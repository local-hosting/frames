import type { CompactFrame, FrameCodec } from '../types.js'

/** Ordered text codecs for sim/debug decode (first match wins). */

const codecs: FrameCodec[] = []

export function registerTextCodec(codec: FrameCodec): void {
  if (codecs.some((c) => c.name === codec.name)) return
  codecs.push(codec)
}

export function listTextCodecs(): readonly FrameCodec[] {
  return codecs
}

export function decodeCompactFrame(wire: string): CompactFrame | null {
  for (const codec of codecs) {
    const frame = codec.decode(wire)
    if (frame) return frame
  }
  return null
}

export function encodeCompactFrame(
  frame: CompactFrame,
  codecName?: string,
): string {
  const codec = codecName
    ? codecs.find((c) => c.name === codecName)
    : codecs[0]
  if (!codec) throw new Error('text-codecs: no codec registered')
  return codec.encode(frame)
}
