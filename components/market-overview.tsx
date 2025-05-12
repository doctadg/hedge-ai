"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  fetchCoinGeckoTrending, 
  fetchCoinGeckoCategories, 
  fetchCoinGeckoDerivativesExchanges 
} from "@/utils/api"

// Interfaces might need slight adjustments based on actual CoinGecko response structure
// For now, assuming they are largely compatible or will be adapted in rendering.
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
  id: string; // Added id for keying if available from CoinGecko
  name: string
  open_interest_btc: number
  trade_volume_24h_btc: string // CoinGecko returns this as string
  number_of_perpetual_pairs: number
  number_of_futures_pairs: number
  // image?: string; // Optional: if we want to display exchange image
}

export function MarketOverview() {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])
  const [topCategories, setTopCategories] = useState<Category[]>([])
  const [derivativesExchanges, setDerivativesExchanges] = useState<DerivativesExchange[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [trendingData, categoriesData, derivativesData] = await Promise.all([
          fetchCoinGeckoTrending(),
          fetchCoinGeckoCategories({ order: "market_cap_desc" }), // Fetch top categories by market cap
          fetchCoinGeckoDerivativesExchanges({ order: "open_interest_btc_desc" }), // Fetch top exchanges by open interest
        ]);
        
        // The 'coins' property is specific to CoinGecko's /search/trending response
        setTrendingCoins(trendingData.coins || []); 
        // Assuming categoriesData is an array directly
        setTopCategories((categoriesData || []).slice(0, 5));
        // Assuming derivativesData is an array directly
        setDerivativesExchanges((derivativesData || []).slice(0, 5));

      } catch (err: any) {
        console.error("Error fetching market overview data:", err);
        setError(`Failed to load data: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="text-center text-white py-10">Loading market overview...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Trending Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {trendingCoins.length > 0 ? trendingCoins.map((coin) => (
              <li key={coin.item.id} className="flex items-center space-x-2">
                <img
                  src={coin.item.small || coin.item.thumb || "/placeholder.svg"} // Prefer small, fallback to thumb
                  alt={coin.item.name}
                  className="h-6 w-6 rounded-full"
                />
                <span>{coin.item.name}</span>
                <span className="text-sm text-gray-500">({coin.item.symbol.toUpperCase()})</span>
              </li>
            )) : <p className="text-gray-400">No trending coins available.</p>}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topCategories.length > 0 ? topCategories.map((category) => (
              <li key={category.id} className="flex items-center justify-between">
                <span>{category.name}</span>
                <span className={category.market_cap_change_24h && category.market_cap_change_24h >= 0 ? "text-green-500" : "text-red-500"}>
                  {category.market_cap_change_24h !== null && category.market_cap_change_24h !== undefined 
                    ? `${category.market_cap_change_24h.toFixed(2)}%` 
                    : 'N/A'}
                </span>
              </li>
            )) : <p className="text-gray-400">No top categories available.</p>}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Derivatives Exchanges</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {derivativesExchanges.length > 0 ? derivativesExchanges.map((exchange) => (
              <li key={exchange.id || exchange.name} className="flex flex-col"> {/* Use exchange.id if available from CG */}
                <span className="font-medium">{exchange.name}</span>
                <span className="text-sm text-gray-500">
                  Open Interest: {exchange.open_interest_btc ? exchange.open_interest_btc.toFixed(2) : 'N/A'} BTC
                </span>
                <span className="text-sm text-gray-500">
                  24h Volume: {exchange.trade_volume_24h_btc ? Number.parseFloat(exchange.trade_volume_24h_btc).toFixed(2) : 'N/A'} BTC
                </span>
              </li>
            )) : <p className="text-gray-400">No top derivatives exchanges available.</p>}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
