import { defineLink } from '../types.js'

/** sensors catalog technology: `infrared` */
export const infrared = defineLink({
  id: 'infrared',
  name: "Infrared",
  kind: 'rf',
  payloadBytes: { min: 1, typical: 8, max: 64 },
  bitrateBps: { min: 1_200, typical: 9_600, max: 115_200 },
  pipe: 'thin',
  packetNotes: "IR remote / IrDA-class; line-of-sight, tiny payloads.",
})
