import { ColorModeSwitch } from './components/ColorModeSwitch'
import { useData } from './components/DataContext'
import { TableView } from './components/Table'
import { Spinner } from '@chakra-ui/react'

export default function App() {
  const { data, error, isLoading } = useData()

  console.log('data', data, 'error', error, 'isLoading', isLoading)

  return (
    <div className='flex flex-col gap-2 p-2'>
      <header className='flex items-center justify-between'>
        <h1 className='text-xl font-bold'>Meetings</h1>
        <ColorModeSwitch />
      </header>
      {error && <div className='text-red-500'>Error: {error.message}</div>}
      {isLoading && (
        <div className='grid h-40 w-full place-items-center'>
          <Spinner size='xl' />
        </div>
      )}
      {!error && data && <TableView className='w-full text-sm' data={data} />}
    </div>
  )
}
