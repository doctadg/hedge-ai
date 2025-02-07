"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import Web3 from "web3"

interface WalletContextType {
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  account: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const web3 = new Web3(window.ethereum)
        try {
          const accounts = await web3.eth.getAccounts()
          if (accounts.length > 0) {
            setIsConnected(true)
            setAccount(accounts[0])
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
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
      } catch (error) {
        console.error("Error connecting to wallet:", error)
      }
    } else {
      console.error("Ethereum object not found, do you have MetaMask installed?")
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAccount(null)
  }

  return (
    <WalletContext.Provider value={{ isConnected, connect, disconnect, account }}>{children}</WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

