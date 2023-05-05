'use client'

import { ColorModeSwitch, TableView } from 'components'
import { Spinner } from '@chakra-ui/react'
import { useData } from 'components/DataContext'

export default function App() {
  const { data, error, isLoading } = useData()

  return (
    <div className='flex flex-col gap-2 p-2'>
      <header className='flex items-center justify-between'>
        <h1 className='text-xl font-bold'>Meetings</h1>
        <ColorModeSwitch />
      </header>
      {error && <div className='text-red-500'>Error: {error}</div>}
      {isLoading && (
        <div className='grid h-40 w-full place-items-center'>
          <Spinner size='xl' />
        </div>
      )}
      {data && <TableView className='w-full text-sm' data={data} />}
    </div>
  )
}
