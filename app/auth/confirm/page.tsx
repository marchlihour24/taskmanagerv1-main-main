"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main screen after a short delay
    const timer = setTimeout(() => {
      router.replace('/'); // Change '/' to your main screen route if needed
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h2>Confirming your email...</h2>
      <p>Please wait while we confirm your email. You will be redirected shortly.</p>
    </div>
  );
}
