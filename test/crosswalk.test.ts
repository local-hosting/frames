import { describe, expect, it } from 'vitest'
import {
  buildCrosswalkIndex,
  expandCodes,
  labelPackFromCrosswalk,
  labelsForIds,
  legacyToCode,
  legacyToId,
  mergeCrosswalkIntoTable,
  idToLegacy,
  type CrosswalkEntry,
  type LocalSymbolTablePack,
} from '../src/core.js'

/** Host-supplied sample — wire ships no baked catalog. */
const DEMO_CROSSWALK: CrosswalkEntry[] = [
  {
    legacy_code: 'X1',
    id: 'R_1',
    code: 101,
    kind: 'resource',
    category: 'demo',
    subcategory: 'one',
    labels: { en: 'Resource one' },
  },
  {
    legacy_code: 'X2',
    id: 'R_2',
    code: 102,
    kind: 'resource',
    category: 'demo',
    subcategory: 'two',
    labels: { en: 'Resource two' },
  },
]

describe('crosswalk', () => {
  const index = buildCrosswalkIndex(DEMO_CROSSWALK)

  it('maps legacy ↔ id ↔ code', () => {
    expect(legacyToId(index, 'X1')).toBe('R_1')
    expect(legacyToCode(index, 'x1')).toBe(101)
    expect(idToLegacy(index, 'R_1')).toBe('X1')
  })

  it('merges into symbol table and expands', () => {
    const base: LocalSymbolTablePack = { vocab_base: '0.2.0', entries: [] }
    const table = mergeCrosswalkIntoTable(base, DEMO_CROSSWALK)
    const expanded = expandCodes(table, 'resource', [101], '0.2.0')
    expect(expanded).toEqual({
      ok: true,
      vocab_base: '0.2.0',
      kind: 'resource',
      ids: ['R_1'],
    })
    const labels = labelsForIds(
      ['R_1'],
      labelPackFromCrosswalk(DEMO_CROSSWALK),
      'en',
    )
    expect(labels[0].label).toBe('Resource one')
  })
})
