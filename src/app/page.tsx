'use client';

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  const { userId } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <nav className="relative backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                PublikAI
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
                    className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    Sign up
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
            <div className="text-center">
              <div className="inline-block animate-float">
                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 mb-6 leading-tight">
                  Deploy AI Models<br />in Minutes
                </h1>
              </div>
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                The first India-focused AI model marketplace. Host, manage, and monetize your fine-tuned models with usage-based billing and instant INR payouts.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/creator/sign-up"
                  className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative">Become a Creator</span>
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3 text-lg font-medium text-white/90 bg-white/10 rounded-md hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 relative backdrop-blur-sm bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-xl backdrop-blur-md bg-white/5 transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
                <div className="text-white/80">Active Developers</div>
              </div>
              <div className="p-6 rounded-xl backdrop-blur-md bg-white/5 transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-violet-400 mb-2">500+</div>
                <div className="text-white/80">Models Deployed</div>
              </div>
              <div className="p-6 rounded-xl backdrop-blur-md bg-white/5 transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-purple-400 mb-2">95%</div>
                <div className="text-white/80">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-12">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature cards with hover effects and gradients */}
              <div className="group p-6 rounded-xl backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-300">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 mb-4 transform group-hover:scale-110 transition-transform duration-300"></div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Easy Model Deployment
                </h3>
                <p className="text-white/70">
                  Upload or link your models from Hugging Face. Auto-scale with RunPod or Replicate. Ready in minutes.
                </p>
              </div>

              <div className="group p-6 rounded-xl backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-300">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 mb-4 transform group-hover:scale-110 transition-transform duration-300"></div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Usage-Based Billing
                </h3>
                <p className="text-white/70">
                  Stripe metered billing integration. Set your own pricing. INR support via Razorpay and UPI.
                </p>
              </div>

              <div className="group p-6 rounded-xl backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-300">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 mb-4 transform group-hover:scale-110 transition-transform duration-300"></div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Powerful Analytics
                </h3>
                <p className="text-white/70">
                  Real-time usage tracking, performance metrics, and revenue analytics in your dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 animate-pulse"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Share Your AI Models?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join India's first AI model marketplace. Start monetizing your models today.
            </p>
            <Link
              href="/creator/sign-up"
              className="inline-flex items-center px-8 py-3 text-lg font-medium text-blue-900 bg-gradient-to-r from-blue-300 to-violet-300 rounded-md hover:from-blue-200 hover:to-violet-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Apply as Creator
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative backdrop-blur-md bg-black/30 text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                PublikAI
              </h3>
              <p className="text-white/60">
                India's platform for AI model creators and users.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-white/60 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/creator/sign-up" className="text-white/60 hover:text-white transition-colors">
                    Become a Creator
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-white/60 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-white/60">support@publikai.com</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
