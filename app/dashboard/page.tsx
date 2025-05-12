"use client"

import { DashboardChart } from "@/components/dashboard/chart"
import { DashboardMetrics } from "@/components/dashboard/metrics"
import { MarketOverview } from "@/components/dashboard/market-overview"
import { LivePrice } from "@/components/dashboard/live-price"
import { LoginModal } from "@/components/ui/LoginModal"
import { useEffect, useState } from "react"
// Web3 and direct wallet interaction might not be needed here anymore if ConnectButton handles it
// import Web3 from "web3" 
import { ConnectButton } from "@/components/ConnectButton"
// isPremiumUser util might be replaced by session data
// import { isPremiumUser } from "@/utils/isPremiumUser" 
import { useSession } from "next-auth/react" // Import useSession
import { useDashboardAccess } from "@/hooks/useDashboardAccess" // To get premium status and modal state

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  // useDashboardAccess hook provides isAuthenticated, isPremium, sessionStatus, etc.
  // We can use this to simplify logic here.
  const { 
    isAuthenticated, 
    isPremium, 
    sessionStatus: accessSessionStatus, // Renaming to avoid conflict if needed, though same as useSession's
    // isOpenModal, // This is for the premium modal in layout, not login modal
    // onOpenModalChange 
  } = useDashboardAccess();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // The middleware should handle redirecting if not authenticated.
  // This page will only render if the user is authenticated or session is loading.
  // The LoginModal here is a bit redundant if middleware redirects to a login page.
  // However, if the intent is to show a modal *on this page* if somehow reached while unauthenticated,
  // then `isAuthenticated` from `useDashboardAccess` (which uses `useSession`) is the correct check.

  if (!hasMounted) {
    // Prevents hydration errors
    return null;
  }

  // Show loading state while session is being determined
  if (accessSessionStatus === "loading") {
    return <div>Loading session...</div>;
  }

  // If user is not authenticated, middleware should have redirected.
  // If for some reason it didn't, or if we want an explicit in-page prompt:
  if (!isAuthenticated) {
    // This LoginModal will contain the ConnectButton which now handles NextAuth sign-in
    return (
      <LoginModal isOpen={true}> {/* isOpen is always true if not authenticated */}
        <ConnectButton /> {/* ConnectButton is now self-contained */}
      </LoginModal>
    );
  }

  // At this point, user is authenticated.
  // The premium status is available via `isPremium` from `useDashboardAccess`.
  // The premium modal for restricted features is handled by `DashboardLayout` using `useDashboardAccess`.
  // This page can now just display its content.
  // The old `isLoading` for premium check is no longer needed as `isPremium` comes from session.

  return (
    <div className="space-y-6">
      <div className="w-full">
        {/* All content below assumes user is authenticated.
            Premium-specific content *within* this page would check `isPremium`.
            But general dashboard access is granted. */}
        <LivePrice />
        <DashboardChart />
        <DashboardMetrics />
        <MarketOverview />
        {/* Example of premium content check within the page:
        {isPremium ? (
          <div>Premium Feature X</div>
        ) : (
          <div>Upgrade to see Premium Feature X</div>
        )}
        */}
      </div>
    </div>
  );
}
