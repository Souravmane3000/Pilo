"use client";

import { motion } from "framer-motion";

const steps = [
  "Describe your task",
  "AI interprets intent",
  "Workflow executes",
  "Result delivered",
];

export default function HowItWorks() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-6xl px-6 py-8"
    >
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">How It Works</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          From intent to execution in four clear steps
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={step}
            className="rounded-2xl border border-white/5 bg-[#111827] p-5 transition-all duration-200 ease-out hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] active:scale-[0.98]"
          >
            <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-400/10 text-sm font-semibold text-emerald-200">
              {index + 1}
            </div>
            <p className="text-sm font-medium text-slate-100">{step}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
