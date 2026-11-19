import { defineLink } from '../types.js'

/** sensors catalog technology: `mqtt` */
export const mqtt = defineLink({
  id: 'mqtt',
  name: "MQTT",
  kind: 'app',
  payloadBytes: { min: 0, typical: 0, max: 268_435_455 },
  bitrateBps: { min: 0, typical: 0, max: 0 },
  pipe: 'none',
  packetNotes: "Application protocol over TCP/TLS (or QUIC). Inherit limits from the bearer (Wi-Fi, LTE, …).",
})
