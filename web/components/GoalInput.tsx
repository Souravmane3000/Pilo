'use client'

import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { usePilo } from '../context/PiloContext'
import { supabase } from '../lib/supabaseClient'

type GoalInputProps = {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  isLoading: boolean
}

export default function GoalInput({ value, onChange, onRun, isLoading }: GoalInputProps): React.ReactNode {
  const { mode, runStatus } = usePilo()
  const [error, setError] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const placeholders = [
    "Update Rahul's email to rahul123@gmail.com",
    'Send email to Amit saying welcome to Pilo',
    'Create a lead named Sourav Mane',
    'Delete lead Amit Shah',
    'Show all leads',
  ]
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  const isRunning = runStatus === 'running'

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [placeholders.length])

  useEffect(() => {
    if (uploadStatus === 'success' || uploadStatus === 'error') {
      const timeout = window.setTimeout(() => setUploadStatus('idle'), 3000)
      return () => window.clearTimeout(timeout)
    }
  }, [uploadStatus])

  const handleRun = (): void => {
    const trimmed = value.trim()

    if (isRunning || isLoading) {
      return
    }

    if (trimmed.length < 5) {
      setError('Please enter at least 5 characters.')
      return
    }

    setError(null)
    onRun()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setError(null)
    setUploadMessage(null)
    setUploadStatus('uploading')

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data

        try {
          if (mode === 'demo') {
            window.setTimeout(() => {
              setUploadMessage(`Demo: ${data.length} leads processed`)
              setUploadStatus('success')
            }, 1000)
            event.target.value = ''
            return
          }

          const { data: sessionData } = await supabase.auth.getSession()
          const accessToken = sessionData.session?.access_token

          if (!accessToken) {
            setError('Please sign in to upload CSV leads.')
            setUploadStatus('error')
            event.target.value = ''
            return
          }

          const response = await fetch('/api/upload-leads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ leads: data }),
          })

          const result = (await response.json()) as { error?: string; inserted?: number }

          if (!response.ok) {
            setError(result.error ?? 'Failed to upload leads.')
            setUploadStatus('error')
            event.target.value = ''
            return
          }

          const successMessage = `Leads uploaded successfully${result.inserted ? ` (${result.inserted})` : ''}`
          setUploadMessage(successMessage)
          setUploadStatus('success')
          window.dispatchEvent(new Event('pilo:leads-uploaded'))
        } catch {
          setError('Failed to upload leads.')
          setUploadStatus('error')
        } finally {
          event.target.value = ''
        }
      },
      error: () => {
        setError('Failed to parse CSV file.')
        setUploadStatus('error')
        event.target.value = ''
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#020617] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-green-500/20 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
    >
      <label className="text-xs font-medium uppercase tracking-wide text-gray-500">What should Pilo do?</label>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all focus:border-green-400/40 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          placeholder={placeholders[placeholderIndex]}
        />
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning || isLoading}
          className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
            isRunning || isLoading
              ? 'cursor-not-allowed border-white/10 bg-zinc-900 text-zinc-500'
              : 'border-green-500/20 bg-[#0f172a] text-green-400 hover:border-green-400/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)]'
          }`}
        >
          {isRunning || isLoading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block animate-spin">⏳</span>
              Running...
            </span>
          ) : (
            'Run'
          )}
        </button>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csvUpload"
        />
        <label
          htmlFor="csvUpload"
          title="Upload leads via CSV"
          className="cursor-pointer rounded-xl border border-green-400/30 px-4 py-2 text-sm text-green-400 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-green-500/10 active:scale-[0.98]"
        >
          Upload CSV
        </label>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {uploadMessage ? <p className="animate-fade-in text-xs text-green-400">✔ Action completed successfully</p> : null}
      {uploadStatus === 'uploading' ? (
        <div className="mt-2 flex items-center gap-2 text-sm text-blue-400">
          <span className="inline-block animate-spin">⏳</span>
          Uploading file...
        </div>
      ) : null}
      {uploadStatus === 'success' ? (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
          ✅ File uploaded successfully
        </div>
      ) : null}
      {uploadStatus === 'error' ? (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
          ❌ Upload failed. Try again.
        </div>
      ) : null}
    </motion.div>
  )
}

