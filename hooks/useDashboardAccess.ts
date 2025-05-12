"use client";

import { useWallet } from "@/contexts/WalletContext";
// import { isPremiumUser } from "@/utils/isPremiumUser"; // No longer needed
import { usePathname } from "next/navigation"; // useRouter not used, removed
import { useEffect, useState } from "react";

export function useDashboardAccess() {
  const { isConnected, account, currentUser } = useWallet(); // Get currentUser from context
  // const [premium, setPremium] = useState(false); // premium status now comes from currentUser
  const [isOpen, setIsOpen] = useState(false); // For controlling a modal, presumably
  const pathname = usePathname();

  const isUserPremium = !!currentUser?.isPremium; // Get premium status from currentUser

  useEffect(() => {
    if (isConnected && account) {
      // Directly use currentUser?.isPremium in the condition
      if (restrictedRoutes.includes(pathname) && !currentUser?.isPremium) {
        setIsOpen(true);
      } else {
        // If not on a restricted route, or if user is premium, ensure modal is closed.
        // This logic might need refinement if the modal is used for other purposes.
        // For now, this ensures it closes if the condition for opening it is not met.
        setIsOpen(false); 
      }
    } else if (!isConnected) {
      // If not connected, ensure modal is closed (or handle as per desired UX)
      setIsOpen(false);
    }
  }, [isConnected, account, pathname, currentUser]); // Depend on currentUser directly

  const restrictedRoutes = [
    "/dashboard/allocations",
    "/dashboard/chat",
    "/dashboard/generate-strategy",
    "/dashboard/performance",
    "/dashboard/portfolio-chat",
    "/dashboard/settings",
    // "/dashboard/strategies", // Assuming this was a typo or old route, common pattern is plural
  ];

  const isRestricted = restrictedRoutes.includes(pathname);

  const onOpenChange = (open: boolean) => {
    // If trying to close the modal on a restricted page without premium, keep it open.
    if (isRestricted && !isUserPremium && isConnected && !open) {
      setIsOpen(true); 
    } else {
      setIsOpen(open);
    }
  };

  return {
    isConnected,
    isPremium: isUserPremium, // Use premium status from context
    isOpen,
    onOpenChange,
    // Expose currentUser if other parts of the dashboard need more details
    // currentUser 
  };
}
