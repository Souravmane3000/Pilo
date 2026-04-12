'use client'

import React from 'react'
import ModeToggle from './ModeToggle'
import { usePilo } from '../context/PiloContext'

export default function Header(): React.JSX.Element {
  const { user } = usePilo()
  const initial = user.name.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="text-lg font-bold text-zinc-100">Pilo</div>

        <ModeToggle />

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
          <span className="text-sm font-medium text-zinc-100">{initial}</span>
        </div>
      </div>
    </header>
  )
}
