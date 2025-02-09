"use client"

import { HedgingStrategies } from "@/components/dashboard/hedging-strategies"
import { useDashboardAccess } from "@/hooks/useDashboardAccess"
import { PremiumModal } from "@/components/ui/PremiumModal"

export default function GenerateStrategyPage() {
  const { isPremium } = useDashboardAccess()

  return (
    <div className="space-y-6">
      {!isPremium ? (
        <PremiumModal>
          <Content />
        </PremiumModal>
      ) : (
        <Content />
      )}
    </div>
  )
}

function Content() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white">
        Generate Hedging Strategy
      </h1>
      <HedgingStrategies />
    </>
  )
}
