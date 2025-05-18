'use client';

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useMemo } from "react";

export default function Home() {
  const { userId } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation visibility on page load - with optimization
  useEffect(() => {
    // Delay visibility to improve initial render performance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Set loaded state after the page is fully rendered
    window.addEventListener('load', () => {
      setIsLoaded(true);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', () => {
        setIsLoaded(true);
      });
    };
  }, []);

  // Memoize the orbs to prevent unnecessary re-renders
  const floatingOrbs = useMemo(() => {
    // Reduce number of orbs from 30 to 15
    return [...Array(15)].map((_, i) => {
      // Use a predictable pattern based on index instead of random values
      const sizeBase = 8 + (i % 15);
      const duration = 15 + (i % 10);
      const delay = (i % 5);
      const opacityBase = 0.3 + ((i % 7) / 10);
      
      // Calculate position based on index to create a pleasing pattern
      const topPosition = ((i * 13) % 100);
      const leftPosition = ((i * 17) % 100);
      
      // Determine color pattern based on index
      const colorIndex = i % 3;
      const backgroundGradient = colorIndex === 0 
        ? 'radial-gradient(circle, rgba(120,80,255,0.5) 0%, rgba(50,50,200,0) 70%)' 
        : colorIndex === 1 
          ? 'radial-gradient(circle, rgba(100,209,255,0.5) 0%, rgba(45,145,255,0) 70%)'
          : 'radial-gradient(circle, rgba(250,130,255,0.5) 0%, rgba(190,0,250,0) 70%)';
      
      return (
        <div 
          key={i}
          className="absolute rounded-full blur-md will-change-transform"
          style={{
            width: `${sizeBase}px`,
            height: `${sizeBase}px`,
            background: backgroundGradient,
            top: `${topPosition}%`,
            left: `${leftPosition}%`,
            opacity: opacityBase,
            animation: `floatComplex ${duration}s ease-in-out ${delay}s infinite, pulse 5s ease-in-out ${delay/2}s infinite`,
            zIndex: 1
          }}
        ></div>
      );
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced grid background with optimized performance */}
      <div 
        className="absolute inset-0 bg-[url('/grid.svg')] bg-center will-change-transform"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.2))',
           animation: isLoaded ? 'pulse 8s ease-in-out infinite, rotate 30s linear infinite' : 'none', 
          backgroundSize: '130px 130px',
          opacity: isVisible ? 0.7 : 0.5,
          transform: 'translateZ(0)'
        }}
      ></div>
      
      {/* Dynamic glowing orbs with reduced count and optimized performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingOrbs}
      </div>
      
      {/* Navigation - removed theme toggle */}
      <nav className="relative backdrop-blur-md border-b border-white/10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                FritoAI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {!userId ? (
                <>
                  <Link
                    href="/sign-in"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="relative group overflow-hidden bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white px-4 py-2 rounded-md transition-all duration-300"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative">Sign up</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-white/80 hover:text-white">Dashboard</Link>
                  <UserButton afterSignOutUrl="/" />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-violet-500/10 animate-pulse"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-block animate-float">
                <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 mb-6 leading-tight">
                Monetize AI Models   <br className="hidden md:block" />In Minutes
                </h1>
              </div>
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                India&apos;s first AI model marketplace. Host, deploy, and bill for your models with usage-based billing and instant INR payouts.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/sign-up"
                  className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white glass rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-violet-500 opacity-30 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative flex items-center">
                    Get Started Free
                    <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3 text-lg font-medium text-white/90 bg-white/10 rounded-md hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                >
                  Explore Marketplace
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 relative backdrop-blur-sm bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="p-6 rounded-xl glass transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
                <div className="text-white/80">Active Developers</div>
              </div>
              <div className="p-6 rounded-xl glass transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-violet-400 mb-2">500+</div>
                <div className="text-white/80">Models Deployed</div>
              </div>
              <div className="p-6 rounded-xl glass transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
                <div className="text-white/80">API Calls Daily</div>
              </div>
              <div className="p-6 rounded-xl glass transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-indigo-400 mb-2">1s</div>
                <div className="text-white/80">Avg API Latency</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-12">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature cards with hover effects and gradients */}
              <div className="group p-6 rounded-xl glass hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 mb-4 transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Easy Model Deployment
                </h3>
                <p className="text-white/70 relative z-10">
                  Upload or link your models from Hugging Face. Auto-scale with RunPod or Replicate. Ready in minutes.
                </p>
              </div>

              <div className="group p-6 rounded-xl glass hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 mb-4 transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Usage-Based Billing
                </h3>
                <p className="text-white/70 relative z-10">
                  Stripe metered billing integration. Set your own pricing. INR support via Razorpay and UPI.
                </p>
              </div>

              <div className="group p-6 rounded-xl glass hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 mb-4 transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Powerful Analytics
                </h3>
                <p className="text-white/70 relative z-10">
                  Real-time usage tracking, performance metrics, and revenue analytics in your dashboard.
                </p>
              </div>

              <div className="group p-6 rounded-xl glass hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-4 transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Secure API Access
                </h3>
                <p className="text-white/70 relative z-10">
                  Auto-generate API keys, implement rate limits, and secure endpoints for your models.
                </p>
              </div>

              <div className="group p-6 rounded-xl glass hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 mb-4 transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  India-First Payments
                </h3>
                <p className="text-white/70 relative z-10">
                  INR/UPI payments, Razorpay integration, and instant payouts to Indian bank accounts.
                </p>
              </div>

              <div className="group p-6 rounded-xl glass hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-pink-500 to-blue-500 mb-4 transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Public/Private Marketplace
                </h3>
                <p className="text-white/70 relative z-10">
                  Discover and monetize models with ratings and tags in a public or private marketplace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 relative backdrop-blur-sm bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Step 1 - with enhanced animations */}
              <div className="relative p-6 rounded-xl glass hover:bg-white/10 transition-all duration-500 transform hover:scale-105 group">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-violet-500 mb-4 transition-transform duration-500 transform group-hover:rotate-12 animate-pulse-glow">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">Upload Your Model</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">Upload or link models from Hugging Face or your repo</p>
                {/* Animated icon */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <svg className="w-8 h-8 text-blue-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              
              {/* Step 2 - with enhanced animations */}
              <div className="relative p-6 rounded-xl glass hover:bg-white/10 transition-all duration-500 transform hover:scale-105 group">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-500 mb-4 transition-transform duration-500 transform group-hover:rotate-12 animate-pulse-glow">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors duration-300">Generate API</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">Auto-generate secure API endpoints for your model</p>
                {/* Animated icon */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <svg className="w-8 h-8 text-violet-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
              
              {/* Step 3 - with enhanced animations */}
              <div className="relative p-6 rounded-xl glass hover:bg-white/10 transition-all duration-500 transform hover:scale-105 group">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 mb-4 transition-transform duration-500 transform group-hover:rotate-12 animate-pulse-glow">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">Set Pricing</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">Define your pricing model and usage rules</p>
                {/* Animated icon */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <svg className="w-8 h-8 text-purple-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Step 4 - with enhanced animations */}
              <div className="p-6 rounded-xl glass hover:bg-white/10 transition-all duration-500 transform hover:scale-105 group">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-blue-500 mb-4 transition-transform duration-500 transform group-hover:rotate-12 animate-pulse-glow">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-pink-300 transition-colors duration-300">Track & Earn</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">Monitor usage and receive payments in INR</p>
                {/* Animated icon */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <svg className="w-8 h-8 text-pink-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Animated path connecting the steps */}
            <div className="relative mt-12 h-2 max-w-3xl mx-auto hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 rounded-full animate-pulse opacity-60"></div>
              </div>
              <div className="absolute h-4 w-4 bg-blue-500 rounded-full left-0 top-1/2 transform -translate-y-1/2 animate-pulse"></div>
              <div className="absolute h-4 w-4 bg-violet-500 rounded-full left-1/3 top-1/2 transform -translate-y-1/2 animate-pulse delay-75"></div>
              <div className="absolute h-4 w-4 bg-purple-500 rounded-full left-2/3 top-1/2 transform -translate-y-1/2 animate-pulse delay-150"></div>
              <div className="absolute h-4 w-4 bg-pink-500 rounded-full right-0 top-1/2 transform -translate-y-1/2 animate-pulse delay-200"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 animate-pulse"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to launch your AI models?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join India&apos;s first AI model marketplace. Start monetizing your models today.
            </p>
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white glass rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 animate-pulse-glow"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-violet-500 opacity-30 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative flex items-center">
                Get Started Free
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative backdrop-blur-md bg-black/30 text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                FritoAI
              </h3>
              <p className="text-white/60">
                India&apos;s platform for AI model creators and users.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors">
                    Marketplace
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-white/60">support@FritoAI.com</li>
                <li className="flex space-x-4 mt-4">
                  <Link href="#" className="text-white/60 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </Link>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link href="#" className="text-white/60 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} FritoAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
