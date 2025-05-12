"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardAccess } from "@/hooks/useDashboardAccess"
import { PremiumModal } from "@/components/ui/PremiumModal"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { fetchCoinGeckoMarkets } from "@/utils/api";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"; // For price change indication

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
const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};


const staticPieData = [
  { id: "bitcoin", name: "BTC", value: 40, cgId: "bitcoin" },
  { id: "ethereum", name: "ETH", value: 30, cgId: "ethereum" },
  { id: "usd-coin", name: "USDC", value: 20, cgId: "usd-coin" },
  { id: "other", name: "Other", value: 10, cgId: null }, // No CoinGecko ID for "Other"
];

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];

interface AllocationMarketData {
  id: string;
  current_price?: number;
  price_change_percentage_24h?: number | null;
}

export default function AllocationsPage() {
  const { isPremium } = useDashboardAccess()

  return (
    <div className="space-y-6">
      {!isPremium ? (
        <PremiumModal>
          <Content />
        </PremiumModal>
      ) : (
        <Content />
      )}
    </div>
  )
}

function Content() {
  const [marketData, setMarketData] = useState<Record<string, AllocationMarketData>>({});
  const [loading, setLoading] = useState(true);
  // Error state can be added if needed

  useEffect(() => {
    async function loadAllocationMarketData() {
      setLoading(true);
      const coinIdsToFetch = staticPieData
        .filter(item => item.cgId)
        .map(item => item.cgId)
        .join(',');

      if (!coinIdsToFetch) {
        setLoading(false);
        return;
      }

      try {
        const fetchedData = await fetchCoinGeckoMarkets({ ids: coinIdsToFetch, vs_currency: "usd" });
        const newMarketData: Record<string, AllocationMarketData> = {};
        if (fetchedData && Array.isArray(fetchedData)) {
          fetchedData.forEach((coin: any) => {
            newMarketData[coin.id] = {
              id: coin.id,
              current_price: coin.current_price,
              price_change_percentage_24h: coin.price_change_percentage_24h,
            };
          });
        }
        setMarketData(newMarketData);
      } catch (error) {
        console.error("Error fetching market data for allocations:", error);
        // Handle error state if necessary
      } finally {
        setLoading(false);
      }
    }
    loadAllocationMarketData();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Portfolio Allocations</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white">Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={staticPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {staticPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                    }}
                    formatter={(value, name, props) => [`${value}%`, props.payload.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {staticPieData.map((item, index) => {
                const currentCoinMarketData = item.cgId ? marketData[item.cgId] : null;
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-400 mr-1">{item.name}</span>
                      <span className="text-white">({item.value}%)</span>
                    </div>
                    {!loading && currentCoinMarketData && (
                      <div className="flex items-center text-xs ml-2">
                        <span className="text-gray-300 mr-1">{formatCurrency(currentCoinMarketData.current_price || 0, 2, 2)}</span>
                        <span className={ (currentCoinMarketData.price_change_percentage_24h || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                           {(currentCoinMarketData.price_change_percentage_24h || 0) >= 0 ? <ArrowUpIcon className="h-3 w-3 inline" /> : <ArrowDownIcon className="h-3 w-3 inline" />}
                          {formatPercentage(currentCoinMarketData.price_change_percentage_24h)}
                        </span>
                      </div>
                    )}
                    {loading && item.cgId && <span className="text-xs text-gray-500 ml-2">Loading...</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white">Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Portfolio Beta</span>
                <span className="text-white">0.85</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sharpe Ratio</span>
                <span className="text-white">1.92</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Value at Risk (VaR)</span>
                <span className="text-white">$12,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Maximum Drawdown</span>
                <span className="text-red-500">-15.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
