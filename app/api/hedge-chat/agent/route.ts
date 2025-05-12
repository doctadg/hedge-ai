import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import shared Prisma client instance

const VENYMIO_AGENT_ENDPOINT_URL = process.env.VENYMIO_AGENT_ENDPOINT_URL;
const VENYMIO_API_KEY = process.env.VENYMIO_API_KEY;

export async function POST(request: NextRequest) {
  console.log('[API hedge-chat/agent] Request received (walletAddress auth).');

  if (!VENYMIO_AGENT_ENDPOINT_URL || !VENYMIO_API_KEY) {
    console.error('[API hedge-chat/agent] Venymio environment variables not configured.');
    return NextResponse.json({ error: 'Server configuration error for AI chat agent.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      message,
      walletAddress, // Expect walletAddress from the client
      hedgeConversationId: clientHedgeConversationId,
      historyForAgent,
      venymioContextId
    } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing required parameter: message' }, { status: 400 });
    }
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid walletAddress parameter.' }, { status: 400 });
    }

    // --- Authentication/Authorization based on walletAddress ---
    const normalizedWalletAddress = walletAddress.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedWalletAddress },
      select: { id: true, isPremium: true }
    });

    if (!user) {
      console.error(`[API hedge-chat/agent] Unauthorized: User not found for wallet ${normalizedWalletAddress}.`);
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }
    if (!user.isPremium) {
      console.error(`[API hedge-chat/agent] Forbidden: User ${user.id} is not premium.`);
      return NextResponse.json({ error: 'Forbidden: Premium access required' }, { status: 403 });
    }
    const userId = user.id;
    console.log(`[API hedge-chat/agent] User ${userId} authorized (Premium: ${user.isPremium}).`);
    // --- End Authentication/Authorization ---

    let hedgeConversationId = clientHedgeConversationId;
    let conversationVerified = !hedgeConversationId;

    if (hedgeConversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: hedgeConversationId },
        select: { userId: true }
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      if (conversation.userId !== userId) {
        console.error(`[API hedge-chat/agent] Forbidden: User ${userId} does not own conversation ${hedgeConversationId} (Owner: ${conversation.userId}).`);
        return NextResponse.json({ error: 'Forbidden: User does not own this conversation' }, { status: 403 });
      }
      conversationVerified = true;
    }

    if (!conversationVerified) {
       console.error('[API hedge-chat/agent] Conversation verification failed unexpectedly.');
       return NextResponse.json({ error: 'Conversation verification failed.' }, { status: 500 });
    }

    const venymioPayload: any = {
      message: message,
      conversationHistory: historyForAgent || [],
    };

    if (venymioContextId) {
      venymioPayload.conversationId = venymioContextId;
    }
    
    const venymioResponse = await fetch(VENYMIO_AGENT_ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENYMIO_API_KEY}`,
      },
      body: JSON.stringify(venymioPayload),
    });

    if (!venymioResponse.ok) {
      const errorText = await venymioResponse.text();
      console.error(`[API hedge-chat/agent] Error from Venymio API: ${venymioResponse.status}`, errorText);
      return NextResponse.json({ error: `Venymio API Error: ${venymioResponse.status} - ${errorText}` }, { status: venymioResponse.status });
    }

    if (!venymioResponse.body) {
      return NextResponse.json({ error: 'Venymio API returned no response body' }, { status: 500 });
    }

    let baseStream = venymioResponse.body;
    let newHedgeConversationIdForClient: string | null = null;

    if (!hedgeConversationId) {
      const newConversation = await prisma.conversation.create({
        data: {
          title: message.substring(0, 70) + (message.length > 70 ? '...' : ''),
          userId: userId,
        },
      });
      hedgeConversationId = newConversation.id;
      newHedgeConversationIdForClient = hedgeConversationId;
      console.log(`[API hedge-chat/agent] Created new hedge-ai conversation: ${hedgeConversationId} for user ${userId}`);
    }

    try {
        await prisma.chatMessage.create({
          data: {
              content: message,
              isUserMessage: true,
              conversationId: hedgeConversationId!, // hedgeConversationId is guaranteed to be set
            },
          });
          console.log(`[API hedge-chat/agent] Saved user message to hedge-ai conversation: ${hedgeConversationId}`);

          await prisma.conversation.update({
            where: { id: hedgeConversationId! }, // hedgeConversationId is guaranteed to be set
            data: { updatedAt: new Date() },
          });
      } catch (dbError) {
        console.error('[API hedge-chat/agent] DB error saving user message/conversation:', dbError);
      }

    if (newHedgeConversationIdForClient && baseStream) {
      const prefixEncoder = new TextEncoder();
      const prefixEvent = `event: hedge_conversation_created\ndata: ${JSON.stringify({ hedgeConversationId: newHedgeConversationIdForClient })}\n\n`;
      
      const transformedStream = new ReadableStream({
        async start(controller) {
          controller.enqueue(prefixEncoder.encode(prefixEvent));
          
          const reader = baseStream!.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } catch (e) {
            controller.error(e);
          } finally {
            controller.close();
            reader.releaseLock();
          }
        }
      });
      baseStream = transformedStream;
    }
    
    return new Response(baseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('[API hedge-chat/agent] Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
