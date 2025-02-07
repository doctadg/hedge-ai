"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Loader2, TrendingUp, DollarSign, Droplets } from "lucide-react"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatLargeNumber = (value: number) => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`
  }
  return value.toFixed(2)
}

interface PairData {
  chainId: string
  dexId: string
  baseToken: {
    name: string
    symbol: string
  }
  quoteToken: {
    symbol: string
  }
  priceUsd: string
  liquidity: {
    usd: number
  }
  volume: {
    h24: number
  }
  priceChange: {
    h24: number
  }
}

export function GeniusSection() {
  const [pairData, setPairData] = useState<PairData | null>(null)
  const [analysis, setAnalysis] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState("")

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = formData.get("query") as string

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/dexscreener?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      setPairData(data.pair)
      setAnalysis(data.analysis)
      setChatMessages([{ role: "assistant", content: data.analysis }])
    } catch (err) {
      console.error("Error in handleSearch:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!chatInput.trim()) return

    const newMessage = { role: "user", content: chatInput }
    setChatMessages([...chatMessages, newMessage])
    setChatInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, newMessage],
          pairData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const data = await response.json()
      setChatMessages([...chatMessages, newMessage, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error in chat:", error)
      setChatMessages([
        ...chatMessages,
        newMessage,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    }
  }

  const chartData = pairData
    ? [
        { name: "Price", value: Number(pairData.priceUsd) },
        { name: "Volume (24h)", value: pairData.volume?.h24 || 0 },
        { name: "Liquidity", value: pairData.liquidity?.usd || 0 },
      ]
    : []

  return (
    <section className="relative bg-[#000000] py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="inline-flex items-center rounded-full border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-1">
            <span className="mr-2 text-sm font-medium text-white">Meet Genius™</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white">AI-powered market intelligence</h2>
          <p className="mt-2 text-gray-400">Get instant AI analysis for any token by address or symbol</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-[#1a1a1a] bg-[#0A0A0A]">
            <CardHeader className="border-b border-[#1a1a1a]">
              <CardTitle className="text-sm font-medium text-white">
                {pairData ? `${pairData.baseToken.name} (${pairData.baseToken.symbol})` : "Token Analysis"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {pairData ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="flex items-center text-sm text-gray-400">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Price
                      </div>
                      <div className="text-lg font-medium text-white">{formatCurrency(pairData.priceUsd)}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Droplets className="mr-2 h-4 w-4" />
                        Liquidity
                      </div>
                      <div className="text-lg font-medium text-white">
                        {formatCurrency(pairData.liquidity?.usd || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-400">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        24h Change
                      </div>
                      <div
                        className={`text-lg font-medium ${
                          (pairData.priceChange?.h24 || 0) >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {(pairData.priceChange?.h24 || 0).toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Volume (24h)</div>
                      <div className="text-lg font-medium text-white">{formatCurrency(pairData.volume?.h24 || 0)}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-white">AI Analysis</div>
                    <div className="rounded-lg bg-[#1a1a1a] p-4 text-sm text-gray-300">{analysis}</div>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "none",
                            borderRadius: "4px",
                          }}
                          formatter={(value: any) => formatLargeNumber(value)}
                        />
                        <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-center text-gray-400">
                  Search for a token to view its analysis
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#1a1a1a] bg-[#0A0A0A]">
            <CardContent className="flex h-full flex-col items-center justify-between p-8">
              {!pairData ? (
                <>
                  <MessageCircle className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-6 text-center text-gray-400">
                    Enter a token address or symbol to get instant AI-powered market analysis
                  </p>
                  <form onSubmit={handleSearch} className="w-full space-y-4">
                    <Input
                      type="text"
                      name="query"
                      placeholder="Enter token address or symbol (e.g., ETH, 0x...)"
                      className="border-[#1a1a1a] bg-[#0A0A0A] text-white placeholder:text-gray-500"
                    />
                    <Button
                      type="submit"
                      className="w-full bg-green-500 text-white hover:bg-green-600"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze Token"
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <div className="mb-4 w-full overflow-y-auto flex-grow">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
                        <span
                          className={`inline-block rounded-lg px-4 py-2 ${
                            message.role === "user" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-200"
                          }`}
                        >
                          {message.content}
                        </span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleChatSubmit} className="w-full">
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about this token..."
                        className="flex-grow border-[#1a1a1a] bg-[#0A0A0A] text-white placeholder:text-gray-500"
                      />
                      <Button type="submit" className="bg-green-500 text-white hover:bg-green-600">
                        Send
                      </Button>
                    </div>
                  </form>
                </>
              )}
              {error && (
                <div className="mt-4 rounded-md bg-red-900/50 p-4 text-sm text-white">
                  <h3 className="mb-2 font-bold">Error:</h3>
                  <p>{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

