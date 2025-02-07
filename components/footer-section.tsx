import { Button } from "@/components/ui/button"

export function FooterSection() {
  const partners = [
    "CoinDesk",
    "Nasdaq",
    "Yahoo",
    "Bitcoin",
    "CNBC",
    "Blockworks",
  ]

  const footerLinks = [
    {
      title: "Company",
      links: ["About", "Careers", "Press"],
    },
    {
      title: "Product",
      links: ["Features", "Pricing", "Security"],
    },
    {
      title: "Resources",
      links: ["Blog", "Help Center", "API"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Cookies"],
    },
  ]

  return (
    <footer className="mt-20 border-t border-gray-800 bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">New finance deserves a new terminal</h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
            {partners.map((partner) => (
              <div
                key={partner}
                className="text-gray-500 transition-colors hover:text-gray-400"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-8 text-sm text-gray-500 md:grid-cols-5">
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 font-semibold text-gray-400">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link} className="hover:text-gray-300">
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="mb-4 font-semibold text-gray-400">Subscribe</h3>
            <p className="mb-4">Stay up to date with our latest news and products.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-md bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400"
              />
              <Button type="submit" className="bg-green-500 hover:bg-green-600">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  )
}

