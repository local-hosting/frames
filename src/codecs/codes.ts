import type { CompactFrame, SymbolKind, FrameCodec } from '../types.js'
import { isReferentKind } from '../frame/taxonomy.js'
import {
  baseFromFrame,
  baseToFrame,
  decodeSymbolEnvelope,
  encodeSymbolEnvelope,
} from './symbol-envelope.js'

/**
 * Generic text codec for any frame symbol.
 * Body: `kind:c,c;kind:c|field=v,field=v` (UTF-8 hex in the envelope).
 * Prefer domain codecs (`intent`, `intent-packed`) when available.
 */
export function encodeCodesBody(frame: CompactFrame): string {
  const codeParts: string[] = []
  for (const [kind, codes] of Object.entries(frame.codes)) {
    if (!codes?.length) continue
    codeParts.push(`${kind}:${codes.join(',')}`)
  }
  const fieldParts = Object.entries(frame.fields ?? {}).map(
    ([k, v]) => `${k}=${v}`,
  )
  const body = codeParts.join(';')
  return fieldParts.length ? `${body}|${fieldParts.join(',')}` : body
}

export function decodeCodesBody(
  body: string,
): Pick<CompactFrame, 'codes' | 'fields'> | null {
  const [codeSection, fieldSection] = body.split('|')
  const codes: Partial<Record<SymbolKind, number[]>> = {}
  if (codeSection) {
    for (const part of codeSection.split(';')) {
      if (!part) continue
      const colon = part.indexOf(':')
      if (colon < 0) return null
      const kind = part.slice(0, colon)
      if (!isReferentKind(kind)) return null
      const raw = part.slice(colon + 1)
      const list = raw
        ? raw.split(',').map(Number).filter((n) => !Number.isNaN(n))
        : []
      codes[kind] = list
    }
  }
  const fields: Record<string, string | number> = {}
  if (fieldSection) {
    for (const part of fieldSection.split(',')) {
      if (!part) continue
      const eq = part.indexOf('=')
      if (eq < 0) return null
      const key = part.slice(0, eq)
      const value = part.slice(eq + 1)
      const asNum = Number(value)
      fields[key] = Number.isNaN(asNum) || value.trim() === '' ? value : asNum
    }
  }
  return {
    codes,
    fields: Object.keys(fields).length ? fields : undefined,
  }
}

export function codesToCompact(
  symbol: number,
  vocab_base: string,
  codes: Partial<Record<SymbolKind, number[]>>,
  fields?: Record<string, string | number>,
): CompactFrame {
  return { symbol, vocab_base, codes, fields }
}

export const codesCodec: FrameCodec = {
  name: 'codes-symbol-envelope',

  encode(frame: CompactFrame): string {
    return encodeSymbolEnvelope({
      symbol: frame.symbol,
      base: baseToFrame(frame.vocab_base),
      hex: Buffer.from(encodeCodesBody(frame), 'utf8').toString('hex'),
    })
  },

  decode(wire: string): CompactFrame | null {
    const env = decodeSymbolEnvelope(wire)
    if (!env) return null
    let body: string
    try {
      body = Buffer.from(env.hex, 'hex').toString('utf8')
    } catch {
      return null
    }
    const parsed = decodeCodesBody(body)
    if (!parsed) return null
    return {
      symbol: env.symbol,
      vocab_base: baseFromFrame(env.base),
      codes: parsed.codes,
      fields: parsed.fields,
    }
  },
}
