"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        isScrolled ? "bg-black/50 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Image
              src="/hedgelogo.png"
              alt="Hedge AI Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            Hedge AI
          </Link>
          <Button asChild className="bg-green-500 text-white hover:bg-green-600 transition-colors">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
