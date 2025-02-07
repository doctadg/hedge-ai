"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { fetchMarketChart } from "@/utils/api"

const timeframes = ["1H", "1D", "7D", "1M", "YTD", "1Y", "5Y", "ALL"]

export function DashboardChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const data = await fetchMarketChart("bitcoin", "7")
        const formattedData = data.prices.map(([timestamp, price]) => ({
          time: new Date(timestamp).toLocaleDateString(),
          price: price,
        }))
        setChartData(formattedData)
      } catch (error) {
        console.error("Error fetching chart data:", error)
        setError("Failed to load chart data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="text-white">Loading chart...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <Card className="border-0 bg-[#0a0a0a] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              className="h-7 rounded bg-[#1a1a1a] text-xs font-medium text-gray-400 hover:bg-[#262626] hover:text-white"
            >
              {tf}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-7 bg-[#1a1a1a] text-xs font-medium">
            TradingView
          </Button>
          <Button variant="ghost" size="sm" className="h-7 bg-[#1a1a1a] text-xs font-medium">
            PRO
          </Button>
          <Button variant="ghost" size="sm" className="h-7 bg-[#1a1a1a] text-xs font-medium">
            News
          </Button>
          <Button variant="ghost" size="sm" className="h-7 bg-[#1a1a1a] text-xs font-medium">
            Research
          </Button>
          <Button variant="ghost" size="sm" className="h-7 bg-[#1a1a1a] text-xs font-medium">
            Markets
          </Button>
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 40, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="time" stroke="#666" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              stroke="#666"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              domain={[90000, "auto"]}
            />
            <YAxis
              stroke="#666"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              orientation="right"
              yAxisId="right"
              domain={[90000, "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#fff" }}
              formatter={(value) => [`$${value.toLocaleString()}`, "Price"]}
            />
            <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} yAxisId="right" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

