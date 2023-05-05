import { Client } from '@hubspot/api-client'
import type { NextApiRequest, NextApiResponse } from 'next'

const API_TOKEN = process.env.HUBSPOT_API_KEY

const hubspotClient = new Client({ accessToken: API_TOKEN })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { results: companies } = await hubspotClient.crm.companies.basicApi.getPage(
    100,
    undefined,
    ['name'],
  )
  res.json(companies)
}

export default handler
