"use client"

"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface ConnectButtonProps {
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

export function ConnectButton({
  isConnected,
  connect,
  disconnect,
}: ConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  if (isConnected) {
    return (
      <Button
        onClick={disconnect}
        className="bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
      >
        Disconnect
      </Button>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  )
}
