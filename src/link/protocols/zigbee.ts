import { defineLink } from '../types.js'

/** sensors catalog technology: `zigbee` */
export const zigbee = defineLink({
  id: 'zigbee',
  name: "Zigbee",
  kind: 'rf',
  payloadBytes: { min: 40, typical: 80, max: 104 },
  bitrateBps: { min: 20_000, typical: 250_000, max: 250_000 },
  pipe: 'thin',
  packetNotes: "Built on 802.15.4 (127 B PSDU). APS payload often ~80 B after NWK/APS headers.",
})
