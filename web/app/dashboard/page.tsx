'use client'

import React, { useRef, useState } from 'react'
import AuthModal from '../../components/AuthModal'
import ExampleGoals from '../../components/ExampleGoals'
import ExecutionFeed from '../../components/ExecutionFeed'
import GoalInput from '../../components/GoalInput'
import Header from '../../components/Header'
import LeadsTable from '../../components/LeadsTable'
import WorkflowHistory from '../../components/WorkflowHistory'
import { usePilo } from '../../context/PiloContext'
import { runAgent } from '../../lib/runAgent'
import { supabase } from '../../lib/supabaseClient'
import type { RunStatus } from '../../lib/types'

export default function DashboardPage(): React.ReactNode {
  const [goal, setGoal] = useState<string>('')
  const [showAuth, setShowAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const cancelRef = useRef<boolean>(false)

  const {
    mode,
    runStatus,
    setRunStatus,
    feed,
    appendFeedItem,
    resetFeed,
  } = usePilo()

  const handleRun = (): void => {
    if (isLoading) {
      return
    }

    if (mode === 'live') {
      void (async () => {
        setIsLoading(true)
        try {
          const { data } = await supabase.auth.getSession()
          if (!data.session?.user) {
            setShowAuth(true)
            return
          }

          cancelRef.current = true
          cancelRef.current = false
          resetFeed()
          setRunStatus('running')

          void runAgent({
            mode,
            goal,
            cancelRef,
            appendFeedItem,
            onComplete: (status: RunStatus) => {
              setRunStatus(status)
              setIsLoading(false)
            },
          })
        } catch {
          setIsLoading(false)
        }
      })()
      return
    }

    setIsLoading(true)
    cancelRef.current = true
    cancelRef.current = false
    resetFeed()
    setRunStatus('running')

    void runAgent({
      mode,
      goal,
      cancelRef,
      appendFeedItem,
      onComplete: (status: RunStatus) => {
        setRunStatus(status)
        setIsLoading(false)
      },
    })
  }

  return (
    <div
      id="app-content"
      className="relative flex h-screen overflow-hidden bg-gradient-to-b from-[#020617] to-[#010409]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_60%)]" />
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        <Header />
        <main className="relative flex flex-1 gap-6 overflow-hidden p-6">
          <section className="flex w-1/2 min-h-0 flex-col gap-4 overflow-hidden">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs">
              <span className="text-xs uppercase tracking-wide text-gray-500">Mode</span>
              <span
                className={`rounded-full border px-2 py-1 font-medium ${
                  mode === 'demo'
                    ? 'border-green-400/30 bg-green-500/10 text-green-400'
                    : 'border-green-400/30 bg-green-500/10 text-green-400'
                }`}
              >
                {mode === 'demo' ? 'Demo' : 'Live'}
              </span>
            </div>
            {mode === 'demo' ? (
              <div className="mb-2 text-xs text-gray-400">
                You are in demo mode. Data is not user-specific.
              </div>
            ) : null}
          </div>
          <GoalInput value={goal} onChange={setGoal} onRun={handleRun} isLoading={isLoading} />
          <ExampleGoals onSelect={setGoal} />
          <div className="min-h-0 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-500/20">
            <LeadsTable />
          </div>
          </section>

          <section className="flex w-1/2 min-h-0 flex-col gap-4 overflow-hidden">
            <div className="min-h-0 flex-[0.65] overflow-hidden">
              <ExecutionFeed
                feed={feed}
                runStatus={runStatus}
                isLoading={isLoading}
                mode={mode}
                userInput={goal}
              />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <WorkflowHistory />
            </div>
          </section>
        </main>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
