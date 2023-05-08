import { hubspot } from './lib/hubspot'
import { https } from 'firebase-functions'

export const updateAssociation = https.onRequest(async (req, res) => {
  const { callId } = req.query
  if (!callId || Array.isArray(callId) || !Number(callId)) {
    res.status(400).json({ message: 'Missing callId' })
    return
  }
  const { companyId } = req.body
  if (!companyId || !Number(companyId)) {
    res.status(400).json({ message: 'Missing companyId' })
    return
  }
  const call = await hubspot.crm.objects.calls.associationsApi.getAll(Number(callId), 'company')
  const promises = call.results.map(async association => {
    await hubspot.crm.objects.calls.associationsApi.archive(
      Number(callId),
      'company',
      association.toObjectId,
    )
  })
  await Promise.all(promises)
  await hubspot.crm.objects.calls.associationsApi.create(
    Number(callId),
    'company',
    Number(companyId),
    [
      // {
      //   associationCategory: 'HUBSPOT_DEFINED',
      //   associationTypeId: 2,
      // },
    ],
  )
  res.send('ok')
})
