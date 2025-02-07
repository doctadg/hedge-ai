"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchGlobalData, fetchCoinMarkets, fetchExchangeRates, fetchCoinCategories, fetchCoinData } from "@/utils/api"
import { ArrowDownIcon, ArrowUpIcon, Activity, Network, Cpu, Building2 } from "lucide-react"
import { motion } from "framer-motion"

interface MetricProps {
  label: string
  value: string | number
  change?: number
  prefix?: string
  suffix?: string
}

function MetricCard({ label, value, change, prefix = "", suffix = "" }: MetricProps) {
  const formattedValue =
    typeof value === "number"
      ? new Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 2,
        }).format(value)
      : value

  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="flex items-baseline justify-between">
        <div className="font-mono text-sm text-white">
          {prefix}
          {formattedValue}
          {suffix}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
            {change >= 0 ? <ArrowUpIcon className="mr-1 h-3 w-3" /> : <ArrowDownIcon className="mr-1 h-3 w-3" />}
            {Math.abs(change).toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  )
}

function MetricSection({
  title,
  icon: Icon,
  metrics,
}: {
  title: string
  icon: any
  metrics: MetricProps[]
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-medium text-white">{title}</h3>
      </div>
      <div className="grid gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  )
}

export function FeatureSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [globalData, markets, ethData] = await Promise.all([
          fetchGlobalData(),
          fetchCoinMarkets(),
          fetchCoinData("ethereum"),
        ])

        setData({
          globalData,
          markets,
          ethData,
        })
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <section className="relative bg-[#000000] py-24">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-gray-800 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-800 rounded"></div>
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const { globalData, markets, ethData } = data

  const sections = {
    trending: {
      title: "Trending Charts",
      icon: Activity,
      metrics: [
        {
          label: "ETH Circulating Supply",
          value: ethData.market_data.circulating_supply,
          change: ethData.market_data.circulating_supply_change_percentage_24h,
        },
        {
          label: "ETH Trading Volume",
          value: ethData.market_data.total_volume.usd,
          prefix: "$",
          suffix: "",
          change: ethData.market_data.total_volume_change_percentage_24h,
        },
        {
          label: "ETH Market Cap",
          value: ethData.market_data.market_cap.usd,
          prefix: "$",
          change: ethData.market_data.market_cap_change_percentage_24h,
        },
        {
          label: "ETH/BTC Ratio",
          value: ethData.market_data.current_price.btc,
          change: ethData.market_data.price_change_percentage_24h_in_currency.btc,
        },
      ],
    },
    market: {
      title: "Market",
      icon: Building2,
      metrics: [
        {
          label: "ETH Dominance",
          value: globalData.data.market_cap_percentage.eth,
          suffix: "%",
          change: ethData.market_data.market_cap_change_percentage_24h,
        },
        {
          label: "ETH Price (USD)",
          value: ethData.market_data.current_price.usd,
          prefix: "$",
          change: ethData.market_data.price_change_percentage_24h,
        },
        {
          label: "24h High",
          value: ethData.market_data.high_24h.usd,
          prefix: "$",
        },
        {
          label: "24h Low",
          value: ethData.market_data.low_24h.usd,
          prefix: "$",
        },
      ],
    },
    network: {
      title: "Network",
      icon: Network,
      metrics: [
        {
          label: "Total Value Locked",
          value: ethData.market_data.total_value_locked || "N/A",
          prefix: "$",
        },
        {
          label: "Gas Price (Gwei)",
          value: "25", // This would need a separate API call for real-time gas data
          suffix: " gwei",
        },
        {
          label: "Network Hash Rate",
          value: "1.02 PH/s", // This would need a separate API call for real-time hash rate
        },
        {
          label: "Active Validators",
          value: "889,242", // This would need a separate API call for validator data
        },
      ],
    },
    defi: {
      title: "DeFi",
      icon: Cpu,
      metrics: [
        {
          label: "Total DeFi TVL",
          value: globalData.data.defi_market_cap || 0,
          prefix: "$",
          change: globalData.data.defi_24h_vol_change || 0,
        },
        {
          label: "ETH Staked",
          value: "25.6M",
          suffix: " ETH",
        },
        {
          label: "Staking APR",
          value: "3.8",
          suffix: "%",
        },
        {
          label: "Active dApps",
          value: "3,945",
        },
      ],
    },
    exchanges: {
      title: "Exchanges",
      icon: Building2,
      metrics: [
        {
          label: "DEX Volume 24h",
          value: ethData.market_data.dex_volume || "18.24B",
          prefix: "$",
          change: 12.04,
        },
        {
          label: "CEX Volume 24h",
          value: ethData.market_data.total_volume.usd,
          prefix: "$",
          change: ethData.market_data.total_volume_change_percentage_24h,
        },
        {
          label: "DEX/CEX Ratio",
          value: "32.5",
          suffix: "%",
          change: 2.31,
        },
        {
          label: "Monthly Volume",
          value: (ethData.market_data.total_volume.usd * 30).toFixed(2),
          prefix: "$",
        },
      ],
    },
  }

  return (
    <section className="relative bg-[#000000] py-24">
      <div className="container mx-auto space-y-12 px-4">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">
            Advanced insights and
            <br />
            powerful research tools
          </h2>
          <p className="max-w-2xl text-gray-400">
            Ethereum&apos;s expansive network is now visible in one place. Experience a rich platform with endless
            possibilities.
          </p>
        </div>

        <Card className="border-0 bg-[#0A0A0A] shadow-2xl">
          <CardContent className="grid gap-8 p-6 md:grid-cols-3 lg:grid-cols-5">
            {Object.entries(sections).map(([key, section], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <MetricSection {...section} />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

