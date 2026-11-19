import { defineLink } from '../types.js'

/** sensors catalog technology: `eddystone` */
export const eddystone = defineLink({
  id: 'eddystone',
  name: "Eddystone (BLE beacon)",
  kind: 'rf',
  payloadBytes: { min: 1, typical: 20, max: 31 },
  bitrateBps: { min: 0, typical: 0, max: 0 },
  pipe: 'thin',
  packetNotes: "BLE advertisement frames only (UID/URL/TLM). Not a bidirectional thin-pipe transport.",
})
