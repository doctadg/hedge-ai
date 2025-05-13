'use client';

import React, { createContext, useState, useContext, useCallback, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession
// import { useWallet } from './WalletContext'; // WalletContext might still be needed if direct wallet actions are performed here

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatContextProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoadingConversations: boolean;
  errorConversations: string | null;
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => void;
  startNewChat: () => void;
  setCurrentConversationIdDirectly: (id: string | null) => void; // Needed for stream response handling
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [errorConversations, setErrorConversations] = useState<string | null>(null);
  const { data: session, status: sessionStatus } = useSession(); // Use NextAuth session
  const [hasMounted, setHasMounted] = useState(false);
  // const { account, currentUser } = useWallet(); // account and currentUser.isPremium will come from session

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchConversations = useCallback(async () => {
    // Only fetch if authenticated and user is premium (from NextAuth session)
    // This check is also present in the useEffect, but good for direct calls too.
    if (sessionStatus !== 'authenticated' || !session?.user?.isPremium) {
      console.log('[ChatContext] User not authenticated or not premium, skipping conversation fetch.');
      setConversations([]);
      // setCurrentConversationId(null); // Let the main effect handle clearing currentConversationId
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    setErrorConversations(null);
    // Wallet address is not needed in the query param as backend uses session
    console.log(`[ChatContext] Fetching conversations for user: ${session.user.id}`);
    try {
      // API call no longer needs walletAddress query parameter
      const response = await fetch(`/api/hedge-chat/history/conversations`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch conversations');
      }
      const data = await response.json();
      const sortedConversations = (data.conversations || []).sort(
        (a: Conversation, b: Conversation) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setConversations(sortedConversations);
      console.log('[ChatContext] Conversations fetched:', sortedConversations.length);
    } catch (err: any) {
      console.error('[ChatContext] Error fetching conversations:', err);
      setErrorConversations(err.message);
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [sessionStatus, session]); // Depend on session status and session object

  // Fetch conversations when session status or user's premium status changes
  useEffect(() => {
    if (!hasMounted || sessionStatus === 'loading') {
      // Do nothing if not mounted or session is still loading
      return;
    }

    if (sessionStatus === 'authenticated' && session?.user?.isPremium) {
      console.log('[ChatContext] User authenticated and premium, triggering conversation fetch.');
      fetchConversations();
    } else if (sessionStatus === 'unauthenticated' || (sessionStatus === 'authenticated' && !session?.user?.isPremium)) {
      // Explicitly handle unauthenticated or authenticated but not premium
      console.log('[ChatContext] User not authenticated or not premium - clearing conversations.');
      setConversations([]);
      setCurrentConversationId(null); // Clear current conversation
    }
    // No action needed if sessionStatus is 'loading' due to the check at the beginning of the effect.
  }, [sessionStatus, session, fetchConversations, hasMounted]); // session.user.isPremium is covered by `session` dependency

  const selectConversation = (conversationId: string) => {
    console.log('[ChatContext] Selecting conversation:', conversationId);
    setCurrentConversationId(conversationId);
    // Fetching messages will now be handled within AIChatInterface based on this ID change
  };

  const startNewChat = () => {
    console.log('[ChatContext] Starting new chat');
    setCurrentConversationId(null);
    // Clearing messages etc. will be handled in AIChatInterface
  };

  const setCurrentConversationIdDirectly = (id: string | null) => {
    setCurrentConversationId(id);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversationId,
      isLoadingConversations,
      errorConversations,
      fetchConversations,
      selectConversation,
      startNewChat,
      setCurrentConversationIdDirectly
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextProps => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
