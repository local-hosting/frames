import { defineLink } from '../types.js'

/** WiMAX (IEEE 802.16) — legacy WMAN broadband. */
export const wimax = defineLink({
  id: 'wimax',
  name: 'WiMAX',
  kind: 'rf',
  payloadBytes: { min: 64, typical: 1_400, max: 1_500 },
  bitrateBps: { min: 1_000_000, typical: 10_000_000, max: 70_000_000 },
  pipe: 'both',
  packetNotes:
    '802.16 IP-class bearer when available. Prefer as fat heal path; thin frames fine.',
})
