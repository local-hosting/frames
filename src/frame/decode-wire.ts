import { ensureWireDefaults } from '../registry/bootstrap.js'
import { decodeCompactWire as decodeFromRegistry } from '../registry/text-codecs.js'
import type { CompactFrame } from '../types.js'

/** Decode via registered text codecs (intent envelope, then codes, then host codecs). */
export function decodeCompactWire(wire: string): CompactFrame | null {
  ensureWireDefaults()
  return decodeFromRegistry(wire)
}
