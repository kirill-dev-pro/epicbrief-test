import { Input, InputProps } from '@chakra-ui/react'
import type { Column, Table } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

export function FilterInput({
  column,
  table,
}: {
  column: Column<any, unknown>
  table: Table<any>
}) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  const facedUniqueValues = column.getFacetedUniqueValues()

  const sortedUniqueValues = useMemo(
    () => (typeof firstValue === 'number' ? [] : Array.from(facedUniqueValues.keys()).sort()),
    [facedUniqueValues, firstValue],
  )

  return typeof firstValue === 'number' ? (
    <div className='flex space-x-2'>
      <DebouncedInput
        type='number'
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={value => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
        placeholder={`Min ${
          column.getFacetedMinMaxValues()?.[0] ? `(${column.getFacetedMinMaxValues()?.[0]})` : ''
        }`}
        className='w-24 rounded border shadow'
      />
      <DebouncedInput
        type='number'
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={value => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
        placeholder={`Max ${
          column.getFacetedMinMaxValues()?.[1] ? `(${column.getFacetedMinMaxValues()?.[1]})` : ''
        }`}
        className='w-24 rounded border shadow'
      />
    </div>
  ) : (
    <>
      <datalist id={column.id + 'list'}>
        {sortedUniqueValues.slice(0, 5000).map((value: any, idx) => (
          <option value={value} key={idx} />
        ))}
      </datalist>
      <DebouncedInput
        type='text'
        value={(columnFilterValue ?? '') as string}
        onChange={value => column.setFilterValue(value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        className='w-36 rounded border shadow'
        list={column.id + 'list'}
      />
    </>
  )
}

// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<InputProps, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, debounce])

  return <Input {...props} value={value} onChange={e => setValue(e.target.value)} />
}
