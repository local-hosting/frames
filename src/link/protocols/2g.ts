import { defineLink } from '../types.js'

/** sensors catalog technology: `2g` */
export const link_2g = defineLink({
  id: '2g',
  name: "2G (GSM/GPRS/EDGE)",
  kind: 'rf',
  payloadBytes: { min: 64, typical: 500, max: 1_500 },
  bitrateBps: { min: 8_000, typical: 40_000, max: 200_000 },
  pipe: 'both',
  packetNotes: "GPRS/EDGE IP; latency high. Prefer thin; fat heal only when session is up.",
})
