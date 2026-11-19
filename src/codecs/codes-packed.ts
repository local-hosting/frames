import {
  bytesToHex,
  fnv1a16,
  hexToBytes,
  readU16LE,
  writeU16LE,
} from '../bits.js'
import { REFERENT_KINDS } from '../frame/taxonomy.js'
import {
  resolvePackedFieldId,
  resolvePackedFieldName,
} from '../registry/packed-fields.js'
import type { BinaryCodec, CompactFrame, SymbolKind, WireCodec } from '../types.js'
import { SYMBOL_INTENT } from './symbol-kinds.js'

/**
 * Packed codes frame (binary) for symbols without a denser layout.
 * Layout (little-endian), version 1:
 *   0       u8   version = 1
 *   1       u8   symbol
 *   2–3     u16  vocab_base FNV-1a-16
 *   4       u8   n_groups (0–15)
 *   5       u8   n_fields (0–15)
 *   6…      groups: u8 kindIndex, u8 count (1–15), u16×count codes
 *           fields: u8 fieldId, u16 value
 *
 * Field ids come from {@link registerPackedField} (append-only).
 * Kind index is position in {@link REFERENT_KINDS} (append-only).
 */

export const CODES_PACKED_VERSION = 1

const KIND_INDEX = new Map(
  REFERENT_KINDS.map((kind, i) => [kind, i] as const),
)

export type CodesPackedCodec = WireCodec &
  BinaryCodec & {
    vocabMatches(frame: CompactFrame, vocab_base: string): boolean
  }

function assertCode(c: number): void {
  if (!Number.isInteger(c) || c < 0 || c > 0xffff) {
    throw new Error('codes-packed: code out of u16 range')
  }
}

export function encodeCodesPackedBytes(frame: CompactFrame): Uint8Array {
  if (frame.symbol === SYMBOL_INTENT) {
    throw new Error('codes-packed: use intent-packed for intent')
  }
  if (!Number.isInteger(frame.symbol) || frame.symbol < 0 || frame.symbol > 255) {
    throw new Error('codes-packed: invalid symbol')
  }

  const groups: Array<{ kindIndex: number; codes: number[] }> = []
  for (const kind of REFERENT_KINDS) {
    const codes = frame.codes[kind]
    if (!codes?.length) continue
    if (codes.length > 15) throw new Error(`codes-packed: too many ${kind} codes`)
    const kindIndex = KIND_INDEX.get(kind)
    if (kindIndex === undefined) {
      throw new Error(`codes-packed: unknown kind ${kind}`)
    }
    for (const c of codes) assertCode(c)
    groups.push({ kindIndex, codes })
  }
  if (groups.length > 15) throw new Error('codes-packed: too many kind groups')

  const fields: Array<{ id: number; value: number }> = []
  for (const [key, raw] of Object.entries(frame.fields ?? {})) {
    if (key === 'vocab_fnv16') continue
    const id = resolvePackedFieldId(key)
    if (id === undefined) {
      throw new Error(`codes-packed: unsupported field "${key}"`)
    }
    const value = Number(raw)
    if (!Number.isInteger(value) || value < 0 || value > 0xffff) {
      throw new Error(`codes-packed: field "${key}" out of u16 range`)
    }
    fields.push({ id, value })
  }
  if (fields.length > 15) throw new Error('codes-packed: too many fields')

  const codeBytes = groups.reduce((n, g) => n + 2 + 2 * g.codes.length, 0)
  const size = 6 + codeBytes + 3 * fields.length
  const buf = new Uint8Array(size)
  buf[0] = CODES_PACKED_VERSION
  buf[1] = frame.symbol
  writeU16LE(buf, 2, fnv1a16(frame.vocab_base))
  buf[4] = groups.length
  buf[5] = fields.length

  let o = 6
  for (const g of groups) {
    buf[o++] = g.kindIndex
    buf[o++] = g.codes.length
    for (const c of g.codes) {
      writeU16LE(buf, o, c)
      o += 2
    }
  }
  for (const f of fields) {
    buf[o++] = f.id
    writeU16LE(buf, o, f.value)
    o += 2
  }
  return buf
}

export function decodeCodesPackedBytes(
  data: Uint8Array,
): CompactFrame | null {
  if (data.length < 6) return null
  if (data[0] !== CODES_PACKED_VERSION) return null
  const symbol = data[1]!
  if (symbol === SYMBOL_INTENT) return null
  const vocabHash = readU16LE(data, 2)
  const nGroups = data[4]!
  const nFields = data[5]!
  if (nGroups > 15 || nFields > 15) return null

  let o = 6
  const codes: Partial<Record<SymbolKind, number[]>> = {}
  for (let g = 0; g < nGroups; g++) {
    if (o + 2 > data.length) return null
    const kindIndex = data[o++]!
    const count = data[o++]!
    if (count < 1 || count > 15) return null
    const kind = REFERENT_KINDS[kindIndex]
    if (!kind) return null
    if (o + 2 * count > data.length) return null
    const list: number[] = []
    for (let i = 0; i < count; i++) {
      list.push(readU16LE(data, o))
      o += 2
    }
    codes[kind] = list
  }

  const fields: Record<string, string | number> = { vocab_fnv16: vocabHash }
  for (let i = 0; i < nFields; i++) {
    if (o + 3 > data.length) return null
    const fieldId = data[o++]!
    const value = readU16LE(data, o)
    o += 2
    const name = resolvePackedFieldName(fieldId)
    if (!name) return null
    fields[name] = value
  }

  return {
    symbol,
    vocab_base: `fnv16:${vocabHash.toString(16)}`,
    codes,
    fields,
  }
}

export const codesPackedCodec: CodesPackedCodec = {
  name: 'codes-packed-v1',

  encodeBytes: encodeCodesPackedBytes,
  decodeBytes: decodeCodesPackedBytes,

  encode(frame: CompactFrame): string {
    return bytesToHex(encodeCodesPackedBytes(frame))
  },

  decode(wire: string): CompactFrame | null {
    const bytes = hexToBytes(wire)
    if (!bytes) return null
    return decodeCodesPackedBytes(bytes)
  },

  vocabMatches(frame: CompactFrame, vocab_base: string): boolean {
    return fnv1a16(vocab_base) === Number(frame.fields?.vocab_fnv16)
  },
}
