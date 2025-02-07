"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTrendingSearches, fetchCoinCategories, fetchDerivativesExchanges } from "@/utils/api"

interface TrendingCoin {
  item: {
    id: string
    coin_id: number
    name: string
    symbol: string
    market_cap_rank: number
    thumb: string
    small: string
    large: string
    slug: string
    price_btc: number
    score: number
  }
}

interface Category {
  id: string
  name: string
  market_cap: number
  market_cap_change_24h: number
  top_3_coins: string[]
}

interface DerivativesExchange {
  name: string
  open_interest_btc: number
  trade_volume_24h_btc: string
  number_of_perpetual_pairs: number
  number_of_futures_pairs: number
}

export function MarketOverview() {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])
  const [topCategories, setTopCategories] = useState<Category[]>([])
  const [derivativesExchanges, setDerivativesExchanges] = useState<DerivativesExchange[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingData, categoriesData, derivativesData] = await Promise.all([
          fetchTrendingSearches(),
          fetchCoinCategories(),
          fetchDerivativesExchanges(),
        ])
        setTrendingCoins(trendingData.coins)
        setTopCategories(categoriesData.slice(0, 5))
        setDerivativesExchanges(derivativesData.slice(0, 5))
      } catch (error) {
        console.error("Error fetching market overview data:", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Trending Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {trendingCoins.map((coin) => (
              <li key={coin.item.id} className="flex items-center space-x-2">
                <img
                  src={coin.item.thumb || "/placeholder.svg"}
                  alt={coin.item.name}
                  className="h-6 w-6 rounded-full"
                />
                <span>{coin.item.name}</span>
                <span className="text-sm text-gray-500">({coin.item.symbol})</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topCategories.map((category) => (
              <li key={category.id} className="flex items-center justify-between">
                <span>{category.name}</span>
                <span className={category.market_cap_change_24h >= 0 ? "text-green-500" : "text-red-500"}>
                  {category.market_cap_change_24h.toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Derivatives Exchanges</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {derivativesExchanges.map((exchange) => (
              <li key={exchange.name} className="flex flex-col">
                <span className="font-medium">{exchange.name}</span>
                <span className="text-sm text-gray-500">
                  Open Interest: {exchange.open_interest_btc.toFixed(2)} BTC
                </span>
                <span className="text-sm text-gray-500">
                  24h Volume: {Number.parseFloat(exchange.trade_volume_24h_btc).toFixed(2)} BTC
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

