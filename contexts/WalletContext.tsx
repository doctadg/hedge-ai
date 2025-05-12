"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import Web3 from "web3"

interface UserDetails {
  id: string;
  walletAddress: string | null;
  isPremium: boolean;
  isAdmin: boolean;
}

interface WalletContextType {
  isConnected: boolean
  connect: () => Promise<string | null> // Modified to return account or null
  disconnect: () => void
  account: string | null
  currentUser: UserDetails | null; // Added currentUser
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null); // Added currentUser state

  // Effect to check initial connection and potentially re-sync with NextAuth session
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            const currentAccount = accounts[0];
            setAccount(currentAccount);
            setIsConnected(true);
            // We still call registerUserWallet to ensure user is in DB,
            // but primary auth state comes from NextAuth.
            await registerUserWallet(currentAccount);
          } else {
            setIsConnected(false);
            setAccount(null);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
          setIsConnected(false);
          setAccount(null);
          setCurrentUser(null);
        }
      }
    };

    checkConnection();
    // Consider adding event listener for account changes if not already handled by NextAuth session updates
    // window.ethereum?.on('accountsChanged', handleAccountsChanged);
    // return () => window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const connect = async (): Promise<string | null> => { // Modified to return account or null
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          setIsConnected(true);
          await registerUserWallet(currentAccount); // Ensure user is in DB
          return currentAccount; // Return the account
        }
        return null; // No account found
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        return null;
      }
    } else {
      console.error("Ethereum object not found, do you have MetaMask installed?");
      return null;
    }
  };

  const registerUserWallet = async (walletAddress: string) => {
    if (!walletAddress) return;
    try {
      const response = await fetch('/api/auth/register-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Error registering wallet:", data.error || 'Unknown error');
      } else {
        console.log("Wallet registered/verified:", data.message, data.user); // Keep one log
        if (data.user) {
          setCurrentUser({
            id: data.user.id,
            walletAddress: data.user.walletAddress,
            isPremium: data.user.isPremium,
            isAdmin: data.user.isAdmin,
          });
        }
      }
    } catch (error) {
      console.error("Failed to call register-wallet API:", error);
      setCurrentUser(null); // Clear user data on API error
    }
  };

  const disconnect = () => {
    setIsConnected(false)
    setAccount(null)
    setCurrentUser(null); // Clear currentUser on disconnect
  }

  return (
    <WalletContext.Provider value={{ isConnected, connect, disconnect, account, currentUser }}>{children}</WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
