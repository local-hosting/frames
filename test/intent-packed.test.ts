import { describe, expect, it } from 'vitest'
import {
  intentPackedCodec,
  intentToCompact,
  bindPackedVocabBase,
  bytesToHex,
  encodeIntentPackedBytes,
  expandCodes,
  intentCodec,
} from '../src/core.js'
import { sampleTable } from './fixtures.js'

describe('intent packed binary', () => {
  it('roundtrips and is smaller than text envelope', () => {
    const compact = intentToCompact('0.2.0', {
      event_code: 1,
      band: 3,
      actor_codes: [40],
      action_codes: [10, 11],
      place_codes: [20],
    })

    const packed = encodeIntentPackedBytes(compact)
    const textWire = intentCodec.encode(compact)

    expect(packed.length).toBe(16)
    expect(packed.length * 2).toBeLessThan(textWire.length)

    const decoded = intentPackedCodec.decodeBytes(packed)!
    const bound = bindPackedVocabBase(decoded, '0.2.0')
    expect(bound?.vocab_base).toBe('0.2.0')
    expect(bound?.fields?.band).toBe(3)

    const actions = expandCodes(
      sampleTable,
      'action',
      bound!.codes.action ?? [],
      bound!.vocab_base,
    )
    expect(actions).toEqual({
      ok: true,
      vocab_base: '0.2.0',
      kind: 'action',
      ids: ['A_1', 'A_2'],
    })

    expect(bytesToHex(packed)).toBe(intentPackedCodec.encode(compact))
  })

  it('rejects vocab fingerprint mismatch', () => {
    const compact = intentToCompact('0.2.0', {
      event_code: 1,
      band: 2,
      actor_codes: [],
      action_codes: [10],
      place_codes: [],
    })
    const decoded = intentPackedCodec.decodeBytes(
      encodeIntentPackedBytes(compact),
    )!
    expect(bindPackedVocabBase(decoded, '9.9.9')).toBeNull()
  })
})
