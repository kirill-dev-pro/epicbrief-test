import { Client } from '@hubspot/api-client'

const API_TOKEN = process.env.HUBSPOT_API_KEY

const hubspot = new Client({ accessToken: API_TOKEN })

export { hubspot }
