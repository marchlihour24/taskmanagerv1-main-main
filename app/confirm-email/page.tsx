"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConfirmEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect after 2 seconds to home
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Email Confirmed!</h1>
      <p className="text-gray-600 mb-8">Your email has been confirmed. Redirecting to your dashboard...</p>
    </div>
  );
}
