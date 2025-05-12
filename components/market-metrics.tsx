"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  fetchCoinGeckoCoinMarketChart,
  fetchCoinGeckoMarkets,
  fetchCoinGeckoTrending,
} from "@/utils/api";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";


// Helper to format currency
const formatCurrency = (value: number, minimumFractionDigits = 2, maximumFractionDigits = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

// Helper to format percentage
const formatPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};


interface BitcoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

interface BitcoinChartData {
  prices: [number, number][]; // [timestamp, price]
}

interface TrendingCoinItem {
  id: string;
  name: string;
  symbol: string;
  small: string; // image
  score?: number;
}
interface TrendingCoin {
  item: TrendingCoinItem;
}

interface TopCoinMarketData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
}

export function MarketMetrics() {
  const [bitcoinMarket, setBitcoinMarket] = useState<BitcoinMarketData | null>(null);
  const [bitcoinChart, setBitcoinChart] = useState<BitcoinChartData | null>(null);
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [topMarketCoins, setTopMarketCoins] = useState<TopCoinMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [btcMarketData, btcChartData, trendingData, topCoinsData] = await Promise.all([
          fetchCoinGeckoMarkets({ ids: "bitcoin", vs_currency: "usd" }),
          fetchCoinGeckoCoinMarketChart({ id: "bitcoin", vs_currency: "usd", days: 7 }),
          fetchCoinGeckoTrending(),
          fetchCoinGeckoMarkets({ vs_currency: "usd", order: "market_cap_desc", per_page: 5 }), // Top 5 for this card
        ]);

        if (btcMarketData && btcMarketData.length > 0) {
          setBitcoinMarket(btcMarketData[0]);
        }
        setBitcoinChart(btcChartData); // btcChartData contains { prices: [...] }
        
        if (trendingData && trendingData.coins && Array.isArray(trendingData.coins)) {
          setTrendingCoins(trendingData.coins.slice(0, 5)); // Show top 5 trending
        } else {
          setTrendingCoins([]);
        }

        if (Array.isArray(topCoinsData)) {
          setTopMarketCoins(topCoinsData);
        } else {
          setTopMarketCoins([]);
        }

      } catch (err: any) {
        console.error("Error fetching market metrics data:", err);
        setError(`Failed to load metrics: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formattedBtcChartData = bitcoinChart?.prices?.map(pricePoint => ({
    timestamp: pricePoint[0],
    price: pricePoint[1],
    // name: new Date(pricePoint[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // For XAxis if needed
  })) || [];


  if (loading) return <div className="text-center text-white py-10">Loading metrics...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Bitcoin Stats Card */}
      <Card className="bg-[#0A0A0A] border border-[#1a1a1a] p-4">
        <CardContent className="pt-4">
          {bitcoinMarket ? (
            <>
              <div className="flex items-center gap-4 mb-2">
                <img src={bitcoinMarket.image} alt={bitcoinMarket.name} className="h-10 w-10 rounded-full" />
                <div>
                  <h3 className="font-medium text-gray-200">{bitcoinMarket.name} ({bitcoinMarket.symbol.toUpperCase()})</h3>
                  <div className="flex items-baseline gap-2">
                     <p className="text-xl font-bold text-white">{formatCurrency(bitcoinMarket.current_price, 2, 2)}</p>
                     <span className={`text-sm ${bitcoinMarket.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatPercentage(bitcoinMarket.price_change_percentage_24h)}
                     </span>
                  </div>
                </div>
              </div>
              <div className="mt-1 h-[100px]">
                {formattedBtcChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedBtcChartData}>
                       <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "0.5rem" }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        formatter={(value: number) => [formatCurrency(value, 2, 2), "Price"]}
                      />
                      <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-400 text-sm text-center">Chart data unavailable.</p>}
              </div>
            </>
          ) : <p className="text-gray-400">Bitcoin data unavailable.</p>}
        </CardContent>
      </Card>
      
      {/* Trending Coins Card */}
      <Card className="bg-[#0A0A0A] border border-[#1a1a1a] p-4">
         <CardHeader className="p-0 mb-2">
            <CardTitle className="text-gray-200 text-base font-medium">See what's trending</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trendingCoins.length > 0 ? (
            <ul className="space-y-2">
              {trendingCoins.map((coin) => (
                <li key={coin.item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <img src={coin.item.small} alt={coin.item.name} className="h-5 w-5 rounded-full" />
                    <span className="text-gray-300">{coin.item.name}</span>
                  </div>
                  <span className="text-gray-400">({coin.item.symbol.toUpperCase()})</span>
                  {/* Score or rank could be displayed here if desired: coin.item.score */}
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-400 text-sm">No trending coins data.</p>}
        </CardContent>
      </Card>
      
      {/* Monitor Live Markets Card */}
      <Card className="bg-[#0A0A0A] border border-[#1a1a1a] p-4">
        <CardHeader className="p-0 mb-2">
            <CardTitle className="text-gray-200 text-base font-medium">Monitor live markets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topMarketCoins.length > 0 ? (
            <ul className="space-y-2">
              {topMarketCoins.map((coin) => (
                <li key={coin.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                     <img src={coin.image} alt={coin.name} className="h-5 w-5 rounded-full" />
                    <span className="text-gray-300">{coin.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">{formatCurrency(coin.current_price, 2, 2)}</span>
                    {coin.price_change_percentage_24h !== null && (
                       <span className={`text-xs ${coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-400 text-sm">No market data available.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
