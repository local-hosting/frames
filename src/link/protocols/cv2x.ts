import { defineLink } from '../types.js'

/** sensors catalog technology: `cv2x` */
export const cv2x = defineLink({
  id: 'cv2x',
  name: "C-V2X",
  kind: 'rf',
  payloadBytes: { min: 64, typical: 300, max: 1_500 },
  bitrateBps: { min: 1_000_000, typical: 10_000_000, max: 50_000_000 },
  pipe: 'both',
  packetNotes: "PC5/Uu sidelink or network; treat like cellular-class IP for planning.",
})
