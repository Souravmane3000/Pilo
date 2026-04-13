import type { FeedItem, RunStatus } from './types'

type CancelRef = { current: boolean }

type RunAgentLiveParams = {
  goal: string
  cancelRef: CancelRef
  appendFeedItem: (item: FeedItem) => void
  onComplete: (status: RunStatus) => void
}

const FEED_ITEM_TYPES: FeedItem['type'][] = [
  'thinking',
  'executing',
  'success',
  'failed',
  'run_start',
  'run_end',
]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function normalizeFeedItem(raw: Record<string, unknown>): FeedItem {
  const step = typeof raw.step === 'number' ? raw.step : 0
  const typeRaw = raw.type
  const type: FeedItem['type'] =
    typeof typeRaw === 'string' && (FEED_ITEM_TYPES as string[]).includes(typeRaw)
      ? (typeRaw as FeedItem['type'])
      : 'thinking'
  const action = typeof raw.action === 'string' ? raw.action : 'system'
  const message = typeof raw.message === 'string' ? raw.message : ''
  const ts = raw.timestamp
  const timestamp =
    typeof ts === 'string' && ts.length > 0 ? ts : new Date().toISOString()

  return { step, type, action, message, timestamp }
}

export async function runAgentLive(params: RunAgentLiveParams): Promise<void> {
  const { goal, cancelRef, appendFeedItem, onComplete } = params
  let lastIndex = 0
  try {
    const runResponse = await fetch('/api/run-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    })

    if (!runResponse.ok) {
      onComplete('failed')
      return
    }

    const runBody = (await runResponse.json()) as { run_id?: string }
    const run_id = runBody.run_id
    if (!run_id) {
      onComplete('failed')
      return
    }

    appendFeedItem({
      type: 'run_start',
      action: 'system',
      step: 0,
      message: 'Run started',
      timestamp: new Date().toISOString(),
    })

    while (true) {
      if (cancelRef.current) {
        return
      }

      const feedResponse = await fetch(
        `/api/agent/feed?run_id=${encodeURIComponent(run_id)}&mode=live`
      )

      if (!feedResponse.ok) {
        onComplete('failed')
        return
      }

      const data = await feedResponse.json()
      const items = Array.isArray(data) ? data : []
      const newItems = items.slice(lastIndex)

      for (const row of newItems) {
        if (cancelRef.current) {
          return
        }

        const record =
          row !== null && typeof row === 'object'
            ? (row as Record<string, unknown>)
            : {}

        appendFeedItem(normalizeFeedItem(record))
      }
      lastIndex = items.length

      // ✅ FIX: include 'failed' as terminal state
      if (
        items.some((step) => {
          const t =
            step &&
            typeof step === 'object' &&
            'type' in step &&
            typeof (step as { type: unknown }).type === 'string'
              ? (step as { type: string }).type
              : ''
          return t === 'success' || t === 'error' || t === 'failed'
        })
      ) {
        const terminalFailed = items.some((step) => {
          const t =
            step &&
            typeof step === 'object' &&
            'type' in step &&
            typeof (step as { type: unknown }).type === 'string'
              ? (step as { type: string }).type
              : ''
          return t === 'error' || t === 'failed'
        })

        appendFeedItem({
          type: 'run_end',
          action: 'system',
          step: 999,
          message: terminalFailed ? 'Run failed' : 'Run completed successfully',
          timestamp: new Date().toISOString(),
        })

        onComplete(terminalFailed ? 'failed' : 'completed')
        return
      }

      await sleep(600)
    }
  } catch {
    onComplete('failed')
  }
}