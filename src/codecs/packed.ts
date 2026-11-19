import { bytesToHex, hexToBytes } from '../bits.js'
import {
  decodePackedBytes,
  encodePackedBytes,
} from '../registry/packed-codecs.js'
import type { BinaryCodec, CompactFrame, WireCodec } from '../types.js'

export type PackedCodec = WireCodec & BinaryCodec

/** Hex facade over the packed codec registry. */
export const packedCodec: PackedCodec = {
  name: 'packed-v1',

  encodeBytes: encodePackedBytes,
  decodeBytes: decodePackedBytes,

  encode(frame: CompactFrame): string {
    return bytesToHex(encodePackedBytes(frame))
  },

  decode(wire: string): CompactFrame | null {
    const bytes = hexToBytes(wire)
    if (!bytes) return null
    return decodePackedBytes(bytes)
  },
}
