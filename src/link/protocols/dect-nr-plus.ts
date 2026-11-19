import { defineLink } from '../types.js'

/** DECT NR+ (DECT-2020 NR) — non-cellular 5G-era cordless / IoT mesh. */
export const dect_nr_plus = defineLink({
  id: 'dect-nr-plus',
  name: 'DECT NR+',
  kind: 'rf',
  payloadBytes: { min: 64, typical: 500, max: 1_500 },
  bitrateBps: { min: 100_000, typical: 1_000_000, max: 16_000_000 },
  pipe: 'both',
  packetNotes:
    'ETSI DECT-2020 NR. Local mesh/cordless; larger frames than classic LPWAN. Thin always; short fat packs OK.',
})
