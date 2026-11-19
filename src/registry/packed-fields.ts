/**
 * Append-only numeric field registry for codes-packed.
 * Ids are on-air stable — never reuse or renumber.
 */

const nameToId = new Map<string, number>([
  ['band', 0],
  ['act', 1],
  ['ok', 2],
  ['offer', 3],
])

const idToName = new Map<number, string>([
  [0, 'band'],
  [1, 'act'],
  [2, 'ok'],
  [3, 'offer'],
])

/** Built-in snapshot (stable ids). Prefer {@link resolvePackedFieldId}. */
export const PACKED_FIELD_IDS = {
  band: 0,
  act: 1,
  ok: 2,
  /** Report need/offer polarity (`REPORT_DEMAND` / `REPORT_OFFER`). */
  offer: 3,
} as const

export type PackedFieldName = keyof typeof PACKED_FIELD_IDS

export function registerPackedField(name: string, id: number): void {
  if (!name || name === 'vocab_fnv16') {
    throw new Error(`packed-fields: invalid name "${name}"`)
  }
  if (!Number.isInteger(id) || id < 0 || id > 255) {
    throw new Error(`packed-fields: id out of u8 range (${id})`)
  }
  const existingId = nameToId.get(name)
  if (existingId !== undefined && existingId !== id) {
    throw new Error(
      `packed-fields: name "${name}" already bound to id ${existingId}`,
    )
  }
  const existingName = idToName.get(id)
  if (existingName !== undefined && existingName !== name) {
    throw new Error(
      `packed-fields: id ${id} already bound to "${existingName}"`,
    )
  }
  nameToId.set(name, id)
  idToName.set(id, name)
}

export function resolvePackedFieldId(name: string): number | undefined {
  return nameToId.get(name)
}

export function resolvePackedFieldName(id: number): string | undefined {
  return idToName.get(id)
}

export function listPackedFields(): ReadonlyArray<{ name: string; id: number }> {
  return [...nameToId.entries()]
    .map(([name, id]) => ({ name, id }))
    .sort((a, b) => a.id - b.id)
}
