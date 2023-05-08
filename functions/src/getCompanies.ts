import { hubspot } from './lib/hubspot'
import { https } from 'firebase-functions'

export const getCompanies = https.onRequest(async (req, res) => {
  const { results: companies } = await hubspot.crm.companies.basicApi.getPage(100, undefined, [
    'name',
  ])
  res.json(companies)
})
