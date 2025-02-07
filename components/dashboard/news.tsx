const news = [
  {
    title: "Trump Likes Crypto: Just As Long As It's For Grifting",
    source: "bitcoinmagazine.com",
    time: "27m",
  },
  {
    title: "Inflation and Job Scares Fuel Risk of Civil Unrest, Edelman Says",
    source: "Bloomberg.com",
    time: "30m",
  },
  {
    title: "From Thousands to Tens of Thousands: Moonshot's User Base Skyrockets Amid TRUMP Meme Coin Craze",
    source: "Bitcoin.com",
    time: "1h",
  },
  {
    title: "Spain's Premier Aims to Ban Non-EU Citizens From Buying Homes",
    source: "Bloomberg.com",
    time: "1h",
  },
  {
    title: "Coinbase CEO Urges Nations to Establish Bitcoin Reserves",
    source: "bitconews",
    time: "1h",
  },
]

export function DashboardNews() {
  return (
    <aside className="w-80 border-l border-[#1a1a1a] bg-[#0a0a0a] p-4">
      <div className="space-y-4">
        {news.map((item, i) => (
          <div key={i} className="border-b border-[#1a1a1a] pb-4 last:border-0">
            <h3 className="mb-1 text-sm text-white hover:text-green-500">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{item.time}</span>
              <span>•</span>
              <span>{item.source}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

