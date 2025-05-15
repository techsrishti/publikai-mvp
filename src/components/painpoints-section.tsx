'use client';

import { motion } from "framer-motion";

const painpoints = [
  {
    asIs: "Weeks (or longer) to turn a notebook into a secure, scalable API",
    withFrito: "Live HTTPS endpoint in minutes—no DevOps needed"
  },
  {
    asIs: "No built-in metering → manual spreadsheets, lost revenue",
    withFrito: "Usage-based metering & billing baked-in"
  },
  {
    asIs: "Hosting, keys, logs spread across multiple dashboards",
    withFrito: "Single control plane for deploy, monitor, keys & analytics"
  },
  {
    asIs: "Locked into one cloud / hardware stack",
    withFrito: "Infra-agnostic—switch regions, clouds, CPU ↔ GPU effortlessly"
  },
  {
    asIs: "Security & compliance add endless overhead",
    withFrito: "Turnkey SOC 2-ready security, RBAC, audit logs"
  }
];

export function PainpointsSection() {
  return (
    <section className="py-24 overflow-hidden bg-[#0A0A0A] relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-cabinet-grotesk bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400">
            Transform Your AI Development
          </h2>
          <p className="text-lg text-white/70">
            See how Frito eliminates common pain points in AI deployment
          </p>
        </motion.div>

        <div className="overflow-x-auto">
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-8 py-6 text-lg font-cabinet-grotesk font-semibold text-white/90">As Is</th>
                  <th className="text-left px-8 py-6 text-lg font-cabinet-grotesk font-semibold text-white/90">With Frito</th>
                </tr>
              </thead>
              <tbody>
                {painpoints.map((point, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6 text-white/70">{point.asIs}</td>
                    <td className="px-8 py-6">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 group-hover:from-emerald-300 group-hover:to-blue-300 transition-all">
                        {point.withFrito}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}   