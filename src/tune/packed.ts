import {
  bytesToHex,
  hexToBytes,
  readU16LE,
  writeU16LE,
} from '../bits.js'
import type { CompactFrame, FrameCodec } from '../types.js'
import { SYMBOL_BASE } from '../codecs/symbol-kinds.js'
import { compactToTune, tuneToCompact } from './codec.js'

/**
 * Packed tune (binary), version 1:
 *   0     u8   version = 1
 *   1     u8   symbol = SYMBOL_BASE
 *   2–3   u16  key_epoch
 *   4     u8   vocab_tip length (UTF-8)
 *   5…    UTF-8 vocab_tip (`fp-…`)
 *   …     u8   net length
 *   …     UTF-8 net id
 */

export const TUNE_PACKED_VERSION = 1

const enc = new TextEncoder()
const dec = new TextDecoder()

export function encodeTunePackedBytes(frame: CompactFrame): Uint8Array {
  const tune = compactToTune(frame)
  if (!tune) {
    throw new Error('tune-packed: frame is not a tune (SYMBOL_BASE)')
  }
  const tipBytes = enc.encode(tune.vocab_tip)
  const netBytes = enc.encode(tune.net)
  if (tipBytes.length > 255 || netBytes.length > 255) {
    throw new Error('tune-packed: vocab_tip or net too long')
  }
  if (!Number.isInteger(tune.key_epoch) || tune.key_epoch < 0 || tune.key_epoch > 0xffff) {
    throw new Error('tune-packed: key_epoch out of u16 range')
  }
  const buf = new Uint8Array(5 + tipBytes.length + 1 + netBytes.length)
  buf[0] = TUNE_PACKED_VERSION
  buf[1] = SYMBOL_BASE
  writeU16LE(buf, 2, tune.key_epoch)
  buf[4] = tipBytes.length
  buf.set(tipBytes, 5)
  const netOff = 5 + tipBytes.length
  buf[netOff] = netBytes.length
  buf.set(netBytes, netOff + 1)
  return buf
}

export function decodeTunePackedBytes(data: Uint8Array): CompactFrame | null {
  if (data.length < 7) return null
  if (data[0] !== TUNE_PACKED_VERSION) return null
  if (data[1] !== SYMBOL_BASE) return null
  const key_epoch = readU16LE(data, 2)
  const tipLen = data[4]!
  if (tipLen === 0 || data.length < 5 + tipLen + 1) return null
  const vocab_tip = dec.decode(data.subarray(5, 5 + tipLen))
  const netOff = 5 + tipLen
  const netLen = data[netOff]!
  if (netLen === 0 || data.length < netOff + 1 + netLen) return null
  const net = dec.decode(data.subarray(netOff + 1, netOff + 1 + netLen))
  return tuneToCompact({ net, key_epoch, vocab_tip })
}

export const tunePackedCodec: FrameCodec & {
  encodeBytes(frame: CompactFrame): Uint8Array
  decodeBytes(data: Uint8Array): CompactFrame | null
} = {
  name: 'tune-packed-v1',

  encodeBytes: encodeTunePackedBytes,
  decodeBytes: decodeTunePackedBytes,

  encode(frame: CompactFrame): string {
    return bytesToHex(encodeTunePackedBytes(frame))
  },

  decode(wire: string): CompactFrame | null {
    const bytes = hexToBytes(wire)
    if (!bytes) return null
    return decodeTunePackedBytes(bytes)
  },
}