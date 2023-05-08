import { useCompanies, useData } from './DataContext'
import { updateCompanyAssociation } from '../api'
import { useOutsideClick, Menu, MenuItem, MenuList, MenuButton, Spinner } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { HubspotCompanyObject } from 'types'

export function AccountField({ value, callId }: { value: string; callId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const companies = useCompanies()
  const { mutate } = useData()
  const [loading, setLoading] = useState(false)

  useOutsideClick({ ref, handler: () => setIsEditing(false) })

  useEffect(() => {
    setLoading(false)
  }, [value])

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
    await updateCompanyAssociation(callId, company.id)
    mutate()
  }

  if (isEditing) {
    return (
      <div ref={ref}>
        <Menu isOpen>
          <MenuButton>
            <div className='rounded border p-1'>{value || '<none>'}</div>
          </MenuButton>
          <MenuList>
            {companies &&
              companies.map(company => (
                <MenuItem
                  key={company.id}
                  onClick={() => {
                    onCompanySelected(company)
                    setIsEditing(false)
                    setLoading(true)
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
    <div
      onClick={() => setIsEditing(true)}
      className='cursor-pointer border border-transparent p-1'
    >
      {loading ? <Spinner /> : value || '<none>'}
    </div>
  )
}
