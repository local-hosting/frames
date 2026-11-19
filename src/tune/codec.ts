import { SYMBOL_BASE } from '../codecs/symbol-kinds.js'
import {
  baseFromFrame,
  baseToFrame,
  decodeSymbolEnvelope,
  encodeSymbolEnvelope,
} from '../codecs/symbol-envelope.js'
import type { CompactFrame, FrameCodec } from '../types.js'
import type { TuneAgreement } from './agreement.js'
import { checkTune, type TuneCheckResult, type FrameSession } from './agreement.js'

/** Body: `net=<id>|key_epoch=<n>` (UTF-8 hex in envelope). Tip is envelope base. */
export function encodeTuneBody(tune: TuneAgreement): string {
  return `net=${tune.net}|key_epoch=${tune.key_epoch}`
}

export function decodeTuneBody(
  body: string,
  vocab_tip: string,
): TuneAgreement | null {
  const fields: Record<string, string> = {}
  for (const part of body.split('|')) {
    if (!part) continue
    const eq = part.indexOf('=')
    if (eq < 0) return null
    fields[part.slice(0, eq)] = part.slice(eq + 1)
  }
  const net = fields.net
  const epochRaw = fields.key_epoch
  if (!net || epochRaw === undefined || epochRaw === '') return null
  const key_epoch = Number(epochRaw)
  if (!Number.isInteger(key_epoch) || key_epoch < 0) return null
  return { net, key_epoch, vocab_tip }
}

export function tuneToCompact(tune: TuneAgreement): CompactFrame {
  return {
    symbol: SYMBOL_BASE,
    vocab_base: tune.vocab_tip,
    codes: {},
    fields: {
      net: tune.net,
      key_epoch: tune.key_epoch,
    },
  }
}

export function compactToTune(frame: CompactFrame): TuneAgreement | null {
  if (frame.symbol !== SYMBOL_BASE) return null
  const net = frame.fields?.net
  const key_epoch = Number(frame.fields?.key_epoch)
  if (typeof net !== 'string' || !net) return null
  if (!Number.isInteger(key_epoch) || key_epoch < 0) return null
  return {
    net,
    key_epoch,
    vocab_tip: frame.vocab_base,
  }
}

export const tuneCodec: FrameCodec = {
  name: 'tune-symbol-envelope',

  encode(frame: CompactFrame): string {
    const tune = compactToTune(frame)
    if (!tune) {
      throw new Error('tuneCodec: frame is not a tune (SYMBOL_BASE)')
    }
    return encodeSymbolEnvelope({
      symbol: SYMBOL_BASE,
      base: baseToFrame(tune.vocab_tip),
      hex: Buffer.from(encodeTuneBody(tune), 'utf8').toString('hex'),
    })
  },

  decode(wire: string): CompactFrame | null {
    const env = decodeSymbolEnvelope(wire)
    if (!env || env.symbol !== SYMBOL_BASE) return null
    let body: string
    try {
      body = Buffer.from(env.hex, 'hex').toString('utf8')
    } catch {
      return null
    }
    const tune = decodeTuneBody(body, baseFromFrame(env.base))
    if (!tune) return null
    return tuneToCompact(tune)
  },
}

/** Decode on-air text as tune and check against local session. */
export function checkTuneFromText(
  local: FrameSession,
  wire: string,
): TuneCheckResult | { ok: false; reason: 'decode_failed' } {
  const frame = tuneCodec.decode(wire)
  if (!frame) return { ok: false, reason: 'decode_failed' }
  const tune = compactToTune(frame)
  if (!tune) return { ok: false, reason: 'not_tune' }
  return checkTune(local, tune)
}

/** Decode frame as tune and check against local session. */
export function checkTuneFrame(
  local: FrameSession,
  frame: CompactFrame,
): TuneCheckResult {
  const tune = compactToTune(frame)
  if (!tune) return { ok: false, reason: 'not_tune' }
  return checkTune(local, tune)
}
