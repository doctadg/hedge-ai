"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const timeframes = ["1H", "1D", "7D", "1M", "YTD", "1Y", "5Y", "ALL"]

export function DashboardChart() {
  return (
    <Card className="border-0 bg-[#0a0a0a] p-4">
      <div className="h-[400px]">
        <iframe
          className="w-full h-full"
          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BITSTAMP%3ABTCUSD&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=BITSTAMP%3ABTCUSD"
        ></iframe>
      </div>
    </Card>
  )
}
