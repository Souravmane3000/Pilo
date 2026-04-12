'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { AlertCircle, History } from 'lucide-react'
import EmptyState from './EmptyState'
import StatusBadge from './StatusBadge'
import { fetchWorkflowRuns } from '../lib/api'
import type { WorkflowRun } from '../lib/types'

function formatRelativeTime(isoDate: string): string {
  const now = Date.now()
  const time = new Date(isoDate).getTime()
  const diffSeconds = Math.floor((now - time) / 1000)

  if (diffSeconds < 60) return 'just now'

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hours ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} days ago`

  return new Date(isoDate).toLocaleDateString()
}

export default function WorkflowHistory(): React.ReactNode {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runs, setRuns] = useState<WorkflowRun[]>([])

  const loadRuns = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetchWorkflowRuns()
      if (res.error) {
        setError(res.error)
        setRuns([])
        return
      }

      setRuns(res.data ?? [])
    } catch {
      setError('Something went wrong.')
      setRuns([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRuns()
  }, [loadRuns])

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-zinc-800" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load history"
          description="Something went wrong."
          action={{ label: 'Retry', onClick: () => void loadRuns() }}
        />
      </div>
    )
  }

  if (runs.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <EmptyState
          icon={History}
          title="No runs yet"
          description="Completed runs will appear here."
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      {runs.map((run) => (
        <div key={run.id} className="flex items-center justify-between border-b border-zinc-800/60 py-2">
          <div>
            <p className="text-sm text-zinc-100">{run.goal}</p>
            <p className="text-xs text-zinc-400">{formatRelativeTime(run.created_at)}</p>
          </div>
          <StatusBadge status={run.status} />
        </div>
      ))}
    </div>
  )
}