'use client'

import React, { useEffect, useRef } from 'react'
import { Zap } from 'lucide-react'
import EmptyState from './EmptyState'
import FeedItem from './FeedItem'
import type { FeedItem as FeedItemType, RunStatus } from '../lib/types'

type ExecutionFeedProps = {
  feed: FeedItemType[]
  runStatus: RunStatus
}

export default function ExecutionFeed({ feed, runStatus }: ExecutionFeedProps): React.ReactNode {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [feed.length])

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      {feed.length === 0 && runStatus === 'idle' ? (
        <EmptyState
          icon={Zap}
          title="Run a goal to see Pilo think"
          description="Step-by-step agent reasoning will appear here."
        />
      ) : (
        <>
          {feed.map((item, index) => (
            <FeedItem key={index} item={item} />
          ))}

          {runStatus === 'running' ? (
            <div className="mt-2 text-sm text-zinc-400 animate-pulse">Thinking...</div>
          ) : null}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

