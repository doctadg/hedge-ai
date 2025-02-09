"use client";

import { useWallet } from "@/contexts/WalletContext";
import { isPremiumUser } from "@/utils/isPremiumUser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useDashboardAccess() {
  const { isConnected, account } = useWallet();
  const [premium, setPremium] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkPremium = async () => {
      const isPrem = await isPremiumUser(account);
      setPremium(isPrem);
    };

    if (isConnected) {
      checkPremium();
      if (restrictedRoutes.includes(pathname) && !premium) {
        setIsOpen(true);
      }
    }
  }, [account, isConnected, pathname]);

  const restrictedRoutes = [
    "/dashboard/allocations",
    "/dashboard/chat",
    "/dashboard/generate-strategy",
    "/dashboard/performance",
    "/dashboard/portfolio-chat",
    "/dashboard/settings",
    "/dashboard/strategies",
  ];

  const isRestricted = restrictedRoutes.includes(pathname);

    const onOpenChange = (open: boolean) => {
        if (isRestricted && !premium && isConnected) {
            setIsOpen(true);
        } else {
            setIsOpen(open)
        }
    }

  return {
    isConnected,
    isPremium: premium,
    isOpen,
    onOpenChange
  };
}
