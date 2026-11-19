import { describe, expect, it } from 'vitest'
import {
  SYMBOL_READING,
  addSnapshot,
  buildCrosswalkIndex,
  codesToCompact,
  createVocabSnapshot,
  createVocabStore,
  expandWithStore,
  fingerprintEntries,
  legacyToCode,
  legacyToId,
  publishAppend,
  publishSnapshot,
  type CrosswalkEntry,
  type SymbolTableEntry,
} from '../src/core.js'

const baseEntries: SymbolTableEntry[] = [
  { id: 'E_1', code: 1, kind: 'event' },
  { id: 'A_1', code: 10, kind: 'action' },
  { id: 'P_1', code: 20, kind: 'place' },
]

/** Everyday: tip fingerprint + expand when peers share a healthy frontier. */
describe('everyday vocab / expand', () => {
  it('fingerprints change when entries mutate', () => {
    const a = fingerprintEntries(baseEntries)
    const b = fingerprintEntries([
      ...baseEntries,
      { id: 'A_2', code: 11, kind: 'action' },
    ])
    expect(a).toMatch(/^fp-[0-9a-f]{16}$/)
    expect(a).not.toBe(b)
  })

  it('expands older tip codes via newer same-lineage superset', () => {
    const v1 = createVocabSnapshot({
      lineage: 'community:demo',
      epoch: 1,
      entries: baseEntries,
      label: '0.2.0',
    })
    const v2 = createVocabSnapshot({
      lineage: 'community:demo',
      epoch: 2,
      parent: v1.fingerprint,
      entries: [
        ...baseEntries,
        { id: 'A_2', code: 11, kind: 'action' },
      ],
      label: '0.3.0',
    })
    const store = createVocabStore(v2, [v1])
    const frame = codesToCompact(SYMBOL_READING, v1.fingerprint, {
      event: [1],
      place: [20],
    })
    // Drop v1 from frontier — only v2 active
    const slim = createVocabStore(v2)
    const expanded = expandWithStore(slim, frame)
    expect(expanded).toMatchObject({
      ok: true,
      resolvedVia: v2.fingerprint,
      ids: { event: ['E_1'], place: ['P_1'] },
    })
    expect(store.active).toBe(v2.fingerprint)
  })

  it('superset-decodes unknown tip when all codes resolve on active', () => {
    const v1 = createVocabSnapshot({
      lineage: 'community:demo',
      epoch: 1,
      entries: baseEntries,
    })
    const store = createVocabStore(v1)
    const frame = codesToCompact(SYMBOL_READING, 'fp-badf00d', {
      event: [1],
    })
    expect(expandWithStore(store, frame)).toMatchObject({
      ok: true,
      resolvedVia: v1.fingerprint,
      ids: { event: ['E_1'] },
    })
  })
})

/**
 * Resilience: bad tips, append-only violations, heal / migration —
 * thin messages must not soft-match the wrong vocab.
 */
