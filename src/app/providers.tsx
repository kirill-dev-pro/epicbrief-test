'use client'

// import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import { DataProvider } from 'components/DataContext'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    // <CacheProvider>
    <DataProvider>
      <ChakraProvider>{children}</ChakraProvider>
    </DataProvider>
    // </CacheProvider>
  )
}
