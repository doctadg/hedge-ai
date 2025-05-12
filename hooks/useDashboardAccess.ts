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
    // No need to fetch premium status separately, it's in currentUser
    if (isConnected && account) { // Ensure account is also present, though currentUser implies it
      if (restrictedRoutes.includes(pathname) && !isUserPremium) {
        setIsOpen(true); // Open modal if on restricted route and not premium
      } else if (!restrictedRoutes.includes(pathname) || isUserPremium) {
        // If on non-restricted route, or if user is premium, ensure modal is closed
        // This might be too aggressive if modal is used for other things.
        // Consider if modal should only be set to true here and closed by its own logic.
        // For now, let's assume it's only for premium restriction.
        // setIsOpen(false); // Let's comment this out to prevent unintended closing. Modal should manage its own close.
      }
    }
  }, [isConnected, account, pathname, isUserPremium]); // Add isUserPremium to dependencies

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
