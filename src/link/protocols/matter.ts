import { defineLink } from '../types.js'

/**
 * Matter (CSA) — application fabric over Thread / Wi-Fi / Ethernet.
 * Not an RF PHY; inherit budgets from the bearer.
 */
export const matter = defineLink({
  id: 'matter',
  name: 'Matter',
  kind: 'app',
  payloadBytes: { min: 0, typical: 0, max: 0 },
  bitrateBps: { min: 0, typical: 0, max: 0 },
  pipe: 'none',
  packetNotes:
    'Application layer over Thread, Wi-Fi, or Ethernet. Call optimizeForLink on the bearer (`thread`, `wifi`, `ethernet`), not Matter itself.',
})
