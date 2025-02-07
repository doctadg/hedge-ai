import { DashboardTopBar } from "@/components/dashboard/top-bar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { WalletProvider } from "@/contexts/WalletContext"
import type React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WalletProvider>
      <div className="flex flex-col min-h-screen bg-black">
        <DashboardTopBar />
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </WalletProvider>
  )
}

