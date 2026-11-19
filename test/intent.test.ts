import { describe, expect, it } from 'vitest'
import {
  intentCodec,
  intentToCompact,
  compactToIntent,
  expandCodes,
  SYMBOL_INTENT,
} from '../src/core.js'
import { sampleTable } from './fixtures.js'

describe('intent codec', () => {
  it('roundtrips wire ↔ CompactFrame ↔ body', () => {
    const compact = intentToCompact('0.2.0', {
      event_code: 1,
      band: 3,
      actor_codes: [40],
      action_codes: [10, 11],
      place_codes: [20],
    })
    expect(compact.symbol).toBe(SYMBOL_INTENT)

    const wire = intentCodec.encode(compact)
    const decoded = intentCodec.decode(wire)
    expect(decoded).toEqual(compact)

    const body = compactToIntent(decoded!)
    expect(body).toEqual({
      vocab_base: '0.2.0',
      event_code: 1,
      band: 3,
      actor_codes: [40],
      action_codes: [10, 11],
      place_codes: [20],
    })
  })

  it('expands decoded action codes via symbol table', () => {
    const wire = intentCodec.encode(
      intentToCompact('0.2.0', {
        event_code: 1,
        band: 2,
        actor_codes: [40],
        action_codes: [10],
        place_codes: [],
      }),
    )
    const frame = intentCodec.decode(wire)!
    const actions = expandCodes(
      sampleTable,
      'action',
      frame.codes.action ?? [],
      frame.vocab_base,
    )
    expect(actions).toEqual({
      ok: true,
      vocab_base: '0.2.0',
      kind: 'action',
      ids: ['A_1'],
    })
  })

  it('returns null for other symbols', () => {
    expect(intentCodec.decode('0:0.2.0:00')).toBeNull()
  })
})
