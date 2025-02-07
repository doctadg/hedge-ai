import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black pt-16">
      {" "}
      {/* Added pt-16 for navbar space */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #1a1a1a 1px, transparent 1px),
                               linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)`,
              backgroundSize: "4rem 4rem",
              maskImage: "radial-gradient(circle at center, black 40%, transparent 70%)",
            }}
          />
        </div>
      </div>
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex min-h-screen flex-col items-center justify-center text-center">
            <div className="max-w-4xl">
              <div className="mb-8 inline-flex items-center rounded-full border border-gray-800 bg-gray-900/50 px-6 py-2 backdrop-blur">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-300">Next-Generation Investment Intelligence</span>
              </div>

              <h1 className="mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-6xl font-bold tracking-tight text-transparent md:text-7xl">
                Hedge AI
              </h1>

              <p className="mb-12 -mt-2 text-xl text-gray-400">Next-Generation Investment Intelligence</p>

              <Button
                asChild
                size="lg"
                className="relative h-14 overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_0_rgba(34,197,94,0.3)] focus:scale-105"
              >
                <Link href="/dashboard">
                  Get Started
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite] transition-all" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

