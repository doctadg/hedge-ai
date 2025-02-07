"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "2024-01", pnl: 4000 },
  { date: "2024-02", pnl: -2000 },
  { date: "2024-03", pnl: 6000 },
  { date: "2024-04", pnl: 8000 },
  { date: "2024-05", pnl: -3000 },
  { date: "2024-06", pnl: 10000 },
]

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Performance Analysis</h1>

      <div className="grid gap-6">
        <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white">PNL Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                    }}
                  />
                  <Line type="monotone" dataKey="pnl" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Total PNL</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-500">$23,000</p>
              <p className="text-sm text-gray-400">+15.3% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-500">68%</p>
              <p className="text-sm text-gray-400">+5% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Avg. Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-500">$420</p>
              <p className="text-sm text-gray-400">-2.1% from last month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

