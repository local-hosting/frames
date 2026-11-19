import { defineLink } from '../types.js'

/** sensors catalog technology: `ieee-802-15-4` */
export const ieee_802_15_4 = defineLink({
  id: 'ieee-802-15-4',
  name: "IEEE 802.15.4",
  kind: 'rf',
  payloadBytes: { min: 50, typical: 90, max: 116 },
  bitrateBps: { min: 20_000, typical: 250_000, max: 250_000 },
  pipe: 'thin',
  packetNotes: "Max PSDU 127 B; PHY/MAC headers leave ~90–116 B MSDU. Thread/Zigbee sit on top.",
})
