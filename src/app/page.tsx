'use client';

import Link from "next/link";
import { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { AnimatedGradientText } from "@/components/animated-gradient-text";
import { TiltCard } from "@/components/tilt-card";
import { ReviewsSection } from "@/components/reviews-section";
import { PainpointsSection } from "@/components/painpoints-section";
import Image from 'next/image'
import { WaitlistForm } from "@/components/WaitlistForm";
import { ContactForm } from "@/components/ContactForm";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const WaitlistButton = ({ children, className = "", onClick }: ButtonProps) => {
  return (
    <button 
      className={`${className} transition-all duration-300 hover:scale-105`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const ComingSoonLink = ({ children, className = "" }: ButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        className={`relative group ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
        {showTooltip && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/90 text-white text-sm rounded-md whitespace-nowrap z-50">
            Coming Soon
            <div className="absolute top-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
   const [highlightForm, setHighlightForm] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  const scrollToWaitlist = () => {
     setHighlightForm(true);
    // Reset highlight after animation
    setTimeout(() => setHighlightForm(false), 2000);
    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Frito
            </Link>
            <div className="flex items-center gap-4 md:gap-8">
              <ComingSoonLink>
                <span className="text-xs md:text-sm text-white/70 hover:text-white transition-colors">Documentation</span>
              </ComingSoonLink>
              <ComingSoonLink>
                <span className="text-xs md:text-sm text-white/70 hover:text-white transition-colors">Pricing</span>
              </ComingSoonLink>
              <WaitlistButton 
                className="bg-white hover:bg-white/90 transition-colors text-black text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg"
                onClick={scrollToWaitlist}
              >
                Join Waitlist
              </WaitlistButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        id="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative pt-32 pb-20 overflow-hidden"  
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent animate-gradient-flow"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-white/70">Now in private beta</span>
            </div>
            
            <AnimatedGradientText
              text="Deploy and Monetize your AI models in minutes"  
              className="text-5xl md:text-7xl font-bold mb-8"
              mousePosition={mousePosition}
            />
            
            <motion.p 
              className="text-lg md:text-xl text-white/70 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Deploy, secure, and monetize your AI models with enterprise-grade infrastructure.<br />
              No DevOps required.
            </motion.p>

            <motion.div 
              className="flex flex-col items-center justify-center gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <WaitlistForm 
                className="w-full max-w-lg" 
                buttonText="Join Private Beta"
                highlight={highlightForm}
              />
            </motion.div>

            <p className="text-sm text-white/50">
              🔥 <span className="font-medium text-white/70">500+ developers</span> already using Frito
            </p>
          </motion.div>

          <TiltCard 
            mousePosition={mousePosition}
            className="relative max-w-4xl mx-auto"
          >
            {/* Enhanced animated grid background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 animate-grid-flow"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-xl blur-2xl"></div>
            
            <div className="relative bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
              {/* Enhanced terminal header */}
              <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 animate-pulse delay-75"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80 animate-pulse delay-150"></div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <div className="text-sm text-white/30 font-mono">model_deployment.py</div>
                </div>
              </div>

              <div className="relative">
                {/* Code content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Python</span>
                  </div>

                  <pre className="text-sm md:text-base font-mono relative group">
                    <code className="text-white/90 block space-y-4">
                      <span className="block"><span className="text-blue-400">from</span> <span className="text-purple-400">frito</span> <span className="text-blue-400">import</span> Model</span>

                      <span className="block text-slate-500"># Initialize your model</span>
                      model = Model.from_huggingface(<span className="text-green-300">&quot;mistralai/Mistral-7B-v0.1&quot;</span>)

                      <span className="block text-slate-500"># Configure and deploy</span>
                      model.deploy(
                          name=<span className="text-green-300">&quot;my-chatbot&quot;</span>,
                          pricing={`{`}
                              <span className="text-yellow-300">&quot;requests&quot;</span>: <span className="text-green-300">&quot;$0.01/call&quot;</span>,
                              <span className="text-yellow-300">&quot;tokens&quot;</span>: <span className="text-green-300">&quot;$0.001/1k&quot;</span>
                          {`}`}
                      )

                      <span className="block text-slate-500"># Your model is now live with:</span>
                      <span className="text-green-400"># ✓ Production API endpoint</span>
                      <span className="text-green-400"># ✓ Usage tracking & billing</span>
                      <span className="text-green-400"># ✓ Rate limiting & security</span>
                    </code>
                    
                    {/* Added typing cursor animation */}
                    <div className="absolute right-0 bottom-0 w-2 h-5 bg-purple-400 animate-blink opacity-0 group-hover:opacity-100"></div>
                  </pre>
                </div>

                {/* Added floating particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[
                    { left: '22%', top: '48%' },
                    { left: '11%', top: '82%' },
                    { left: '26%', top: '85%' },
                    { left: '7%', top: '65%' },
                    { left: '47%', top: '59%' },
                    { left: '40%', top: '33%' },
                    { left: '30%', top: '54%' },
                    { left: '21%', top: '91%' }
                  ].map((position, i) => (
                    <div
                      key={i}
                      className="absolute animate-float"
                      style={{
                        left: position.left,
                        top: position.top,
                        animationDelay: `${i * 0.5}s`
                      }}
                    >
                      <div className={`w-24 h-24 rounded-xl bg-gradient-to-r 
                        ${i % 2 === 0 ? 'from-purple-500/10 to-blue-500/10' : 'from-blue-500/10 to-pink-500/10'} 
                        blur-xl`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </motion.section>

      {/* We're Building Something Unique Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-cabinet-grotesk">
              We&apos;re building something unique
            </h2>
            <p className="text-lg text-white/70">
              A platform that brings enterprise-grade infrastructure to every AI model. 
              Deploy, monitor, and scale with confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning-fast deployment</h3>
              <p className="text-white/70">Deploy your AI models in minutes, not weeks. Automatic scaling and load balancing included.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time monitoring</h3>
              <p className="text-white/70">Track performance metrics, usage patterns, and costs in real-time with detailed analytics.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM10 9V7a4 4 0 018 0v2h-8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Enterprise-grade security</h3>
              <p className="text-white/70">Built-in authentication, rate limiting, and secure API keys to keep your models and data safe.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">API Key Management</h3>
              <p className="text-white/70">Create, revoke, and manage API keys with granular permissions and usage tracking.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Metric-Based Billing</h3>
              <p className="text-white/70">Flexible pay-as-you-go pricing with custom pricing tiers, usage tracking, and automated billing.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Creator Suite</h3>
              <p className="text-white/70">All-in-one platform to deploy, manage, and earn from your AI models. Set your own prices, get paid instantly, and track your revenue growth - all from a single dashboard.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Workflow Section with Glowing Timeline */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your AI model journey with Frito
            </h2>
            <p className="text-lg text-white/70">
              From development to deployment, we handle the infrastructure so you can focus on innovation.
            </p>
          </motion.div>

          <div className="relative">
            {/* Glowing Timeline Line */}
            <div className="timeline-line absolute left-0 md:left-1/2 top-0 h-full w-[2px] -translate-x-[6px] md:-translate-x-[1px]">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-purple-500 via-blue-500 to-violet-500 opacity-50"></div>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-purple-500 via-blue-500 to-violet-500 blur-sm"></div>
            </div>

            {/* Step 1 - Model Development */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative mb-24 md:ml-auto md:w-1/2 md:pl-12"
            >
              <div className="absolute left-0 md:-left-6 top-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <TiltCard mousePosition={mousePosition} className="ml-16 md:ml-0">
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Model Development
                  </h3>
                  <p className="text-white/70 mb-6">
                    Use your favorite tools to develop and fine-tune models - we support all major frameworks.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg">
                      <Image src="/icons/chat.png" alt="OpenAI" width={32} height={32} />
                    </div>
                    <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg">
                      <Image src="/icons/mistral.png" alt="Mistral" width={32} height={32} />
                    </div>
                    <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg">
                      <Image src="/icons/image.png" alt="Anthropic" width={32} height={32} />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Step 2 - One-Click Deployment */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative mb-24 md:w-1/2 md:pr-12"
            >
              <div className="absolute left-0 md:right-[-1.5rem] md:left-auto top-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M13 17l6-6M9 17l6-6M5 9l6 6" />
                </svg>
              </div>

              <TiltCard mousePosition={mousePosition} className="ml-16 md:ml-0">
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    One-Click Deployment
                  </h3>
                  <p className="text-sm md:text-base text-white/70 mb-4 md:mb-6">
                    Deploy your model with a single command. We handle scaling, security, and monitoring.
                  </p>
                  <div className="bg-black/30 rounded-lg p-3 md:p-4">
                    <pre className="text-xs md:text-sm overflow-x-auto">
                      <code className="text-blue-300">$ frito deploy model.py --name chatbot</code>
                    </pre>
                    <div className="mt-2 flex items-center gap-2 text-xs md:text-sm text-green-400">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400 animate-pulse"></div>
                      Deployed and ready to use
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Step 3 - Monitor & Scale */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative md:ml-auto md:w-1/2 md:pl-12"
            >
              <div className="absolute left-0 md:-left-6 top-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>

              <TiltCard mousePosition={mousePosition} className="ml-16 md:ml-0">
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    Monitor & Scale
                  </h3>
                  <p className="text-white/70 mb-6">
                    Real-time metrics, automated scaling, and built-in monetization.
                  </p>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-white/5 rounded-lg p-2 md:p-4 text-center">
                      <div className="text-lg md:text-2xl font-bold text-violet-400 truncate">99.9%</div>
                      <div className="text-[10px] md:text-xs text-white/50">Uptime</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 md:p-4 text-center">
                      <div className="text-lg md:text-2xl font-bold text-violet-400 truncate">45ms</div>
                      <div className="text-[10px] md:text-xs text-white/50">Latency</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 md:p-4 text-center">
                      <div className="text-lg md:text-2xl font-bold text-violet-400 truncate">24/7</div>
                      <div className="text-[10px] md:text-xs text-white/50">Support</div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <WaitlistButton 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              onClick={scrollToWaitlist}
            >
              Start Building
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </WaitlistButton>
          </motion.div>
        </div>
      </section>

      {/* Painpoints Section */}
      <PainpointsSection />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Enhanced CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 animate-gradient-flow"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
            
            {/* Floating elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[
                { left: '22%', top: '48%' },
                { left: '11%', top: '82%' },
                { left: '26%', top: '85%' },
                { left: '7%', top: '65%' },
                { left: '47%', top: '59%' },
                { left: '40%', top: '33%' },
                { left: '30%', top: '54%' },
                { left: '21%', top: '91%' }
              ].map((position, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: position.left,
                    top: position.top,
                    animationDelay: `${i * 0.5}s`
                  }}
                >
                  <div className={`w-24 h-24 rounded-xl bg-gradient-to-r 
                    ${i % 2 === 0 ? 'from-purple-500/10 to-blue-500/10' : 'from-blue-500/10 to-pink-500/10'} 
                    blur-xl`}
                  />
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="relative backdrop-blur-sm bg-black/30 border border-white/10 rounded-2xl p-8 md:p-16">
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Ready to Transform Your AI Models?
                  </h2>
                  <p className="text-lg text-white/80 mb-8">
                    Join the future of AI deployment. Get early access to our platform and receive:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 transform hover:scale-105 transition-transform">
                      <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Priority Access</h3>
                      <p className="text-white/60 text-sm">Be among the first to deploy your models</p>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 transform hover:scale-105 transition-transform">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Premium Features</h3>
                      <p className="text-white/60 text-sm">Free access to all premium features</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 transform hover:scale-105 transition-transform">
                      <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Community Access</h3>
                      <p className="text-white/60 text-sm">Join our exclusive creator community</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                   
                    <WaitlistButton 
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                      onClick={scrollToWaitlist}
                    >
                      Get Early Access
                    </WaitlistButton>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
            <p className="text-lg text-white/70">
              Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you shortly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8"
            >
              <ContactForm />
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <TiltCard mousePosition={mousePosition} className="overflow-hidden">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                  <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    About Frito
                  </h3>
                  <div className="space-y-4">
                    <p className="text-lg text-white/70 leading-relaxed">
                      We are a team of AI enthusiasts and infrastructure experts building the next generation of AI deployment platforms. Our mission is to democratize AI deployment and make it accessible to everyone.
                    </p>
                 
                  </div>
                </div>
              </TiltCard>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 flex flex-col">
                  <div className="flex items-center gap-4 mb-14">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white">Contact Us</h4>
                      <p className="text-white/50">We would love to hear from you</p>
                    </div>
                  </div>
                  <div className="flex-grow"></div>
                  <a href="mailto:hello@frito.ai" className="inline-flex items-center gap-2 text-lg text-purple-400 hover:text-purple-300 transition-colors group">
                    hello@frito.ai
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Frito
              </Link>
              <div className="flex gap-6 text-sm text-white/50">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/security" className="hover:text-white transition-colors">Security</Link>
              </div>
            </div>
            <div className="flex gap-6">
              <a href="https://twitter.com/frito" className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="https://github.com/frito" className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

