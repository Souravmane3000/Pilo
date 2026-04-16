'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Zap } from 'lucide-react'
import EmptyState from './EmptyState'
import FeedItem from './FeedItem'
import { DEMO_ACTION_STEPS } from '../lib/demoActionSteps'
import { detectDemoAction } from '../lib/demoIntent'
import type { ExecutionMode, FeedItem as FeedItemType, RunStatus } from '../lib/types'

type ExecutionFeedProps = {
  feed: FeedItemType[]
  runStatus: RunStatus
  isLoading: boolean
  mode: ExecutionMode
  userInput: string
}

function getDemoStepIcon(step: string): string {
  if (step.includes('Thinking')) return '🧠'
  if (step.includes('Fetching')) return '🔍'
  if (step.includes('Preparing')) return '✍️'
  if (step.includes('Sending')) return '📧'
  if (step.includes('Updating')) return '⚙️'
  if (step.includes('Deleting')) return '🗑️'
  if (step.includes('Saving')) return '💾'
  if (step.toLowerCase().includes('success')) return '✅'
  return '⚡'
}

function formatLiveStepLabel(step: FeedItemType, index: number, total: number): string | null {
  if (step.type === 'run_start' || step.type === 'run_end' || step.type === 'failed') {
    return null
  }

  if (index === 0) return '🧠 Thinking...'
  if (index < total - 1) return '⚙️ Executing action...'
  return '✅ Action completed'
}

export default function ExecutionFeed({
  feed,
  runStatus,
  isLoading,
  mode,
  userInput,
}: ExecutionFeedProps): React.ReactNode {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [visibleDemoSteps, setVisibleDemoSteps] = useState<string[]>([])
  const isDemoMode = mode === 'demo'
  const structuredSteps = feed.slice(1).filter((item) => item.type !== 'run_start' && item.type !== 'run_end')
  const demoStepsToRender = useMemo(() => {
    if (!isDemoMode) return []

    const detectedAction = detectDemoAction(userInput)

    return (
      DEMO_ACTION_STEPS[detectedAction] ?? [
        'Thinking...',
        'Processing request...',
        'Completed',
      ]
    )
  }, [isDemoMode, userInput])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [feed.length, visibleDemoSteps.length])

  useEffect(() => {
    if (!isDemoMode) return

    setVisibleDemoSteps([])

    const timers = demoStepsToRender.map((step, index) =>
      window.setTimeout(() => {
        setVisibleDemoSteps((prev) => [...prev, step])
      }, index * 700)
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [demoStepsToRender, isDemoMode])

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto rounded-2xl border border-white/5 bg-[#020617] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-green-500/20 scrollbar-thin scrollbar-thumb-green-500/20">
      {feed.length === 0 && runStatus === 'idle' ? (
        <EmptyState
          icon={Zap}
          title="Run a goal to see Pilo think"
          description="Step-by-step agent reasoning will appear here."
        />
      ) : (
        <>
          {feed[0] ? <FeedItem key={0} item={feed[0]} /> : null}
          {isLoading ? (
            <div className="mb-3 text-sm text-gray-300">⏳ Pilo is working...</div>
          ) : null}
          {isDemoMode
            ? visibleDemoSteps.map((step, index) => {
                const sourceItem = structuredSteps[index]

                if (!sourceItem) {
                  return null
                }

                return (
                  <FeedItem
                    key={`demo-${index}-${step}`}
                    item={sourceItem}
                    messageOverride={`${getDemoStepIcon(step)} ${step}`}
                  />
                )
              })
            : feed.slice(1).map((item, index) => (
                <FeedItem
                  key={index + 1}
                  item={item}
                  messageOverride={
                    formatLiveStepLabel(
                      item,
                      structuredSteps.indexOf(item),
                      structuredSteps.length
                    ) ?? undefined
                  }
                />
              ))}

          {runStatus === 'running' ? (
            <div className="mt-2 animate-pulse text-sm text-green-400">Thinking...</div>
          ) : null}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

