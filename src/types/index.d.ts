import type { RowData } from '@tanstack/react-table'

export type TableData = {
  id: string
  name: string
  time: number
  account: string
  nextSteps: string[]
}

declare module '@tanstack/table-core' {
  // eslint-disable-next-line no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    isNumeric?: boolean
    isDate?: boolean
    isHtml?: boolean
  }
}

type HubspotObject = {
  id: string
  properties: {
    [key: string]: string | number | boolean | null
  }
  createdAt: string
  updatedAt: string
  archived: boolean
}

type Association = {
  id: string
  type: 'call_to_company' | 'call_to_contact'
}

interface HubspotObjectWithAssociations extends HubspotObject {
  associations: {
    [key: string]: {
      results: Association[]
    }
  }
}

export interface HubspotCallObject extends HubspotObjectWithAssociations {
  properties: {
    hs_call_body: string
    hs_call_title: string
    hs_createdate: string
    hs_lastmodifieddate: string
    hs_object_id: string
  }
}

export interface HubspotCompanyObject extends HubspotObjectWithAssociations {
  properties: {
    name: string
  }
}

export type HubspotObjectResponseWithAssociations<T extends HubspotObject> = {
  results: T[]
  paging: {
    next: {
      after: string
      link: string
    }
  }
}
