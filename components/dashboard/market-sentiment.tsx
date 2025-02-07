import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MarketSentiment() {
  const sentiment = 65 // Example sentiment score

  return (
    <Card className="w-full bg-[#0A0A0A] border-[#1a1a1a]">
      <CardHeader>
        <CardTitle className="text-white">Market Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="relative h-24 w-24">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-700"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
              <circle
                className="text-green-500"
                strokeWidth="10"
                strokeDasharray={`${sentiment * 2.83} 283`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{sentiment}%</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-400">
              The current market sentiment is slightly bullish. This indicator suggests a positive outlook among traders
              and investors.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

