'use client'

import { ReactNode, createContext } from 'react'
import { PollsContext, usePollsProvider } from '../../lib/hooks/usePolls'

interface PollsProviderProps {
  children: ReactNode
}

export function PollsProvider({ children }: PollsProviderProps) {
  const polls = usePollsProvider()

  return (
    <PollsContext.Provider value={polls}>
      {children}
    </PollsContext.Provider>
  )
}