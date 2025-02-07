import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"

const dummyData = [
  { value: 30 },
  { value: 40 },
  { value: 35 },
  { value: 50 },
  { value: 45 },
  { value: 60 },
  { value: 55 },
]

export function MarketMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gray-900 p-4">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-800" />
            <div>
              <h3 className="font-medium text-gray-200">Bitcoin Mining is Less Profitable</h3>
              <p className="text-sm text-gray-400">Mining Difficulty: 123</p>
            </div>
          </div>
          <div className="mt-4 h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummyData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900 p-4">
        <CardContent>
          <h3 className="mb-4 font-medium text-gray-200">See what's trending</h3>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Trend {i + 1}</span>
                <span className="text-sm text-green-500">+{(Math.random() * 5).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900 p-4">
        <CardContent>
          <h3 className="mb-4 font-medium text-gray-200">Monitor live markets</h3>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Market {i + 1}</span>
                <span className="text-sm text-green-500">${(Math.random() * 1000).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

