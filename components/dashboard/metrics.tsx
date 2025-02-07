"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { fetchCoinData, fetchGlobalData, fetchCoinMarkets } from "@/utils/api"

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [bitcoinData, globalData, marketsData] = await Promise.all([
          fetchCoinData("bitcoin"),
          fetchGlobalData(),
          fetchCoinMarkets(),
        ])

        const btcMarketData = marketsData.find((coin) => coin.id === "bitcoin")

        setMetrics([
          { label: "24H HIGH", value: `$${bitcoinData.market_data.high_24h.usd.toLocaleString()}` },
          { label: "24H LOW", value: `$${bitcoinData.market_data.low_24h.usd.toLocaleString()}` },
          { label: "24H VOL (BTC)", value: bitcoinData.market_data.total_volume.btc.toLocaleString() },
          { label: "24H VOL (USD)", value: `$${bitcoinData.market_data.total_volume.usd.toLocaleString()}` },
          { label: "ATH (USD)", value: `$${bitcoinData.market_data.ath.usd.toLocaleString()}` },
          { label: "MARKET CAP", value: `$${bitcoinData.market_data.market_cap.usd.toLocaleString()}` },
          { label: "CIRCULATING SUPPLY", value: bitcoinData.market_data.circulating_supply.toLocaleString() },
          { label: "BTC DOMINANCE", value: `${globalData.data.market_cap_percentage.btc.toFixed(2)}%` },
          { label: "TOTAL MARKET CAP", value: `$${globalData.data.total_market_cap.usd.toLocaleString()}` },
          {
            label: "24H CHANGE",
            value: `${btcMarketData.price_change_percentage_24h.toFixed(2)}%`,
            className: btcMarketData.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500",
          },
        ])
      } catch (error) {
        console.error("Error fetching metrics data:", error)
        setError("Failed to load metrics. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="text-white">Loading metrics...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-0 bg-[#0A0A0A] p-4">
          <div className="text-xs font-medium text-gray-400">{metric.label}</div>
          <div className={`mt-1 font-mono text-sm ${metric.className || "text-white"}`}>{metric.value}</div>
        </Card>
      ))}
    </div>
  )
}

