import { defineLink } from '../types.js'

/**
 * Generic MSS/LEO IoT satellite (Globalstar, Orbcomm, Swarm, Kinéis, …)
 * beyond Iridium-specific SBD. Use `iridium` for Iridium SBD budgets.
 */
export const satellite_generic = defineLink({
  id: 'satellite',
  name: 'Satellite IoT (generic MSS/LEO)',
  kind: 'rf',
  payloadBytes: { min: 1, typical: 64, max: 340 },
  bitrateBps: { min: 50, typical: 1_200, max: 20_000 },
  pipe: 'thin',
  packetNotes:
    'Catch-all for non-Iridium sat IoT (short messages / store-and-forward). Prefer vendor-specific ids when known. Fat heal via terrestrial backhaul only.',
})
