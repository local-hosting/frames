import { defineLink } from '../types.js'

/** 6LoWPAN adaptation (usually over 802.15.4) — not a catalog tech slug. */
export const sixlowpan = defineLink({
  id: '6lowpan',
  name: '6LoWPAN',
  kind: 'rf',
  payloadBytes: { min: 40, typical: 80, max: 104 },
  bitrateBps: { min: 20_000, typical: 250_000, max: 250_000 },
  pipe: 'thin',
  packetNotes:
    'IPv6 header compression over 802.15.4-class links. Budget like Zigbee/Thread; fat via border router.',
})
