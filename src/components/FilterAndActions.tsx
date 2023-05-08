import { useData } from './DataContext'
import { DateRangeFilter } from './DateRangeFilter'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  HamburgerIcon,
} from '@chakra-ui/icons'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Input,
} from '@chakra-ui/react'
import { Table } from '@tanstack/react-table'
import { useMemo, useRef, useState } from 'react'
import { TableData } from 'types'

const EMAIL_REGEX = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/gm

export function FilterAndActions({ table }: { table: Table<TableData> }) {
  const timeColumn = useMemo(() => table.getColumn('time'), [table])

  return (
    <div className='flex gap-2'>
      <FilterMenu columnId='account' table={table} />
      <ActionsMenu table={table} />
      <div className='flex-1' />
      {timeColumn && (
        <Button
          onClick={() => table.getColumn('time')?.toggleSorting()}
          aria-label='Sort'
          leftIcon={
            timeColumn.getIsSorted() ? (
              timeColumn.getIsSorted() === 'desc' ? (
                <ArrowDownIcon h={3} w={3} />
              ) : (
                <ArrowUpIcon h={3} w={3} />
              )
            ) : undefined
          }
        >
          Sort:{' '}
          {timeColumn.getIsSorted()
            ? timeColumn.getIsSorted() === 'desc'
              ? 'Recent'
              : 'Old'
            : 'None'}
        </Button>
      )}
      {timeColumn && <DateRangeFilter column={timeColumn} className='' />}
    </div>
  )
}

export function FilterMenu({ columnId, table }: { columnId: string; table: Table<TableData> }) {
  const column = useMemo(() => table.getColumn(columnId), [table, columnId])

  const sortedUniqueValues = useMemo(() => {
    if (!column) return []
    return Array.from(column.getFacetedUniqueValues().keys()).sort()
  }, [column])

  if (!column) return null

  const columnFilterValue = column.getFilterValue()

  return (
    <Menu>
      <MenuButton as={Button} leftIcon={<HamburgerIcon />}>
        Filters
      </MenuButton>
      <MenuList>
        {!!columnFilterValue && (
          <>
            <MenuItem onClick={() => column.setFilterValue(undefined)}>Clear</MenuItem>
            <hr />
          </>
        )}
        {sortedUniqueValues
          .slice(0, 100)
          .filter(Boolean)
          .map((value: string, idx) => (
            <MenuItem
              icon={columnFilterValue === value ? <CheckIcon /> : undefined}
              key={idx}
              onClick={() => column.setFilterValue(value)}
            >
              {value || '<Empty>'}
            </MenuItem>
          ))}
      </MenuList>
    </Menu>
  )
}

function ActionsMenu({ table }: { table: Table<TableData> }) {
  const toast = useToast()
  const { mutate } = useData()
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteDialog = useDisclosure()
  const exportDialog = useDisclosure()
  const deleteCancelRef = useRef<HTMLButtonElement>(null)
  const exportCancelRef = useRef<HTMLButtonElement>(null)
  const [email, setEmail] = useState('')
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email), [email])

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)

  function saveSelected() {
    const text = JSON.stringify(selectedRows, null, 2)
    const data = new Blob([text], { type: 'text/plain' })
    const file = window.URL.createObjectURL(data)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', file)
    a.setAttribute('download', 'export.json')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  async function deleteSelected() {
    try {
      setIsDeleting(true)
      const rowIds = selectedRows.map(row => row.id)
      const promises = rowIds.map(callId =>
        fetch('/api/deleteRecord?' + new URLSearchParams({ callId })),
      )
      await Promise.all(promises)
      deleteDialog.onClose()
      toast({
        title: 'Records deleted',
        description: `${selectedRows.length} records deleted`,
        status: 'success',
        duration: 1000,
        isClosable: true,
      })
      mutate()
      table.setRowSelection({})
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error deleting records',
        description: (err as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  function sendSelectedByMail() {
    window.location.href = `mailto:${email}?subject=Call%20records&body=${encodeURIComponent(
      JSON.stringify(selectedRows, null, 2),
    )}`
    exportDialog.onClose()
  }

  return (
    <>
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={deleteCancelRef}
        onClose={() => !isDeleting && deleteDialog.onClose()}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete records?
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {selectedRows.length} records? You can't undo this
              action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={deleteCancelRef} onClick={deleteDialog.onClose} isDisabled={isDeleting}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={deleteSelected} ml={3} isLoading={isDeleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={exportDialog.isOpen}
        leastDestructiveRef={exportCancelRef}
        onClose={exportDialog.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Where do you want to send email?
            </AlertDialogHeader>

            <AlertDialogBody>
              Type email to send {selectedRows.length} records?
              <Input
                placeholder='Email'
                type='email'
                mt={2}
                onChange={e => setEmail(e.currentTarget.value)}
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={exportCancelRef} onClick={exportDialog.onClose}>
                Cancel
              </Button>
              <Button onClick={sendSelectedByMail} ml={3} isDisabled={!isEmailValid}>
                Send
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} isDisabled={!selectedRows.length}>
          Actions
        </MenuButton>
        <MenuList>
          <MenuItem onClick={exportDialog.onOpen}>Send Email</MenuItem>
          <MenuItem onClick={saveSelected}>Export</MenuItem>
          <MenuItem onClick={deleteDialog.onOpen}>Delete</MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}
