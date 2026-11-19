import { defineLink } from '../types.js'

/**
 * Bare LoRa PHY (not LoRaWAN).
 * sensors catalog technology: `lora`
 *
 * Use this for Meshtastic-style / raw SX126x frames. For network+MAC use `lorawan`.
 */
export const lora = defineLink({
  id: 'lora',
  name: 'LoRa (PHY, bare)',
  kind: 'rf',
  payloadBytes: { min: 11, typical: 51, max: 242 },
  bitrateBps: { min: 250, typical: 1_100, max: 5_500 },
  pipe: 'thin',
  packetNotes:
    'Bare CSS chirp PHY only — no LoRaWAN MAC. SF12≈51 B useful, SF7≈222–242 B. Meshtastic and custom SX1262 stacks use this id, not `lorawan`.',
})
