"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProductPreview() {
  const [showStep1, setShowStep1] = useState(false);
  const [showStep2, setShowStep2] = useState(false);
  const [showStep3, setShowStep3] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStep1(true), 250);
    const t2 = setTimeout(() => setShowStep2(true), 800);
    const t3 = setTimeout(() => setShowStep3(true), 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className="mx-auto mt-8 max-w-4xl rounded-2xl border border-white/5 bg-[#0D1117] p-6 shadow-[0_25px_70px_rgba(2,6,23,0.45)] transition-all duration-200 ease-out hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
    >
      <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Command</p>
      <div className="rounded-lg bg-black/40 p-3 font-mono text-sm text-green-400 sm:text-base">
        Send email to John saying "Welcome to Pilo"
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className={`text-gray-400 transition-opacity duration-500 ${showStep1 ? "opacity-100" : "opacity-0"}`}>
          🧠 Thinking...
        </p>
        <p className={`text-gray-400 transition-opacity duration-500 ${showStep2 ? "opacity-100" : "opacity-0"}`}>
          ⚙️ Executing action...
        </p>
        <p className={`text-green-400 transition-opacity duration-500 ${showStep3 ? "opacity-100" : "opacity-0"}`}>
          ✅ Email sent successfully
        </p>
      </div>
    </motion.div>
  );
}
