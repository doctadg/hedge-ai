"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  fetchCoinGeckoTrending,
  fetchCoinGeckoCategories,
  fetchCoinGeckoDerivativesExchanges,
} from "@/utils/api"

// Define interfaces similar to the other market-overview component for consistency
interface TrendingCoinItem {
  id: string;
  coin_id: number; // Unused in this component's render but part of CG structure
  name: string;
  symbol: string;
  market_cap_rank?: number; // Unused
  thumb: string;
  small: string;
  large?: string; // Unused
  slug?: string; // Unused
  price_btc?: number; // Unused
  score?: number; // Unused
}

interface TrendingCoin {
  item: TrendingCoinItem;
}

interface Category {
  id: string;
  name: string;
  market_cap?: number; // Unused
  market_cap_change_24h: number | null; // Can be null from CoinGecko
  top_3_coins?: string[]; // Unused
  content?: string; // Unused
  volume_24h?: number; // Unused
}

interface DerivativesExchange {
  id: string;
  name: string;
  open_interest_btc: number | null;
  trade_volume_24h_btc?: string; // Unused in this component's render
  number_of_perpetual_pairs?: number; // Unused
  number_of_futures_pairs?: number; // Unused
  image?: string; // Unused
}


export function MarketOverview() {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])
  const [topCategories, setTopCategories] = useState<Category[]>([])
  const [derivativesExchanges, setDerivativesExchanges] = useState<DerivativesExchange[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Ensure error state can hold string messages

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [trendingResponse, categoriesResponse, derivativesResponse] = await Promise.all([
          fetchCoinGeckoTrending(),
          fetchCoinGeckoCategories({ order: "market_cap_desc" }),
          fetchCoinGeckoDerivativesExchanges({ order: "open_interest_btc_desc", per_page: 5 }), // Fetch top 5
        ]);

        // Trending coins from CoinGecko are nested under 'coins'
        if (trendingResponse && trendingResponse.coins && Array.isArray(trendingResponse.coins)) {
          setTrendingCoins(trendingResponse.coins.slice(0, 5));
        } else {
          console.warn("Trending coins data is not in expected format:", trendingResponse);
          setTrendingCoins([]);
        }

        // Categories data from CoinGecko is an array
        if (Array.isArray(categoriesResponse)) {
          setTopCategories(categoriesResponse.slice(0, 5));
        } else {
          console.warn("Categories data is not in expected format:", categoriesResponse);
          setTopCategories([]);
        }
        
        // Derivatives exchanges data from CoinGecko is an array
        if (Array.isArray(derivativesResponse)) {
          setDerivativesExchanges(derivativesResponse.slice(0,5)); // Already fetched 5
        } else {
          console.warn("Derivatives exchanges data is not in expected format:", derivativesResponse);
          setDerivativesExchanges([]);
        }

      } catch (err: any) {
        console.error("Error fetching dashboard market overview data:", err);
        setError(`Failed to load market overview: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="text-white text-center py-10">Loading market overview...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
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
                      src={coin.item.small || coin.item.thumb || "/placeholder.svg"}
                      alt={coin.item.name}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    <span className="text-white">{coin.item.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{coin.item.symbol.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No trending coins available.</p>
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
                  <span 
                    className={
                      category.market_cap_change_24h !== null && category.market_cap_change_24h >= 0 
                        ? "text-green-500" 
                        : "text-red-500"
                    }
                  >
                    {category.market_cap_change_24h !== null && category.market_cap_change_24h !== undefined
                      ? `${category.market_cap_change_24h.toFixed(2)}%`
                      : 'N/A'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No categories available.</p>
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
                <li key={exchange.id} className="flex items-center justify-between"> {/* Use exchange.id from CoinGecko */}
                  <span className="text-white">{exchange.name}</span>
                  <span className="text-sm text-gray-400">
                    {exchange.open_interest_btc ? `${exchange.open_interest_btc.toFixed(2)} BTC` : 'N/A'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No derivatives exchanges available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
