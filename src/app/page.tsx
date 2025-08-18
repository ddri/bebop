'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to campaigns as the new default landing page
    router.push('/campaigns');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-[#2f2f2d] flex items-center justify-center">
      <div className="text-lg text-white">Loading...</div>
    </div>
  );
}