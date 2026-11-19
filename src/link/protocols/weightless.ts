import { defineLink } from '../types.js'

/** Weightless (N/P/W) — UNB / TV-white-space LPWAN family. */
export const weightless = defineLink({
  id: 'weightless',
  name: 'Weightless',
  kind: 'rf',
  payloadBytes: { min: 1, typical: 48, max: 256 },
  bitrateBps: { min: 100, typical: 2_500, max: 100_000 },
  pipe: 'thin',
  packetNotes:
    'Weightless-N/P/W variants. Small uplinks; plan packed thin frames. Fat heal off-air.',
})
