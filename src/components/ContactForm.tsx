'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function ContactForm() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setFormData({
          email: '',
          name: '',
          subject: '',
          message: ''
        });
        setIsSubmitted(true);
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="w-full max-w-2xl px-8 py-6 rounded-lg bg-white/5 backdrop-blur-sm border border-purple-500/50 text-center">
          <h3 className="text-xl font-medium text-white mb-3">Message Sent Successfully! 🎉</h3>
          <p className="text-white/70">Thank you for reaching out. We will get back to you as soon as possible.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
            placeholder="john@company.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Subject</label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
          placeholder="How can we help?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
          placeholder="Your message..."
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
} 