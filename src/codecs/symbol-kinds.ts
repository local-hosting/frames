/** Illocution / message-type ids on compact frames. 0–5 stable. */
export const SYMBOL_READING = 0
export const SYMBOL_DIGEST = 1
export const SYMBOL_PATTERN = 2
export const SYMBOL_BASE = 3
export const SYMBOL_INTENT = 4
export const SYMBOL_RATING = 5
export const SYMBOL_QUERY = 6
export const SYMBOL_ACK = 7
export const SYMBOL_SIGNAL = 8
export const SYMBOL_TREND = 9
/** Human-facing narrative packaging (illocution) — not a referent kind. */
export const SYMBOL_NARRATIVE = 10
export const SYMBOL_REPORT = 11
/** Approve/confirm a specific report or observation (not rating of an intent). */
export const SYMBOL_VERIFY = 12

/** @deprecated Prefer {@link FRAME_SYMBOL_NAMES}. */
export const SYMBOL_KIND_NAMES: Record<number, string> = {
  [SYMBOL_READING]: 'reading',
  [SYMBOL_DIGEST]: 'digest',
  [SYMBOL_PATTERN]: 'pattern',
  [SYMBOL_BASE]: 'base',
  [SYMBOL_INTENT]: 'intent',
  [SYMBOL_RATING]: 'rating',
  [SYMBOL_QUERY]: 'query',
  [SYMBOL_ACK]: 'ack',
  [SYMBOL_SIGNAL]: 'signal',
  [SYMBOL_TREND]: 'trend',
  [SYMBOL_NARRATIVE]: 'narrative',
  [SYMBOL_REPORT]: 'report',
  [SYMBOL_VERIFY]: 'verify',
}

export const FRAME_SYMBOL_NAMES = SYMBOL_KIND_NAMES

export function frameSymbolName(symbol: number): string | undefined {
  return FRAME_SYMBOL_NAMES[symbol]
}

/** @deprecated Prefer {@link frameSymbolName}. */
export function symbolKindName(symbol: number): string | undefined {
  return frameSymbolName(symbol)
}
