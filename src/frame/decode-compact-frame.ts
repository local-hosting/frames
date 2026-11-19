import { ensureFrameDefaults } from '../registry/bootstrap.js'
import { decodeCompactFrame as decodeFromRegistry } from '../registry/text-codecs.js'
import type { CompactFrame } from '../types.js'

/** Decode via registered text codecs (intent envelope, then codes, then host codecs). */
export function decodeCompactFrame(wire: string): CompactFrame | null {
  ensureFrameDefaults()
  return decodeFromRegistry(wire)
}
