'use client';

import Image from "next/image";
import { motion } from "framer-motion";

const reviews = [
  {
    quote: "Frito has completely transformed how we deploy and manage our AI models. The platform is intuitive and powerful.",
    author: "Mason Williams",
    role: "ML Engineer at TechCorp",
    image: "/mason.jpg"
  },
  {
    quote: "Our team went from spending weeks on model deployment to just minutes. The analytics and monitoring are fantastic.",
    author: "Isla Rodriguez",
    role: "AI Lead at DataFlux",
    image: "/isla.png"
  },
  {
    quote: "The ease of use and powerful features make Frito stand out. It&apos;s become an essential part of our ML infrastructure.",
    author: "Jonah Chen",
    role: "CTO at AI Ventures",
    image: "/jonah.jpg"
  }
];  

export function ReviewsSection() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Loved by AI teams worldwide
          </h2>
          <p className="text-lg text-white/70">
            Join hundreds of companies using Frito to deploy and scale their AI models
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={review.image}
                    alt={review.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{review.author}</h4>
                  <p className="text-sm text-white/50">{review.role}</p>
                </div>
              </div>
              <p className="text-white/80 italic">&quot;{review.quote}&quot;</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}