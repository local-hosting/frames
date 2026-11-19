import { describe, expect, it } from 'vitest'
import {
  assertVocabBase,
  compressIds,
  expandCodes,
  labelsForIds,
  resolveCodeById,
  resolveIdByCode,
} from '../src/index.js'
import { sampleTable } from './fixtures.js'

describe('symbol table expand/compress', () => {
  it('roundtrips id ↔ code', () => {
    expect(resolveCodeById(sampleTable, 'P_1')).toBe(20)
    expect(resolveIdByCode(sampleTable, 'place', 20)).toBe('P_1')
  })

  it('expands codes with matching vocab_base', () => {
    const result = expandCodes(sampleTable, 'action', [10, 11], '0.2.0')
    expect(result).toEqual({
      ok: true,
      vocab_base: '0.2.0',
      kind: 'action',
      ids: ['A_1', 'A_2'],
    })
  })

  it('fails closed on vocab_base mismatch', () => {
    const result = expandCodes(sampleTable, 'action', [10], '9.9.9')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('vocab_mismatch')
  })

  it('fails on unknown code', () => {
    const result = expandCodes(sampleTable, 'action', [99])
    expect(result).toEqual({
      ok: false,
      reason: 'unknown_code',
      kind: 'action',
      code: 99,
    })
  })

  it('compresses ids', () => {
    const result = compressIds(sampleTable, 'place', ['P_1'])
    expect(result).toEqual({
      ok: true,
      vocab_base: '0.2.0',
      kind: 'place',
      codes: [20],
    })
  })

  it('assertVocabBase', () => {
    expect(assertVocabBase(sampleTable, '0.2.0')).toBe(true)
    expect(assertVocabBase(sampleTable, '0.1.0')).toBe(false)
  })

  it('labelsForIds picks lang with en fallback', () => {
    const labeled = labelsForIds(
      ['A_1'],
      { A_1: { en: 'First action', fr: 'Première action' } },
      'fr',
    )
    expect(labeled[0]).toEqual({
      id: 'A_1',
      label: 'Première action',
    })
    expect(
      labelsForIds(['A_1'], { A_1: { en: 'First action' } }, 'es')[0].label,
    ).toBe('First action')
  })
})
