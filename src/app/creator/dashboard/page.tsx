'use client';

import { useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function CreatorDashboard() {
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    const checkCreatorAccess = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/user/role');
        const data = await response.json();
        
      } catch (error) {
        console.error('Error checking creator access:', error);
        router.replace('/dashboard');
      }
    };

    checkCreatorAccess();
  }, [userId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Creator Dashboard
          </h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        <div className="backdrop-blur-lg bg-white/10 shadow-xl border border-white/20 rounded-lg p-8">
          <div className="text-white">
            {/* Creator dashboard content will go here */}
            <p>Welcome to your creator dashboard!</p>
          </div>
        </div>
      </div>
    </div>
  );
}