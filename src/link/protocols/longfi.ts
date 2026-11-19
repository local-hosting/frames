import { defineLink } from '../types.js'

/** sensors catalog technology: `longfi` */
export const longfi = defineLink({
  id: 'longfi',
  name: "LongFi (Helium)",
  kind: 'rf',
  payloadBytes: { min: 11, typical: 51, max: 222 },
  bitrateBps: { min: 250, typical: 1_100, max: 5_500 },
  pipe: 'thin',
  packetNotes: "Helium LongFi over LoRaWAN-class airtime; treat like LoRaWAN for payload budgeting.",
})
