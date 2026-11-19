import { defineLink } from '../types.js'

/** sensors catalog technology: `gnss` */
export const gnss = defineLink({
  id: 'gnss',
  name: "GNSS",
  kind: 'sensor',
  payloadBytes: { min: 0, typical: 0, max: 0 },
  bitrateBps: { min: 0, typical: 0, max: 0 },
  pipe: 'none',
  packetNotes: "Receive-only navigation (GPS/GNSS). Not a data uplink for thin/fat wire.",
})
