"use client";

import { useWallet } from "@/contexts/WalletContext";
// import { isPremiumUser } from "@/utils/isPremiumUser"; // No longer needed
import { usePathname } from "next/navigation"; // useRouter not used, removed
import { useEffect, useState } from "react";

export function useDashboardAccess() {
  const { status, isPremium: isUserPremium, account } = useWallet(); // Get status and isPremium from context
  const [isOpen, setIsOpen] = useState(false); // For controlling the premium modal
  const pathname = usePathname();

  const isConnected = status === 'authenticated'; // Determine connection status

  useEffect(() => {
    if (status === 'loading') {
      // If session is loading, don't do anything yet, modal should remain closed or managed by its previous state.
      // Or explicitly ensure it's closed if it shouldn't show during loading:
      // setIsOpen(false); 
      return;
    }

    if (isConnected) { // User is authenticated
      if (restrictedRoutes.includes(pathname) && !isUserPremium) {
        setIsOpen(true); // Open modal if on restricted route and not premium
      } else {
        // If on non-restricted route, or if user is premium on a restricted route,
        // ensure modal is closed.
        setIsOpen(false);
      }
    } else {
      // User is not authenticated, ensure modal is closed as middleware should handle redirection.
      // Or, if a login prompt is desired here for UX, this could be a place.
      // For now, assuming middleware handles unauthenticated access to dashboard.
      setIsOpen(false);
    }
  }, [status, isConnected, account, pathname, isUserPremium]); // Dependencies for the effect

  const restrictedRoutes = [
    "/dashboard/allocations",
    "/dashboard/chat",
    "/dashboard/generate-strategy",
    "/dashboard/performance",
    // "/dashboard/portfolio-chat", // Assuming this might be covered by /dashboard/chat or is a separate feature
    "/dashboard/settings",
    // "/dashboard/strategies", // Assuming this was a typo or old route
  ];

  const isCurrentRouteRestricted = restrictedRoutes.includes(pathname);

  const onOpenChange = (open: boolean) => {
    // If trying to close the modal on a restricted page without being premium and authenticated, keep it open.
    if (isCurrentRouteRestricted && !isUserPremium && isConnected && !open) {
      setIsOpen(true); 
    } else {
      setIsOpen(open);
    }
  };

  // Return the necessary values for the dashboard layout
  return {
    isOpen,
    onOpenChange,
    // Optionally, expose isConnected and isUserPremium if needed directly by the layout,
    // though the modal's visibility (isOpen) is the primary concern here.
    // isConnected, 
    // isPremium: isUserPremium 
  };
}
