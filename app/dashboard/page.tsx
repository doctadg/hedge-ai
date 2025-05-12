"use client"

import { DashboardChart } from "@/components/dashboard/chart"
import { DashboardMetrics } from "@/components/dashboard/metrics"
import { MarketOverview } from "@/components/dashboard/market-overview"
import { LivePrice } from "@/components/dashboard/live-price"
// LoginModal and ConnectButton are no longer needed here as auth is handled by middleware and context
// Web3, isPremiumUser are also not needed directly here
import { useEffect, useState } from "react" // Keep for hasMounted if still desired for other reasons
import { useWallet } from "@/contexts/WalletContext" // Import the refactored context hook

export default function DashboardPage() {
  const { status, account, isPremium } = useWallet(); // Use values from context
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // This can help prevent hydration mismatches if needed,
    // but with proper session handling, might not be strictly necessary for auth.
    return null;
  }

  // Middleware now handles redirection if not authenticated.
  // The WalletContext provides the status: 'loading', 'authenticated', 'unauthenticated'.
  // The useDashboardAccess hook (in layout) handles premium modal for restricted pages.
  // This page is the main dashboard overview, accessible to all authenticated users.

  if (status === 'loading') {
    return <div>Loading session...</div>; // Or a more sophisticated loading spinner
  }

  if (status === 'unauthenticated') {
    // This case should ideally be handled by middleware redirecting to login.
    // If middleware is correctly configured, users shouldn't reach here unauthenticated.
    // However, as a fallback or for direct navigation attempts:
    return <div>Please log in to view the dashboard.</div>; // Or redirect to login page
  }
  
  // At this point, status === 'authenticated'
  // The premium check for *this specific page* (overview) is not required,
  // as it's accessible to all logged-in users.
  // The useDashboardAccess hook in the layout handles premium checks for other sub-pages.

  return (
    <div className="space-y-6">
      <div className="w-full">
        {/* Content for authenticated users */}
        <LivePrice />
        <DashboardChart />
        <DashboardMetrics />
        <MarketOverview />
      </div>
    </div>
  )
}
