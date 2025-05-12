'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginForm() {
  const { account, connect: connectWallet, status } = useWallet();
  const isConnected = status === 'authenticated'; // Derive isConnected
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  // Effect to attempt sign-in once wallet is connected and is an admin
  useEffect(() => {
    if (isConnected && account) {
      handleSignIn(account);
    }
  }, [isConnected, account, callbackUrl]); // Added callbackUrl to dependencies

  const handleSignIn = async (walletAddress: string) => {
    setIsLoading(true);
    setError(null);
    const result = await signIn('credentials', {
      redirect: false,
      walletAddress: walletAddress,
    });

    setIsLoading(false);
    if (result?.error) {
      setError(result.error === "CredentialsSignin" 
        ? "Login failed. Ensure your wallet is registered as an admin." 
        : result.error);
    } else if (result?.ok) {
      router.push(callbackUrl);
    }
  };

  const handleConnectAndSignIn = async () => {
    if (!isConnected) {
      await connectWallet();
    } else if (account) {
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
