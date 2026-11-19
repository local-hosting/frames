/**
 * Kind of vocabulary row (referent) encoded in a symbol table.
 * Everyday slots only: event/action/place/resource/actor.
 */
export type SymbolKind =
  | 'event'
  | 'action'
  | 'place'
  | 'resource'
  | 'actor'

/** One id ↔ code row. Full table is synced out-of-band; wires carry codes. */
export type SymbolTableEntry = {
  id: string
  code: number
  kind: SymbolKind
}

export type LocalSymbolTablePack = {
  /**
   * On-air / expand tip id. Prefer a content fingerprint (`fp-…`);
   * human semver belongs on {@link VocabSnapshot.label}, not here.
   */
  vocab_base: string
  pack_id?: string
  entries: SymbolTableEntry[]
  /** Optional type hints (not instance labels). */
  type_hints?: Record<string, string>
}

/** One published symbol table (fat-pipe body). Tip id = fingerprint. */
export type VocabSnapshot = {
  lineage: string
  epoch: number
  fingerprint: string
  parent?: string
  entries: SymbolTableEntry[]
  /** Human display version (e.g. 0.3.0) — never the expand lock. */
  label?: string
}

export type VocabMigrationRemap = {
  kind: SymbolKind
  code: number
  /** Omit to tombstone the code. */
  toCode?: number
}

/** Explicit remap between tips (forks / breaking renumbers). */
export type VocabMigration = {
  from: string
  to: string
  remaps: VocabMigrationRemap[]
}

/** Local decode frontier: known tips + active encode tip. */
export type VocabStore = {
  active: string
  byFingerprint: Map<string, VocabSnapshot>
  migrations: VocabMigration[]
}

/** Optional display labels keyed by language code. */
export type LabelMap = Partial<Record<string, string>>

export type LabeledEntry = SymbolTableEntry & {
  labels?: LabelMap
}

export type ExpandFailure =
  | { ok: false; reason: 'vocab_mismatch'; expected: string; actual: string }
  | { ok: false; reason: 'unknown_code'; kind: SymbolKind; code: number }
  | { ok: false; reason: 'unknown_id'; id: string }
  | { ok: false; reason: 'need_heal'; fingerprint: string }

export type ExpandCodesResult =
  | { ok: true; vocab_base: string; kind: SymbolKind; ids: string[] }
  | ExpandFailure

export type CompressIdsResult =
  | { ok: true; vocab_base: string; kind: SymbolKind; codes: number[] }
  | ExpandFailure

/** Decoded compact payload before expansion. */
export type CompactFrame = {
  /** Illocution / frame type id (e.g. intent = 4). See FRAME_ILLOCUTIONS. */
  symbol: number
  vocab_base: string
  codes: Partial<Record<SymbolKind, number[]>>
  fields?: Record<string, string | number>
}

/** Text wire codec (sim / debug envelopes). */
export type WireCodec = {
  readonly name: string
  encode(frame: CompactFrame): string
  decode(wire: string): CompactFrame | null
}

/** Binary on-air codec. */
export type BinaryCodec = {
  readonly name: string
  encodeBytes(frame: CompactFrame): Uint8Array
  decodeBytes(data: Uint8Array): CompactFrame | null
}
