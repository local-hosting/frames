import {
  getWirelessLink,
  payloadFitsLink,
} from './registry.js'
import type { WirelessLinkProfile, WirelessPipeFit } from './types.js'

export type WireEncodePrefer = 'packed' | 'text'

export type OptimizeForLinkResult =
  | {
      ok: true
      link: WirelessLinkProfile
      /** Prefer packed bytes on constrained RF; text OK when budget is large. */
      preferEncode: WireEncodePrefer
      budgetBytes: number
      allowFatHeal: boolean
      fitsTypical: boolean
      fitsMax: boolean
    }
  | {
      ok: false
      reason: 'unknown_link' | 'no_pipe'
      linkId: string
      link?: WirelessLinkProfile
    }

function preferEncodeFor(pipe: WirelessPipeFit, typical: number): WireEncodePrefer {
  if (pipe === 'thin' || typical <= 180) return 'packed'
  return 'text'
}

/**
 * Pick encode path + budgets for a sensors catalog technology slug.
 * Hosts call this before encodePackedBytes / text codecs.
 */
export function optimizeForLink(
  linkId: string,
  payloadBytes: number,
): OptimizeForLinkResult {
  const link = getWirelessLink(linkId)
  if (!link) return { ok: false, reason: 'unknown_link', linkId }
  if (link.pipe === 'none') {
    return { ok: false, reason: 'no_pipe', linkId, link }
  }
  const budgetBytes = link.payloadBytes.typical
  return {
    ok: true,
    link,
    preferEncode: preferEncodeFor(link.pipe, budgetBytes),
    budgetBytes,
    allowFatHeal: link.pipe === 'fat' || link.pipe === 'both',
    fitsTypical: payloadFitsLink(linkId, payloadBytes),
    fitsMax: payloadFitsLink(linkId, payloadBytes, { useMax: true }),
  }
}

/** True when this link should carry thin frames (and not rely on fat heal in-band). */
export function isThinOnlyLink(linkId: string): boolean {
  return getWirelessLink(linkId)?.pipe === 'thin'
}

/** True when fat vocab heal can use this link. */
export function canFatHealOnLink(linkId: string): boolean {
  const pipe = getWirelessLink(linkId)?.pipe
  return pipe === 'fat' || pipe === 'both'
}
