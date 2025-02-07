import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
        
        <div className="container relative mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">NewEdge</span>
          </Link>

          <nav className="hidden space-x-6 md:flex">
            <Link 
              href="/features" 
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Sign in
            </Button>
            <Button 
              variant="default"
              className="bg-green-500 text-sm font-medium text-white hover:bg-green-600"
            >
              <Link href="/dashboard">Launch App</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

