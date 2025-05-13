"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import Web3 from "web3"
import { useSession } from "next-auth/react"; // Import useSession

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
  const { data: session, status: sessionStatus } = useSession(); // Get NextAuth session

  // Effect to sync WalletContext state with NextAuth session
  useEffect(() => {
    if (sessionStatus === 'loading') {
      // Still waiting for NextAuth session to resolve
      // Optionally, you could set isConnected to false here if you want UI to show "Connect"
      // but it might cause a flicker if session resolves quickly.
      // For now, let WalletContext retain its state until session is resolved.
      return;
    }

    if (sessionStatus === 'authenticated' && session?.user) {
      // User is authenticated via NextAuth
      const sessionUser = session.user as UserDetails; // Cast to include all our custom fields
      
      setAccount(sessionUser.walletAddress);
      setCurrentUser({
        id: sessionUser.id,
        walletAddress: sessionUser.walletAddress,
        isPremium: sessionUser.isPremium,
        isAdmin: sessionUser.isAdmin,
      });

      // Now, check if the physically connected wallet (if any) matches the session
      // This sets `isConnected` based on physical wallet connection matching the authenticated user.
      const checkPhysicalWallet = async () => {
        if (typeof window !== "undefined" && window.ethereum && sessionUser.walletAddress) {
          const web3 = new Web3(window.ethereum);
          try {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0 && accounts[0].toLowerCase() === sessionUser.walletAddress.toLowerCase()) {
              setIsConnected(true); // Physically connected wallet matches session
              console.log("[WalletContext] Physically connected wallet matches NextAuth session.");
            } else {
              setIsConnected(false); // No physical match or different account
              if (accounts.length > 0) {
                console.warn("[WalletContext] Physically connected wallet does not match NextAuth session wallet.");
              } else {
                console.log("[WalletContext] No wallet physically connected to the site.");
              }
            }
          } catch (error) {
            console.error("[WalletContext] Error checking physical wallet connection:", error);
            setIsConnected(false);
          }
        } else {
          setIsConnected(false); // No ethereum provider or no walletAddress in session
        }
      };
      checkPhysicalWallet();

    } else { // sessionStatus === 'unauthenticated'
      // User is not authenticated via NextAuth
      setIsConnected(false);
      setAccount(null);
      setCurrentUser(null);
      console.log("[WalletContext] NextAuth session unauthenticated, resetting WalletContext.");
    }
  }, [sessionStatus, session]); // Re-run when NextAuth session status or data changes

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
