import { Client } from '@hubspot/api-client'
import type { NextApiRequest, NextApiResponse } from 'next'

const API_TOKEN = process.env.HUBSPOT_API_KEY

const hubspotClient = new Client({ accessToken: API_TOKEN })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { results: calls } = await hubspotClient.crm.objects.calls.basicApi.getPage(
    100,
    undefined,
    ['hs_call_title, hs_call_body', 'hs_timestamp'],
    undefined,
    ['company'],
    false,
  )
  const { results: companies } = await hubspotClient.crm.companies.basicApi.getPage(
    100,
    undefined,
    ['name'],
  )
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
  res.json(data)
}

export default handler
