import { planBearer } from '@local-hosting/comms'
import type { BearerProfile, LinkProfile } from './types.js'
import { preferEncodeFor, type EncodePref } from './encode-pref.js'

export type { EncodePref } from './encode-pref.js'

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
      link?: LinkProfile
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

export { isThinLink as isThin, canFatHealLink as canFatHeal } from '@local-hosting/comms'