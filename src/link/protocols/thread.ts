import { defineLink } from '../types.js'

/** Thread (802.15.4 mesh) — missing from sensors catalog tech list; common for Matter border routers. */
export const thread = defineLink({
  id: 'thread',
  name: 'Thread',
  kind: 'rf',
  payloadBytes: { min: 40, typical: 80, max: 104 },
  bitrateBps: { min: 20_000, typical: 250_000, max: 250_000 },
  pipe: 'thin',
  packetNotes:
    'IPv6 over 802.15.4. MSDU budgets like Zigbee (~80 B typical). Fat heal via Thread border router Ethernet/Wi-Fi.',
})
