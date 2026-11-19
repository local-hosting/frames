import { describe, expect, it } from 'vitest'
import {
  SYMBOL_ACK,
  SYMBOL_READING,
  bindPackedVocabBase,
  codesToCompact,
  createWireSystem,
  decodePackedBytes,
  encodePackedBytes,
  listPackedCodecs,
  listPackedFields,
  listTextCodecs,
  registerPackedField,
  resolvePackedFieldId,
} from '../src/index.js'
import { sampleTable } from './fixtures.js'

describe('wire registries + system', () => {
  it('bootstraps default packed and text codecs', () => {
    const packed = listPackedCodecs()
    expect(packed.some((c) => c.symbol === 4 && c.name === 'intent-packed-v1')).toBe(
      true,
    )
    expect(packed.some((c) => c.symbol === 'fallback')).toBe(true)
    expect(listTextCodecs().map((c) => c.name)).toEqual(
      expect.arrayContaining([
        'intent-symbol-envelope',
        'codes-symbol-envelope',
      ]),
    )
  })

  it('registers append-only packed fields', () => {
    registerPackedField('score', 10)
    expect(resolvePackedFieldId('score')).toBe(10)
    expect(listPackedFields().some((f) => f.name === 'score' && f.id === 10)).toBe(
      true,
    )

    const frame = codesToCompact(
      SYMBOL_ACK,
      '0.2.0',
      { action: [10] },
      { score: 9 },
    )
    const packed = encodePackedBytes(frame)
    const bound = bindPackedVocabBase(decodePackedBytes(packed)!, '0.2.0')!
    expect(bound.fields?.score).toBe(9)

    expect(() => registerPackedField('score', 11)).toThrow(/already bound/)
    expect(() => registerPackedField('other', 10)).toThrow(/already bound/)
  })

  it('createWireSystem packs and expands', () => {
    const sys = createWireSystem(sampleTable)
    const frame = codesToCompact(SYMBOL_READING, sampleTable.vocab_base, {
      event: [1],
      place: [20],
    })
    const bytes = sys.encodePacked(frame)
    const bound = sys.decodePackedBound(bytes)!
    const expanded = sys.expand(bound)
    expect(expanded.ok).toBe(true)
    if (expanded.ok) {
      expect(expanded.ids.event).toEqual(['E_1'])
      expect(expanded.ids.place).toEqual(['P_1'])
    }
  })
})
