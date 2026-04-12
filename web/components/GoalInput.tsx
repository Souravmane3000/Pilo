'use client'

import React, { useState } from 'react'
import { usePilo } from '../context/PiloContext'

type GoalInputProps = {
  value: string
  onChange: (value: string) => void
  onRun: () => void
}

export default function GoalInput({ value, onChange, onRun }: GoalInputProps): React.JSX.Element {
  const { runStatus } = usePilo()
  const [error, setError] = useState<string | null>(null)

  const isRunning = runStatus === 'running'

  const handleRun = (): void => {
    const trimmed = value.trim()

    if (isRunning) {
      return
    }

    if (trimmed.length < 5) {
      setError('Please enter at least 5 characters.')
      return
    }

    setError(null)
    onRun()
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <label className="text-sm font-medium text-zinc-200">What should Pilo do?</label>
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your goal in one sentence..."
        />
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            isRunning
              ? 'cursor-not-allowed bg-zinc-800 text-zinc-500'
              : 'bg-blue-500 text-white hover:bg-blue-400'
          }`}
        >
          {isRunning ? 'Running…' : 'Run'}
        </button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}

