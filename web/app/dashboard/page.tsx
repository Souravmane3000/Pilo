'use client'

import React, { useRef, useState } from 'react'
import ExampleGoals from '../../components/ExampleGoals'
import ExecutionFeed from '../../components/ExecutionFeed'
import GoalInput from '../../components/GoalInput'
import Header from '../../components/Header'
import LeadsTable from '../../components/LeadsTable'
import WorkflowHistory from '../../components/WorkflowHistory'
import { usePilo } from '../../context/PiloContext'
import { runAgent } from '../../lib/runAgent'
import type { RunStatus } from '../../lib/types'

export default function DashboardPage(): React.ReactNode {
  const [goal, setGoal] = useState<string>('')
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
    cancelRef.current = true
    cancelRef.current = false
    resetFeed()
    setRunStatus('running')

    void runAgent({
      mode,
      goal,
      cancelRef,
      appendFeedItem,
      onComplete: (status: RunStatus) => setRunStatus(status),
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <main className="grid grid-cols-5 gap-6 p-6">
        <section className="col-span-2 flex flex-col gap-4">
          <GoalInput value={goal} onChange={setGoal} onRun={handleRun} />
          <ExampleGoals onSelect={setGoal} />
          <div className="flex-1 overflow-y-auto">
            <LeadsTable />
          </div>
        </section>

        <section className="col-span-3 flex flex-col gap-4">
          <div className="flex-[0.65]">
            <ExecutionFeed feed={feed} runStatus={runStatus} />
          </div>
          <div className="flex-1">
            <WorkflowHistory />
          </div>
        </section>
      </main>
    </div>
  )
}
