import { defineLink } from '../types.js'

/** mioty (TS-UNB) — European LPWAN; not in catalog tech list. */
export const mioty = defineLink({
  id: 'mioty',
  name: 'mioty',
  kind: 'rf',
  payloadBytes: { min: 1, typical: 24, max: 245 },
  bitrateBps: { min: 100, typical: 400, max: 2_400 },
  pipe: 'thin',
  packetNotes:
    'Telegram-splitting UNB. Small uplinks; plan like Sigfox/LoRa thin — no fat heal on-air.',
})
