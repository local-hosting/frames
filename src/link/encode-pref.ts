import type { BearerPipe } from './types.js'

export type EncodePref = 'packed' | 'text'

export function preferEncodeFor(pipe: BearerPipe, typicalBudgetBytes: number): EncodePref {
  if (pipe === 'thin' || typicalBudgetBytes <= 180) return 'packed'
  return 'text'
}