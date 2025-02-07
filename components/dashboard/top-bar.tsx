"use client"

import Link from "next/link"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@/components/ConnectButton"

const categories = ["Overview", "Markets", "Portfolio", "Analytics"]

export function DashboardTopBar() {
  return (
    <div className="static top-0 left-0 right-0 z-50 w-full border-b border-gray-800 bg-black">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-white">
            Hedge AI
          </Link>
          <nav className="hidden md:flex space-x-4">
            {categories.map((category) => (
              <Button key={category} variant="ghost" className="text-gray-300 hover:text-white">
                {category}
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
          <ConnectButton />
        </div>
      </div>
    </div>
  )
}

