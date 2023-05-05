import { ReactNode, createContext, useContext } from 'react'
import useSWR, { SWRResponse } from 'swr'
import { HubspotCompanyObject, TableData } from 'types'

type ContextValue = SWRResponse<TableData[], any, any>

const DataContext = createContext<ContextValue>({
  data: undefined,
  error: undefined,
  isValidating: false,
  isLoading: false,
  mutate: async () => undefined,
})

const CompaniesContext = createContext<HubspotCompanyObject[] | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const value = useSWR<TableData[]>('/api/getData', () =>
    fetch('/api/getData').then(res => res.json()),
  )

  const { data: companies } = useSWR<HubspotCompanyObject[]>('/api/getCompanies', () =>
    fetch('/api/getCompanies').then(res => res.json()),
  )

  return (
    <DataContext.Provider value={value}>
      <CompaniesContext.Provider value={companies}>{children}</CompaniesContext.Provider>
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
export const useCompanies = () => useContext(CompaniesContext)
