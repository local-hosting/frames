import type { CompactFrame, WireCodec } from '../types.js'

/** Ordered text codecs for sim/debug decode (first match wins). */

const codecs: WireCodec[] = []

export function registerTextCodec(codec: WireCodec): void {
  if (codecs.some((c) => c.name === codec.name)) return
  codecs.push(codec)
}

export function listTextCodecs(): readonly WireCodec[] {
  return codecs
}

export function decodeCompactWire(wire: string): CompactFrame | null {
  for (const codec of codecs) {
    const frame = codec.decode(wire)
    if (frame) return frame
  }
  return null
}

export function encodeCompactWire(
  frame: CompactFrame,
  codecName?: string,
): string {
  const codec = codecName
    ? codecs.find((c) => c.name === codecName)
    : codecs[0]
  if (!codec) throw new Error('text-codecs: no codec registered')
  return codec.encode(frame)
}
