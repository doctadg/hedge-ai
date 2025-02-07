import { HedgingStrategies } from "@/components/dashboard/hedging-strategies"

export default function GenerateStrategyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Generate Hedging Strategy</h1>
      <HedgingStrategies />
    </div>
  )
}

