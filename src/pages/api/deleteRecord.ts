import { Client } from '@hubspot/api-client'
import type { NextApiRequest, NextApiResponse } from 'next'

const API_TOKEN = process.env.HUBSPOT_API_KEY

const hubspotClient = new Client({ accessToken: API_TOKEN })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { callId } = req.query
  if (!callId || Array.isArray(callId)) {
    res.status(400).json({ message: 'Missing callId' })
    return
  }
  await hubspotClient.crm.objects.calls.basicApi.archive(callId)
  res.send('ok')
}

export default handler
