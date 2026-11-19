import { defineLink } from '../types.js'

/** Starlink (SpaceX LEO broadband) — IP over sat, not LPWAN. */
export const starlink = defineLink({
  id: 'starlink',
  name: 'Starlink',
  kind: 'rf',
  payloadBytes: { min: 64, typical: 1_400, max: 1_500 },
  bitrateBps: { min: 10_000_000, typical: 100_000_000, max: 500_000_000 },
  pipe: 'both',
  packetNotes:
    'LEO broadband IP (dish/terminal). High latency vs fiber but fat heal and thin frames both fine. Not a sensor uplink PHY.',
})
