"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0F14]/75 backdrop-blur-xl"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="group inline-flex items-center gap-3 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Go to home"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-[#111827]">
            <Image src="/pilo-logo.png" alt="Pilo logo" fill className="object-cover" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white transition-colors group-hover:text-emerald-300">
            Pilo
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-xl border border-green-500 px-5 py-2 text-green-400 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-green-500/10 active:scale-[0.98]"
        >
          Dashboard
        </button>
      </nav>
    </motion.header>
  );
}
