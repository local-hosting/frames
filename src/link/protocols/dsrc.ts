import { defineLink } from '../types.js'

/** sensors catalog technology: `dsrc` */
export const dsrc = defineLink({
  id: 'dsrc',
  name: "DSRC (802.11p)",
  kind: 'rf',
  payloadBytes: { min: 64, typical: 500, max: 2_304 },
  bitrateBps: { min: 3_000_000, typical: 6_000_000, max: 27_000_000 },
  pipe: 'both',
  packetNotes: "WAVE/DSRC short-range vehicular; large frames possible but sessions are brief.",
})
