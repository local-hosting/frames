import { defineLink } from '../types.js'

/**
 * Amazon Sidewalk (BLE + Sub-GHz FSK/CSS gateways).
 * catalog network slug: `network-amazon-sidewalk`
 */
export const amazon_sidewalk = defineLink({
  id: 'amazon-sidewalk',
  name: 'Amazon Sidewalk',
  kind: 'rf',
  payloadBytes: { min: 8, typical: 50, max: 255 },
  bitrateBps: { min: 500, typical: 50_000, max: 1_000_000 },
  pipe: 'thin',
  packetNotes:
    'BLE + Sidewalk Sub-GHz hops via neighbor gateways. Small uplinks; treat as thin. Fat heal via the gateway’s Wi-Fi/Ethernet backhaul, not Sidewalk air.',
})
