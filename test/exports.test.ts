import { describe, expect, it } from 'vitest'
import { expandCodes, type FrameCodec } from '../src/core.js'
import { listLinks, planFrame, planStack, forLink } from '../src/link/index.js'

describe('package exports', () => {
  it('core loads without comms catalog', () => {
    expect(typeof expandCodes).toBe('function')
    const codecShape: Pick<FrameCodec, 'name' | 'encode' | 'decode'> = {
      name: 'noop',
      encode: () => '',
      decode: () => null,
    }
    expect(codecShape.name).toBe('noop')
  })

  it('link registry matches comms catalog size', () => {
    expect(listLinks().length).toBe(54)
  })

  it('planFrame and forLink agree on bearer-only path', () => {
    const bytes = 40
    const framed = planFrame('wifi', bytes)
    const linked = forLink('wifi', bytes)
    expect(framed.ok).toBe(true)
    expect(linked.ok).toBe(true)
    if (!framed.ok || !linked.ok) return
    expect(framed.preferEncode).toBe(linked.preferEncode)
    expect(framed.budgetBytes).toBe(linked.budgetBytes)
  })

  it('planStack rejects invalid overlay bearer pairs', () => {
    const bad = planStack('nfc', 16, 'matter')
    expect(bad.ok).toBe(false)
    if (bad.ok) return
    expect(bad.reason).toBe('incompatible_stack')
  })
})