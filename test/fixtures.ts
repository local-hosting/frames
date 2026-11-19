import type { LocalSymbolTablePack } from '../src/types.js'

/** Neutral sample table — no product domain. */
export const sampleTable: LocalSymbolTablePack = {
  vocab_base: '0.2.0',
  entries: [
    { id: 'E_1', code: 1, kind: 'event' },
    { id: 'A_1', code: 10, kind: 'action' },
    { id: 'A_2', code: 11, kind: 'action' },
    { id: 'P_1', code: 20, kind: 'place' },
    { id: 'PR_1', code: 40, kind: 'actor' },
    { id: 'R_1', code: 50, kind: 'resource' },
  ],
}
