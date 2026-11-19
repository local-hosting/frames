import { describe, expect, it } from 'vitest'
import {
  CHANNEL_KINDS,
  FRAME_ILLOCUTIONS,
  REFERENT_KINDS,
  REPORT_DEMAND,
  REPORT_OFFER,
  SYMBOL_ACK,
  SYMBOL_INTENT,
  SYMBOL_NARRATIVE,
  SYMBOL_QUERY,
  SYMBOL_READING,
  SYMBOL_REPORT,
  SYMBOL_SIGNAL,
  SYMBOL_TREND,
  SYMBOL_VERIFY,
  codesCodec,
  codesToCompact,
  decodeCompactFrame,
  expandCompactFrame,
  frameSymbolName,
  intentCodec,
  intentToCompact,
  isReferentKind,
  knownFrameSymbol,
} from '../src/index.js'
import { sampleTable } from './fixtures.js'

describe('taxonomy', () => {
  it('keeps legacy illocutions 0–5 and extends through verify', () => {
    expect(FRAME_ILLOCUTIONS.map((f) => f.symbol)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
    expect(frameSymbolName(SYMBOL_INTENT)).toBe('intent')
    expect(frameSymbolName(SYMBOL_QUERY)).toBe('query')
    expect(frameSymbolName(SYMBOL_ACK)).toBe('ack')
    expect(frameSymbolName(SYMBOL_SIGNAL)).toBe('signal')
    expect(frameSymbolName(SYMBOL_TREND)).toBe('trend')
    expect(frameSymbolName(SYMBOL_NARRATIVE)).toBe('narrative')
    expect(frameSymbolName(SYMBOL_REPORT)).toBe('report')
    expect(frameSymbolName(SYMBOL_VERIFY)).toBe('verify')
    expect(knownFrameSymbol(99)).toBe(false)
  })

  it('lists everyday referent kinds only', () => {
    expect([...REFERENT_KINDS]).toEqual([
      'event',
      'action',
      'place',
      'resource',
      'actor',
    ])
    expect(isReferentKind('place')).toBe(true)
    expect(isReferentKind('story')).toBe(false)
    expect(isReferentKind('vehicle')).toBe(false)
  })

  it('keeps query = info-ask and report = need/offer polarity', () => {
    const byName = Object.fromEntries(
      FRAME_ILLOCUTIONS.map((f) => [f.name, f.role]),
    )
    expect(byName.query).toMatch(/information only/i)
    expect(byName.report).toMatch(/REPORT_DEMAND/)
    expect(byName.report).toMatch(/REPORT_OFFER/)
    expect(byName.intent).toMatch(/proposed actions/i)
    expect(byName.rating).toMatch(/proposal|intent/i)
    expect(byName.verify).toMatch(/report|observation/i)
    expect(REPORT_DEMAND).toBe(0)
    expect(REPORT_OFFER).toBe(1)
  })

  it('names the four channels', () => {
    expect(CHANNEL_KINDS).toEqual(['thin_frame', 'fat_pack', 'feed', 'ui'])
  })
})

describe('codes codec', () => {
  it('roundtrips a reading frame with everyday referents', () => {
    const frame = codesToCompact(
      SYMBOL_READING,
      '0.2.0',
      { event: [1], place: [20], actor: [40], resource: [50] },
    )
    const wire = codesCodec.encode(frame)
    const decoded = codesCodec.decode(wire)
    expect(decoded).toEqual(frame)
    const expanded = expandCompactFrame(sampleTable, decoded!)
    expect(expanded).toEqual({
      ok: true,
      vocab_base: '0.2.0',
      symbol: SYMBOL_READING,
      ids: {
        event: ['E_1'],
        place: ['P_1'],
        actor: ['PR_1'],
        resource: ['R_1'],
      },
    })
  })

  it('decodeCompactFrame prefers intent codec then codes', () => {
    const intentWire = intentCodec.encode(
      intentToCompact('0.2.0', {
        event_code: 1,
        band: 2,
        actor_codes: [],
        action_codes: [10],
        place_codes: [],
      }),
    )
    const intent = decodeCompactFrame(intentWire)
    expect(intent?.symbol).toBe(SYMBOL_INTENT)

    const reading = codesToCompact(SYMBOL_READING, '0.2.0', {
      event: [1],
      place: [20],
    })
    const readingWire = codesCodec.encode(reading)
    expect(decodeCompactFrame(readingWire)).toEqual(reading)
  })
})
