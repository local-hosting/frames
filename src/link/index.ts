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
  LinkProfile,
} from './types.js'

export { PROFILE_LAYOUTS, isBearerProfile, isOverlayProfile } from '@local-hosting/comms'
export {
  assertCommsProfile,
  defBearer,
  defCommsProfile,
  defLink,
  defOverlay,
} from './link-profile.js'

export {
  getBearer,
  getLink,
  getOverlay,
  listBearers,
  listByTag,
  listFat,
  listLinks,
  listOverlays,
  listTags,
  listThin,
  fitsLink,
} from './registry.js'

export type { EncodePref, ForLinkResult } from './optimize.js'
export { forLink, isThin, canFatHeal } from './optimize.js'

export type { PlanFrameResult } from './plan-frame.js'
export { planFrame } from './plan-frame.js'

export type { EffectiveEnvelope, PlanStackResult, ResolveStackResult, StackRulesArtifact } from './stack.js'
export {
  effectiveEnvelope,
  getDefaultStackRules,
  isStackCompatible,
  listCompatibleBearers,
  planStack,
  resolveStack,
} from './stack.js'