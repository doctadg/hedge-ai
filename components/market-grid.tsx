interface MarketDataItem {
  label: string
  value: string
  change: string
  isPositive?: boolean
}

interface MarketGridProps {
  title: string
  data: MarketDataItem[]
}

export function MarketGrid({ title, data }: MarketGridProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{item.label}</span>
            <div className="flex items-center gap-2">
              <span>{item.value}</span>
              <span
                className={item.isPositive ? "text-green-500" : "text-red-500"}
              >
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

