/** Simulation-style envelope: `symbol:base:hex` */

export type SymbolEnvelope = {
  symbol: number
  base: string
  hex: string
}

export function encodeSymbolEnvelope(env: SymbolEnvelope): string {
  return `${env.symbol}:${env.base}:${env.hex}`
}

export function decodeSymbolEnvelope(line: string): SymbolEnvelope | null {
  const parts = line.trim().split(':')
  if (parts.length !== 3) return null
  const symbol = Number(parts[0])
  if (Number.isNaN(symbol)) return null
  return { symbol, base: parts[1], hex: parts[2] }
}

/** Wire uses `_` in place of `.` inside vocab_base segments. */
export function baseToWire(vocab_base: string): string {
  return vocab_base.replace(/\./g, '_')
}

export function baseFromWire(base: string): string {
  return base.replace(/_/g, '.')
}
