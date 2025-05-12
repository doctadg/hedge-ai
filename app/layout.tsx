import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/contexts/WalletContext"
import AuthProvider from "@/components/auth/AuthProvider" // Import AuthProvider

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/hedgelogo.png" sizes="any" />
      </head>
      <AuthProvider> {/* Wrap with AuthProvider */}
        <WalletProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <body className={inter.className}>{children}</body>
          </ThemeProvider>
        </WalletProvider>
      </AuthProvider>
    </html>
  )
}
