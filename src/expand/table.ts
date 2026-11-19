import type {
  LocalSymbolTablePack,
  SymbolKind,
  SymbolTableEntry,
} from '../types.js'

export function resolveIdByCode(
  table: LocalSymbolTablePack,
  kind: SymbolKind,
  code: number,
): string | undefined {
  return table.entries.find((e) => e.kind === kind && e.code === code)?.id
}

export function resolveCodeById(
  table: LocalSymbolTablePack,
  id: string,
): number | undefined {
  return table.entries.find((e) => e.id === id)?.code
}

export function resolveEntryById(
  table: LocalSymbolTablePack,
  id: string,
): SymbolTableEntry | undefined {
  return table.entries.find((e) => e.id === id)
}

export function entriesOfKind(
  table: LocalSymbolTablePack,
  kind: SymbolKind,
): SymbolTableEntry[] {
  return table.entries.filter((e) => e.kind === kind)
}

/** Fail closed when frame `vocab_base` does not match the local table. */
export function assertVocabBase(
  table: LocalSymbolTablePack,
  vocab_base: string,
): boolean {
  return table.vocab_base === vocab_base
}
