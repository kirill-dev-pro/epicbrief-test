import { hubspot } from './lib/hubspot'
import { https } from 'firebase-functions'

export const deleteRecord = https.onRequest(async (req, res) => {
  const { callId } = req.query
  if (!callId || Array.isArray(callId)) {
    res.status(400).json({ message: 'Missing callId' })
    return
  }
  await hubspot.crm.objects.calls.basicApi.archive(callId as string)
  res.send('ok')
})
