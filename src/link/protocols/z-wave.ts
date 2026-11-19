import { defineLink } from '../types.js'

/** Z-Wave / Z-Wave Long Range — not in sensors catalog techById yet. */
export const z_wave = defineLink({
  id: 'z-wave',
  name: 'Z-Wave',
  kind: 'rf',
  payloadBytes: { min: 8, typical: 48, max: 64 },
  bitrateBps: { min: 9_600, typical: 40_000, max: 100_000 },
  pipe: 'thin',
  packetNotes:
    'Sub-GHz mesh; classic frames small. Z-Wave LR larger range still thin-pipe class for wire frames.',
})
