import { hubspot } from './lib/hubspot'
import { https } from 'firebase-functions'

export const updateRecord = https.onRequest(async (req, res) => {
  const { callId } = req.query
  if (!callId || Array.isArray(callId)) {
    res.status(400).json({ message: 'Missing callId' })
    return
  }
  const { record } = req.body
  if (!record) {
    res.status(400).json({ message: 'Missing record' })
    return
  }
  await hubspot.crm.objects.calls.basicApi.update(callId as string, {
    properties: record,
  })
  res.send('ok')
})
