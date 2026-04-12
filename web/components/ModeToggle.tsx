'use client'

'use client'

import React from 'react'
import { usePilo } from '../context/PiloContext'
import type { ExecutionMode } from '../lib/types'

export default function ModeToggle(): React.JSX.Element {
  const { mode, runStatus, setMode } = usePilo()

  const handleModeChange = (nextMode: ExecutionMode): void => {
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

    setMode(nextMode)
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-900">
      <button
        type="button"
        onClick={() => handleModeChange('demo')}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
          mode === 'demo' ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-zinc-100'
        }`}
      >
        Demo
      </button>
      <button
        type="button"
        onClick={() => handleModeChange('live')}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
          mode === 'live' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
        }`}
      >
        Live
      </button>
    </div>
  )
}
