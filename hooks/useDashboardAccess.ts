import { useWallet } from "@/contexts/WalletContext"
import { isPremiumUser } from "@/utils/isPremiumUser"

export function useDashboardAccess() {
  console.log(typeof useWallet)
  const { isConnected, account } = useWallet()
  const premium = isPremiumUser(account)

  return {
    isConnected,
    isPremium: premium,
  }
}
