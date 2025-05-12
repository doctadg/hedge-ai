import { Suspense } from 'react';
import AdminLoginForm from './AdminLoginForm';

// A simple fallback component for Suspense
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold">Admin Login</h1>
        <p>Loading login form...</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
