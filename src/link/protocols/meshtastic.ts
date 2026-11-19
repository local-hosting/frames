import { defineLink } from '../types.js'

/**
 * Meshtastic mesh (bare LoRa PHY + Meshtastic framing).
 * catalog network slug: `network-meshtastic` / slug `meshtastic`
 */
export const meshtastic = defineLink({
  id: 'meshtastic',
  name: 'Meshtastic',
  kind: 'rf',
  payloadBytes: { min: 8, typical: 200, max: 237 },
  bitrateBps: { min: 250, typical: 1_100, max: 5_500 },
  pipe: 'thin',
  packetNotes:
    'Runs on bare LoRa PHY (`lora`), not LoRaWAN. App payload after Meshtastic header often ~200 B at mid SF; plan packed thin frames only.',
})
