// This will be the main page for the admin dashboard.
// We'll import and use the UserManagementTable component here.
// For now, it's a placeholder.
// Proper admin authentication should protect this page.

import React from 'react';
import UserManagementTable from '@/components/admin/UserManagementTable';
// import AdminLayout from './layout'; // If we create a specific admin layout

export default function AdminDashboardPage() {
  // TODO: Add checkAdmin(); if not admin, redirect or show unauthorized.
  // This check should ideally happen in middleware or a higher-order component.
  // For now, this page will be accessible if the route is known.

  return (
    // <AdminLayout>
    <div className="container mx-auto py-8 text-white"> {/* Added text-white for base text color */}
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <UserManagementTable />
      </div>
      {/* Add other admin sections/modules here as needed */}
    </div>
    // </AdminLayout>
  );
}
