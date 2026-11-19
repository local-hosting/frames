import { defineLink } from '../types.js'

/** sensors catalog technology: `sigfox` */
export const sigfox = defineLink({
  id: 'sigfox',
  name: "Sigfox",
  kind: 'rf',
  payloadBytes: { min: 1, typical: 12, max: 12 },
  bitrateBps: { min: 100, typical: 100, max: 600 },
  pipe: 'thin',
  packetNotes: "Uplink max 12 B payload, 140 msg/day classic. Downlink 8 B. Extremely constrained thin pipe only.",
})
