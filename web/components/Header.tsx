'use client'

import React, { useState } from 'react'
import ModeToggle from './ModeToggle'
import { usePilo } from '../context/PiloContext'
import { supabase } from '../lib/supabaseClient'

export default function Header(): React.ReactNode {
  const { user, setMode } = usePilo()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const initial = user.name.charAt(0).toUpperCase()

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut()
    setMode('demo')
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/85 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="text-lg font-bold tracking-tight text-zinc-100">Pilo</div>

        <ModeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0f172a] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-all duration-300 hover:border-green-500/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.12)]"
          >
            <span className="text-sm font-medium text-zinc-100">{initial}</span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 rounded-xl border border-white/10 bg-[#020617] p-1 shadow-[0_16px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-green-500/10 hover:text-green-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
