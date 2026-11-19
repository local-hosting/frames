import type { LabelMap, LocalSymbolTablePack, SymbolKind, SymbolTableEntry } from '../types.js'

/** Short token ↔ stable id ↔ uint16 code. */
export type CrosswalkEntry = {
  legacy_code: string
  id: string
  code: number
  kind: SymbolKind
  category?: string
  subcategory?: string
  labels?: LabelMap
}

export type CrosswalkIndex = {
  byLegacy: Map<string, CrosswalkEntry>
  byId: Map<string, CrosswalkEntry>
  byCode: Map<string, CrosswalkEntry>
  entries: CrosswalkEntry[]
}

function codeKey(kind: SymbolKind, code: number): string {
  return `${kind}:${code}`
}

export function buildCrosswalkIndex(entries: CrosswalkEntry[]): CrosswalkIndex {
  const byLegacy = new Map<string, CrosswalkEntry>()
  const byId = new Map<string, CrosswalkEntry>()
  const byCode = new Map<string, CrosswalkEntry>()
  for (const e of entries) {
    byLegacy.set(e.legacy_code.toUpperCase(), e)
    byId.set(e.id, e)
    byCode.set(codeKey(e.kind, e.code), e)
  }
  return { byLegacy, byId, byCode, entries }
}

export function legacyToId(
  index: CrosswalkIndex,
  legacy_code: string,
): string | undefined {
  return index.byLegacy.get(legacy_code.toUpperCase())?.id
}

export function idToLegacy(
  index: CrosswalkIndex,
  id: string,
): string | undefined {
  return index.byId.get(id)?.legacy_code
}

export function legacyToCode(
  index: CrosswalkIndex,
  legacy_code: string,
): number | undefined {
  return index.byLegacy.get(legacy_code.toUpperCase())?.code
}

export function codeToLegacy(
  index: CrosswalkIndex,
  kind: SymbolKind,
  code: number,
): string | undefined {
  return index.byCode.get(codeKey(kind, code))?.legacy_code
}

/** Merge crosswalk rows into a symbol table (skips duplicate ids). */
export function mergeCrosswalkIntoTable(
  table: LocalSymbolTablePack,
  entries: CrosswalkEntry[],
): LocalSymbolTablePack {
  const seen = new Set(table.entries.map((e) => e.id))
  const added: SymbolTableEntry[] = []
  for (const e of entries) {
    if (seen.has(e.id)) continue
    seen.add(e.id)
    added.push({ id: e.id, code: e.code, kind: e.kind })
  }
  return {
    ...table,
    entries: [...table.entries, ...added],
  }
}

/** Label pack keyed by id for `labelsForIds`. */
export function labelPackFromCrosswalk(
  entries: CrosswalkEntry[],
): Record<string, LabelMap> {
  const out: Record<string, LabelMap> = {}
  for (const e of entries) {
    if (e.labels) out[e.id] = e.labels
  }
  return out
}
