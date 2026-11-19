import {
  bytesToHex,
  fnv1a16,
  hexToBytes,
  readU16LE,
  writeU16LE,
} from '../bits.js'
import type { CompactFrame, FrameCodec } from '../types.js'
import { SYMBOL_INTENT } from './symbol-kinds.js'

/**
 * Packed intent (binary). Layout (little-endian), version 1:
 *   0     u8   version = 1
 *   1     u8   symbol = 4
 *   2     u8   flags: band-1 in [1:0], n_actors [4:2], n_actions [7:5]  (each count 0–7)
 *   3     u8   n_places in [3:0]
 *   4–5   u16  event_code
 *   6–7   u16  vocab_base FNV-1a-16
 *   8…    u16  actor codes, then action codes, then place codes
 */

export const INTENT_PACKED_VERSION = 1

export type IntentPackedCodec = FrameCodec & {
  encodeBytes(frame: CompactFrame): Uint8Array
  decodeBytes(data: Uint8Array): CompactFrame | null
  /** True when local vocab_base fingerprint matches the frame. */
  vocabMatches(frame: CompactFrame, vocab_base: string): boolean
}

function countsOk(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 7
}

export function encodeIntentPackedBytes(frame: CompactFrame): Uint8Array {
  if (frame.symbol !== SYMBOL_INTENT) {
    throw new Error('intent-packed: wrong symbol')
  }
  const band = Number(frame.fields?.band)
  if (![1, 2, 3, 4].includes(band)) {
    throw new Error('intent-packed: invalid band')
  }
  const actors = frame.codes.actor ?? []
  const actions = frame.codes.action ?? []
  const places = frame.codes.place ?? []
  if (!countsOk(actors.length) || !countsOk(actions.length) || places.length > 15) {
    throw new Error('intent-packed: too many codes')
  }
  const event = frame.codes.event?.[0]
  if (event === undefined || event > 0xffff) {
    throw new Error('intent-packed: missing event_code')
  }

  const size = 8 + 2 * (actors.length + actions.length + places.length)
  const buf = new Uint8Array(size)
  buf[0] = INTENT_PACKED_VERSION
  buf[1] = SYMBOL_INTENT
  buf[2] =
    ((band - 1) & 0x3) |
    ((actors.length & 0x7) << 2) |
    ((actions.length & 0x7) << 5)
  buf[3] = places.length & 0xf
  writeU16LE(buf, 4, event)
  writeU16LE(buf, 6, fnv1a16(frame.vocab_base))

  let o = 8
  for (const c of actors) {
    writeU16LE(buf, o, c)
    o += 2
  }
  for (const c of actions) {
    writeU16LE(buf, o, c)
    o += 2
  }
  for (const c of places) {
    writeU16LE(buf, o, c)
    o += 2
  }
  return buf
}

export function decodeIntentPackedBytes(
  data: Uint8Array,
): CompactFrame | null {
  if (data.length < 8) return null
  if (data[0] !== INTENT_PACKED_VERSION) return null
  if (data[1] !== SYMBOL_INTENT) return null
  const flags = data[2]!
  const band = (flags & 0x3) + 1
  const nActors = (flags >>> 2) & 0x7
  const nActions = (flags >>> 5) & 0x7
  const nPlaces = data[3]! & 0xf
  const need = 8 + 2 * (nActors + nActions + nPlaces)
  if (data.length < need) return null

  const event = readU16LE(data, 4)
  const vocabHash = readU16LE(data, 6)
  let o = 8
  const actor: number[] = []
  for (let i = 0; i < nActors; i++) {
    actor.push(readU16LE(data, o))
    o += 2
  }
  const action: number[] = []
  for (let i = 0; i < nActions; i++) {
    action.push(readU16LE(data, o))
    o += 2
  }
  const place: number[] = []
  for (let i = 0; i < nPlaces; i++) {
    place.push(readU16LE(data, o))
    o += 2
  }

  return {
    symbol: SYMBOL_INTENT,
    // Hash placeholder; bindPackedVocabBase restores the real base.
    vocab_base: `fnv16:${vocabHash.toString(16)}`,
    codes: {
      event: [event],
      actor,
      action,
      place,
    },
    fields: { band, vocab_fnv16: vocabHash },
  }
}

/**
 * Rehydrate vocab_base after decode when the local table base fingerprints match.
 */
export function bindPackedVocabBase(
  frame: CompactFrame,
  vocab_base: string,
): CompactFrame | null {
  const hash = Number(frame.fields?.vocab_fnv16)
  if (!Number.isFinite(hash) || fnv1a16(vocab_base) !== hash) return null
  return { ...frame, vocab_base }
}

export const intentPackedCodec: IntentPackedCodec = {
  name: 'intent-packed-v1',

  encodeBytes: encodeIntentPackedBytes,
  decodeBytes: decodeIntentPackedBytes,

  encode(frame: CompactFrame): string {
    return bytesToHex(encodeIntentPackedBytes(frame))
  },

  decode(wire: string): CompactFrame | null {
    const bytes = hexToBytes(wire)
    if (!bytes) return null
    return decodeIntentPackedBytes(bytes)
  },

  vocabMatches(frame: CompactFrame, vocab_base: string): boolean {
    return fnv1a16(vocab_base) === Number(frame.fields?.vocab_fnv16)
  },
}
