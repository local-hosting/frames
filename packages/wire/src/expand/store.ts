import type {
  CompactFrame,
  ExpandFailure,
  LocalSymbolTablePack,
  SymbolKind,
  SymbolTableEntry,
  VocabMigration,
  VocabSnapshot,
  VocabStore,
} from '../types.js'
import { assertAppendOnly } from './append-only.js'
import { compressIds, expandCodes, type ExpandCompactResult } from './expand.js'
import {
  assertFingerprintMatches,
  fingerprintEntries,
} from './fingerprint.js'
import { resolveIdByCode } from './table.js'

export type ExpandWithStoreResult =
  | (Extract<ExpandCompactResult, { ok: true }> & {
      resolvedVia: string
    })
  | ExpandFailure

export type AddSnapshotOptions = {
  /**
   * When snapshot.parent is set and that tip is in the store, require
   * append-only codes vs the parent. Default true.
   */
  checkAppendOnly?: boolean
  /** Verify fingerprint ≡ entries. Default true. */
  checkFingerprint?: boolean
}

export function createVocabSnapshot(opts: {
  lineage: string
  epoch: number
  entries: SymbolTableEntry[]
  parent?: string
  label?: string
  /** If set, must match fingerprintEntries(entries). */
  fingerprint?: string
}): VocabSnapshot {
  const fingerprint = fingerprintEntries(opts.entries)
  if (opts.fingerprint !== undefined && opts.fingerprint !== fingerprint) {
    throw new Error(
      `vocab fingerprint mismatch: got ${opts.fingerprint}, expected ${fingerprint}`,
    )
  }
  return {
    lineage: opts.lineage,
    epoch: opts.epoch,
    fingerprint,
    parent: opts.parent,
    entries: opts.entries,
    label: opts.label,
  }
}

/** View one snapshot as a legacy single-table pack (vocab_base = tip). */
export function snapshotToTable(snapshot: VocabSnapshot): LocalSymbolTablePack {
  return {
    vocab_base: snapshot.fingerprint,
    pack_id: snapshot.lineage,
    entries: snapshot.entries,
  }
}

function ingestSnapshot(
  snapshot: VocabSnapshot,
  opts: AddSnapshotOptions,
  parentEntries?: SymbolTableEntry[],
): void {
  if (opts.checkFingerprint !== false) {
    assertFingerprintMatches(snapshot)
  }
  if (
    opts.checkAppendOnly !== false &&
    parentEntries &&
    snapshot.parent
  ) {
    assertAppendOnly(parentEntries, snapshot.entries)
  }
}

export function createVocabStore(
  active: VocabSnapshot,
  extras: VocabSnapshot[] = [],
  migrations: VocabMigration[] = [],
  opts: AddSnapshotOptions = {},
): VocabStore {
  ingestSnapshot(active, opts)
  const byFingerprint = new Map<string, VocabSnapshot>()
  byFingerprint.set(active.fingerprint, active)
  for (const snap of extras) {
    const parent = snap.parent
      ? byFingerprint.get(snap.parent) ??
        (snap.parent === active.fingerprint ? active : undefined)
      : undefined
    // Parent may appear later in extras — second pass below
    byFingerprint.set(snap.fingerprint, snap)
    void parent
  }
  // Validate extras once all tips are present
  for (const snap of extras) {
    const parentEntries = snap.parent
      ? byFingerprint.get(snap.parent)?.entries
      : undefined
    ingestSnapshot(snap, opts, parentEntries)
  }
  return {
    active: active.fingerprint,
    byFingerprint,
    migrations: [...migrations],
  }
}

export function addSnapshot(
  store: VocabStore,
  snapshot: VocabSnapshot,
  opts: AddSnapshotOptions = {},
): VocabStore {
  const parentEntries = snapshot.parent
    ? store.byFingerprint.get(snapshot.parent)?.entries
    : undefined
  if (
    opts.checkAppendOnly !== false &&
    snapshot.parent &&
    !parentEntries
  ) {
    throw new Error(
      `vocab store: parent tip ${snapshot.parent} not in frontier`,
    )
  }
  ingestSnapshot(snapshot, opts, parentEntries)
  const byFingerprint = new Map(store.byFingerprint)
  byFingerprint.set(snapshot.fingerprint, snapshot)
  return { ...store, byFingerprint }
}

/**
 * Publish a new tip onto the frontier (append-only vs parent when provided),
 * optionally making it the active encode tip.
 */
export function publishSnapshot(
  store: VocabStore,
  opts: {
    lineage: string
    epoch: number
    entries: SymbolTableEntry[]
    parent?: string
    label?: string
    setActive?: boolean
  },
): VocabStore {
  const parent = opts.parent ?? store.active
  const snapshot = createVocabSnapshot({
    lineage: opts.lineage,
    epoch: opts.epoch,
    entries: opts.entries,
    parent,
    label: opts.label,
  })
  let next = addSnapshot(store, snapshot)
  if (opts.setActive !== false) {
    next = setActive(next, snapshot.fingerprint)
  }
  return next
}

