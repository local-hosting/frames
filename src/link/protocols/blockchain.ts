import { defineLink } from '../types.js'

/** sensors catalog technology: `blockchain` */
export const blockchain = defineLink({
  id: 'blockchain',
  name: "Blockchain",
  kind: 'app',
  payloadBytes: { min: 0, typical: 0, max: 0 },
  bitrateBps: { min: 0, typical: 0, max: 0 },
  pipe: 'none',
  packetNotes: "Ledger/settlement layer in the sensors catalog — not an RF packet interface.",
})
