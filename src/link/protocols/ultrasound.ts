import { defineLink } from '../types.js'

/** sensors catalog technology: `ultrasound` */
export const ultrasound = defineLink({
  id: 'ultrasound',
  name: "Ultrasound",
  kind: 'sensor',
  payloadBytes: { min: 1, typical: 4, max: 32 },
  bitrateBps: { min: 0, typical: 100, max: 1_000 },
  pipe: 'none',
  packetNotes: "Ranging/presence sensing, not a digital packet pipe for wire frames.",
})
