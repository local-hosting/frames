import { defineLink } from '../types.js'

/** Wi-Fi HaLow (802.11ah) — long-range Sub-GHz Wi-Fi; not in catalog tech list. */
export const wifi_halow = defineLink({
  id: 'wifi-halow',
  name: 'Wi-Fi HaLow (802.11ah)',
  kind: 'rf',
  payloadBytes: { min: 64, typical: 700, max: 1_500 },
  bitrateBps: { min: 150_000, typical: 4_000_000, max: 86_000_000 },
  pipe: 'both',
  packetNotes:
    'Sub-GHz 802.11ah. Better range than 2.4 GHz Wi-Fi; can fat-heal and carry thin frames.',
})
