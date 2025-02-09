"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown } from "lucide-react"

export function LivePrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [priceChangePercentage, setPriceChangePercentage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch("/api/livecoinwatch?symbol=BTC");
                if (!res.ok) {
                    throw new Error(`Failed to fetch Bitcoin price: ${res.status}`);
                }
                const data = await res.json();
                setPrice(data.rate);
                setPriceChange(data.rate * (data.delta.day - 1));
                setPriceChangePercentage((data.delta.day - 1) * 100);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching Bitcoin price:", error);
                setLoading(false);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

  if (loading) {
    return <div className="text-white">Loading price data...</div>
  }

  const isPositive = priceChange && priceChange > 0

  return (
    <Card className="w-full bg-[#0A0A0A] border-[#1a1a1a]">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-500">●</span>
              <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">BITCOIN LIVE DASHBOARD</h2>
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              ${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className={`font-mono text-xl sm:text-2xl ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? <ArrowUp className="inline mr-1" /> : <ArrowDown className="inline mr-1" />}$
              {Math.abs(priceChange || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              ({priceChangePercentage?.toFixed(2)}%)
            </span>
            <div className="mt-1 text-sm text-gray-400">24h change</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
