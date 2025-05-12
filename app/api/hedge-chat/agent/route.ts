import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path as needed

const VENYMIO_AGENT_ENDPOINT_URL = process.env.VENYMIO_AGENT_ENDPOINT_URL;
const VENYMIO_API_KEY = process.env.VENYMIO_API_KEY;

export async function POST(request: NextRequest) {
  console.log('[API hedge-chat/agent] Request received.');

  // --- Authentication/Authorization with NextAuth Session ---
  // Note: For app router, getServerSession needs to be called with request and a dummy response or by passing `req` and `res` if available.
  // However, a more common pattern in app router is to use `getToken` or pass the request directly.
  // Let's assume we can get the session. If this is an Edge function, `getToken` would be preferred.
  // For standard Node.js runtime with app router, direct `req` and `res` might not be available.
  // A common workaround is to use `headers()` from `next/headers` to reconstruct parts needed by `getServerSession`
  // or to use a helper that wraps this. For simplicity, we'll try the direct approach.
  // If this API is not an Edge function, we might need to adjust how session is retrieved.
  // The middleware should have already blocked unauthenticated requests.
  const session = await getServerSession(authOptions); // Simplified call, might need req/res for older NextAuth versions or specific setups

  if (!session || !session.user) {
    console.error('[API hedge-chat/agent] Unauthorized: No active session or user data found.');
    // Middleware should ideally catch this, but as a fallback:
    return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
  }

  const userId = session.user.id as string; // Assuming ID is string from your session callback
  const isUserPremium = session.user.isPremium as boolean;
  const userWalletAddress = session.user.walletAddress as string; // Get wallet address from session

  console.log(`[API hedge-chat/agent] User ${userId} (Wallet: ${userWalletAddress}) attempting access. Premium: ${isUserPremium}.`);

  if (!isUserPremium) {
    console.error(`[API hedge-chat/agent] Forbidden: User ${userId} is not premium.`);
    return NextResponse.json({ error: 'Forbidden: Premium access required for AI chat agent.' }, { status: 403 });
  }
  // --- End Authentication/Authorization ---

  if (!VENYMIO_AGENT_ENDPOINT_URL || !VENYMIO_API_KEY) {
    console.error('[API hedge-chat/agent] Venymio environment variables not configured.');
    return NextResponse.json({ error: 'Server configuration error for AI chat agent.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      message,
      // walletAddress, // No longer needed from client for auth; use session.user.walletAddress if Venymio needs it
      hedgeConversationId: clientHedgeConversationId,
      historyForAgent,
      venymioContextId
    } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing required parameter: message' }, { status: 400 });
    }
    // walletAddress from body is no longer used for auth. If Venymio needs it, pass session.user.walletAddress

    console.log(`[API hedge-chat/agent] User ${userId} authorized (Premium: ${isUserPremium}).`);
    
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
