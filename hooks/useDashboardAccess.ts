"use client";

import { useWallet } from "@/contexts/WalletContext";
import { useSession } from "next-auth/react"; // Import useSession
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useDashboardAccess() {
  const { isConnected: isWalletPhysicallyConnected, account } = useWallet(); // Renamed for clarity
  const { data: session, status: sessionStatus } = useSession(); // Get NextAuth session and status
  const [isOpen, setIsOpen] = useState(false); // For premium modal
  const pathname = usePathname();

  // User is considered authenticated if NextAuth session is active
  const isAuthenticated = sessionStatus === "authenticated";
  // Premium status comes from the NextAuth session token
  const isUserPremium = !!session?.user?.isPremium;

  useEffect(() => {
    // If NextAuth session is loading, don't make decisions yet
    if (sessionStatus === "loading") {
      return;
    }

    // If authenticated and on a restricted route but not premium, show modal
    if (isAuthenticated && restrictedRoutes.includes(pathname) && !isUserPremium) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }

    // If not authenticated (e.g. session ended, or never logged in via NextAuth)
    // and trying to access dashboard, the middleware should ideally redirect.
    // This hook primarily handles the premium modal logic for authenticated users.
    // The "connect wallet" prompt should be handled by components checking `isAuthenticated`
    // and `isWalletPhysicallyConnected` separately if needed.

  }, [isAuthenticated, isUserPremium, pathname, sessionStatus]);

  const restrictedRoutes = [
    "/dashboard/allocations",
    "/dashboard/chat",
    "/dashboard/generate-strategy",
    "/dashboard/performance",
    // "/dashboard/portfolio-chat", // Assuming this might be a new/future route
    "/dashboard/settings",
  ];

  const isRestrictedPage = restrictedRoutes.includes(pathname);

  const onOpenChange = (open: boolean) => {
    // Prevent closing the premium modal on a restricted page if user is not premium
    if (isAuthenticated && isRestrictedPage && !isUserPremium && !open) {
      setIsOpen(true);
    } else {
      setIsOpen(open);
    }
  };

  return {
    // `isAuthenticated` is the primary status for "logged in"
    isAuthenticated,
    // `isWalletPhysicallyConnected` can be used for UI like "Connect Wallet" button state
    isWalletPhysicallyConnected,
    // `sessionStatus` can be used to show loading indicators
    sessionStatus,
    // `session` object contains user data like walletAddress, isAdmin, isPremium
    session,
    isPremium: isUserPremium,
    isOpenModal: isOpen, // Renamed for clarity (premium modal)
    onOpenModalChange: onOpenChange, // Renamed for clarity
    // The account from useWallet can still be useful for display purposes or direct interactions
    walletAccount: account 
  };
}
