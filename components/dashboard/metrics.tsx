"use client"

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Metric {
  label: string;
  value: string;
  className?: string;
}

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [globalRes, coinRes] = await Promise.all([
          fetch("/api/data?endpoint=global"),
          fetch("/api/data?endpoint=coin"),
        ]);

        if (!globalRes.ok) {
          console.log('globalRes', globalRes)
          throw new Error(`Failed to fetch global data: ${globalRes.status}`);
        }
        if (!coinRes.ok) {
          console.log('coinRes', coinRes)
          throw new Error(`Failed to fetch coin data: ${coinRes.status}`);
        }

        const globalData = await globalRes.json();
        const coinData = await coinRes.json(); // This is now Bitcoin data from /coins/markets
        console.log('globalData (CoinGecko)', globalData)
        console.log('coinData (CoinGecko Bitcoin)', coinData)

        // Helper function for safe formatting
        const formatNumber = (num: number | undefined | null, options: Intl.NumberFormatOptions = {}) => {
          if (num === undefined || num === null || isNaN(num)) return "N/A";
          return num.toLocaleString("en-US", options);
        };

        const formatCurrency = (num: number | undefined | null, options: Intl.NumberFormatOptions = {}) => {
          if (num === undefined || num === null || isNaN(num)) return "N/A";
          // Abbreviation logic
          if (num >= 1e12) { // Trillions
            return `$${(num / 1e12).toFixed(2)}T`;
          } else if (num >= 1e9) { // Billions
            return `$${(num / 1e9).toFixed(2)}B`;
          } else if (num >= 1e6) { // Millions
            return `$${(num / 1e6).toFixed(2)}M`;
          } else { // Less than a million
            return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2, ...options })}`;
          }
        };

        const formatPercentage = (num: number | undefined | null) => {
          if (num === undefined || num === null || isNaN(num)) return "N/A";
          return `${num.toFixed(2)}%`;
        };

        const newMetrics = [
          { label: "COINS", value: formatNumber(globalData?.data?.active_cryptocurrencies) },
          { label: "EXCHANGES", value: formatNumber(globalData?.data?.markets) },
          // { // BTC Volume for just Bitcoin isn't directly available here, removing for now
          //   label: "24H VOL (BTC)",
          //   value: "N/A", // Need to calculate or find another endpoint if required
          // },
          {
            label: "BTC 24H VOL (USD)", // Renamed for clarity
            value: formatCurrency(coinData?.total_volume),
          },
          {
            label: "BTC ATH (USD)", // Renamed for clarity
            value: formatCurrency(coinData?.ath),
          },
          {
            label: "BTC MARKET CAP", // Renamed for clarity
            value: formatCurrency(coinData?.market_cap),
          },
          {
            label: "BTC CIRCULATING SUPPLY", // Renamed for clarity
            value: formatNumber(coinData?.circulating_supply, { maximumFractionDigits: 0 }),
          },
          {
            label: "BTC DOMINANCE",
            value: formatPercentage(globalData?.data?.market_cap_percentage?.btc),
          },
          {
            label: "TOTAL MARKET CAP",
            value: formatCurrency(globalData?.data?.total_market_cap?.usd),
          },
          {
            label: "ETH DOMINANCE",
            value: formatPercentage(globalData?.data?.market_cap_percentage?.eth),
          },
        ];
        setMetrics(newMetrics);
        console.log("Metrics after update (CoinGecko):", newMetrics);
      } catch (error) {
        console.error("Error fetching metrics data:", error);
        setError("Failed to load metrics. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-white">Loading metrics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  console.log("Metrics before render:", metrics);
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-0 bg-[#0A0A0A] p-4">
          <div className="text-xs font-medium text-gray-400">{metric.label}</div>
          <div className={`mt-1 font-mono text-sm ${metric.className || "text-white"}`}>{metric.value}</div>
        </Card>
      ))}
    </div>
  );
}
