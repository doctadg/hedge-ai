"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, LayoutGrid, LineChart, Layers, MessageSquare, Settings, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useWallet } from "@/contexts/WalletContext"

const categories = [
  {
    title: "TOOLS",
    items: [{ label: "Overview", icon: "LayoutGrid", href: "/dashboard" }],
  },
  {
    title: "PNL ANALYSIS",
    items: [{ label: "Performance", icon: "LineChart", href: "/dashboard/performance" }],
  },
  {
    title: "HEDGING",
    items: [
      { label: "Strategies", icon: "Shield", href: "/dashboard/strategies" },
      { label: "Generate Strategy", icon: "LineChart", href: "/dashboard/generate-strategy" },
    ],
  },
  {
    title: "PORTFOLIO MANAGEMENT",
    items: [{ label: "Allocations", icon: "Layers", href: "/dashboard/allocations" }],
  },
  {
    title: "AI ASSISTANT",
    items: [{ label: "Portfolio Chat", icon: "MessageSquare", href: "/dashboard/portfolio-chat" }],
  },
  {
    title: "PERSONAL",
    items: [{ label: "Settings", icon: "Settings", href: "/dashboard/settings" }],
  },
]

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isConnected } = useWallet()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-[#1a1a1a] bg-[#0a0a0a] lg:static lg:block`}
      >
        <div className="p-4">
          <input
            type="search"
            placeholder="Search metrics"
            className="w-full rounded-md border-0 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <nav className="space-y-6 p-2">
          {categories.map((category) => (
            <div key={category.title} className="space-y-2">
              <h2 className="px-2 text-xs font-semibold text-gray-400">{category.title}</h2>
              {category.items.map((item) => {
                const Icon =
                  item.icon === "LayoutGrid"
                    ? LayoutGrid
                    : item.icon === "LineChart"
                      ? LineChart
                      : item.icon === "Layers"
                        ? Layers
                        : item.icon === "MessageSquare"
                          ? MessageSquare
                          : item.icon === "Shield"
                            ? Shield
                            : Settings
                const isActive = pathname === item.href

                // Only show the Overview option if not connected
                if (!isConnected && item.label !== "Overview") {
                  return null
                }

                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    asChild
                    className={`w-full justify-start ${
                      isActive ? "bg-[#1a1a1a] text-white" : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                    }`}
                  >
                    <Link href={item.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

