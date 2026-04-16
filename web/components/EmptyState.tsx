'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps): React.ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#020617] px-6 py-8 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-green-500/20 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
    >
      <Icon className="mb-3 h-8 w-8 text-zinc-500" aria-hidden="true" />
      <h3 className="text-lg font-semibold tracking-tight text-zinc-100 opacity-70">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-400">{description}</p>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 rounded-xl border border-green-500/20 bg-[#0f172a] px-4 py-2 text-sm font-medium text-green-400 transition-all duration-200 ease-out hover:scale-[1.02] hover:border-green-400/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] active:scale-[0.98]"
        >
          {action.label}
        </button>
      ) : null}
    </motion.div>
  )
}
