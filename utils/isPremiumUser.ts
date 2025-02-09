export async function isPremiumUser(account: string | null): Promise<boolean> {
  if (!account) {
    return false;
  }

  try {
    const response = await fetch('/api/premium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress: account }),
    });

    if (!response.ok) {
      console.error('Error checking premium status:', response.statusText);
      return false; // Assume not premium on error
    }

    const data = await response.json();
    return data.isPremium;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false; // Assume not premium on error
  }
}
