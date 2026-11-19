/**
 * Per-protocol wireless planning envelopes (sensors catalog technology slugs).
 * Numbers are conservative planning envelopes, not guarantees.
 */

export type WirelessLinkKind = 'rf' | 'wired' | 'app' | 'sensor'

/** Which wire pipe this link can realistically carry. */
export type WirelessPipeFit = 'thin' | 'fat' | 'both' | 'none'

export type ByteRange = {
  min: number
  typical: number
  max: number
}

export type BitrateRange = {
  min: number
  typical: number
  max: number
}

export type WirelessLinkProfile = {
  id: string
  name: string
  kind: WirelessLinkKind
  payloadBytes: ByteRange
  bitrateBps: BitrateRange
  pipe: WirelessPipeFit
  packetNotes: string
}

export function defineLink(profile: WirelessLinkProfile): WirelessLinkProfile {
  return profile
}
