"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import Web3 from "web3"

interface TokenBalance {
  symbol: string
  balance: string
  usdValue: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function PortfolioOverview() {
  const [account, setAccount] = useState<string | null>(null)
  const [ethBalance, setEthBalance] = useState<string>("0")
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const web3 = new Web3(window.ethereum)
        try {
          const accounts = await web3.eth.getAccounts()
          if (accounts.length > 0) {
            setAccount(accounts[0])
            setIsConnected(true)
            // Get ETH balance
            const balance = await web3.eth.getBalance(accounts[0])
            setEthBalance(web3.utils.fromWei(balance, "ether"))
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        } else {
          setAccount(null)
          setIsConnected(false)
        }
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [])

  // Mock token data - in a real app, you'd fetch this from the blockchain
  useEffect(() => {
    if (isConnected) {
      const mockTokens = [
        { symbol: "USDC", balance: "1000", usdValue: 1000 },
        { symbol: "LINK", balance: "50", usdValue: 500 },
        { symbol: "UNI", balance: "100", usdValue: 300 },
      ]
      setTokenBalances(mockTokens)
      setTotalValue(mockTokens.reduce((sum, token) => sum + token.usdValue, 0))
    }
  }, [isConnected])

  if (!isConnected) {
    return (
      <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="text-white">Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Connect your wallet to view your portfolio</p>
        </CardContent>
      </Card>
    )
  }

  const ethValue = Number.parseFloat(ethBalance) * 2000 // Mock ETH price of $2000
  const portfolioData = [
    { name: "ETH", value: ethValue },
    ...tokenBalances.map((token) => ({ name: token.symbol, value: token.usdValue })),
  ]

  return (
    <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
      <CardHeader>
        <CardTitle className="text-white">Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Connected to: Ethereum</p>
            <p className="text-gray-400">Address: {account}</p>
            <p className="text-white text-2xl mt-4">Total Value: ${(totalValue + ethValue).toFixed(2)}</p>
            <div className="mt-4">
              <h3 className="text-white mb-2">Token Balances:</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">ETH: {Number.parseFloat(ethBalance).toFixed(4)}</li>
                {tokenBalances.map((token, index) => (
                  <li key={index} className="text-gray-400">
                    {token.symbol}: {token.balance}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

