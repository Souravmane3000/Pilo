'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_USER } from '../lib/mockData'
import type { ExecutionMode, FeedItem, MockUser, RunStatus } from '../lib/types'

type PiloContextValue = {
  user: MockUser
  mode: ExecutionMode
  setMode: (mode: ExecutionMode) => void
  runStatus: RunStatus
  setRunStatus: (status: RunStatus) => void
  feed: FeedItem[]
  appendFeedItem: (item: FeedItem) => void
  resetFeed: () => void
}

const PiloContext = createContext<PiloContextValue | undefined>(undefined)

type PiloProviderProps = {
  children: ReactNode
}

const MODE_STORAGE_KEY = 'pilo_mode'

export function PiloProvider({ children }: PiloProviderProps): JSX.Element {
  const [mode, setModeState] = useState<ExecutionMode>('demo')
  const [runStatus, setRunStatus] = useState<RunStatus>('idle')
  const [feed, setFeed] = useState<FeedItem[]>([])

  useEffect(() => {
    try {
      const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY)
      if (storedMode === 'demo' || storedMode === 'live') {
        setModeState(storedMode)
      }
    } catch {
      // localStorage can be unavailable in some environments.
    }
  }, [])

  const setMode = useCallback((nextMode: ExecutionMode): void => {
    setModeState(nextMode)

    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, nextMode)
    } catch {
      // localStorage can be unavailable in some environments.
    }
  }, [])

  const appendFeedItem = useCallback((item: FeedItem): void => {
    setFeed((currentFeed) => [...currentFeed, item])
  }, [])

  const resetFeed = useCallback((): void => {
    setFeed([])
  }, [])

  const value = useMemo<PiloContextValue>(() => {
    return {
      user: MOCK_USER,
      mode,
      setMode,
      runStatus,
      setRunStatus,
      feed,
      appendFeedItem,
      resetFeed,
    }
  }, [appendFeedItem, feed, mode, resetFeed, runStatus, setMode])

  return <PiloContext.Provider value={value}>{children}</PiloContext.Provider>
}

export function usePilo(): PiloContextValue {
  const context = useContext(PiloContext)
  if (!context) {
    throw new Error('usePilo must be used within a PiloProvider')
  }
  return context
}
