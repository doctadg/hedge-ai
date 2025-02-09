"use client";

import { useWallet } from "@/contexts/WalletContext";
import { isPremiumUser } from "@/utils/isPremiumUser";
import { useRouter, usePathname } from "next/navigation";
import { PremiumModal } from "@/components/ui/PremiumModal";
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
    }
  }, [account, isConnected]);

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

  useEffect(() => {
    if (isRestricted && !premium && isConnected) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isRestricted, premium, isConnected, pathname]);

  const renderContent = (children: React.ReactNode): React.ReactNode => {
    if (isConnected && premium) {
      return children;
    }
    if (!isConnected) {
      return children;
    }

    return children;
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return {
    isConnected,
    isPremium: premium,
    renderContent,
    isOpen,
    openModal,
  };
}
