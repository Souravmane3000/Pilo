import type { FeedItem, RunStatus } from './types'
import { supabase } from './supabaseClient'

type CancelRef = { current: boolean }

type RunAgentLiveParams = {
  mode: 'demo' | 'live'
  goal: string
  cancelRef: CancelRef
  appendFeedItem: (item: FeedItem) => void
  onComplete: (status: RunStatus) => void
}

type RunAgentResponse = {
  success?: boolean
  run_id?: string
  action?: string | null
  error?: string
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

function getFriendlyErrorMessage(error: string): string {
  const msg = error?.toLowerCase() || ''

  if (msg.includes('name') && msg.includes('required')) {
    return 'Please provide a lead name.'
  }

  if (msg.includes('email') && msg.includes('required')) {
    return 'Please provide an email address.'
  }

  if (msg.includes('name') && msg.includes('email')) {
    return 'Please provide both name and email.'
  }

  if (msg.includes('not found')) {
    return 'No matching lead found.'
  }

  if (msg.includes('multiple')) {
    return 'Multiple leads found. Please be more specific.'
  }

  return 'Something went wrong. Please try again.'
}

function formatFinalMessage(action: string): string {
  switch (action) {
    case 'send_email':
      return 'Email sent successfully'
    case 'create_lead':
      return 'Lead created successfully'
    case 'update_email':
      return 'Email updated successfully'
    case 'delete_lead':
      return 'Lead deleted successfully'
    case 'get_leads':
      return 'Leads fetched successfully'
    default:
      return `Action completed: ${action}`
  }
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
  const { mode, goal, cancelRef, appendFeedItem, onComplete } = params
  let lastIndex = 0
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session
    const user_id =
      mode === 'demo'
        ? '00000000-0000-0000-0000-000000000000'
        : session?.user?.id

    if (!user_id) {
      onComplete('failed')
      return
    }

    const runResponse = await fetch('/api/run-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, user_id }),
    })

    if (!runResponse.ok) {
      let errorMessage = 'Failed to start run'
      try {
        const errorBody = (await runResponse.json()) as RunAgentResponse
        if (typeof errorBody.error === 'string' && errorBody.error.trim().length > 0) {
          errorMessage = getFriendlyErrorMessage(errorBody.error)
        }
      } catch {
        // Keep fallback message when error response is not JSON.
      }

      appendFeedItem({
        type: 'failed',
        action: 'system',
        step: 0,
        message: `❌ ${errorMessage}`,
        timestamp: new Date().toISOString(),
      })
      onComplete('failed')
      return
    }

    const runBody = (await runResponse.json()) as RunAgentResponse
    if (!runBody.success) {
      const errorMessage =
        typeof runBody.error === 'string' && runBody.error.trim().length > 0
          ? getFriendlyErrorMessage(runBody.error)
          : 'Run failed'

      appendFeedItem({
        type: 'failed',
        action: 'system',
        step: 0,
        message: `❌ ${errorMessage}`,
        timestamp: new Date().toISOString(),
      })
      onComplete('failed')
      return
    }

    const actionLabel =
      typeof runBody.action === 'string' && runBody.action.trim().length > 0
        ? runBody.action
        : 'unknown'

    appendFeedItem({
      type: 'success',
      action: 'system',
      step: 0,
      message: `✅ ${formatFinalMessage(actionLabel)}`,
      timestamp: new Date().toISOString(),
    })

    const run_id = runBody.run_id
    if (!run_id) {
      appendFeedItem({
        type: 'failed',
        action: 'system',
        step: 0,
        message: '❌ Missing run ID from server',
        timestamp: new Date().toISOString(),
      })
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