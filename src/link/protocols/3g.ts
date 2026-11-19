import { defineLink } from '../types.js'

/** sensors catalog technology: `3g` */
export const link_3g = defineLink({
  id: '3g',
  name: "3G (UMTS/HSPA)",
  kind: 'rf',
  payloadBytes: { min: 64, typical: 1_200, max: 1_500 },
  bitrateBps: { min: 64_000, typical: 1_000_000, max: 10_000_000 },
  pipe: 'both',
  packetNotes: "IP bearer; fat pipe practical when coverage is good.",
})
