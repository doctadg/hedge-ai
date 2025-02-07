"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "BTC", value: 40 },
  { name: "ETH", value: 30 },
  { name: "USDC", value: 20 },
  { name: "Other", value: 10 },
]

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"]

export default function AllocationsPage() {
  return (
    <div className="space-y-6">
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
                  <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-400">{item.name}</span>
                  <span className="ml-auto text-white">{item.value}%</span>
                </div>
              ))}
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
    </div>
  )
}

