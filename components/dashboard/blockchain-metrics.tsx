import { Card } from "@/components/ui/card"

const sections = [
  {
    title: "Price",
    metrics: [
      { label: "Live Price", value: "$105,007.91" },
      { label: "Market Cap", value: "$2.08T" },
    ],
  },
  {
    title: "Blockchain",
    metrics: [
      { label: "Block Height", value: "879,956" },
      { label: "Time Since Last Block", value: "12 minutes ago" },
    ],
  },
  {
    title: "Block Reward",
    metrics: [
      { label: "Reward per Block (BTC)", value: "3.125" },
      { label: "Reward per Block (USD)", value: "$328,150" },
    ],
  },
  {
    title: "Difficulty Adjustment",
    metrics: [
      { label: "Previous Difficulty", value: "109,781" },
      { label: "Previous Difficulty Change", value: "+0.6401%", isPositive: true },
    ],
  },
]

export function BlockchainMetrics() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {sections.map((section) => (
        <Card key={section.title} className="border-0 bg-[#0a0a0a] p-4">
          <h3 className="mb-4 text-sm font-medium text-gray-400">{section.title}</h3>
          <div className="space-y-4">
            {section.metrics.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{metric.label}</span>
                <span
                  className={`font-mono text-sm ${
                    metric.isPositive ? "text-green-500" : "text-white"
                  }`}
                >
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

