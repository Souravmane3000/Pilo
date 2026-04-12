import { buildDemoFeed } from './mockData'
import type { FeedItem, RunStatus } from './types'

type CancelRef = { current: boolean }

type RunAgentDemoParams = {
  goal: string
  cancelRef: CancelRef
  appendFeedItem: (item: FeedItem) => void
  onComplete: (status: RunStatus) => void
}

function randomDelayMs(): number {
  return Math.floor(Math.random() * 401) + 800
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function runAgentDemo(params: RunAgentDemoParams): Promise<void> {
  const { goal, cancelRef, appendFeedItem, onComplete } = params

  try {
    // 1) Reset cancellation for this run
    cancelRef.current = false

    const feed = buildDemoFeed(goal)
    const runStart = feed.find((item) => item.type === 'run_start')
    const runEnd = feed.find((item) => item.type === 'run_end')
    const realSteps = feed.filter((item) => item.step >= 1 && item.step <= 5)

    // 2) Append run_start immediately
    if (runStart) {
      appendFeedItem({
        run_id: 'demo_run',
        step: 0,
        type: runStart.type,
        action: runStart.action ?? 'start',
        message: runStart.message,
        timestamp: new Date().toISOString(),
      })
    }

    // 3) Process only real steps (1-5), sequentially
    for (const step of realSteps) {
      await sleep(randomDelayMs())

      if (cancelRef.current) {
        return
      }

      appendFeedItem({
        run_id: 'demo_run', // 👈 important (match live structure)
        step: step.step,
        type: step.type,
        action: step.action ?? 'processing',
        message: step.message,
        timestamp: new Date().toISOString(),
      })
    }

    // 4) Append run_end then mark complete
    if (runEnd) {
      appendFeedItem({
        run_id: 'demo_run',
        step: 999,
        type: runEnd.type,
        action: runEnd.action ?? 'finish',
        message: runEnd.message,
        timestamp: new Date().toISOString(),
      })
      onComplete('completed')
    }
  } catch {
    if (!cancelRef.current) {
      onComplete('failed')
    }
  }
}
