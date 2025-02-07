import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react"

const strategies = [
  {
    name: "Delta Neutral",
    description: "Maintain market neutrality through balanced long and short positions",
    status: "Active",
    performance: "+12.5%",
    isPositive: true,
  },
  {
    name: "Grid Trading",
    description: "Automated trading using price grid levels",
    status: "Paused",
    performance: "-3.2%",
    isPositive: false,
  },
  {
    name: "Momentum Following",
    description: "Follow market trends with dynamic position sizing",
    status: "Active",
    performance: "+15.7%",
    isPositive: true,
  },
]

export default function StrategiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Hedging Strategies</h1>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          New Strategy
        </Button>
      </div>

      <div className="grid gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.name} className="bg-[#0A0A0A] border-[#1a1a1a]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{strategy.name}</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">{strategy.description}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    strategy.status === "Active" ? "bg-emerald-500/20 text-emerald-500" : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {strategy.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Performance (30d)</span>
                <span
                  className={`flex items-center ${strategy.isPositive ? "text-emerald-500" : "text-red-500"} font-medium`}
                >
                  {strategy.isPositive ? (
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                  )}
                  {strategy.performance}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

