"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  const handleViewDemo = () => {
    document.getElementById("product-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-8 pt-20 text-center sm:pt-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-56 w-56 rounded-full bg-emerald-400/20 blur-[90px]" />
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/10 blur-[110px]" />

      <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
        Operate Your CRM with Intelligence
      </h1>
      <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-gray-400 sm:text-lg">
        Pilo transforms simple instructions into real actions - manage leads, send emails, and automate
        workflows effortlessly.
      </p>

      <div className="relative mt-12">
        <div className="pointer-events-none absolute inset-4 -z-10 rounded-full bg-emerald-400/25 blur-[64px]" />
        <div className="pointer-events-none absolute inset-8 -z-10 rounded-full bg-sky-500/20 blur-[72px]" />
        <Image
          src="/pilo-logo.png"
          alt="Pilo Logo"
          width={120}
          height={120}
          className="mx-auto rounded-xl border border-white/10 bg-[#111827] shadow-[0_0_50px_rgba(16,185,129,0.25)]"
          priority
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-2xl border border-emerald-300/40 bg-emerald-500/15 px-7 py-3 text-sm font-semibold text-emerald-200 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-emerald-400/25 active:scale-[0.98]"
        >
          Open Dashboard
        </button>
        <button
          type="button"
          onClick={handleViewDemo}
          className="rounded-2xl border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 ease-out hover:scale-[1.02] hover:border-white/30 hover:bg-white/10 active:scale-[0.98]"
        >
          View Demo
        </button>
      </div>
    </motion.section>
  );
}
