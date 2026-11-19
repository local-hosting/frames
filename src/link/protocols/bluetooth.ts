import { defineLink } from '../types.js'

/** sensors catalog technology: `bluetooth` */
export const bluetooth = defineLink({
  id: 'bluetooth',
  name: "Bluetooth / BLE",
  kind: 'rf',
  payloadBytes: { min: 20, typical: 180, max: 512 },
  bitrateBps: { min: 125_000, typical: 1_000_000, max: 2_000_000 },
  pipe: 'both',
  packetNotes: "ADV payload 31 B (ext ADV larger). Connected ATT default 23 B, negotiable MTU often 185–512. Short-range fat possible.",
})
