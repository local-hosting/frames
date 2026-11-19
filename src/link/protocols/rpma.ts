import { defineLink } from '../types.js'

/** sensors catalog technology: `rpma` */
export const rpma = defineLink({
  id: 'rpma',
  name: "RPMA (Ingenu)",
  kind: 'rf',
  payloadBytes: { min: 16, typical: 64, max: 256 },
  bitrateBps: { min: 100, typical: 2_000, max: 20_000 },
  pipe: 'thin',
  packetNotes: "Proprietary LPWAN; plan small uplink frames. Not a fat-pipe heal path.",
})
