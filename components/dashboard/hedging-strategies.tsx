"use client"

import { useState, type React } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function HedgingStrategies() {
  const [loading, setLoading] = useState(false)
  const [strategy, setStrategy] = useState("")
  const [error, setError] = useState<string | null>(null)

  const generateStrategy = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.target as HTMLFormElement)
    const asset = formData.get("asset") as string
    const riskTolerance = formData.get("riskTolerance") as string

    try {
      const response = await fetch("/api/generate-strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ asset, riskTolerance }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate strategy")
      }

      const data = await response.json()
      setStrategy(data.strategy)
    } catch (error) {
      console.error("Error generating strategy:", error)
      setError("Failed to generate strategy. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#0A0A0A] border-[#1a1a1a]">
      <CardHeader>
        <CardTitle className="text-white">Hedging Strategies</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={generateStrategy} className="space-y-4">
          <div>
            <label htmlFor="asset" className="block text-sm font-medium text-gray-400">
              Asset
            </label>
            <Input
              id="asset"
              name="asset"
              type="text"
              required
              placeholder="e.g., BTC, ETH"
              className="mt-1 bg-[#1a1a1a] text-white border-gray-700"
            />
          </div>
          <div>
            <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-400">
              Risk Tolerance
            </label>
            <select
              id="riskTolerance"
              name="riskTolerance"
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-700 bg-[#1a1a1a] rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-green-500 text-white" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Strategy"
            )}
          </Button>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {strategy && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-2">Generated Strategy:</h3>
            <p className="text-gray-300">{strategy}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

