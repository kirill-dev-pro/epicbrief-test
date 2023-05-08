import { hubspot } from './lib/hubspot'
import { https } from 'firebase-functions'

export const getData = https.onRequest(async (request, response) => {
  const { results: calls } = await hubspot.crm.objects.calls.basicApi.getPage(
    100,
    undefined,
    ['hs_call_title, hs_call_body', 'hs_timestamp'],
    undefined,
    ['company'],
    false,
  )
  const { results: companies } = await hubspot.crm.companies.basicApi.getPage(100, undefined, [
    'name',
  ])
  const data = calls.map(call => {
    const company = companies.find(
      company =>
        call.associations &&
        Object.values(call.associations).some(association =>
          association.results.some(({ id }) => id === company.id),
        ),
    )
    return {
      id: call.id,
      name: call.properties.hs_call_title,
      time: new Date(call.properties.hs_timestamp).getTime(),
      account: company?.properties.name,
      nextSteps: call.properties.hs_call_body,
    }
  })
  response.json(data)
})
