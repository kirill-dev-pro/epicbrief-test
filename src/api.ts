import { HubspotCallObject } from 'types'

export async function updateCompanyAssociation(callId: string, companyId: string) {
  const response = await fetch('/api/updateAssociation?' + new URLSearchParams({ callId }), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ companyId }),
  })
  if (!response.ok) {
    throw new Error('Failed to update call. Reason: ' + response.statusText)
  }
}

export async function updateCall(callId: string, data: Partial<HubspotCallObject['properties']>) {
  const response = await fetch('/api/updateRecord?' + new URLSearchParams({ callId }), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      record: data,
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to update call. Reason: ' + response.statusText)
  }
}
