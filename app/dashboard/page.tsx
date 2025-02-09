"use client"

import { DashboardChart } from "@/components/dashboard/chart"
import { DashboardMetrics } from "@/components/dashboard/metrics"
import { MarketOverview } from "@/components/dashboard/market-overview"
import { LivePrice } from "@/components/dashboard/live-price"
import { LoginModal } from "@/components/ui/LoginModal"
import { useEffect, useState } from "react"
import Web3 from "web3"
import { ConnectButton } from "@/components/ConnectButton"

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="w-full">
        {!isConnected ? (
          <LoginModal isOpen={!isConnected}>
            <ConnectButton
              isConnected={isConnected}
              connect={connect}
              disconnect={disconnect}
            />
          </LoginModal>
        ) : (
          <>
            <LivePrice />
            <DashboardChart />
            <DashboardMetrics />
            <MarketOverview />
          </>
        )}
      </div>
    </div>
  )
}
