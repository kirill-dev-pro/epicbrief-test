import { FilterAndActions } from './FilterAndActions'
import { PaginationControls } from './PaginationControls'
import { CellContent } from './TableCell'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { Table, Thead, Tbody, Tr, Th, TableContainer, Checkbox, Td } from '@chakra-ui/react'
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
} from '@tanstack/react-table'
import clsx from 'clsx'
import { useState } from 'react'
import type { TableData } from 'types'

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
  }),
]

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
                {row.getVisibleCells().map((cell, idx) => (
                  <Td key={idx}>
                    <CellContent cell={cell} />
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <PaginationControls table={table} totalRows={data.length} />
    </div>
  )
}
