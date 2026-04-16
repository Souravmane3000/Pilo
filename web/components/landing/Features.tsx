"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Natural Command Interface",
    description: "Control your CRM using simple language instead of complex workflows.",
  },
  {
    title: "Automated Execution",
    description: "Actions like sending emails or updating leads happen instantly.",
  },
  {
    title: "Transparent Workflow Logs",
    description: "Track every step - thinking, execution, and results.",
  },
];

export default function Features() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-6xl px-6 py-8"
    >
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Features</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Built for modern CRM operations</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group rounded-2xl border border-white/5 bg-[#111827] p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)] transition-all duration-200 ease-out hover:scale-[1.02] hover:border-emerald-300/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] active:scale-[0.98]"
          >
            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-400">{feature.description}</p>
          </article>
        ))}
      </div>
    </motion.section>
  );
}
