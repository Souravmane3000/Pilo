'use client'

import React, { useState } from 'react'
import AuthModal from '@/components/AuthModal'
import { usePilo } from '../context/PiloContext'
import { supabase } from '../lib/supabaseClient'
import type { ExecutionMode } from '../lib/types'

export default function ModeToggle(): React.ReactNode {
  const { mode, runStatus, setMode } = usePilo()
  const [showAuth, setShowAuth] = useState(false)

  const handleModeChange = async (nextMode: ExecutionMode): Promise<void> => {
    if (nextMode === mode) {
      return
    }

    if (runStatus === 'running') {
      const shouldSwitch = window.confirm(
        'A run is currently in progress. Switching mode may interrupt your current workflow. Continue?'
      )
      if (!shouldSwitch) {
        return
      }
    }

    if (nextMode === 'live') {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        setShowAuth(true)
        return
      }
    }

    setMode(nextMode)
  }

  return (
    <>
      <div className="inline-flex items-center rounded-xl border border-white/5 bg-[#020617] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => void handleModeChange('demo')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
            mode === 'demo'
              ? 'border-green-400/30 bg-green-500/10 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.18)]'
              : 'border-transparent bg-transparent text-gray-400 hover:text-zinc-100'
          }`}
        >
          Demo
        </button>
        <button
          type="button"
          onClick={() => void handleModeChange('live')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
            mode === 'live'
              ? 'border-green-400/30 bg-green-500/10 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.18)]'
              : 'border-transparent bg-transparent text-gray-400 hover:text-zinc-100'
          }`}
        >
          Live
        </button>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
