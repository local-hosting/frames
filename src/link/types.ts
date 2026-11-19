/**
 * Wire link types — canonical definitions live in `@local-hosting/comms`.
 */

export type {
  BearerCategory,
  BearerLayout,
  BearerPipe,
  BearerProfile,
  BitrateRange,
  ByteRange,
  CommsProfile,
  CommsTagId,
  CovScope,
  Geo,
  GeoRf,
  NumericRange,
  Ops,
  OpsAvail,
  OpsDir,
  OpsMob,
  OpsUsage,
  OverlayCategory,
  OverlayLayout,
  OverlayPipe,
  OverlayProfile,
  PipeFit,
  ProfileCategory,
  ProfileLayout,
  RangeM,
  SpectrumRegime,
} from '@local-hosting/comms'

export {
  PROFILE_LAYOUTS,
  assertCommsProfile,
  defBearer,
  defCommsProfile,
  defOverlay,
  isBearerCategory,
  isBearerPipe,
  isBearerProfile,
  isOverlayCategory,
  isOverlayPipe,
  isOverlayProfile,
} from '@local-hosting/comms'

export type { LinkProfile } from './link-profile.js'
export { defLink } from './link-profile.js'