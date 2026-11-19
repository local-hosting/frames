export type {
  WirelessLinkKind,
  WirelessPipeFit,
  ByteRange,
  BitrateRange,
  WirelessLinkProfile,
} from './types.js'
export { defineLink } from './types.js'

export {
  WIRELESS_LINKS,
  getWirelessLink,
  listWirelessLinks,
  listThinPipeLinks,
  listFatPipeLinks,
  payloadFitsLink,
} from './registry.js'

export type { WireEncodePrefer, OptimizeForLinkResult } from './optimize.js'
export {
  optimizeForLink,
  isThinOnlyLink,
  canFatHealOnLink,
} from './optimize.js'
