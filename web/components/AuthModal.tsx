"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      }

      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        className="fixed inset-0 z-[100] bg-[rgba(0,0,0,0.75)] backdrop-blur-[4px]"
        onClick={onClose}
      />
      <div
        className="auth-panel fixed right-0 top-0 z-[999] h-screen w-[420px] border-l border-white/10 bg-[#0b0b0c] shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col overflow-y-auto p-8">
          <div className="mb-8 space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Pilo</h1>
            <p className="text-sm text-zinc-400/90">Welcome to Live Mode</p>
          </div>

          <div className="flex-1 space-y-5">
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-zinc-100 outline-none transition duration-200 focus:border-emerald-400/70 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-zinc-100 outline-none transition duration-200 focus:border-emerald-400/70 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
            </button>

            <p
              className="cursor-pointer text-sm text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </p>
          </div>

          <div className="space-y-1 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
            <p>Demo mode uses shared data</p>
            <p>Live mode gives you private workspace</p>
          </div>
        </div>
        <style jsx>{`
          .auth-panel {
            animation: panelSlideIn 260ms ease-out;
          }

          @keyframes panelSlideIn {
            from {
              opacity: 0;
              transform: translateX(24px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </div>
  )
}