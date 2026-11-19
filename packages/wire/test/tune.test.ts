import { describe, expect, it } from 'vitest'
import {
  SYMBOL_BASE,
  checkTune,
  checkTuneFrame,
  compactToTune,
  decodeCompactWire,
  decodePackedBytes,
  encodePackedBytes,
  tuneCodec,
  tuneToCompact,
  type WireSession,
} from '../src/index.js'

const session: WireSession = {
  net: 'community-demo',
  key_epoch: 2,
  vocab_tip: 'fp-aaaaaaaaaaaaaaaa',
}

describe('tune / SYMBOL_BASE', () => {
  it('roundtrips tune agreement on air', () => {
    const frame = tuneToCompact(session)
    expect(frame.symbol).toBe(SYMBOL_BASE)
    expect(frame.vocab_base).toBe(session.vocab_tip)
    const wire = tuneCodec.encode(frame)
    const decoded = tuneCodec.decode(wire)
    expect(compactToTune(decoded!)).toEqual(session)
    expect(decodeCompactWire(wire)).toEqual(decoded)
  })

  it('checkTune fails closed on net / epoch / tip mismatch', () => {
    expect(checkTune(session, session)).toEqual({ ok: true })
    expect(
      checkTune(session, { ...session, net: 'other' }),
    ).toMatchObject({ ok: false, reason: 'net_mismatch' })
    expect(
      checkTune(session, { ...session, key_epoch: 9 }),
    ).toMatchObject({ ok: false, reason: 'key_epoch_mismatch' })
    expect(
      checkTune(session, { ...session, vocab_tip: 'fp-bbbbbbbbbbbbbbbb' }),
    ).toMatchObject({ ok: false, reason: 'vocab_tip_mismatch' })
  })

  it('roundtrips packed bytes', () => {
    const frame = tuneToCompact(session)
    const bytes = encodePackedBytes(frame)
    const decoded = decodePackedBytes(bytes)
    expect(compactToTune(decoded!)).toEqual(session)
  })

  it('checkTuneFrame rejects non-tune symbols', () => {
    expect(
      checkTuneFrame(session, {
        symbol: 4,
        vocab_base: session.vocab_tip,
        codes: {},
      }),
    ).toEqual({ ok: false, reason: 'not_tune' })
  })
})
