import { defineLink } from '../types.js'

/** sensors catalog technology: `lte-m` */
export const lte_m = defineLink({
  id: 'lte-m',
  name: "LTE-M (Cat-M1)",
  kind: 'rf',
  payloadBytes: { min: 64, typical: 1_000, max: 1_500 },
  bitrateBps: { min: 10_000, typical: 300_000, max: 1_000_000 },
  pipe: 'both',
  packetNotes: "IP MTU ~1500 when healthy. Suitable for thin frames and occasional fat vocab pulls.",
})
