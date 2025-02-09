"use client"

import { PortfolioChat } from "@/components/dashboard/portfolio-chat"
import { useDashboardAccess } from "@/hooks/useDashboardAccess"
import { PremiumModal } from "@/components/ui/PremiumModal"

export default function PortfolioChatPage() {
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
      <h1 className="text-2xl font-bold text-white">Portfolio Chat</h1>
      <PortfolioChat />
    </>
  )
}
