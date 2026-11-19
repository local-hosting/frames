import { defineLink } from '../types.js'

/** EnOcean — energy-harvesting Sub-GHz; not in catalog tech list. */
export const enocean = defineLink({
  id: 'enocean',
  name: 'EnOcean',
  kind: 'rf',
  payloadBytes: { min: 1, typical: 14, max: 21 },
  bitrateBps: { min: 10_000, typical: 125_000, max: 125_000 },
  pipe: 'thin',
  packetNotes:
    'Very small ERP telegrams (often ≤14–21 B). Thin only; not a vocab heal path.',
})
