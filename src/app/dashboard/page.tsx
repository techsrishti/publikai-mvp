'use client';

import { useEffect, useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
 import { useAuth } from '@clerk/nextjs';

interface UserRole {
  role: 'USER' | 'CREATOR' | 'ADMIN';
  isCreator: boolean;
}

export default function DashboardPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/user/role');
        const data = await response.json();
        
        if (response.ok) {
          setUserRole(data);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    checkUserRole();
  }, [userId]);

  const handleCreatorAction = () => {
    if (userRole?.isCreator) {
      router.push('/creator/dashboard');
    } else {
      router.push('/creator/questionnaire');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Dashboard
          </h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        <div className="backdrop-blur-lg bg-white/10 shadow-xl border border-white/20 rounded-lg p-8">
          <div className="text-center">
            <button
              onClick={handleCreatorAction}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 font-medium"
            >
              {userRole?.isCreator ? 'Go to Creator Dashboard' : 'Become a Creator'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}