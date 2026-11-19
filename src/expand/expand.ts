import { assertVocabBase, resolveCodeById, resolveIdByCode } from './table.js'
import type {
  CompactFrame,
  CompressIdsResult,
  ExpandCodesResult,
  ExpandFailure,
  LabelMap,
  LocalSymbolTablePack,
  SymbolKind,
} from '../types.js'

export type ExpandCompactResult =
  | {
      ok: true
      vocab_base: string
      symbol: number
      ids: Partial<Record<SymbolKind, string[]>>
      fields?: Record<string, string | number>
    }
  | ExpandFailure

export function expandCodes(
  table: LocalSymbolTablePack,
  kind: SymbolKind,
  codes: number[],
  vocab_base?: string,
): ExpandCodesResult {
  if (vocab_base !== undefined && !assertVocabBase(table, vocab_base)) {
    return {
      ok: false,
      reason: 'vocab_mismatch',
      expected: table.vocab_base,
      actual: vocab_base,
    }
  }
  const ids: string[] = []
  for (const code of codes) {
    const id = resolveIdByCode(table, kind, code)
    if (id === undefined) {
      return { ok: false, reason: 'unknown_code', kind, code }
    }
    ids.push(id)
  }
  return { ok: true, vocab_base: table.vocab_base, kind, ids }
}

export function compressIds(
  table: LocalSymbolTablePack,
  kind: SymbolKind,
  ids: string[],
  vocab_base?: string,
): CompressIdsResult {
  if (vocab_base !== undefined && !assertVocabBase(table, vocab_base)) {
    return {
      ok: false,
      reason: 'vocab_mismatch',
      expected: table.vocab_base,
      actual: vocab_base,
    }
  }
  const codes: number[] = []
  for (const id of ids) {
    const entry = table.entries.find((e) => e.id === id)
    if (!entry) return { ok: false, reason: 'unknown_id', id }
    if (entry.kind !== kind) return { ok: false, reason: 'unknown_id', id }
    codes.push(entry.code)
  }
  return { ok: true, vocab_base: table.vocab_base, kind, codes }
}

/** Resolve display strings after expand (from a separate label map). */
export function labelsForIds(
  ids: string[],
  labelPack: Record<string, LabelMap>,
  lang: string,
  fallbackLang = 'en',
): Array<{ id: string; label: string | undefined }> {
  return ids.map((id) => {
    const labels = labelPack[id]
    const label = labels?.[lang] ?? labels?.[fallbackLang]
    return { id, label }
  })
}

/** Convenience: compress a single id (any kind). */
export function compressId(
  table: LocalSymbolTablePack,
  id: string,
): number | undefined {
  return resolveCodeById(table, id)
}

/** Expand every code list on a decoded CompactFrame. */
export function expandCompactFrame(
  table: LocalSymbolTablePack,
  frame: CompactFrame,
): ExpandCompactResult {
  if (!assertVocabBase(table, frame.vocab_base)) {
    return {
      ok: false,
      reason: 'vocab_mismatch',
      expected: table.vocab_base,
      actual: frame.vocab_base,
    }
  }
  const ids: Partial<Record<SymbolKind, string[]>> = {}
  const kinds = Object.keys(frame.codes) as SymbolKind[]
  for (const kind of kinds) {
    const codes = frame.codes[kind]
    if (!codes?.length) continue
    const result = expandCodes(table, kind, codes, frame.vocab_base)
    if (!result.ok) return result
    ids[kind] = result.ids
  }
  return {
    ok: true,
    vocab_base: table.vocab_base,
    symbol: frame.symbol,
    ids,
    fields: frame.fields,
  }
}
