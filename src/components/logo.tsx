'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string;
  showText?: boolean;
  href?: string;
}

export default function Logo({ 
  className, 
  showText = true, 
  href = '/' 
}: LogoProps) {
  const LogoContent = () => (
    <div className={cn("flex items-center", className)}>
      <div className="relative w-6 h-6 md:w-8 md:h-8">
        <Image 
          src="/icons/frito_icon.png" 
          alt="Frito Logo" 
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ml-1.5 md:ml-2">
          Frito
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80 inline-flex items-center">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
