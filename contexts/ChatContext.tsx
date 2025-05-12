'use client';

import React, { createContext, useState, useContext, useCallback, useEffect, ReactNode } from 'react';
// import { useSession } from 'next-auth/react'; // No longer using useSession here
import { useWallet } from './WalletContext'; // Import useWallet

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
  // const { data: session, status } = useSession(); // No longer using useSession here
  const { account, currentUser } = useWallet(); // Get account and currentUser from WalletContext

  const fetchConversations = useCallback(async () => {
    // Only fetch if account is available and user is premium
    if (!account || !currentUser?.isPremium) {
      console.log('[ChatContext] Wallet not connected or user not premium, skipping conversation fetch.');
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    setErrorConversations(null);
    console.log(`[ChatContext] Fetching conversations for wallet: ${account}`);
    try {
      const response = await fetch(`/api/hedge-chat/history/conversations?walletAddress=${account}`);
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
  }, [account, currentUser?.isPremium]); // Add account and currentUser.isPremium to dependencies

  // Fetch conversations when account or premium status changes
  useEffect(() => {
    if (account && currentUser?.isPremium) {
      console.log('[ChatContext] Account connected and user is premium, triggering conversation fetch.');
      fetchConversations();
    } else {
      console.log('[ChatContext] Account not connected or user not premium - clearing conversations.');
      setConversations([]);
      setCurrentConversationId(null);
    }
  }, [account, currentUser?.isPremium, fetchConversations]);

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
