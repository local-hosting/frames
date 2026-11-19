import type { SymbolTableEntry, VocabSnapshot } from '../types.js'

/** Canonical bytes for tip identity — sorted kind/code/id rows. */
export function canonicalizeEntries(entries: readonly SymbolTableEntry[]): string {
  return [...entries]
    .map((e) => `${e.kind}\t${e.code}\t${e.id}`)
    .sort()
    .join('\n')
}

/** FNV-1a 32-bit over UTF-16 code units (portable, no crypto dep). */
export function fnv1a32(text: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

/**
 * Content fingerprint for a symbol table (fat pack / store tip id).
 * Thin frames set `CompactFrame.vocab_base` to this string; packed air
 * still FNV-1a-16 hashes the string via bits.fnv1a16.
 *
 * Format avoids ':' (envelope) and '_' (baseFromFrame maps _ → .).
 * 16 hex chars = two FNV-32 passes (length-salted) for fewer collisions.
 */
export function fingerprintEntries(entries: readonly SymbolTableEntry[]): string {
  const canon = canonicalizeEntries(entries)
  const a = fnv1a32(canon).toString(16).padStart(8, '0')
  const b = fnv1a32(`\0${canon.length}\0${canon}`).toString(16).padStart(8, '0')
  return `fp-${a}${b}`
}

/** True when snapshot.fingerprint matches its entries. */
export function fingerprintMatches(snapshot: VocabSnapshot): boolean {
  return snapshot.fingerprint === fingerprintEntries(snapshot.entries)
}

export function assertFingerprintMatches(snapshot: VocabSnapshot): void {
  const expected = fingerprintEntries(snapshot.entries)
  if (snapshot.fingerprint !== expected) {
    throw new Error(
      `vocab fingerprint mismatch: got ${snapshot.fingerprint}, expected ${expected}`,
    )
  }
}
