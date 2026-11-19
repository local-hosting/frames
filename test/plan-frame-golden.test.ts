import { describe, expect, it } from 'vitest'
import { planFrame } from '../src/link/index.js'

type GoldenSuccess = {
  label: string
  bearer: string
  bytes: number
  overlay?: string
  expect: {
    preferEncode: 'packed' | 'text'
    allowFatHeal: boolean
    fitsTypical: boolean
  }
}

type GoldenFailure = {
  label: string
  bearer: string
  bytes: number
  overlay?: string
  expect: {
    ok: false
    reason: string
  }
}

const GOLDEN: Array<GoldenSuccess | GoldenFailure> = [
  {
    label: 'lorawan bearer only',
    bearer: 'lorawan',
    bytes: 40,
    expect: {
      preferEncode: 'packed',
      allowFatHeal: false,
      fitsTypical: true,
    },
  },
  {
    label: 'lorawan + mqtt stack',
    bearer: 'lorawan',
    bytes: 40,
    overlay: 'mqtt',
    expect: {
      preferEncode: 'packed',
      allowFatHeal: false,
      fitsTypical: true,
    },
  },
  {
    label: 'wifi fat pipe',
    bearer: 'wifi',
    bytes: 800,
    expect: {
      preferEncode: 'text',
      allowFatHeal: true,
      fitsTypical: true,
    },
  },
  {
    label: 'thin pipe prefers packed (meshtastic)',
    bearer: 'meshtastic',
    bytes: 80,
    expect: {
      preferEncode: 'packed',
      allowFatHeal: false,
      fitsTypical: true,
    },
  },
  {
    label: 'lte-m + mqtt',
    bearer: 'lte-m',
    bytes: 200,
    overlay: 'mqtt',
    expect: {
      preferEncode: 'text',
      allowFatHeal: true,
      fitsTypical: true,
    },
  },
  {
    label: 'ethernet + http',
    bearer: 'ethernet',
    bytes: 1500,
    overlay: 'http',
    expect: {
      preferEncode: 'text',
      allowFatHeal: true,
      fitsTypical: true,
    },
  },
  {
    label: 'incompatible matter on nfc',
    bearer: 'nfc',
    bytes: 10,
    overlay: 'matter',
    expect: { ok: false, reason: 'incompatible_stack' },
  },
]

describe('planFrame golden policy', () => {
  for (const row of GOLDEN) {
    it(row.label, () => {
      const plan = planFrame(row.bearer, row.bytes, row.overlay)
      if ('ok' in row.expect && row.expect.ok === false) {
        expect(plan.ok).toBe(false)
        if (!plan.ok) expect(plan.reason).toBe(row.expect.reason)
        return
      }
      expect(plan.ok).toBe(true)
      if (!plan.ok) return
      const exp = row.expect as GoldenSuccess['expect']
      expect(plan.preferEncode).toBe(exp.preferEncode)
      expect(plan.allowFatHeal).toBe(exp.allowFatHeal)
      expect(plan.fitsTypical).toBe(exp.fitsTypical)
    })
  }
})