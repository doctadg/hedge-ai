"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { date: "Jan", price: 40000 },
  { date: "Feb", price: 45000 },
  { date: "Mar", price: 42000 },
  { date: "Apr", price: 48000 },
  { date: "May", price: 52000 },
  // Add more data points as needed
]

export function PriceChart() {
  return (
    <section className="container mx-auto px-4 py-8">
      <Card className="bg-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl">$96,537.20</span>
                <span className="ml-2 text-green-500">+1.24%</span>
              </div>
              <div className="text-sm text-gray-400">BITCOIN LIVE DASHBOARD</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

