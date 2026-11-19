import { defineLink } from '../types.js'

/** sensors catalog technology: `nfc` */
export const nfc = defineLink({
  id: 'nfc',
  name: "NFC",
  kind: 'rf',
  payloadBytes: { min: 16, typical: 128, max: 8_192 },
  bitrateBps: { min: 106_000, typical: 424_000, max: 848_000 },
  pipe: 'both',
  packetNotes: "ISO 14443/15693; touch-range. Can shove a fat pack in one tap; not mesh.",
})
