import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';

export default async function DashboardPage() {
  const user = await currentUser();
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1040] via-[#2d1875] to-[#4b2395] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white/90">
            Welcome, {user?.firstName || 'User'}!
          </h1>
          <UserButton 
            appearance={{
              elements: {
                userButtonBox: "hover:opacity-80 transition-opacity",
                userButtonOuterIdentifier: "text-white",
                userButtonPopoverCard: "bg-white/10 backdrop-blur-lg border border-white/20",
                userButtonPopoverText: "text-white/90",
                userButtonPopoverActionButton: "hover:bg-white/10",
                userButtonPopoverActionButtonText: "text-white/90",
                userButtonPopoverFooter: "border-t border-white/20"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}