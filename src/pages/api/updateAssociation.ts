import { Client } from '@hubspot/api-client'
import type { NextApiRequest, NextApiResponse } from 'next'

const API_TOKEN = process.env.HUBSPOT_API_KEY

const hubspotClient = new Client({ accessToken: API_TOKEN })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { callId } = req.query
  if (!callId || Array.isArray(callId) || !Number(callId)) {
    res.status(400).json({ message: 'Missing callId' })
    return
  }
  console.log('got req', req.body.companyId, Number(req.body.companyId))
  const { companyId } = req.body
  if (!companyId || !Number(companyId)) {
    res.status(400).json({ message: 'Missing companyId' })
    return
  }
  const call = await hubspotClient.crm.objects.calls.associationsApi.getAll(
    Number(callId),
    'company',
  )
  const promises = call.results.map(async association => {
    await hubspotClient.crm.objects.calls.associationsApi.archive(
      Number(callId),
      'company',
      association.toObjectId,
    )
  })
  await Promise.all(promises)
  await hubspotClient.crm.objects.calls.associationsApi.create(
    Number(callId),
    'company',
    Number(companyId),
    [
      {
        associationCategory: 'HUBSPOT_DEFINED',
        associationTypeId: 2,
      },
    ],
  )
  res.send('ok')
}

export default handler
