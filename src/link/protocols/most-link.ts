import { defineLink } from '../types.js'

/** sensors catalog technology: `most-link` */
export const most_link = defineLink({
  id: 'most-link',
  name: "MOST Link",
  kind: 'rf',
  payloadBytes: { min: 8, typical: 32, max: 64 },
  bitrateBps: { min: 100, typical: 1_000, max: 10_000 },
  pipe: 'thin',
  packetNotes: "Proprietary LPWAN-class link in sensors catalog; assume small uplinks only.",
})
