"use client"

import type React from "react";
import { createContext, useContext, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth"; // Import Session type
import Web3 from "web3";

// Define the structure of the user object within the session
// Ensure this matches the structure defined in the NextAuth callbacks
interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  walletAddress?: string | null;
  isPremium?: boolean;
  isAdmin?: boolean;
}

// Define the structure of the session object provided by useSession
interface CustomSession extends Session {
  user?: SessionUser;
}

// Define the context type
interface WalletContextType {
  session: CustomSession | null; // The session object from NextAuth
  status: 'loading' | 'authenticated' | 'unauthenticated'; // Session status
  connect: () => Promise<void>; // Function to initiate connection and sign-in
  disconnect: () => Promise<void>; // Function to sign out
  account: string | null; // Wallet address from session
  isPremium: boolean; // Derived premium status
  isAdmin: boolean; // Derived admin status
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // Cast session data to our custom type
  const customSession = session as CustomSession | null;

  const connect = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Request account access if needed
        const accounts = await (window.ethereum as any).request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          // Trigger NextAuth sign-in with the wallet address
          // Using redirect: false to handle the flow without a full page reload
          const result = await signIn('credentials', {
            walletAddress: walletAddress,
            redirect: false,
          });

          if (result?.error) {
            console.error("Sign-in error:", result.error);
            // Handle sign-in error (e.g., show a toast notification)
          } else {
            console.log("Sign-in successful");
            // Session will automatically update via useSession hook
          }
        } else {
           console.error("No accounts found after requesting.");
        }
      } catch (error) {
        console.error("Error connecting wallet or signing in:", error);
        // Handle connection error
      }
    } else {
      console.error("Ethereum object not found (MetaMask not installed or enabled?)");
      // Handle missing provider error
    }
  }, []);

  const disconnect = useCallback(async () => {
    // Trigger NextAuth sign-out
    await signOut({ redirect: false }); // redirect: false prevents page reload
    console.log("Signed out");
  }, []);

  // Derive account, isPremium, isAdmin from the session object
  const account = customSession?.user?.walletAddress ?? null;
  const isPremium = customSession?.user?.isPremium ?? false;
  const isAdmin = customSession?.user?.isAdmin ?? false;

  const value: WalletContextType = {
    session: customSession,
    status,
    connect,
    disconnect,
    account,
    isPremium,
    isAdmin,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
