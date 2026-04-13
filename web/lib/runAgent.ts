import { runAgentDemo } from './runAgentDemo'
import { runAgentLive } from './runAgentLive'
import type { ExecutionMode, FeedItem, RunStatus } from './types'

type CancelRef = { current: boolean }

type RunAgentParams = {
  mode: ExecutionMode
  goal: string
  cancelRef: CancelRef
  appendFeedItem: (item: FeedItem) => void
  onComplete: (status: RunStatus) => void
}

export async function runAgent(params: RunAgentParams): Promise<void> {
  const { mode, ...sharedParams } = params

  try {
    if (mode === 'demo') {
      await runAgentDemo(sharedParams)
      return
    }

    await runAgentLive(sharedParams)
  } catch {
    sharedParams.onComplete('failed')
  }
}
