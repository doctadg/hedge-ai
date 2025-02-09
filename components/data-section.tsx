"use client"

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

const MetricCard = ({
  title,
  value,
  change,
  prefix = '',
  suffix = '',
}: {
  title: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
}) => {
  const formattedValue =
    typeof value === 'number'
      ? new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 2,
        }).format(value) + suffix
      : value;

  return (
    <motion.div
      className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg p-6 flex flex-col justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-bold text-white">
          {prefix}
          {formattedValue}
        </span>
        {change !== undefined && (
          <span
            className={`flex items-center text-sm ${
              change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {change >= 0 ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            {formatPercentage(change)}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export function DataSection() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ethereumData, cryptoData, bitcoinData] = await Promise.all([
          fetch('https://venym.io/api/ethereum').then((res) => res.json()),
          fetch('https://venym.io/api/crypto').then((res) => res.json()),
          fetch('https://venym.io/api/bitcoin').then((res) => res.json()),
        ]);

        console.log('ethereumData:', ethereumData);
        console.log('ethereumData:', ethereumData);
        console.log('cryptoData:', cryptoData);
        console.log('bitcoinData:', bitcoinData);

        // The responses are *already* parsed JSON objects.
        // Access the 'crypto' and 'bitcoin' properties directly.
        setData({
          ethereumData,
          cryptoData: cryptoData ? { crypto: cryptoData.crypto } : {},
          bitcoinData: bitcoinData ? { bitcoin: bitcoinData.bitcoin } : {},
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <section className="bg-black py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-black py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  if (loading || !data) {
    return (
      <section className="bg-black py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center text-white">Loading...</div>
        </div>
      </section>
    );
  }

    const { ethereumData, cryptoData, bitcoinData } = data || {};

  // Access parsed crypto data AFTER data is set
  const crypto = cryptoData?.crypto ? cryptoData.crypto : {};
    const bitcoin = bitcoinData?.bitcoin ? bitcoinData.bitcoin: {};

  // Calculate DeFi Market Cap (assuming it's 35% of Ethereum's Market Cap)
  const defiMarketCap =
    ethereumData && ethereumData[0]
      ? parseFloat(ethereumData[0].MarketCap.replace(/[^0-9.-]+/g, '')) * 0.35
      : undefined;

  // Calculate DeFi to ETH Ratio
  const defiToEthRatio =
    defiMarketCap && ethereumData && ethereumData[0]
      ? (defiMarketCap /
          parseFloat(ethereumData[0].MarketCap.replace(/[^0-9.-]+/g, ''))) *
        100
      : undefined;

  return (
    <section className="bg-black py-24 px-4 min-h-screen flex flex-col justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="container mx-auto relative z-10">
        <motion.h2
          className="text-4xl font-bold text-white mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Data you can't invest without
        </motion.h2>
        <motion.p
          className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Real-time market analysis and predictive insights for the top cryptocurrencies
        </motion.p>

        {/* 4x2 Grid of Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Bitcoin Dominance"
            value={crypto['BTC Dominance']?.replace('BTC ', '') || '0%'}
          />
          <MetricCard
            title="Ethereum Dominance"
            value={crypto['ETH Dominance']?.replace('ETH ', '') || '0%'}
          />
          <MetricCard
            title="Active Cryptocurrencies"
            value={crypto.Coins || '0'}
          />
          <MetricCard
            title="DeFi Market Cap"
            value={defiMarketCap !== undefined ? defiMarketCap : 'N/A'}
            prefix="$"
            
          />
          <MetricCard
            title="DeFi to ETH Ratio"
            value={defiToEthRatio !== undefined ? defiToEthRatio.toFixed(2) : 'N/A'}
            suffix="%"
          />
          <MetricCard title="Gas Fees (Gwei)" value={crypto['Gas Fees'] || 'N/A'} />
          <MetricCard
            title="Total Market Cap"
            value={crypto['Market Cap'] || '$0'}
            change={parseFloat(crypto['Market Cap Change'] || '0')}
            prefix="$"
          />
          <MetricCard
            title="24h Volume"
            value={crypto['24h Volume'] || '$0'}
            prefix="$"
          />
        </div>
      </div>
    </section>
  );
}
