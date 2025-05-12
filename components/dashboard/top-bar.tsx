"use client"

import Link from "next/link"
import {Settings} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@/components/ConnectButton"
import { useWallet } from "@/contexts/WalletContext";




export function DashboardTopBar() {
  const { isConnected, connect, disconnect } = useWallet();
  return (
    <div className="static top-0 left-0 right-0 z-50 w-full border-b border-gray-800 bg-black">
      {/* Apply full width and 7% horizontal padding */}
      <div className="w-full flex h-16 items-center justify-between px-[7%]">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-white flex items-center">
            <img src="/hedgelogo.png" alt="Hedge AI Logo" className="h-6 w-6 mr-2" />
            Hedge AI
          </Link>

        </div>
        <div className="flex items-center space-x-4">
          {/* Link the settings icon to the settings page */}
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <ConnectButton isConnected={isConnected} connect={connect} disconnect={disconnect} />

        </div>
      </div>
    </div>
  )
}
