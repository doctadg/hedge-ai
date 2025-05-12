"use client"

"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react" // Import NextAuth hooks
import { useWallet } from "@/contexts/WalletContext" // Import useWallet to access the original connect/disconnect

interface ConnectButtonProps {
  // The component will now primarily use useSession and useWallet internally
  // Props might not be needed if it's self-contained, or can be simplified.
  // For now, let's assume it might still be used in places that pass down WalletContext values.
  isConnected?: boolean // This will be overridden by session status
  connect?: () => Promise<string | null> // Updated type
  disconnect?: () => void
}

export function ConnectButton(props: ConnectButtonProps) {
  const { data: session, status: sessionStatus } = useSession();
  const walletCtx = useWallet(); // Get full wallet context

  const [isProcessing, setIsProcessing] = useState(false); // Generic processing state

  const effectiveIsConnected = sessionStatus === "authenticated";

  const handleConnect = async () => {
    setIsProcessing(true);
    try {
      // Use connect from props if provided (e.g. from DashboardTopBar), otherwise from context
      const account = await (props.connect ? props.connect() : walletCtx.connect());
      if (account) {
        // After wallet is connected, sign in with NextAuth
        const signInResponse = await signIn("credentials", {
          walletAddress: account,
          redirect: false, // Handle redirect manually or rely on middleware
        });
        if (signInResponse?.error) {
          console.error("NextAuth signIn error:", signInResponse.error);
          // Optionally, disconnect wallet if NextAuth sign-in fails critically
          // await walletCtx.disconnect(); 
        } else if (signInResponse?.ok) {
          console.log("NextAuth signIn successful");
          // Potentially redirect to dashboard if not already there or if callbackUrl is set
          // For example, if (router.pathname !== '/dashboard') router.push('/dashboard');
        }
      } else {
        console.error("Wallet connection failed, no account returned.");
      }
    } catch (error) {
      console.error("Error in connection/sign-in process:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {
      // Disconnect wallet first
      if (props.disconnect) {
        props.disconnect();
      } else {
        walletCtx.disconnect();
      }
      // Then sign out from NextAuth
      await signOut({ redirect: true, callbackUrl: "/" }); // Redirect to homepage after sign out
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (sessionStatus === "loading" || isProcessing) {
    return (
      <Button
        disabled
        className="bg-gray-500 text-white hover:bg-gray-600 transition-colors"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {sessionStatus === "loading" ? "Loading..." : "Processing..."}
      </Button>
    );
  }

  if (effectiveIsConnected) {
    return (
      <Button
        onClick={handleDisconnect}
        className="bg-red-500 text-white hover:bg-red-600 transition-colors" // Changed color for disconnect
      >
        Disconnect Wallet
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      className="bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
    >
      Connect Wallet
    </Button>
  );
}
