import { defineLink } from '../types.js'

/** sensors catalog technology: `wifi` */
export const wifi = defineLink({
  id: 'wifi',
  name: "Wi-Fi (IEEE 802.11)",
  kind: 'rf',
  payloadBytes: { min: 64, typical: 1_400, max: 2_304 },
  bitrateBps: { min: 1_000_000, typical: 50_000_000, max: 1_200_000_000 },
  pipe: 'both',
  packetNotes: "Ethernet-like MSDU; 1500 B IP typical. Preferred fat pipe for vocab heal next to LoRa thin.",
})
