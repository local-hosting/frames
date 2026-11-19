import { defineLink } from '../types.js'

/** sensors catalog technology: `rfid` */
export const rfid = defineLink({
  id: 'rfid',
  name: "RFID",
  kind: 'rf',
  payloadBytes: { min: 1, typical: 12, max: 64 },
  bitrateBps: { min: 0, typical: 40_000, max: 640_000 },
  pipe: 'thin',
  packetNotes: "EPC/tag memory reads; not a general bidirectional frame transport.",
})
