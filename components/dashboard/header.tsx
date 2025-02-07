"use client"

import Link from "next/link"
import { Search, Bell, MessageSquare, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = ["EXPLORE", "DASHBOARDS", "METRICS", "NEWS", "RESEARCH", "PRICING"]

export function DashboardHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a] px-4 lg:px-6">
      <div className="flex items-center gap-4 lg:gap-8">
        <Link href="/" className="text-xl font-bold text-white">
          NewEdge
        </Link>
        <nav className="hidden lg:flex items-center gap-4">
          {navItems.map((item) => (
            <Button key={item} variant="ghost" className="text-sm font-medium text-gray-400 hover:text-white">
              {item}
            </Button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search"
            className="h-9 w-full sm:w-auto rounded-md bg-[#1a1a1a] pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Sun className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" className="font-medium hidden sm:inline-flex">
          Login
        </Button>
      </div>
    </header>
  )
}

