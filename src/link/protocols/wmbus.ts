import { defineLink } from '../types.js'

/** Wireless M-Bus (EN 13757) — metering; not in catalog tech list. */
export const wmbus = defineLink({
  id: 'wmbus',
  name: 'Wireless M-Bus',
  kind: 'rf',
  payloadBytes: { min: 10, typical: 50, max: 255 },
  bitrateBps: { min: 4_800, typical: 32_768, max: 100_000 },
  pipe: 'thin',
  packetNotes:
    'OMS/wM-Bus modes (T/C/S…). Compact meter frames; treat as thin pipe.',
})
