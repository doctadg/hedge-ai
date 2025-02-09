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
        const coinData = await coinRes.json();
        console.log('globalData', globalData)
        console.log('coinData', coinData)
        const newMetrics = [
          { label: "COINS", value: globalData?.Coins || "N/A" },
          { label: "EXCHANGES", value: globalData?.Exchanges || "N/A" },
          {
            label: "24H VOL (BTC)",
            value: coinData?.market_data.total_volume.btc.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) ?? "N/A",
          },
          {
            label: "24H VOL (USD)",
            value: coinData?.market_data.total_volume.usd
              ? `$${coinData.market_data.total_volume.usd.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "N/A",
          },
          { label: "ATH (USD)", value: `$0` }, // No ATH from Venym
          {
            label: "MARKET CAP",
            value: coinData?.market_data.market_cap.usd
              ? `$${coinData.market_data.market_cap.usd.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "N/A",
          },
          {
            label: "CIRCULATING SUPPLY",
            value:
              coinData?.market_data.circulating_supply.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }) ?? "N/A",
          },
          {
            label: "BTC DOMINANCE",
            value: globalData?.["BTC Dominance"]
              ? `${parseFloat(globalData["BTC Dominance"]?.replace(/[^0-9.-]+/g, "")).toFixed(2)}%`
              : "N/A",
          },
          {
            label: "TOTAL MARKET CAP",
            value: globalData?.["Market Cap"]
              ? `$${parseFloat(globalData["Market Cap"]?.replace(/[^0-9.-]+/g, "")).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "N/A",
          },
          {
            label: "ETH DOMINANCE",
            value: globalData?.["ETH Dominance"]
              ? `${parseFloat(globalData["ETH Dominance"]?.replace(/[^0-9.-]+/g, "")).toFixed(2)}%`
              : "N/A",
          },
        ];
        setMetrics(newMetrics);
        console.log("Metrics after update:", newMetrics);
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
