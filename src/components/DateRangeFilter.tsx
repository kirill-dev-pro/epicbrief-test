import type { Column } from '@tanstack/react-table'
import { RangeDatepicker } from 'chakra-dayzed-datepicker'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

export function DateRangeFilter({
  column,
  className,
}: {
  column: Column<any, unknown>
  className?: string
}) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([new Date(), new Date()])

  useEffect(() => {
    if (
      selectedDates[0] &&
      selectedDates[1] &&
      selectedDates[0].getTime() !== selectedDates[1].getTime()
    ) {
      column.setFilterValue(selectedDates)
    }
  }, [selectedDates, column])

  return (
    <div className={clsx('w-96', className)}>
      <RangeDatepicker
        configs={{ dateFormat: 'dd.MM.yyyy' }}
        selectedDates={selectedDates}
        onDateChange={setSelectedDates}
        minDate={new Date(column.getFacetedMinMaxValues()?.[0] ?? '')}
        maxDate={new Date(column.getFacetedMinMaxValues()?.[1] ?? '')}
      />
    </div>
  )
}
