import { AccountField } from './AccountField'
import { useData } from './DataContext'
import { updateCall } from '../api'
import { Input, usePrevious, useOutsideClick, Spinner, useToast, Textarea } from '@chakra-ui/react'
import { Cell } from '@tanstack/react-table'
import { SingleDatepicker } from 'chakra-dayzed-datepicker'
import { useEffect, useRef, useState } from 'react'
import type { TableData } from 'types'

const formatter = new Intl.DateTimeFormat('de-DE', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
})

export function CellContent({ cell }: { cell: Cell<TableData, unknown> }) {
  const { mutate } = useData()
  // const meta = cell.column.columnDef.meta
  const row = cell.row
  const callId = row.original.id
  const toast = useToast()

  const value = cell.getValue()
  // const prevValue = usePrevious(value)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setIsUpdating(false)
  }, [value])

  if (isUpdating) {
    return <Spinner />
  }

  const onPropertyChange = async (value: string | number) => {
    setIsUpdating(true)
    try {
      let column
      if (cell.column.id === 'nextSteps') {
        column = 'hs_call_body'
      } else if (cell.column.id === 'time') {
        column = 'hs_timestamp'
      } else if (cell.column.id === 'name') {
        column = 'hs_call_title'
      } else {
        column = cell.column.id
      }

      await updateCall(callId, { [column]: value })
      await mutate()
      toast({
        title: 'Success',
        description: 'Call updated',
        status: 'success',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Could not update call',
        status: 'error',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  switch (cell.column.id) {
    case 'nextSteps':
      return <EditableField value={value as string} onChange={onPropertyChange} multiline html />
    case 'account':
      return <AccountField value={value as string} callId={row.original.id} />
    case 'time':
      return <DateField value={value as number} onChange={onPropertyChange} />
    default:
      return <EditableField value={cell.getValue() as string} onChange={onPropertyChange} />
  }
}

function EditableField({
  value,
  onChange,
  html,
  multiline,
}: {
  value: string | number
  onChange: (value: string | number) => void
  html?: boolean
  multiline?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [newValue, setNewValue] = useState(value)
  const prevEditing = usePrevious(isEditing)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick({ ref, handler: () => setIsEditing(false) })

  useEffect(() => {
    if (isEditing) {
      const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') setIsEditing(false)
      }
      window.addEventListener('keydown', onKeydown)
      return () => window.removeEventListener('keydown', onKeydown)
    }
  }, [isEditing])

  useEffect(() => {
    if (prevEditing && !isEditing) {
      if (newValue !== value) {
        onChange(newValue)
      }
    }
  }, [isEditing, onChange, prevEditing, newValue, value])

  if (isEditing) {
    if (multiline) {
      return (
        <div ref={ref}>
          <Textarea
            padding={1}
            h={8}
            autoFocus
            onBlur={() => setIsEditing(false)}
            defaultValue={value}
            onChange={e => setNewValue(e.target.value)}
          />
        </div>
      )
    }
    return (
      <div ref={ref}>
        {/* <input className='p-1 h-8 ' autoFocus onBlur={() => setIsEditing(false)} defaultValue={}  /> */}
        <Input
          padding={1}
          h={8}
          autoFocus
          onBlur={() => setIsEditing(false)}
          defaultValue={value}
          onChange={e => setNewValue(e.target.value)}
        />
      </div>
    )
  }

  if (html)
    return (
      <div
        dangerouslySetInnerHTML={{ __html: value }}
        onClick={() => setIsEditing(true)}
        className='cursor-pointer'
      />
    )
  return (
    <div onClick={() => setIsEditing(true)} className='cursor-pointer'>
      {value}
    </div>
  )
}

function DateField({
  value,
  onChange,
}: {
  value: string | number
  onChange: (value: string | number) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const prevEditing = usePrevious(isEditing)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick({ ref, handler: () => setIsEditing(false) })

  useEffect(() => {
    if (isEditing) {
      const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') setIsEditing(false)
      }
      window.addEventListener('keydown', onKeydown)
      return () => window.removeEventListener('keydown', onKeydown)
    }
  }, [isEditing])

  useEffect(() => {
    if (prevEditing && !isEditing) {
      onChange(value)
    }
  }, [isEditing, onChange, prevEditing, value])

  if (isEditing) {
    return (
      <div ref={ref}>
        <SingleDatepicker
          configs={{ dateFormat: 'dd.MM.yyyy' }}
          name='date-input'
          date={new Date(value as number)}
          defaultIsOpen
          onDateChange={date => {
            onChange(date.getTime())
            setIsEditing(false)
          }}
        />
      </div>
    )
  }
  return (
    <div onClick={() => setIsEditing(true)} className='cursor-pointer'>
      {formatter.format(new Date(value))}
    </div>
  )
}
