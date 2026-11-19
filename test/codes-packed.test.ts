import { describe, expect, it } from 'vitest'
import {
  SYMBOL_ACK,
  SYMBOL_QUERY,
  SYMBOL_READING,
  bindPackedVocabBase,
  bytesToHex,
  codesCodec,
  codesToCompact,
  decodePackedBytes,
  encodePackedBytes,
  expandCompactFrame,
  packedCodec,
} from '../src/core.js'
import { sampleTable } from './fixtures.js'

describe('codes packed binary', () => {
  it('roundtrips reading and is smaller than text envelope', () => {
    const frame = codesToCompact(SYMBOL_READING, '0.2.0', {
      event: [1],
      place: [20],
      resource: [50],
    })
    const packed = encodePackedBytes(frame)
    const text = codesCodec.encode(frame)

    expect(packed.length).toBeLessThan(text.length / 2)
    expect(packed[1]).toBe(SYMBOL_READING)

    const decoded = bindPackedVocabBase(decodePackedBytes(packed)!, '0.2.0')
    expect(decoded?.codes).toEqual(frame.codes)
    expect(decoded?.vocab_base).toBe('0.2.0')
    expect(bytesToHex(packed)).toBe(packedCodec.encode(frame))
  })

  it('roundtrips query / ack with fields', () => {
    const samples = [
      codesToCompact(SYMBOL_QUERY, '0.2.0', {
        place: [20],
        actor: [40],
      }),
      codesToCompact(SYMBOL_ACK, '0.2.0', { action: [10] }, { ok: 1 }),
    ]

    for (const frame of samples) {
      const packed = encodePackedBytes(frame)
      const bound = bindPackedVocabBase(decodePackedBytes(packed)!, '0.2.0')!
      expect(bound.symbol).toBe(frame.symbol)
      expect(bound.codes).toEqual(frame.codes)
      const { vocab_fnv16: _, ...fields } = bound.fields ?? {}
      expect(fields).toEqual(frame.fields ?? {})

      const expanded = expandCompactFrame(sampleTable, bound)
      expect(expanded.ok).toBe(true)
    }
  })

  it('rejects unsupported field names', () => {
    const frame = codesToCompact(
      SYMBOL_ACK,
      '0.2.0',
      { action: [10] },
      { nope: 1 },
    )
    expect(() => encodePackedBytes(frame)).toThrow(/unsupported field/)
  })
})
