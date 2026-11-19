import { defineLink } from '../types.js'

/** sensors catalog technology: `ethernet` */
export const ethernet = defineLink({
  id: 'ethernet',
  name: "Ethernet",
  kind: 'wired',
  payloadBytes: { min: 64, typical: 1_500, max: 9_000 },
  bitrateBps: { min: 10_000_000, typical: 1_000_000_000, max: 100_000_000_000 },
  pipe: 'both',
  packetNotes: "IEEE 802.3; standard MTU 1500, jumbo optional. Ideal fat heal path.",
})
