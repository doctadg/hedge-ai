"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts"
import { motion } from "framer-motion"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import {
  fetchGlobalData,
  fetchTrendingCoins,
  fetchTopCoins,
  fetchGlobalDefiData,
  fetchCoinData,
  fetchMarketChart,
} from "@/utils/api"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}

const formatPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

const MetricCard = ({
  title,
  value,
  change,
  prefix = "",
  suffix = "",
}: {
  title: string
  value: string | number
  change?: number
  prefix?: string
  suffix?: string
}) => {
  const formattedValue =
    typeof value === "number"
      ? new Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 2,
        }).format(value)
      : value

  return (
    <motion.div
      className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg p-6 flex flex-col justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-bold text-white">
          {prefix}
          {formattedValue}
          {suffix}
        </span>
        {change !== undefined && (
          <span className={`flex items-center text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
            {change >= 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            {formatPercentage(change)}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function DataSection() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [globalData, trendingCoins, topCoins, defiData, bitcoinData, ethereumData, bitcoinChart] =
          await Promise.all([
            fetchGlobalData(),
            fetchTrendingCoins(),
            fetchTopCoins(),
            fetchGlobalDefiData(),
            fetchCoinData("bitcoin"),
            fetchCoinData("ethereum"),
            fetchMarketChart("bitcoin", "7"),
          ])

        setData({
          globalData,
          trendingCoins: trendingCoins?.coins || [],
          topCoins,
          defiData,
          bitcoinData,
          ethereumData,
          bitcoinChart,
        })
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again later.")
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <section className="bg-black py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="bg-black py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center text-white">Loading...</div>
        </div>
      </section>
    )
  }

  const { globalData, trendingCoins, topCoins, defiData, bitcoinData, ethereumData, bitcoinChart } = data

  const chartData =
    bitcoinChart?.prices?.map((price: number[]) => ({
      date: formatDate(price[0]),
      price: price[1],
    })) || []

  return (
    <section className="bg-black py-24 px-4 min-h-screen flex flex-col justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="container mx-auto relative z-10">
        <motion.h2
          className="text-4xl font-bold text-white mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Data you can&apos;t invest without
        </motion.h2>
        <motion.p
          className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Real-time market analysis and predictive insights for the top cryptocurrencies
        </motion.p>

        {/* Bitcoin Price Chart - Full Width */}
        <Card className="mb-8 bg-[#0A0A0A] border-[#1a1a1a]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Bitcoin Price (7 Days)</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#666" tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#666"
                    domain={["auto", "auto"]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "none",
                      borderRadius: "4px",
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4x2 Grid of Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Bitcoin Dominance" value={globalData.data.market_cap_percentage.btc} suffix="%" />
          <MetricCard title="Ethereum Dominance" value={globalData.data.market_cap_percentage.eth} suffix="%" />
          <MetricCard title="Active Cryptocurrencies" value={globalData.data.active_cryptocurrencies} />
          <MetricCard
            title="DeFi Market Cap"
            value={(defiData.data.defi_market_cap / 1e9).toFixed(2)}
            prefix="$"
            suffix="B"
          />
          <MetricCard
            title="DeFi to ETH Ratio"
            value={(Number(defiData.data.defi_to_eth_ratio) * 100).toFixed(2)}
            suffix="%"
          />
          <MetricCard title="Top DeFi Token" value={defiData.data.top_coin_name} />
          <MetricCard
            title="Total Market Cap"
            value={globalData.data.total_market_cap.usd}
            change={globalData.data.market_cap_change_percentage_24h_usd}
            prefix="$"
          />
          <MetricCard title="24h Volume" value={globalData.data.total_volume.usd} prefix="$" />
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Cryptocurrencies</h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {topCoins.slice(0, 10).map((coin: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-6 h-6 mr-2" />
                        <span className="text-white">{coin.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{formatCurrency(coin.current_price)}</div>
                        <div className={coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>
                          {formatPercentage(coin.price_change_percentage_24h)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Trending Coins</h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {Array.isArray(trendingCoins) && trendingCoins.length > 0 ? (
                    trendingCoins.map((coin: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={coin.item.small || "/placeholder.svg"}
                            alt={coin.item.name}
                            className="w-6 h-6 mr-2"
                          />
                          <span className="text-white">{coin.item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white">#{coin.item.market_cap_rank}</div>
                          <div className="text-gray-400">{coin.item.symbol}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No trending coins available</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

