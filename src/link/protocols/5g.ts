import { defineLink } from '../types.js'

/** sensors catalog technology: `5g` */
export const link_5g = defineLink({
  id: '5g',
  name: "5G NR",
  kind: 'rf',
  payloadBytes: { min: 64, typical: 1_400, max: 9_000 },
  bitrateBps: { min: 10_000_000, typical: 100_000_000, max: 1_000_000_000 },
  pipe: 'both',
  packetNotes: "IP; jumbo rare on WAN. Fat heal and continuous sync fine.",
})
