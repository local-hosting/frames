import { defineLink } from '../types.js'

/** Wi-SUN FAN (802.15.4g) — utility/AMI mesh; not in catalog tech list. */
export const wi_sun = defineLink({
  id: 'wi-sun',
  name: 'Wi-SUN',
  kind: 'rf',
  payloadBytes: { min: 50, typical: 200, max: 2_048 },
  bitrateBps: { min: 50_000, typical: 150_000, max: 300_000 },
  pipe: 'both',
  packetNotes:
    '802.15.4g SUN FSK/OFDM; larger PSDUs than classic 15.4. Thin always; modest fat packs possible.',
})
