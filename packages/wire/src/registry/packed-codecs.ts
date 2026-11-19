import type { BinaryCodec, CompactFrame } from '../types.js'

/**
 * Symbol → binary codec registry.
 * Unregistered symbols use the fallback (codes-packed).
 */

const bySymbol = new Map<number, BinaryCodec>()
let fallback: BinaryCodec | null = null

export function setPackedFallback(codec: BinaryCodec): void {
  fallback = codec
}

export function registerPackedCodec(symbol: number, codec: BinaryCodec): void {
  if (!Number.isInteger(symbol) || symbol < 0 || symbol > 255) {
    throw new Error(`packed-codecs: invalid symbol ${symbol}`)
  }
  const existing = bySymbol.get(symbol)
  if (existing && existing.name !== codec.name) {
    throw new Error(
      `packed-codecs: symbol ${symbol} already registered as ${existing.name}`,
    )
  }
  bySymbol.set(symbol, codec)
}

export function packedCodecForSymbol(symbol: number): BinaryCodec {
  const hit = bySymbol.get(symbol)
  if (hit) return hit
  if (!fallback) {
    throw new Error('packed-codecs: no fallback codec registered')
  }
  return fallback
}

export function encodePackedBytes(frame: CompactFrame): Uint8Array {
  return packedCodecForSymbol(frame.symbol).encodeBytes(frame)
}

export function decodePackedBytes(data: Uint8Array): CompactFrame | null {
  if (data.length < 2) return null
  const symbol = data[1]!
  const codec = bySymbol.get(symbol) ?? fallback
  if (!codec) return null
  return codec.decodeBytes(data)
}

export function listPackedCodecs(): ReadonlyArray<{
  symbol: number | 'fallback'
  name: string
}> {
  const rows: Array<{ symbol: number | 'fallback'; name: string }> = [
    ...[...bySymbol.entries()].map(([symbol, codec]) => ({
      symbol,
      name: codec.name,
    })),
  ]
  if (fallback) rows.push({ symbol: 'fallback', name: fallback.name })
  return rows
}
