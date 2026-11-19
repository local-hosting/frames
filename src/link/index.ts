import { encodeCodesPackedBytes } from '../codecs/codes-packed.js'
import { SYMBOL_INTENT } from '../codecs/symbol-kinds.js'
import { encodeIntentPackedBytes } from '../codecs/intent-packed.js'
import type { CompactFrame } from '../types.js'
import {
  planBearer,
  planStack,
  type BearerPipe,
  type BearerProfile,
  type CommsProfile,
  type EffectiveEnvelope,
  type OverlayProfile,
  type PlanStackResult,
} from '@local-hosting/comms'

export type EncodePref = 'packed' | 'text'

export function preferEncodeFor(pipe: BearerPipe, typicalBudgetBytes: number): EncodePref {
  if (pipe === 'thin' || typicalBudgetBytes <= 180) return 'packed'
  return 'text'
}

export type ForLinkResult =
  | {
      ok: true
      link: BearerProfile
      preferEncode: EncodePref
      budgetBytes: number
      allowFatHeal: boolean
      fitsTypical: boolean
      fitsMax: boolean
    }
  | {
      ok: false
      reason: 'unknown_link' | 'no_pipe'
      linkId: string
      link?: CommsProfile
    }

/** Pick encode path + budgets for a sensors catalog technology slug. */
export function forLink(linkId: string, payloadBytes: number): ForLinkResult {
  const plan = planBearer(linkId, payloadBytes)
  if (!plan.ok) return plan
  return {
    ...plan,
    preferEncode: preferEncodeFor(plan.link.pipe, plan.budgetBytes),
  }
}

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
      link?: CommsProfile
    }

/** End-to-end wire planning: optional overlay stack, bearer budgets, encode preference. */
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

export type EncodeThinFrameResult =
  | {
      ok: true
      bytes: Uint8Array
      plan: PlanFrameSuccess
    }
  | {
      ok: false
      reason: string
      plan?: PlanFrameResult
    }

export function encodeThinFrame(
  frame: CompactFrame,
  bearerId: string,
  overlayId?: string,
): EncodeThinFrameResult {
  const bytes =
    frame.symbol === SYMBOL_INTENT
      ? encodeIntentPackedBytes(frame)
      : encodeCodesPackedBytes(frame)
  const plan = planFrame(bearerId, bytes.length, overlayId)
  if (!plan.ok) {
    return { ok: false, reason: plan.reason, plan }
  }
  if (plan.preferEncode !== 'packed') {
    return { ok: false, reason: 'link does not prefer packed encoding', plan }
  }
  if (!plan.fitsTypical) {
    return {
      ok: false,
      reason: `payload ${bytes.length}B exceeds typical budget ${plan.budgetBytes}B`,
      plan,
    }
  }
  return { ok: true, bytes, plan }
}