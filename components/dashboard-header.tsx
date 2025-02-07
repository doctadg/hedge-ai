import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <header className="border-b border-gray-800 bg-gray-900">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold">
          NewEdge
        </Link>
        <nav>
          <Button variant="ghost">Logout</Button>
        </nav>
      </div>
    </header>
  )
}

