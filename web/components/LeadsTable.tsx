'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Users } from 'lucide-react'
import EmptyState from './EmptyState'
import StatusBadge from './StatusBadge'
import { fetchLeads } from '../lib/api'
import type { Lead } from '../lib/types'

export default function LeadsTable(): React.ReactNode {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])

  const loadLeads = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetchLeads()
      if (response.error) {
        setError(response.error)
        setLeads([])
        return
      }

      setLeads(response.data ?? [])
    } catch {
      setError('Something went wrong.')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLeads()
  }, [loadLeads])

  useEffect(() => {
    const handleRefresh = () => {
      void loadLeads()
    }

    window.addEventListener('pilo:leads-uploaded', handleRefresh)
    return () => {
      window.removeEventListener('pilo:leads-uploaded', handleRefresh)
    }
  }, [loadLeads])

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#020617] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-green-500/20">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 w-full animate-pulse rounded-lg bg-zinc-900" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#020617] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-green-500/20">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load leads"
          description="Something went wrong."
          action={{ label: 'Retry', onClick: () => void loadLeads() }}
        />
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#020617] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-green-500/20">
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Your leads will appear here."
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#020617] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-green-500/20">
      <table className="w-full text-sm text-zinc-300">
        <thead>
          <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-2 py-3 font-medium">Name</th>
            <th className="px-2 py-3 font-medium">Email</th>
            <th className="px-2 py-3 font-medium">Company</th>
            <th className="px-2 py-3 font-medium">Status</th>
            <th className="px-2 py-3 font-medium">Last Contacted</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-white/5 transition-colors duration-200 hover:bg-white/5">
              <td className="px-2 py-3 text-zinc-100">{lead.name}</td>
              <td className="px-2 py-3">{lead.email}</td>
              <td className="px-2 py-3">{lead.company ?? '—'}</td>
              <td className="px-2 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-2 py-3">{lead.last_contacted_at ? lead.last_contacted_at : 'Never'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

