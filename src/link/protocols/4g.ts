import { defineLink } from '../types.js'

/** sensors catalog technology: `4g` */
export const link_4g = defineLink({
  id: '4g',
  name: "4G LTE",
  kind: 'rf',
  payloadBytes: { min: 64, typical: 1_400, max: 1_500 },
  bitrateBps: { min: 1_000_000, typical: 20_000_000, max: 150_000_000 },
  pipe: 'both',
  packetNotes: "Standard IP MTU; primary fat-pipe heal path among cellular options.",
})
