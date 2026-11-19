import { bindPackedVocabBase } from './codecs/intent-packed.js'
import {
  expandCompactFrame,
  type ExpandCompactResult,
} from './expand/expand.js'
import { decodeCompactFrame } from './frame/decode-compact-frame.js'
import { ensureFrameDefaults } from './registry/bootstrap.js'
import {
  decodePackedBytes,
  encodePackedBytes,
} from './registry/packed-codecs.js'
import type { CompactFrame, LocalSymbolTablePack } from './types.js'

export type FrameSystem = {
  readonly table: LocalSymbolTablePack
  encodePacked(frame: CompactFrame): Uint8Array
  decodePacked(data: Uint8Array): CompactFrame | null
  /** Decode packed bytes and bind vocab_base against the local table. */
  decodePackedBound(data: Uint8Array): CompactFrame | null
  decodeText(wire: string): CompactFrame | null
  expand(frame: CompactFrame): ExpandCompactResult
}

/** Host-facing facade: pack/unpack + expand against one local symbol table. */
export function createFrameSystem(table: LocalSymbolTablePack): FrameSystem {
  ensureFrameDefaults()
  return {
    table,
    encodePacked: encodePackedBytes,
    decodePacked: decodePackedBytes,
    decodePackedBound(data) {
      const frame = decodePackedBytes(data)
      if (!frame) return null
      return bindPackedVocabBase(frame, table.vocab_base)
    },
    decodeText: decodeCompactFrame,
    expand(frame) {
      return expandCompactFrame(table, frame)
    },
  }
}
