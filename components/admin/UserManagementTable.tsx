'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch'; // Assuming you have a Switch component
import { Button } from '@/components/ui/button';
import { toast } from 'sonner'; // Assuming you use sonner for toasts

interface User {
  id: string;
  walletAddress: string | null;
  email: string | null;
  name: string | null;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
}

// const TEMP_ADMIN_SECRET_CLIENT = process.env.NEXT_PUBLIC_TEMP_ADMIN_SECRET || '123456'; // No longer needed

export default function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Admin session is now checked by middleware for this route
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 403) { // Handle specific forbidden error
          throw new Error(errData.error || 'Forbidden: You may not have admin access.');
        }
        throw new Error(errData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
      setUsers([]);
      toast.error(`Error fetching users: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, walletAddress: string | null, type: 'isPremium' | 'isAdmin', newStatus: boolean) => {
    if (!walletAddress) {
      toast.error("Cannot update status: User has no wallet address.");
      return;
    }

    // Optimistic update
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, [type]: newStatus } : user
      )
    );

    try {
      const payload: any = {
        walletAddress: walletAddress,
        // Secret is no longer sent from client; backend verifies session
      };
      payload[type] = newStatus;

      const response = await fetch('/api/admin/update-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to update ${type}`);
      }
      toast.success(`User ${walletAddress.substring(0,6)}... ${type} status updated to ${newStatus}.`);
      // Optionally re-fetch or update user from result.user
      // For simplicity, relying on optimistic update or manual refresh for now.
      fetchUsers(); // Re-fetch to confirm
    } catch (err: any) {
      toast.error(`Error updating ${type}: ${err.message}`);
      // Revert optimistic update
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, [type]: !newStatus } : user
        )
      );
    }
  };

  if (isLoading) return <p className="text-center text-gray-300">Loading users...</p>;
  if (error) return <p className="text-center text-red-400">Error: {error}</p>;

  return (
    <div className="overflow-x-auto text-white">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-750">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Wallet Address</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Premium</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Admin</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Joined</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">No users found.</td>
            </tr>
          )}
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-750 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {user.walletAddress ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}` : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Switch
                  checked={!!user.isPremium} // Explicitly cast to boolean
                  onCheckedChange={(checked) => handleStatusChange(user.id, user.walletAddress, 'isPremium', checked)}
                  disabled={!user.walletAddress} // Disable if no wallet address to identify user for update
                  id={`premium-${user.id}`}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Switch
                  checked={!!user.isAdmin} // Explicitly cast to boolean
                  onCheckedChange={(checked) => handleStatusChange(user.id, user.walletAddress, 'isAdmin', checked)}
                  disabled={!user.walletAddress}
                  id={`admin-${user.id}`}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={fetchUsers} variant="outline" className="mt-4">Refresh Users</Button>
    </div>
  );
}
