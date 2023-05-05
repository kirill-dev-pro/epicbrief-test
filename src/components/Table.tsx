import { PaginationControls } from './PaginationControls'
import { FilterAndActions } from './FilterAndActions'
import { useCompanies, useData } from './DataContext'
import type { HubspotCompanyObject, TableData } from 'types'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Checkbox,
  Input,
  usePrevious,
  useOutsideClick,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
} from '@chakra-ui/react'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  createColumnHelper,
  FilterFn,
  getFilteredRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  Cell,
} from '@tanstack/react-table'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { SingleDatepicker } from 'chakra-dayzed-datepicker'

const columnHelper = createColumnHelper<TableData>()

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({ itemRank })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const columns = [
  columnHelper.accessor('name', {
    cell: info => info.getValue(),
    header: 'Name',
  }),
  columnHelper.accessor('time', {
    cell: info => info.getValue(),
    header: 'Time',
    meta: {
      isDate: true,
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, value, addMeta) => {
      if (value.length < 2) return true
      const rowValue = row.getValue(columnId) as number
      return (
        rowValue >= value[0].getTime() &&
        // plus one day in milliseconds
        rowValue <= value[1].getTime() + 60 * 60 * 24 * 1000
      )
    },
  }),
  columnHelper.accessor('account', {
    cell: info => info.getValue(),
    header: 'Account',
  }),
  columnHelper.accessor('nextSteps', {
    cell: info => info.getValue(),
    header: 'Next Steps',
    meta: {
      isHtml: true,
    },
  }),
]

const formatter = new Intl.DateTimeFormat('de-DE', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
})

export function TableView({ className, data }: { className?: string; data: TableData[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    columns,
    data,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    state: {
      rowSelection,
      globalFilter,
      sorting,
    },
  })

  // const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)

  // console.log('render table view', selectedRows)

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <FilterAndActions table={table} />
      <TableContainer className='rounded border p-2 text-sm shadow-md'>
        <Table variant='simple' w='100%'>
          <Thead>
            {table.getHeaderGroups().map(headerGroup => (
              <Tr key={headerGroup.id}>
                <Th paddingX={0}>
                  <Checkbox
                    onChange={() => table.toggleAllRowsSelected()}
                    isChecked={table.getIsAllRowsSelected()}
                    isIndeterminate={!!table.getIsSomeRowsSelected()}
                  />
                </Th>
                {headerGroup.headers.map(header => {
                  const meta = header.column.columnDef.meta
                  return (
                    <Th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      isNumeric={meta?.isNumeric}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}

                      <span className='pl-4'>
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'desc' ? (
                            <TriangleDownIcon aria-label='sorted descending' />
                          ) : (
                            <TriangleUpIcon aria-label='sorted ascending' />
                          )
                        ) : null}
                      </span>
                    </Th>
                  )
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map(row => (
              <Tr key={row.id}>
                <Th paddingX={0}>
                  <Checkbox
                    isChecked={row.getIsSelected() || table.getIsAllRowsSelected()}
                    onChange={() => row.toggleSelected()}
                  />
                </Th>
                {row.getVisibleCells().map(cell => {
                  const meta = cell.column.columnDef.meta
                  // const content = meta?.isDate
                  //   ? formatter.format(new Date(cell.getValue() as number))
                  //   : cell.column.columnDef.cell
                  if (meta?.isHtml) {
                    return (
                      <Td
                        key={cell.id}
                        dangerouslySetInnerHTML={{ __html: cell.getValue() as string }}
                      />
                    )
                  }
                  if (cell.column.id === 'account') {
                    return (
                      <Td key={cell.id}>
                        <AccountField
                          value={cell.getValue() as string}
                          callId={row.original.id}
                          cell={cell}
                        />
                      </Td>
                    )
                  }
                  return (
                    <Td key={cell.id}>
                      <EditableField
                        cell={cell}
                        value={cell.getValue() as string}
                        onChange={() => {}}
                        type={meta?.isDate ? 'date' : 'text'}
                      />
                      {/* {Array.isArray(cell.getValue()) ? (
                        <MultiLinesView lines={cell.getValue() as TableData['nextSteps']} />
                      ) : (
                        flexRender(content, cell.getContext())
                      )} */}
                    </Td>
                  )
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <PaginationControls table={table} totalRows={data.length} />
    </div>
  )
}

// function MultiLinesView({
//   className,
//   lines,
// }: {
//   className?: string
//   lines: TableData['nextSteps']
// }) {
//   const [isOpen, setIsOpen] = useState(!(lines.length > 3))
//   return (
//     <div className={className}>
//       {lines.slice(0, isOpen ? Infinity : 2).map((step, idx) => (
//         <p key={idx}>• {step}</p>
//       ))}
//       {!isOpen && (
//         <span
//           className='cursor-pointer text-gray-500 opacity-90 hover:underline hover:opacity-100'
//           onClick={() => setIsOpen(true)}
//         >
//           Show more
//         </span>
//       )}
//     </div>
//   )
// }

function EditableField({
  value,
  onChange,
  type,
  cell,
}: {
  cell: Cell<TableData, unknown>
  value: string | number
  onChange: (value: string | number) => void
  type: 'text' | 'date'
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
    switch (type) {
      case 'date':
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

      default:
        return (
          <div ref={ref}>
            <Input padding={1} h={8} autoFocus onBlur={() => setIsEditing(false)} value={value} />
          </div>
        )
    }
  }
  switch (type) {
    case 'date':
      return (
        <div onClick={() => setIsEditing(true)} className='cursor-pointer'>
          {formatter.format(new Date(cell.getValue() as number))}
        </div>
      )
    default:
      return (
        <div onClick={() => setIsEditing(true)} className='cursor-pointer'>
          {flexRender(value, cell.getContext())}
        </div>
      )
  }
}

function AccountField({
  value,
  callId,
  cell,
}: {
  value: string
  callId: string
  cell: Cell<TableData, unknown>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const companies = useCompanies()
  const { mutate } = useData()

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

  const onCompanySelected = async (company: HubspotCompanyObject) => {
    if (!company) return
    if (company.properties.name === value) return

    console.log('updating association', callId, company.id)

    await fetch('/api/updateAssociation?' + new URLSearchParams({ callId }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId: company.id,
      }),
    })

    mutate()
  }

  if (isEditing) {
    return (
      <div ref={ref}>
        <Menu isOpen>
          <MenuButton>{value}</MenuButton>
          <MenuList>
            {companies &&
              companies.map(company => (
                <MenuItem
                  key={company.id}
                  onClick={() => {
                    onCompanySelected(company)
                    setIsEditing(false)
                  }}
                >
                  {company.properties.name}
                </MenuItem>
              ))}
          </MenuList>
        </Menu>
      </div>
    )
  }
  return (
    <div onClick={() => setIsEditing(true)} className='cursor-pointer'>
      {flexRender(value, cell.getContext()) || '<none>'}
    </div>
  )
}