/** Publish a new tip by appending rows to the parent snapshot (default: active). */
export function publishAppend(
  store: VocabStore,
  opts: {
    lineage: string
    epoch: number
    add: SymbolTableEntry[]
    parent?: string
    label?: string
    setActive?: boolean
  },
): VocabStore {
  const parentTip = opts.parent ?? store.active
  const parentSnap = store.byFingerprint.get(parentTip)
  if (!parentSnap) {
    throw new Error(`vocab store: parent tip ${parentTip} not in frontier`)
  }
  return publishSnapshot(store, {
    lineage: opts.lineage,
    epoch: opts.epoch,
    entries: [...parentSnap.entries, ...opts.add],
    parent: parentTip,
    label: opts.label,
    setActive: opts.setActive,
  })
}

export function setActive(store: VocabStore, fingerprint: string): VocabStore {
  if (!store.byFingerprint.has(fingerprint)) {
    throw new Error(`vocab store: unknown tip ${fingerprint}`)
  }
  return { ...store, active: fingerprint }
}

function remapCodes(
  codes: Partial<Record<SymbolKind, number[]>>,
  remaps: VocabMigration['remaps'],
): Partial<Record<SymbolKind, number[]>> | null {
  const byKey = new Map(
    remaps.map((r) => [`${r.kind}:${r.code}`, r] as const),
  )
  const out: Partial<Record<SymbolKind, number[]>> = {}
  for (const [kind, list] of Object.entries(codes) as Array<
    [SymbolKind, number[] | undefined]
  >) {
    if (!list?.length) continue
    const next: number[] = []
    for (const code of list) {
      const hit = byKey.get(`${kind}:${code}`)
      if (!hit) {
        next.push(code)
        continue
      }
      if (hit.toCode === undefined) return null
      next.push(hit.toCode)
    }
    out[kind] = next
  }
  return out
}

function collectUnknown(
  snapshot: VocabSnapshot,
  codes: Partial<Record<SymbolKind, number[]>>,
): Array<{ kind: SymbolKind; code: number }> {
  const table = snapshotToTable(snapshot)
  const unknown: Array<{ kind: SymbolKind; code: number }> = []
  for (const kind of Object.keys(codes) as SymbolKind[]) {
    const list = codes[kind]
    if (!list?.length) continue
    for (const code of list) {
      if (resolveIdByCode(table, kind, code) === undefined) {
        unknown.push({ kind, code })
      }
    }
  }
  return unknown
}

function tryExpandOnSnapshot(
  snapshot: VocabSnapshot,
  frame: CompactFrame,
  codes: Partial<Record<SymbolKind, number[]>>,
): ExpandWithStoreResult {
  const table = snapshotToTable(snapshot)
  const ids: Partial<Record<SymbolKind, string[]>> = {}
  for (const kind of Object.keys(codes) as SymbolKind[]) {
    const list = codes[kind]
    if (!list?.length) continue
    const result = expandCodes(table, kind, list)
    if (!result.ok) return result
    ids[kind] = result.ids
  }
  return {
    ok: true,
    vocab_base: snapshot.fingerprint,
    symbol: frame.symbol,
    ids,
    fields: frame.fields,
    resolvedVia: snapshot.fingerprint,
  }
}

function codesResolvable(
  snapshot: VocabSnapshot,
  codes: Partial<Record<SymbolKind, number[]>>,
): boolean {
  return collectUnknown(snapshot, codes).length === 0
}

/**
 * Expand a thin frame against the local tip frontier.
 * Exact tip → same-lineage superset → migrations → need_heal.
 */
export function expandWithStore(
  store: VocabStore,
  frame: CompactFrame,
): ExpandWithStoreResult {
  const tip = frame.vocab_base
  const exact = store.byFingerprint.get(tip)
  if (exact) {
    return tryExpandOnSnapshot(exact, frame, frame.codes)
  }

  const active = store.byFingerprint.get(store.active)
  if (active && codesResolvable(active, frame.codes)) {
    const result = tryExpandOnSnapshot(active, frame, frame.codes)
    if (result.ok) {
      return { ...result, resolvedVia: active.fingerprint }
    }
  }

  for (const snap of store.byFingerprint.values()) {
    if (snap.fingerprint === store.active) continue
    if (active && snap.lineage !== active.lineage) continue
    if (!codesResolvable(snap, frame.codes)) continue
    const result = tryExpandOnSnapshot(snap, frame, frame.codes)
    if (result.ok) return result
  }

  for (const migration of store.migrations) {
    if (migration.from !== tip) continue
    const target = store.byFingerprint.get(migration.to)
    if (!target) continue
    const remapped = remapCodes(frame.codes, migration.remaps)
    if (!remapped) {
      return { ok: false, reason: 'need_heal', fingerprint: tip }
    }
    const result = tryExpandOnSnapshot(target, frame, remapped)
    if (result.ok) return result
  }

  return { ok: false, reason: 'need_heal', fingerprint: tip }
}

/** Compress ids using the store's active tip. */
export function compressWithStore(
  store: VocabStore,
  kind: SymbolKind,
  ids: string[],
) {
  const active = store.byFingerprint.get(store.active)
  if (!active) {
    return {
      ok: false as const,
      reason: 'need_heal' as const,
      fingerprint: store.active,
    }
  }
  return compressIds(snapshotToTable(active), kind, ids)
}
