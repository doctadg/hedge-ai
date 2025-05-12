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
  connect: () => Promise<void>
  disconnect: () => void
  account: string | null
  currentUser: UserDetails | null; // Added currentUser
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)
console.log("WalletContext:", WalletContext)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null); // Added currentUser state

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const web3 = new Web3(window.ethereum)
        try {
          const accounts = await web3.eth.getAccounts()
          if (accounts.length > 0) {
            setIsConnected(true)
            setAccount(accounts[0])
            await registerUserWallet(accounts[0]); // Register on initial check
          } else {
            // No accounts found, ensure local state is cleared
            setIsConnected(false);
            setAccount(null);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
          setIsConnected(false);
          setAccount(null);
          setCurrentUser(null);
        }
      }
    }

    checkConnection()
  }, [])

  const connect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts()
        setIsConnected(true)
        setAccount(accounts[0])
        await registerUserWallet(accounts[0]); // Register on connect
      } catch (error) {
        console.error("Error connecting to wallet:", error)
      }
    } else {
      console.error("Ethereum object not found, do you have MetaMask installed?")
    }
  }

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
        console.log("Wallet registered/verified:", data.message, data.user);
        console.log("Wallet registered/verified:", data.message, data.user);
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
  console.log("useWallet:", useWallet)
  return context
}