describe('resilience vocab / heal', () => {
  it('returns need_heal when tip unknown and codes do not resolve', () => {
    const v1 = createVocabSnapshot({
      lineage: 'community:demo',
      epoch: 1,
      entries: baseEntries,
    })
    const store = createVocabStore(v1)
    const frame = codesToCompact(SYMBOL_READING, 'fp-badf00d', {
      event: [999],
    })
    expect(expandWithStore(store, frame)).toEqual({
      ok: false,
      reason: 'need_heal',
      fingerprint: 'fp-badf00d',
    })
  })

  it('applies migration remaps between tips', () => {
    const from = createVocabSnapshot({
      lineage: 'fork:a',
      epoch: 1,
      entries: [{ id: 'R_OLD', code: 50, kind: 'resource' }],
    })
    const to = createVocabSnapshot({
      lineage: 'fork:b',
      epoch: 1,
      entries: [{ id: 'R_NEW', code: 60, kind: 'resource' }],
    })
    const store = addSnapshot(
      createVocabStore(to, [], [
        {
          from: from.fingerprint,
          to: to.fingerprint,
          remaps: [{ kind: 'resource', code: 50, toCode: 60 }],
        },
      ]),
      from,
    )
    const migrateOnly = createVocabStore(to, [], [
      {
        from: from.fingerprint,
        to: to.fingerprint,
        remaps: [{ kind: 'resource', code: 50, toCode: 60 }],
      },
    ])
    const frame = codesToCompact(SYMBOL_READING, from.fingerprint, {
      resource: [50],
    })
    expect(expandWithStore(migrateOnly, frame)).toMatchObject({
      ok: true,
      ids: { resource: ['R_NEW'] },
      resolvedVia: to.fingerprint,
    })
    expect(store.byFingerprint.has(from.fingerprint)).toBe(true)
  })

  it('tombstone remap yields need_heal', () => {
    const fromFp = 'fp-from0001'
    const to = createVocabSnapshot({
      lineage: 'fork:b',
      epoch: 1,
      entries: [{ id: 'R_NEW', code: 60, kind: 'resource' }],
    })
    const store = createVocabStore(to, [], [
      {
        from: fromFp,
        to: to.fingerprint,
        remaps: [{ kind: 'resource', code: 50 }],
      },
    ])
    const frame = codesToCompact(SYMBOL_READING, fromFp, { resource: [50] })
    expect(expandWithStore(store, frame)).toEqual({
      ok: false,
      reason: 'need_heal',
      fingerprint: fromFp,
    })
  })

  it('rejects wrong fingerprint on create', () => {
    expect(() =>
      createVocabSnapshot({
        lineage: 'community:demo',
        epoch: 1,
        entries: baseEntries,
        fingerprint: 'fp-badf00dbadf00d',
      }),
    ).toThrow(/fingerprint mismatch/)
  })

  it('rejects code remaps on publish (append-only)', () => {
    const v1 = createVocabSnapshot({
      lineage: 'community:demo',
      epoch: 1,
      entries: baseEntries,
    })
    const store = createVocabStore(v1)
    expect(() =>
      publishSnapshot(store, {
        lineage: 'community:demo',
        epoch: 2,
        entries: [
          { id: 'E_OTHER', code: 1, kind: 'event' },
          { id: 'A_1', code: 10, kind: 'action' },
          { id: 'P_1', code: 20, kind: 'place' },
        ],
      }),
    ).toThrow(/append-only/)
  })

  it('publishSnapshot appends codes and activates tip', () => {
    const v1 = createVocabSnapshot({
      lineage: 'community:demo',
      epoch: 1,
      entries: baseEntries,
    })
    const next = publishSnapshot(createVocabStore(v1), {
      lineage: 'community:demo',
      epoch: 2,
      entries: [...baseEntries, { id: 'A_2', code: 11, kind: 'action' }],
      label: '0.3.0',
    })
    expect(next.active).not.toBe(v1.fingerprint)
    expect(next.byFingerprint.get(next.active)?.parent).toBe(v1.fingerprint)
  })

  it('publishAppend grows tip from parent and sets parent link', () => {
    const v1 = createVocabSnapshot({
      lineage: 'community:demo',
      epoch: 1,
      entries: baseEntries,
    })
    const store = createVocabStore(v1)
    const next = publishAppend(store, {
      lineage: 'community:demo',
      epoch: 2,
      add: [{ id: 'A_2', code: 11, kind: 'action' }],
      label: '0.3.0',
    })
    expect(next.active).not.toBe(v1.fingerprint)
    expect(next.byFingerprint.get(next.active)?.parent).toBe(v1.fingerprint)
    expect(next.byFingerprint.get(next.active)?.entries).toHaveLength(
      baseEntries.length + 1,
    )
  })

  it('publishAppend rejects reused (kind, code)', () => {
    const store = createVocabStore(
      createVocabSnapshot({
        lineage: 'community:demo',
        epoch: 1,
        entries: baseEntries,
      }),
    )
    expect(() =>
      publishAppend(store, {
        lineage: 'community:demo',
        epoch: 2,
        add: [{ id: 'E_OTHER', code: 1, kind: 'event' }],
      }),
    ).toThrow(/append-only/)
  })
})

describe('legacy crosswalk', () => {
  const LEGACY: CrosswalkEntry[] = [
    {
      legacy_code: 'WBT',
      id: 'R_water_bottle',
      code: 101,
      kind: 'resource',
      category: 'water',
      subcategory: 'bottle',
      labels: { en: 'water (bottle)' },
    },
    {
      legacy_code: 'DBL',
      id: 'R_donations_blanket',
      code: 102,
      kind: 'resource',
      category: 'donations',
      subcategory: 'blanket',
      labels: { en: 'donations (blanket)' },
    },
  ]

  it('maps short tokens ↔ id ↔ code', () => {
    const index = buildCrosswalkIndex(LEGACY)
    expect(legacyToId(index, 'WBT')).toBe('R_water_bottle')
    expect(legacyToCode(index, 'dbl')).toBe(102)
  })
})
