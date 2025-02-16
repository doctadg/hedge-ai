import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/contexts/WalletContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hedge AI",
  description: "Next-Generation Investment Intelligence",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/hedgelogo.png" sizes="any" />
      </head>
      <WalletProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <body className={inter.className}>{children}</body>
        </ThemeProvider>
      </WalletProvider>
    </html>
  )
}
