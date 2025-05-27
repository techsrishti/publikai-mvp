'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface WaitlistFormProps {
  className?: string;
  buttonText?: string;
  highlight?: boolean;
}

export function WaitlistForm({ className = '', buttonText = 'Join Private Beta', highlight = false }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (highlight) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 2000); // Exactly 2 seconds
      return () => clearTimeout(timer);
    }
    return;
  }, [highlight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setEmail('');
        setIsSubmitted(true);
      } else {
        toast.error(data.error || 'Failed to join waitlist');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div className="w-full sm:w-[580px] px-6 py-4 rounded-lg bg-white/5 backdrop-blur-sm border border-purple-500/50 text-center">
          <h3 className="text-lg font-medium text-white mb-2">Thanks for jumping in! 🎉</h3>
          <p className="text-white/70">You are officially on the insider list for early access.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your work email"
        className={`w-full sm:w-[400px] px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-white/5 backdrop-blur-sm border text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-all duration-300 ${
          isHighlighted 
            ? 'border-purple-500 ring-2 ring-purple-500/50 transform scale-105' 
            : 'border-white/10'
        }`}
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-[180px] bg-white text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-white/25 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isLoading ? 'Joining...' : buttonText}
      </button>
    </form>
  );
}