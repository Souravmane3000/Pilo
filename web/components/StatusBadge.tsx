import React from 'react'

type StatusBadgeProps = {
  status: string
  className?: string
}

type StatusConfig = {
  label: string
  className: string
  showPulse?: boolean
}

const STATUS_STYLES: Record<string, StatusConfig> = {
  new: { label: 'New', className: 'border-zinc-700 bg-zinc-800 text-zinc-300' },
  contacted: { label: 'Contacted', className: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
  qualified: { label: 'Qualified', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  inactive: { label: 'Inactive', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  pending: { label: 'Pending', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  running: {
    label: 'Running',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    showPulse: true,
  },
  completed: { label: 'Completed', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  failed: { label: 'Failed', className: 'border-red-500/40 bg-red-500/10 text-red-400' },
  partial_success: { label: 'Partial', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  thinking: { label: 'Thinking', className: 'border-zinc-700 bg-zinc-800 text-zinc-400 italic' },
  executing: { label: 'Executing', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  success: { label: 'Success', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
}

const DEFAULT_STYLE: StatusConfig = {
  label: 'Unknown',
  className: 'border-zinc-700 bg-zinc-800 text-zinc-400',
}

export default function StatusBadge({ status, className }: StatusBadgeProps): React.ReactNode {
  const config = STATUS_STYLES[status] ?? DEFAULT_STYLE
  const composedClassName = [
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
    config.className,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={composedClassName}>
      {config.showPulse ? <span className="h-2 w-2 animate-pulse rounded-full bg-current" aria-hidden="true" /> : null}
      {config.label}
    </span>
  )
}
