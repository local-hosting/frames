import { planBearer, planStack } from '@local-hosting/comms'
import type { EffectiveEnvelope, PlanStackResult } from '@local-hosting/comms'
import type { BearerProfile, LinkProfile, OverlayProfile } from './types.js'
import { preferEncodeFor, type EncodePref } from './encode-pref.js'

type PlanFrameSuccess = {
  ok: true
  bearer: BearerProfile
  overlay?: OverlayProfile
  envelope?: EffectiveEnvelope
  link: BearerProfile
  preferEncode: EncodePref
  budgetBytes: number
  allowFatHeal: boolean
  fitsTypical: boolean
  fitsMax: boolean
}

export type PlanFrameResult =
  | PlanFrameSuccess
  | Extract<PlanStackResult, { ok: false }>
  | {
      ok: false
      reason: 'unknown_link' | 'no_pipe'
      linkId: string
      link?: LinkProfile
    }

/**
 * End-to-end wire planning: optional overlay stack, bearer budgets, encode preference.
 */
export function planFrame(
  bearerId: string,
  payloadBytes: number,
  overlayId?: string,
): PlanFrameResult {
  if (overlayId) {
    const stack = planStack(bearerId, payloadBytes, overlayId)
    if (!stack.ok) return stack
    return {
      ok: true,
      bearer: stack.bearer,
      overlay: stack.overlay,
      envelope: stack.envelope,
      link: stack.bearer,
      budgetBytes: stack.budgetBytes,
      allowFatHeal: stack.allowFatHeal,
      fitsTypical: stack.fitsTypical,
      fitsMax: stack.fitsMax,
      preferEncode: preferEncodeFor(stack.bearer.pipe, stack.budgetBytes),
    }
  }

  const plan = planBearer(bearerId, payloadBytes)
  if (!plan.ok) return plan
  return {
    ok: true,
    bearer: plan.link,
    link: plan.link,
    budgetBytes: plan.budgetBytes,
    allowFatHeal: plan.allowFatHeal,
    fitsTypical: plan.fitsTypical,
    fitsMax: plan.fitsMax,
    preferEncode: preferEncodeFor(plan.link.pipe, plan.budgetBytes),
  }
}