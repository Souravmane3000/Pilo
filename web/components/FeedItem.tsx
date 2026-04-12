'use client'

import React, { useEffect, useState } from 'react'
import { Brain, CheckCircle, Settings, XCircle } from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { FeedItem } from '../lib/types'

type FeedItemProps = {
  item: FeedItem
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return '--:--:--'
  }

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}

export default function FeedItem({ item }: FeedItemProps): React.JSX.Element {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const time = formatTime(item.timestamp)

  if (item.type === 'run_start') {
    return (
      <div className="py-2 text-center text-sm text-zinc-500">
        — Run started · {time} —
      </div>
    )
  }

  if (item.type === 'run_end') {
    const isCompleted = item.message.toLowerCase().includes('completed')
    const isFailed = item.message.toLowerCase().includes('failed')
    const colorClass = isCompleted ? 'text-emerald-400' : isFailed ? 'text-red-400' : 'text-zinc-500'

    return (
      <div className={`py-2 text-center text-sm ${colorClass}`}>
        {item.message} · {time}
      </div>
    )
  }

  let Icon = Brain
  let iconColorClass = 'text-zinc-400'
  let messageClassName = 'font-mono text-sm text-zinc-100'

  if (item.type === 'executing') {
    Icon = Settings
    iconColorClass = 'text-yellow-400'
  } else if (item.type === 'success') {
    Icon = CheckCircle
    iconColorClass = 'text-emerald-400'
  } else if (item.type === 'failed') {
    Icon = XCircle
    iconColorClass = 'text-red-400'
  }

  if (item.type === 'thinking') {
    messageClassName = 'font-mono text-sm italic text-zinc-400'
  }

  return (
    <div
      className={`flex gap-3 opacity-0 translate-y-1 transition-all duration-200 ${
        mounted ? 'translate-y-0 opacity-100' : ''
      }`}
    >
      <div className={`mt-1 flex h-6 w-6 items-center justify-center ${iconColorClass}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            Step {item.step} · {time}
          </span>
          <StatusBadge status={item.action} />
        </div>
        <p className={messageClassName}>{item.message}</p>
      </div>
    </div>
  )
}

