import { defineLink } from '../types.js'

/**
 * LoRaWAN (LoRa PHY + MAC). Distinct from bare `lora`.
 * sensors catalog technology: `lorawan`
 */
export const lorawan = defineLink({
  id: 'lorawan',
  name: 'LoRaWAN',
  kind: 'rf',
  payloadBytes: { min: 11, typical: 51, max: 222 },
  bitrateBps: { min: 250, typical: 1_100, max: 5_500 },
  pipe: 'thin',
  packetNotes:
    'LoRa PHY + LoRaWAN MAC (FHDR/FPort/MIC). Confirmed FRMPayload by DR/region (often 51 B at DR0). Not bare Meshtastic — use `lora` for that.',
})
