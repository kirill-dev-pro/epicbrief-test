import { TableData } from 'types'
import { Button } from '@chakra-ui/react'
import { Table } from '@tanstack/react-table'

export function PaginationControls({
  table,
  totalRows = 0,
}: {
  table: Table<TableData>
  totalRows: number
}) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        Showing results{' '}
        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
          table.getRowModel().rows.length}{' '}
        of {totalRows}
      </div>
      <div className='flex gap-2'>
        <Button onClick={table.previousPage} isDisabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button onClick={table.nextPage} isDisabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
