/**
 * Thin-pipe channel agreement (radio-style tune before payload).
 * Keys / rotation material stay in the host — wire only carries epoch ids.
 */

export type WireSession = {
  /** Community / formation / net id (channel). */
  net: string
  /** Crypto / session epoch — host rotates; wire only compares. */
  key_epoch: number
  /** Active vocab tip (`fp-…`). */
  vocab_tip: string
}

/** On-air tune body — same fields as {@link WireSession}. */
export type TuneAgreement = WireSession

export type TuneCheckResult =
  | { ok: true }
  | { ok: false; reason: 'not_tune' }
  | { ok: false; reason: 'net_mismatch'; expected: string; actual: string }
  | {
      ok: false
      reason: 'key_epoch_mismatch'
      expected: number
      actual: number
    }
  | {
      ok: false
      reason: 'vocab_tip_mismatch'
      expected: string
      actual: string
    }

export function sessionsEqual(a: WireSession, b: WireSession): boolean {
  return (
    a.net === b.net &&
    a.key_epoch === b.key_epoch &&
    a.vocab_tip === b.vocab_tip
  )
}

/** Compare a decoded tune agreement to the local session (fail closed). */
export function checkTune(
  local: WireSession,
  remote: TuneAgreement,
): TuneCheckResult {
  if (local.net !== remote.net) {
    return {
      ok: false,
      reason: 'net_mismatch',
      expected: local.net,
      actual: remote.net,
    }
  }
  if (local.key_epoch !== remote.key_epoch) {
    return {
      ok: false,
      reason: 'key_epoch_mismatch',
      expected: local.key_epoch,
      actual: remote.key_epoch,
    }
  }
  if (local.vocab_tip !== remote.vocab_tip) {
    return {
      ok: false,
      reason: 'vocab_tip_mismatch',
      expected: local.vocab_tip,
      actual: remote.vocab_tip,
    }
  }
  return { ok: true }
}
