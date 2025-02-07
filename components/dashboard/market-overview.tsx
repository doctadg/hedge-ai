"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTrendingCoins, fetchCoinCategories, fetchDerivativesExchanges } from "@/utils/api"

export function MarketOverview() {
  const [trendingCoins, setTrendingCoins] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [derivativesExchanges, setDerivativesExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [trendingData, categoriesData, derivativesData] = await Promise.all([
          fetchTrendingCoins(),
          fetchCoinCategories(),
          fetchDerivativesExchanges(),
        ])

        if (trendingData && trendingData.coins && Array.isArray(trendingData.coins)) {
          setTrendingCoins(trendingData.coins.slice(0, 5))
        } else {
          console.error("Invalid trending coins data:", trendingData)
          setTrendingCoins([])
        }

        if (Array.isArray(categoriesData)) {
          setTopCategories(categoriesData.slice(0, 5))
        } else {
          console.error("Invalid categories data:", categoriesData)
          setTopCategories([])
        }

        if (Array.isArray(derivativesData)) {
          setDerivativesExchanges(derivativesData.slice(0, 5))
        } else {
          console.error("Invalid derivatives exchanges data:", derivativesData)
          setDerivativesExchanges([])
        }
      } catch (error) {
        console.error("Error fetching market overview data:", error)
        setError(`Failed to load market overview: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="text-white">Loading market overview...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Trending Coins</CardTitle>
        </CardHeader>
        <CardContent>
          {trendingCoins.length > 0 ? (
            <ul className="space-y-2">
              {trendingCoins.map((coin) => (
                <li key={coin.item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={coin.item.small || "/placeholder.svg"}
                      alt={coin.item.name}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    <span className="text-white">{coin.item.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{coin.item.symbol}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No trending coins available</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <ul className="space-y-2">
              {topCategories.map((category) => (
                <li key={category.id} className="flex items-center justify-between">
                  <span className="text-white">{category.name}</span>
                  <span className={category.market_cap_change_24h >= 0 ? "text-green-500" : "text-red-500"}>
                    {category.market_cap_change_24h.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No categories available</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Top Derivatives Exchanges</CardTitle>
        </CardHeader>
        <CardContent>
          {derivativesExchanges.length > 0 ? (
            <ul className="space-y-2">
              {derivativesExchanges.map((exchange) => (
                <li key={exchange.id} className="flex items-center justify-between">
                  <span className="text-white">{exchange.name}</span>
                  <span className="text-sm text-gray-400">{exchange.open_interest_btc.toFixed(2)} BTC</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No derivatives exchanges available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

