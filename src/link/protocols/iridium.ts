import { defineLink } from '../types.js'

/** sensors catalog technology: `iridium` */
export const iridium = defineLink({
  id: 'iridium',
  name: "Iridium",
  kind: 'rf',
  payloadBytes: { min: 1, typical: 270, max: 340 },
  bitrateBps: { min: 100, typical: 2_400, max: 88_000 },
  pipe: 'thin',
  packetNotes: "SBD messages ~270 B MO / 340 B MT typical. Burst/Certus higher but still not a fat vocab pipe.",
})
