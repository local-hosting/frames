import { defineLink } from '../types.js'

/** DASH7 Alliance Protocol (D7A) — Sub-GHz active RFID / sensor blast. */
export const dash7 = defineLink({
  id: 'dash7',
  name: 'DASH7',
  kind: 'rf',
  payloadBytes: { min: 8, typical: 64, max: 256 },
  bitrateBps: { min: 9_600, typical: 55_555, max: 166_667 },
  pipe: 'thin',
  packetNotes:
    'ISO 18000-7 lineage; bursty Sub-GHz. Typical app payloads tens of bytes — thin pipe only.',
})
