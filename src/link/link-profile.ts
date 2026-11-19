import {
  assertCommsProfile,
  defBearer,
  defCommsProfile,
  defOverlay,
  type BearerProfile,
  type CommsProfile,
  type OverlayProfile,
} from '@local-hosting/comms'

export type LinkProfile = CommsProfile

/** Accept bearer or overlay; runtime-checks kind/pipe pairing. */
export function defLink(profile: LinkProfile): LinkProfile {
  return defCommsProfile(profile)
}

export {
  assertCommsProfile,
  defBearer,
  defCommsProfile,
  defOverlay,
  type BearerProfile,
  type OverlayProfile,
}