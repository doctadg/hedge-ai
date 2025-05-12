'use client';

import { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { signIn } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext'; // Your existing wallet context
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

// Renamed the component and removed 'export default'
function AdminLoginContent() { 
  const { account, connect: connectWallet, isConnected } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  // Effect to attempt sign-in once wallet is connected and is an admin
  useEffect(() => {
    if (isConnected && account) {
      // Automatically try to sign in if wallet is connected
      // The authorize function in NextAuth config will check if this account is an admin
      handleSignIn(account);
    }
  }, [isConnected, account]); // Removed handleSignIn from deps as it's defined below

  const handleSignIn = async (walletAddress: string) => {
    setIsLoading(true);
    setError(null);
    const result = await signIn('credentials', {
      redirect: false, // We'll handle redirect manually
      walletAddress: walletAddress,
      // No password needed for this provider as per our setup
    });

    setIsLoading(false);
    if (result?.error) {
      setError(result.error === "CredentialsSignin" 
        ? "Login failed. Ensure your wallet is registered as an admin." 
        : result.error);
    } else if (result?.ok) {
      router.push(callbackUrl); // Redirect to intended admin page or admin dashboard
    }
  };

  const handleConnectAndSignIn = async () => {
    if (!isConnected) {
      await connectWallet(); // This will trigger the useEffect above once connected
    } else if (account) {
      // If already connected but not yet signed in (e.g., useEffect didn't trigger redirect)
      handleSignIn(account);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center">Admin Login</h1>
        
        {error && (
          <p className="text-center text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>
        )}

        {!isConnected && (
          <Button 
            onClick={handleConnectAndSignIn} 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet to Log In as Admin'}
          </Button>
        )}

        {isConnected && account && (
          <div className="text-center space-y-4">
            <p>Wallet Connected: <span className="font-mono text-sm">{`${account.substring(0,6)}...${account.substring(account.length-4)}`}</span></p>
            <p className="text-gray-400 text-sm">
              Attempting to log you in as admin... If this fails, your wallet may not be authorized for admin access.
            </p>
            {isLoading && <p className="text-blue-400">Processing login...</p>}
          </div>
        )}
        
        <p className="text-xs text-gray-500 text-center">
          Only authorized admin wallets can log in.
        </p>
      </div>
    </div>
  );
}

// This remains the default export, rendering the renamed component within Suspense
export default function AdminLoginPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AdminLoginContent /> 
    </Suspense>
  )
}
