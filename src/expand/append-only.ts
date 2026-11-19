import type { SymbolKind, SymbolTableEntry } from '../types.js'

export type AppendOnlyViolation = {
  kind: SymbolKind
  code: number
  parentId: string
  childId: string | undefined
}

export type AppendOnlyResult =
  | { ok: true }
  | { ok: false; violations: AppendOnlyViolation[] }

function codeKey(kind: SymbolKind, code: number): string {
  return `${kind}:${code}`
}

/**
 * Linear lineage rule: every (kind, code) in parent must still mean the same id
 * in child. New codes are allowed; remapping or dropping a code is not.
 */
export function checkAppendOnly(
  parent: readonly SymbolTableEntry[],
  child: readonly SymbolTableEntry[],
): AppendOnlyResult {
  const childByCode = new Map(
    child.map((e) => [codeKey(e.kind, e.code), e.id] as const),
  )
  const violations: AppendOnlyViolation[] = []
  for (const e of parent) {
    const childId = childByCode.get(codeKey(e.kind, e.code))
    if (childId !== e.id) {
      violations.push({
        kind: e.kind,
        code: e.code,
        parentId: e.id,
        childId,
      })
    }
  }
  return violations.length ? { ok: false, violations } : { ok: true }
}

export function assertAppendOnly(
  parent: readonly SymbolTableEntry[],
  child: readonly SymbolTableEntry[],
): void {
  const result = checkAppendOnly(parent, child)
  if (result.ok) return
  const detail = result.violations
    .map(
      (v) =>
        `${v.kind}:${v.code} ${v.parentId}→${v.childId ?? 'missing'}`,
    )
    .join('; ')
  throw new Error(`vocab append-only violated: ${detail}`)
}
