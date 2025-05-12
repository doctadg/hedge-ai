'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
// Icons for styling
import { UserIcon, SparklesIcon, PaperclipIcon } from 'lucide-react';
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import AIChatResponseRenderer from './AIChatResponseRenderer';
import { useChat } from '@/contexts/ChatContext';
// import { useWallet } from '@/contexts/WalletContext'; // Wallet address will come from session
import { useSession } from 'next-auth/react'; // Import useSession
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  isUserMessage: boolean;
  createdAt: string | number; // ISO string or timestamp
  // For bot messages, from hedge-ai DB or live stream
  toolUsed?: string | null;
  toolStatus?: string | null;
  thoughts?: string | null; // Stored as string, parsed by renderer
  streamChunks?: string[]; // For live streaming
  logoUrl?: string; // Optional: if agent has a specific logo
}

// Conversation interface removed, handled by context

interface StreamCompletionData {
  finalContent: string;
  thoughts?: string[]; // Renderer provides array of strings
  toolStatus?: Record<string, string>;
}

export default function AIChatInterface() {
  // State managed by this component
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false); // Renamed from isLoadingHistory
  const [error, setError] = useState<string | null>(null);
  const [activeBotMessageId, setActiveBotMessageId] = useState<string | null>(null);

  // Get state and functions from context
  const { 
    currentConversationId, 
    fetchConversations,
    setCurrentConversationIdDirectly
  } = useChat();
  const { data: session, status: sessionStatus } = useSession(); // Use NextAuth session
  // const { account } = useWallet(); // account will be derived from session if needed

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Fetch messages for the current conversation from context
  const fetchMessages = useCallback(async (conversationId: string | null) => {
    if (!conversationId) {
      setMessages([]); // Clear messages for a new chat
      setError(null);
      setActiveBotMessageId(null);
      return;
    }
    console.log('[AIChatInterface] Fetching messages for conversation:', conversationId);
    // Only proceed if authenticated and premium.
    if (sessionStatus !== 'authenticated' || !session?.user?.isPremium) {
      console.log('[AIChatInterface] fetchMessages skipped: User not authenticated or not premium.');
      if (!conversationId) setMessages([]);
      return;
    }
    
    // Wallet address is not needed in query param
    console.log('[AIChatInterface] Fetching messages for conversation:', conversationId, 'for user:', session.user.id);
    setIsLoadingMessages(true);
    setError(null);

    try {
      // API call no longer needs walletAddress query parameter
      const response = await fetch(`/api/hedge-chat/history/messages?hedgeConversationId=${conversationId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch messages');
      }
      const data = await response.json();
      // Sort messages by creation time just in case
      const fetchedMessages = (data.messages || [])
        .map((msg: any) => ({
          ...msg,
          createdAt: msg.createdAt || Date.now(),
        }))
        .sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
      setMessages(fetchedMessages);
      console.log('[AIChatInterface] Messages fetched:', fetchedMessages.length);
    } catch (err: any) {
      console.error('[AIChatInterface] Error fetching messages:', err);
      setError(err.message);
      setMessages([]); // Clear messages on error
    } finally {
      setIsLoadingMessages(false);
    }
  }, [sessionStatus, session]); // Depend on session status and session object

  const prevConversationIdRef = useRef<string | null | undefined>();

  // Effect to fetch messages when conversation ID, session status, or premium status changes
  useEffect(() => {
    const prevId = prevConversationIdRef.current;

    if (activeBotMessageId) {
      console.log('[AIChatInterface] useEffect skipped fetch: Active bot message streaming.');
      prevConversationIdRef.current = currentConversationId;
      return;
    }

    if (currentConversationId === null) {
      console.log('[AIChatInterface] Switched to new chat, clearing messages.');
      setMessages([]);
      setError(null);
      setIsLoadingMessages(false);
      prevConversationIdRef.current = currentConversationId;
      return;
    }

    // Wait for session to be authenticated and user to be premium
    if (sessionStatus !== 'authenticated' || !session?.user?.isPremium || currentConversationId === undefined) {
      console.log('[AIChatInterface] useEffect skipped fetch: Waiting for auth/premium or defined conversationId.');
      prevConversationIdRef.current = currentConversationId;
      return;
    }
    // Removed Condition 3 that was likely preventing fetches for existing conversations when prevId was null/undefined.
    // The activeBotMessageId check should prevent fetching during new message streams.
    
    // Fetch if the conversation ID is set and has changed, or if it's an initial load with a conversation ID.
    if (currentConversationId && currentConversationId !== prevId) {
       console.log(`[AIChatInterface] Switched to existing conversation ${currentConversationId} from ${prevId}. Fetching messages.`);
      fetchMessages(currentConversationId);
    } else if (currentConversationId && prevId === undefined && sessionStatus === 'authenticated' && session?.user?.isPremium) {
      // Handles initial load with a pre-selected conversation ID after session is ready
      console.log(`[AIChatInterface] Initial load with conversation ${currentConversationId}. Fetching messages.`);
      fetchMessages(currentConversationId);
    }
    else {
      console.log(`[AIChatInterface] useEffect: No fetch needed. currentId: ${currentConversationId}, prevId: ${prevId}, sessionStatus: ${sessionStatus}`);
    }
    
    prevConversationIdRef.current = currentConversationId; // Update ref for the next run
  }, [currentConversationId, sessionStatus, session, fetchMessages, activeBotMessageId]); // Added session dependencies

  // handleSelectConversation and handleNewChat are removed (handled by sidebar/context)

  // This function will be called by AIChatResponseRenderer when a stream completes
  const handleStreamComplete = useCallback(async (completedMessageId: string, completionData: StreamCompletionData) => {
    // Update message state locally first
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === completedMessageId 
          ? {
              ...msg,
              content: completionData.finalContent,
              thoughts: completionData.thoughts?.join('\\n\\n') || null, // Store as string
              toolStatus: completionData.toolStatus ? JSON.stringify(completionData.toolStatus) : null, // Store as string
              streamChunks: [] // Clear chunks 
            } 
          : msg
      )
    );
    
    if (completedMessageId === activeBotMessageId) {
      setActiveBotMessageId(null); 
    }

    // Save the completed agent message to hedge-ai DB
    const finalConversationId = currentConversationId; // Capture current ID
    console.log('[AIChatInterface] handleStreamComplete called for messageId:', completedMessageId);
    console.log('[AIChatInterface] finalConversationId for saving:', finalConversationId);
    console.log('[AIChatInterface] completionData:', completionData);

    // Ensure user is authenticated and premium before saving
    if (finalConversationId && completionData.finalContent && sessionStatus === 'authenticated' && session?.user?.isPremium) {
      console.log('[AIChatInterface] Proceeding to save agent message. Conversation ID:', finalConversationId, 'User ID:', session.user.id);
      try {
        const payload = {
          hedgeConversationId: finalConversationId, // Use captured ID
          agentContent: completionData.finalContent,
          thoughts: completionData.thoughts?.join('\n\n'), // Pass as single string
          toolStatus: completionData.toolStatus ? JSON.stringify(completionData.toolStatus) : undefined,
          // walletAddress: account, // No longer send walletAddress, backend uses session
        };
        console.log('[AIChatInterface] Payload for save-agent-message:', payload);

        const saveResponse = await fetch('/api/hedge-chat/save-agent-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          // credentials: 'include', // No longer needed
        });

        const responseText = await saveResponse.text(); // Get raw response text for debugging
        console.log('[AIChatInterface] save-agent-message response status:', saveResponse.status);
        console.log('[AIChatInterface] save-agent-message response text:', responseText);

        if (!saveResponse.ok) {
          let errorData = {};
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            // If response is not JSON, use the raw text
            console.error('Failed to parse save-agent-message error response as JSON.');
          }
          console.error('Failed to save agent message to DB:', (errorData as any).error || responseText || 'Unknown error');
          setError(`Failed to save agent response: ${(errorData as any).error || responseText}`);
        } else {
          console.log('Agent message saved to DB successfully.');
          // Attempt to parse success response if it's JSON
           try {
            const successData = JSON.parse(responseText);
            console.log('[AIChatInterface] save-agent-message success data:', successData);
          } catch (e) {
            // Not critical if success response isn't JSON
          }
        }
        
        // Refresh conversation list in the sidebar via context
        await fetchConversations(); 

      } catch (err: any) {
        console.error('Error calling save-agent-message API:', err);
        setError(`Network error or issue calling save API: ${err.message}`);
      }
    } else {
      console.warn('[AIChatInterface] Skipping save agent message. Conditions not met. finalConversationId:', finalConversationId, 
                   'finalContent exists:', !!completionData.finalContent, 
                   'sessionStatus:', sessionStatus, 
                   'isPremium:', session?.user?.isPremium);
    }
  }, [sessionStatus, session, activeBotMessageId, currentConversationId, fetchConversations, setCurrentConversationIdDirectly]); 


  const handleSendMessage = async () => {
    // Check if authenticated and premium before sending
    if (sessionStatus !== 'authenticated' || !session?.user?.isPremium) {
      setError("Authentication or premium access required to send messages.");
      console.error("[AIChatInterface] Cannot send message: User not authenticated or not premium.");
      return;
    }
    if (!userInput.trim() || isSending) {
      return;
    }


    const optimisticUserMessage: Message = {
      id: `user-${Date.now()}`,
      content: userInput, 
      isUserMessage: true, 
      createdAt: Date.now(), 
    };

    setIsSending(true);
    setError(null);
    
    const tempBotMessageId = `bot-${Date.now()}`; 
    setActiveBotMessageId(tempBotMessageId);

    const optimisticBotMessagePlaceholder: Message = {
      id: tempBotMessageId, 
      content: '', 
      isUserMessage: false, 
      createdAt: Date.now() + 1, // Ensure it's after user message 
      streamChunks: [], 
    };

    // Use functional update to ensure we have the latest messages state
    setMessages(prev => [...prev, optimisticUserMessage, optimisticBotMessagePlaceholder]);
    const messageToSend = userInput;
    setUserInput('');

    try {
      // Get history based on the state *before* adding the optimistic messages
      const historyForAgent = messages 
        .slice(-10) // Last 10 messages as context 
        .map(m => ({ 
          role: m.isUserMessage ? 'user' : 'assistant', 
          content: m.content, 
        }));

      const payload: any = {
        message: messageToSend,
        historyForAgent: historyForAgent,
        // walletAddress: account, // No longer send walletAddress, backend uses session
      };
      // Use conversation ID from context
      if (currentConversationId) {
        payload.hedgeConversationId = currentConversationId;
      }

      console.log('[AIChatInterface] Sending payload to /api/hedge-chat/agent:', payload, 'User ID:', session.user.id);

      const response = await fetch('/api/hedge-chat/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        const errData = response.body ? await response.json().catch(() => ({})) : {};
        throw new Error(errData.error || `API Error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      let wasNewConversationCreated = false; // Flag to track if we got the event


      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        let eventEndIndex;
        // Standard SSE messages are separated by a blank line (i.e., two newline characters).
        while ((eventEndIndex = buffer.indexOf('\n\n')) >= 0) {
          const eventBlock = buffer.substring(0, eventEndIndex).trim();
          buffer = buffer.substring(eventEndIndex + 2); // Consume the event block and the two newlines

          if (eventBlock) { // Process if not an empty block
            console.log('[AIChatInterface] Processing SSE Event Block:', eventBlock);
            // The eventBlock might contain multiple lines (e.g., event: type\ndata: content)
            // The AIChatResponseRenderer expects each "line" from the stream.
            // We should pass the raw lines that constitute the event.
            // The Venymio backend seems to send one logical piece of info per `data:` line,
            // each terminated by \n\n. So, eventBlock should be a single `data:` line or `event:\ndata:` pair.
            
            // Let's assume for now each `eventBlock` is a self-contained piece of info
            // that AIChatResponseRenderer can handle.
            // If `event: conversation_info` is followed by `data: ...` on separate lines *before* `\n\n`,
            // this simple split won't work. But Venymio's backend sends them together.

            // Example: "event: conversation_info\ndata: {\"conversationId\":\"foo\"}"
            // Example: "data: TEXT:Hello"
            
            // The crucial part is that AIChatResponseRenderer receives these lines.
            // The current logic passes the whole `eventBlock` as a single "line" to streamChunks.
            // This should be fine if AIChatResponseRenderer can parse it.

            // Let's check for conversation_info specifically here for robustness,
            // though AIChatResponseRenderer also has logic for it.
            if (eventBlock.startsWith('event: hedge_conversation_created')) {
              try {
                // Extract the data part of this custom event 
                const dataLineMatch = eventBlock.match(/data: (.*)/s); // s flag for dot to match newline 
                if (dataLineMatch && dataLineMatch[1]) {
                  const eventData = JSON.parse(dataLineMatch[1]);
                  if (eventData.hedgeConversationId) {
                    console.log("[AIChatInterface] Received new hedge_conversation_id:", eventData.hedgeConversationId);
                    // Update context directly
                    setCurrentConversationIdDirectly(eventData.hedgeConversationId); 
                    wasNewConversationCreated = true;
                    // Refresh sidebar list to show the new title eventually
                    fetchConversations(); 
                  }
                }
              } catch (e) { console.error("Error parsing hedge_conversation_created event:", e, eventBlock); }
              // This custom event is for AIChatInterface internal use, don't pass to renderer 
            } else if (eventBlock.includes('event: conversation_info')) { // Venymio's original conversation_info 
              try {
                const dataMatch = eventBlock.match(/data: (.*)/s);
                if (dataMatch && dataMatch[1]) {
                  const info = JSON.parse(dataMatch[1]);
                   console.log("[AIChatInterface] Received Venymio conversation_info, Venymio ID:", info.conversationId);
                  // We are primarily using hedge-ai's conversation IDs now.
                  // This Venymio ID could be stored if needed for direct Venymio API calls later,
                  // e.g., by associating it with the hedgeConversationId in the database.
                  // The backend proxy's `venymioContextId` handles this if needed.
                }
              } catch (e) { console.error("Error parsing conversation_info in AIChatInterface:", e, eventBlock); }
              // Don't pass this to renderer either if it's just for context ID
            } else {
              // For all other events (like data: TEXT:...), pass them to the renderer
              setMessages(prev => prev.map(msg => 
                msg.id === tempBotMessageId 
                ? { ...msg, streamChunks: [...(msg.streamChunks || []), eventBlock] } 
                : msg
              ));
            }
          }
        }
      }
      // After the loop, any remaining part of the buffer is an incomplete event.
      // It will be processed in the next chunk.
      
      // If a new conversation was started locally but we didn't get the ID back via event,
      // refresh the conversation list as a fallback.
      if (!currentConversationId && !wasNewConversationCreated) { 
        console.log("[AIChatInterface] Fallback: Refreshing conversations after sending message to potentially new chat.");
        await fetchConversations(); 
      }

    } catch (err: any) {
      setError(err.message);
      // Remove placeholder on error using functional update
      setMessages(prev => prev.filter(msg => msg.id !== tempBotMessageId)); 
      setActiveBotMessageId(null);
    } finally {
      setIsSending(false);
      // Refocus input after sending or error
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  // SidebarContent removed - handled by main dashboard sidebar

  // Return only the main chat area
  return (
    // Removed overflow-y-auto, kept flex layout
    <div className="flex-1 flex flex-col h-full bg-background"> 
      {/* Message Display Area - Added back flex-1 and overflow-y-auto */}
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto"> {/* Message container scrolls */}
        {isLoadingMessages && ( 
          // Removed h-full, let container size dictate
          <div className="flex justify-center items-center py-10"> 
            <ArrowPathIcon className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoadingMessages && messages.length === 0 && !error && (
           // Re-added flex-1 to make this div grow and justify-center to center vertically
           <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground py-10"> 
             <SparklesIcon className="h-12 w-12 mb-4"/>
             <p className="text-lg font-medium">Start a new conversation</p>
             <p className="text-sm">Ask me anything about the market or your portfolio.</p>
           </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            // Add avatar and align items
            className={`flex items-start gap-3 md:gap-4 ${msg.isUserMessage ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar */}
            {!msg.isUserMessage && (
              <Avatar className="h-8 w-8 border border-border">
                {/* <AvatarImage src={msg.logoUrl || "/placeholder-bot.png"} alt="AI" /> */}
                <AvatarFallback className="bg-muted">
                  <SparklesIcon className="h-4 w-4 text-app-green" />
                </AvatarFallback>
              </Avatar>
            )}
            
            {/* Message Bubble Container */}
            <div
              className={`flex flex-col max-w-xl lg:max-w-2xl ${msg.isUserMessage ? 'items-end' : 'items-start'}`}
            >
              {/* Bubble Styling */}
              <div
                className={`relative px-4 py-3 rounded-lg shadow-sm ${ // Subtle shadow
                  msg.isUserMessage
                    ? 'bg-app-green text-app-green-foreground rounded-br-none' // User message: Green, different corner
                    : 'bg-muted text-foreground rounded-bl-none' // Bot message: Muted, different corner
                }`}
              >
                {/* Render message content */}
                {msg.id === activeBotMessageId && msg.streamChunks ? (
                  <AIChatResponseRenderer
                    messageId={msg.id}
                    responseStream={msg.streamChunks}
                    isActive={true}
                    onStreamComplete={handleStreamComplete}
                  />
                ) : (
                  <AIChatResponseRenderer
                    messageId={msg.id}
                    initialContent={msg.content}
                    persistedThoughts={typeof msg.thoughts === 'string' ? msg.thoughts.split('\\n\\n') : undefined}
                    persistedToolStatus={typeof msg.toolStatus === 'string' ? JSON.parse(msg.toolStatus) : undefined}
                    isActive={false}
                  />
                )}
              </div>
              {/* Timestamp below bubble */}
              <p className="text-xs text-muted-foreground opacity-80 mt-1 px-1"> 
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

             {/* User Avatar (on the right) */}
             {msg.isUserMessage && (
              <Avatar className="h-8 w-8 border border-border">
                {/* <AvatarImage src={"/placeholder-user.png"} alt="User" /> */}
                <AvatarFallback className="bg-muted">
                  <UserIcon className="h-4 w-4 text-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* For scrolling */}
        {error && <p className="text-red-500 text-center py-2">{error}</p>}
      </div>

      {/* Input Area - Modernized */}
      <div className="p-4 border-t border-border bg-background"> 
        <div className="relative flex items-center"> 
           {/* Attachment Icon (Placeholder) */}
           <button className="absolute left-3 text-muted-foreground hover:text-foreground transition-colors">
             <PaperclipIcon className="h-5 w-5" />
           </button>
           
           <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
            placeholder="Ask me anything..." // Updated placeholder
            // Modern Input Styling: Muted background, padding for icons
            className="flex-1 py-3 pl-10 pr-12 rounded-lg bg-muted text-foreground border border-transparent focus:ring-2 focus:ring-app-green focus:border-app-green outline-none placeholder-muted-foreground resize-none" 
            disabled={isSending}
            // Removed rows={1} attribute
          />
          
          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={isSending || !userInput.trim()}
            // Adjusted padding and positioning
            className="absolute right-2 p-2 rounded-md bg-app-green hover:bg-app-green/90 text-app-green-foreground disabled:bg-muted disabled:text-muted-foreground transition-colors duration-150 flex items-center justify-center" 
          >
            {isSending ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" /> 
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
