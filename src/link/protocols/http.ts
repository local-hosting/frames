import { defineLink } from '../types.js'

/** sensors catalog technology: `http` */
export const http = defineLink({
  id: 'http',
  name: "HTTP",
  kind: 'app',
  payloadBytes: { min: 0, typical: 0, max: 0 },
  bitrateBps: { min: 0, typical: 0, max: 0 },
  pipe: 'none',
  packetNotes: "Application protocol. Inherit MTU/bitrate from the underlying IP bearer.",
})
