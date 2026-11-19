import type { SymbolKind } from '../types.js'
import {
  FRAME_SYMBOL_NAMES,
  SYMBOL_ACK,
  SYMBOL_BASE,
  SYMBOL_DIGEST,
  SYMBOL_INTENT,
  SYMBOL_NARRATIVE,
  SYMBOL_PATTERN,
  SYMBOL_QUERY,
  SYMBOL_RATING,
  SYMBOL_READING,
  SYMBOL_REPORT,
  SYMBOL_SIGNAL,
  SYMBOL_TREND,
  SYMBOL_VERIFY,
} from '../codecs/symbol-kinds.js'

/**
 * Three axes of human↔machine communication on this stack.
 *
 * - **illocution** — speech act on the thin frame (`FRAME_ILLOCUTIONS`)
 * - **referent** — coarse vocab slot kinds (`REFERENT_KINDS`); people are `actor`; subtypes (food, lodging, …) are codes
 * - **channel** — pipe shape (`CHANNEL_KINDS`); labels / schema.org live off-pipe (fat / app catalog)
 *
 * Tiny-message rule: grow vocab codes and packed layouts, not new kinds for nouns.
 */
export type TaxonomyAxis = 'illocution' | 'referent' | 'channel'

export type FrameDirection = 'in' | 'out' | 'both' | 'sync'

export type FrameIllocution = {
  symbol: number
  name: string
  role: string
  direction: FrameDirection
}

/**
 * Need vs offer on {@link SYMBOL_REPORT} (packed as `offer` in report-create).
 * Not {@link SYMBOL_QUERY} — query asks for information only.
 */
export const REPORT_DEMAND = 0 as const
export const REPORT_OFFER = 1 as const
export type ReportPolarity = typeof REPORT_DEMAND | typeof REPORT_OFFER

/**
 * Wire frame types (illocution). Codes on the frame point at {@link SymbolKind} referents.
 * 0–5 are the original compose loop; 6+ bridge elevate + fieldwise-ds narrative.
 *
 * Distinctions that stay sharp:
 * - **query** — ask for information (“is the shelter open?”)
 * - **report** — structured need/offer or status (“need lodging” / “offering lodging”)
 * - **intent** — proposed actions (“evacuate now”), not a goods need
 * - **rating** — feedback on a proposal/intent
 * - **verify** — approve/confirm a specific report or observation (not ack-of-receipt)
 */
export const FRAME_ILLOCUTIONS: readonly FrameIllocution[] = [
  {
    symbol: SYMBOL_READING,
    name: 'reading',
    role: 'observation in (sensor / sighting)',
    direction: 'in',
  },
  {
    symbol: SYMBOL_DIGEST,
    name: 'digest',
    role: 'rolled-up summary out',
    direction: 'out',
  },
  {
    symbol: SYMBOL_PATTERN,
    name: 'pattern',
    role: 'detected regularity',
    direction: 'out',
  },
  {
    symbol: SYMBOL_BASE,
    name: 'base',
    role: 'tune beacon: net + key_epoch + vocab tip (before payload)',
    direction: 'sync',
  },
  {
    symbol: SYMBOL_INTENT,
    name: 'intent',
    role: 'proposed actions (evacuate, move); not goods need/offer',
    direction: 'out',
  },
  {
    symbol: SYMBOL_RATING,
    name: 'rating',
    role: 'human feedback on a proposal/intent (quality/preference)',
    direction: 'in',
  },
  {
    symbol: SYMBOL_QUERY,
    name: 'query',
    role: 'ask for information only (not need/demand for goods)',
    direction: 'both',
  },
  {
    symbol: SYMBOL_ACK,
    name: 'ack',
    role: 'acknowledge receipt or acceptance (transport/protocol)',
    direction: 'both',
  },
  {
    symbol: SYMBOL_SIGNAL,
    name: 'signal',
    role: 'elevated aggregate (post-sensor, pre-pattern)',
    direction: 'in',
  },
  {
    symbol: SYMBOL_TREND,
    name: 'trend',
    role: 'trend summary toward compose',
    direction: 'out',
  },
  {
    symbol: SYMBOL_NARRATIVE,
    name: 'narrative',
    role: 'human-facing narrative packaging',
    direction: 'out',
  },
  {
    symbol: SYMBOL_REPORT,
    name: 'report',
    role: 'need (demand) or offer of a subject, or status; see REPORT_DEMAND / REPORT_OFFER',
    direction: 'both',
  },
  {
    symbol: SYMBOL_VERIFY,
    name: 'verify',
    role: 'approve/confirm a specific report or observation (claim truth), not rating an intent',
    direction: 'both',
  },
] as const

/** Vocab-row kinds (referents) — coarse slots; food/medicine/lodging are resource codes. */
export const REFERENT_KINDS: readonly SymbolKind[] = [
  'event',
  'action',
  'place',
  'resource',
  'actor',
] as const

export type ChannelKind = 'thin_frame' | 'fat_pack' | 'feed' | 'ui'

export const CHANNEL_KINDS: readonly ChannelKind[] = [
  'thin_frame',
  'fat_pack',
  'feed',
  'ui',
] as const

const REFERENT_SET = new Set<string>(REFERENT_KINDS)

export function isReferentKind(value: string): value is SymbolKind {
  return REFERENT_SET.has(value)
}

export function knownFrameSymbol(symbol: number): boolean {
  return symbol in FRAME_SYMBOL_NAMES
}
