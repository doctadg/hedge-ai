import { DashboardChart } from "@/components/dashboard/chart"
import { DashboardMetrics } from "@/components/dashboard/metrics"
import { MarketOverview } from "@/components/dashboard/market-overview"
import { LivePrice } from "@/components/dashboard/live-price"
import { MarketSentiment } from "@/components/dashboard/market-sentiment"
import { PortfolioOverview } from "@/components/PortfolioOverview"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="w-full">
        <LivePrice />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <DashboardChart />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <DashboardMetrics />
            <MarketOverview />
          </div>
          <div className="space-y-6">
            <PortfolioOverview />
            <MarketSentiment />
          </div>
        </div>
      </div>
    </div>
  )
}

