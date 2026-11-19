import type { CompactFrame, WireCodec } from '../types.js'
import {
  baseFromWire,
  baseToWire,
  decodeSymbolEnvelope,
  encodeSymbolEnvelope,
} from './symbol-envelope.js'
import { SYMBOL_INTENT } from './symbol-kinds.js'

export { SYMBOL_INTENT }

export type IntentBody = {
  event_code: number
  band: 1 | 2 | 3 | 4
  actor_codes: number[]
  action_codes: number[]
  place_codes: number[]
}

export function intentToCompact(
  vocab_base: string,
  body: IntentBody,
): CompactFrame {
  return {
    symbol: SYMBOL_INTENT,
    vocab_base,
    codes: {
      event: [body.event_code],
      actor: body.actor_codes,
      action: body.action_codes,
      place: body.place_codes,
    },
    fields: { band: body.band },
  }
}

export function compactToIntent(
  frame: CompactFrame,
): (IntentBody & { vocab_base: string }) | null {
  if (frame.symbol !== SYMBOL_INTENT) return null
  const event_code = frame.codes.event?.[0]
  const band = Number(frame.fields?.band)
  if (event_code === undefined || ![1, 2, 3, 4].includes(band)) return null
  return {
    vocab_base: frame.vocab_base,
    event_code,
    band: band as 1 | 2 | 3 | 4,
    actor_codes: frame.codes.actor ?? [],
    action_codes: frame.codes.action ?? [],
    place_codes: frame.codes.place ?? [],
  }
}

function parseCodeList(raw: string): number[] {
  if (!raw) return []
  return raw
    .split(',')
    .map(Number)
    .filter((n) => !Number.isNaN(n))
}

/** Text demo codec for intents (`symbol:base:hex`). Prefer `intent-packed` for compact binary. */
export const intentCodec: WireCodec = {
  name: 'intent-symbol-envelope',

  encode(frame: CompactFrame): string {
    const event = frame.codes.event?.[0] ?? 0
    const band = frame.fields?.band ?? 0
    const actors = (frame.codes.actor ?? []).join(',')
    const actions = (frame.codes.action ?? []).join(',')
    const places = (frame.codes.place ?? []).join(',')
    const body = [event, band, actors, actions, places].join('|')
    return encodeSymbolEnvelope({
      symbol: frame.symbol,
      base: baseToWire(frame.vocab_base),
      hex: Buffer.from(body, 'utf8').toString('hex'),
    })
  },

  decode(wire: string): CompactFrame | null {
    const env = decodeSymbolEnvelope(wire)
    if (!env || env.symbol !== SYMBOL_INTENT) return null
    const body = Buffer.from(env.hex, 'hex').toString('utf8')
    const parts = body.split('|')
    if (parts.length < 5) return null
    const band = Number(parts[1])
    if (![1, 2, 3, 4].includes(band)) return null
    return {
      symbol: SYMBOL_INTENT,
      vocab_base: baseFromWire(env.base),
      codes: {
        event: [Number(parts[0])],
        actor: parseCodeList(parts[2]),
        action: parseCodeList(parts[3]),
        place: parseCodeList(parts[4]),
      },
      fields: { band },
    }
  },
}
