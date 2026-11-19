import { describe, expect, it } from 'vitest'
import {
  canFatHealOnLink,
  getWirelessLink,
  isThinOnlyLink,
  listFatPipeLinks,
  listThinPipeLinks,
  listWirelessLinks,
  optimizeForLink,
  payloadFitsLink,
} from '../src/link/index.js'

/** sensors catalog techById slugs (gen-archetypes.mjs). */
const SENSOR_CATALOG_TECH = [
  'blockchain',
  'rpma',
  'ethernet',
  'eddystone',
  'iridium',
  'most-link',
  'sigfox',
  'zigbee',
  'ieee-802-15-4',
  'rfid',
  'infrared',
  'ultrasound',
  'nfc',
  'gnss',
  'mqtt',
  'http',
  'lorawan',
  '4g',
  '3g',
  '2g',
  'lte-m',
  '5g',
  'bluetooth',
  'nb-iot',
  'lora',
  'longfi',
  'wifi',
  'dsrc',
  'cv2x',
] as const

/** Catalog networks + RF/app gaps not in techById. */
const EXTRA_LINKS = [
  'meshtastic',
  'amazon-sidewalk',
  'thread',
  'z-wave',
  'wi-sun',
  'wifi-halow',
  'mioty',
  'enocean',
  'wmbus',
  '6lowpan',
  'weightless',
  'dash7',
  'dect-nr-plus',
  'wimax',
  'starlink',
  'satellite',
  'matter',
] as const

describe('wireless link modules', () => {
  it('covers every sensors catalog technology slug', () => {
    const ids = new Set(listWirelessLinks().map((l) => l.id))
    for (const slug of SENSOR_CATALOG_TECH) {
      expect(ids.has(slug), `missing catalog tech ${slug}`).toBe(true)
    }
  })

  it('includes catalog network slugs and common RF gaps', () => {
    const ids = new Set(listWirelessLinks().map((l) => l.id))
    for (const slug of EXTRA_LINKS) {
      expect(ids.has(slug), `missing extra ${slug}`).toBe(true)
    }
  })

  it('keeps bare LoRa distinct from LoRaWAN and Meshtastic', () => {
    const bare = getWirelessLink('lora')
    const wan = getWirelessLink('lorawan')
    const mesh = getWirelessLink('meshtastic')
    expect(bare?.id).toBe('lora')
    expect(wan?.id).toBe('lorawan')
    expect(mesh?.id).toBe('meshtastic')
    expect(bare?.name).toMatch(/bare/i)
    expect(optimizeForLink('lora', 40)).toMatchObject({
      ok: true,
      preferEncode: 'packed',
      allowFatHeal: false,
    })
    expect(optimizeForLink('lora-bare', 40)).toMatchObject({ ok: true })
    expect(optimizeForLink('meshtastic', 100)).toMatchObject({
      ok: true,
      allowFatHeal: false,
    })
    expect(isThinOnlyLink('lora')).toBe(true)
    expect(isThinOnlyLink('lorawan')).toBe(true)
  })

  it('optimizes Wi-Fi for fat heal + larger encode budget', () => {
    const plan = optimizeForLink('wifi', 800)
    expect(plan.ok).toBe(true)
    if (!plan.ok) return
    expect(plan.allowFatHeal).toBe(true)
    expect(canFatHealOnLink('wifi')).toBe(true)
    expect(listFatPipeLinks().some((l) => l.id === 'wifi')).toBe(true)
    expect(listThinPipeLinks().some((l) => l.id === 'lorawan')).toBe(true)
    expect(payloadFitsLink('lora', 200)).toBe(false)
  })

  it('rejects app/sensor overlays as no_pipe', () => {
    expect(optimizeForLink('mqtt', 10)).toMatchObject({
      ok: false,
      reason: 'no_pipe',
    })
    expect(optimizeForLink('matter', 10)).toMatchObject({
      ok: false,
      reason: 'no_pipe',
    })
    expect(optimizeForLink('gnss', 0)).toMatchObject({
      ok: false,
      reason: 'no_pipe',
    })
  })

  it('plans sat + DECT + Weightless distinctly', () => {
    expect(optimizeForLink('starlink', 800)).toMatchObject({
      ok: true,
      allowFatHeal: true,
    })
    expect(optimizeForLink('satellite', 40)).toMatchObject({
      ok: true,
      allowFatHeal: false,
    })
    expect(optimizeForLink('iridium', 100)).toMatchObject({ ok: true })
    expect(optimizeForLink('dect-nr+', 200)).toMatchObject({ ok: true })
    expect(optimizeForLink('weightless-n', 20)).toMatchObject({
      ok: true,
      allowFatHeal: false,
    })
    expect(optimizeForLink('dash7', 40)).toMatchObject({ ok: true })
    expect(optimizeForLink('wimax', 800)).toMatchObject({
      ok: true,
      allowFatHeal: true,
    })
  })
})
