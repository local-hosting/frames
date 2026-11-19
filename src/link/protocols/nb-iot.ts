import { defineLink } from '../types.js'

/** sensors catalog technology: `nb-iot` */
export const nb_iot = defineLink({
  id: 'nb-iot',
  name: "NB-IoT",
  kind: 'rf',
  payloadBytes: { min: 16, typical: 200, max: 1_600 },
  bitrateBps: { min: 1_000, typical: 20_000, max: 250_000 },
  pipe: 'both',
  packetNotes: "3GPP CIoT; IP or Non-IP. Small MTUs common; can carry thin always, short fat packs when linked.",
})
