import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Prisma client for hedge-ai DB

const prisma = new PrismaClient();

const VENYMIO_AGENT_ENDPOINT_URL = process.env.VENYMIO_AGENT_ENDPOINT_URL;
const VENYMIO_API_KEY = process.env.VENYMIO_API_KEY;

export async function POST(request: NextRequest) {
  if (!VENYMIO_AGENT_ENDPOINT_URL || !VENYMIO_API_KEY) {
    console.error('[API hedge-chat/agent] Venymio environment variables not configured.');
    return NextResponse.json({ error: 'Server configuration error for AI chat agent.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { 
      message, 
      hedgeConversationId: clientHedgeConversationId, // ID from hedge-ai's database
      historyForAgent, // Pre-formatted history to send to Venymio
      venymioContextId // Optional: if hedge-ai wants to maintain a specific Venymio context ID
    } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing required parameter: message' }, { status: 400 });
    }

    let hedgeConversationId = clientHedgeConversationId;

    // 1. Prepare payload for Venymio
    const venymioPayload: any = {
      message: message,
      conversationHistory: historyForAgent || [], 
    };

    if (venymioContextId) {
      venymioPayload.conversationId = venymioContextId;
    }
    
    // 2. Call Venymio Agent API
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

    // 3. Stream response back to hedge-ai client
    let baseStream = venymioResponse.body;
    let newHedgeConversationIdForClient: string | null = null;

    // 4. Save user message and handle conversation creation
    // This block needs to run *before* we start streaming to the client if we want to prepend an event.
    if (!hedgeConversationId) {
      const newConversation = await prisma.conversation.create({
        data: {
          title: message.substring(0, 70) + (message.length > 70 ? '...' : ''),
          // userId: 'some_user_id', // TODO: Integrate with hedge-ai user system if available
        },
      });
      hedgeConversationId = newConversation.id;
      newHedgeConversationIdForClient = hedgeConversationId; // Store for prepending
      console.log(`[API hedge-chat/agent] Created new hedge-ai conversation: ${hedgeConversationId}`);
    }

    // Save user message to hedge-ai DB
    // This should happen regardless of whether it's a new or existing conversation.
    // Ensure hedgeConversationId is valid before this.
    if (hedgeConversationId) {
      try {
          await prisma.chatMessage.create({
            data: {
              content: message,
              isUserMessage: true,
              conversationId: hedgeConversationId,
            },
          });
          console.log(`[API hedge-chat/agent] Saved user message to hedge-ai conversation: ${hedgeConversationId}`);

          await prisma.conversation.update({
            where: { id: hedgeConversationId },
            data: { updatedAt: new Date() },
          });
      } catch (dbError) {
        console.error('[API hedge-chat/agent] DB error saving user message/conversation:', dbError);
        // Decide if we should still stream Venymio's response or return an error
      }
    } else {
      console.error('[API hedge-chat/agent] hedgeConversationId is null or undefined before saving user message. This should not happen.');
      // This case implies an issue with conversation creation logic if it was a new chat.
    }

    // If a new hedge-ai conversation was created, prepend an event to the stream
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
