import { describe, expect, it } from 'vitest'
import {
  canFatHealLink as canFatHeal,
  getDefaultLinkRegistry,
  isBearerProfile,
  isOverlayProfile,
  isStackCompatible,
  isThinLink as isThin,
  resolveStackDefault as resolveStack,
} from '@local-hosting/comms'
import stackRules from '@local-hosting/comms/stack.json' with { type: 'json' }
import { intentToCompact } from '../src/core.js'
import { encodeThinFrame, forLink, planFrame } from '../src/link/index.js'

const registry = getDefaultLinkRegistry()
const { fitsLink, getLink, listBearers, listFat, listLinks, listOverlays, listThin } = registry

/** sensors catalog techById slugs that have comms bearer/overlay profiles. */
const SENSOR_CATALOG_TECH = [
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
  'nfc',
  'mqtt',
  'http',
  'websocket',
  'webrtc',
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
  'uwb',
  'private-lte',
  'plc',
  'coap',
  'lwm2m',
  'amqp',
  'grpc',
  'opc-ua',
  'modbus-tcp',
] as const

/** sensors catalog networkById slugs → aliases (gen-archetypes.mjs). */
const SENSOR_CATALOG_NETWORKS = [
  'network-meshtastic',
  'network-helium',
  'network-nodle',
  'network-amazon-sidewalk',
  'network-curiosity',
  'network-senet',
  'network-machineq',
  'network-ttn',
  'network-sigfox',
  'helium',
  'ttn',
  'senet',
  'machineq',
] as const

describe('link planning (comms catalog + frames encode)', () => {
  it('covers every sensors catalog technology slug', () => {
    const ids = new Set(listLinks().map((l) => l.id))
    for (const slug of SENSOR_CATALOG_TECH) {
      expect(ids.has(slug), `missing catalog tech ${slug}`).toBe(true)
    }
  })

  it('includes catalog network slugs and common RF gaps', () => {
    const ids = new Set(listLinks().map((l) => l.id))
    for (const slug of EXTRA_LINKS) {
      expect(ids.has(slug), `missing extra ${slug}`).toBe(true)
    }
  })

  it('resolves sensors catalog network slugs via aliases', () => {
    for (const slug of SENSOR_CATALOG_NETWORKS) {
      expect(getLink(slug), `missing alias for network ${slug}`).toBeDefined()
    }
    expect(getLink('network-helium')?.id).toBe('longfi')
    expect(getLink('network-ttn')?.id).toBe('lorawan')
    expect(forLink('ttn', 40)).toMatchObject({ ok: true, allowFatHeal: false })
  })

  it('splits bearers vs overlays', () => {
    expect(listOverlays().every(isOverlayProfile)).toBe(true)
    expect(listBearers().every(isBearerProfile)).toBe(true)
    expect(listBearers().length + listOverlays().length).toBeLessThanOrEqual(listLinks().length)
  })

  it('keeps bare LoRa distinct from LoRaWAN and Meshtastic', () => {
    const bare = getLink('lora')
    const wan = getLink('lorawan')
    const mesh = getLink('meshtastic')
    expect(bare?.id).toBe('lora')
    expect(wan?.id).toBe('lorawan')
    expect(mesh?.id).toBe('meshtastic')
    expect(bare?.name).toMatch(/bare/i)
    expect(forLink('lora', 40)).toMatchObject({
      ok: true,
      preferEncode: 'packed',
      allowFatHeal: false,
    })
    expect(forLink('lora-bare', 40)).toMatchObject({ ok: true })
    expect(forLink('meshtastic', 100)).toMatchObject({
      ok: true,
      allowFatHeal: false,
    })
    expect(isThin('lora')).toBe(true)
    expect(isThin('lorawan')).toBe(true)
  })

  it('optimizes Wi-Fi for fat heal + larger encode budget', () => {
    const plan = forLink('wifi', 800)
    expect(plan.ok).toBe(true)
    if (!plan.ok) return
    expect(plan.allowFatHeal).toBe(true)
    expect(canFatHeal('wifi')).toBe(true)
    expect(listFat().some((l) => l.id === 'wifi')).toBe(true)
    expect(listThin().some((l) => l.id === 'lorawan')).toBe(true)
    expect(fitsLink('lora', 200)).toBe(false)
  })

  it('stack matrix rejects matter on nfc', () => {
    expect(isStackCompatible('matter', 'nfc', stackRules)).toBe(false)
    expect(resolveStack('nfc', 'matter')).toMatchObject({
      ok: false,
      reason: 'incompatible_stack',
    })
  })

  it('encodeThinFrame packs minimal intent within lorawan typical', () => {
    const compact = intentToCompact('0.2.0', {
      event_code: 1,
      band: 3,
      actor_codes: [40],
      action_codes: [10],
      place_codes: [20],
    })
    const result = encodeThinFrame(compact, 'lorawan')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.bytes.length).toBeLessThanOrEqual(32)
    expect(result.plan.preferEncode).toBe('packed')
  })

  it('planFrame stacks mqtt on lorawan with packed encode', () => {
    const plan = planFrame('lorawan', 40, 'mqtt')
    expect(plan.ok).toBe(true)
    if (!plan.ok) return
    expect(plan.preferEncode).toBe('packed')
    expect(plan.fitsTypical).toBe(true)
    expect(plan.envelope?.payloadBytes.typical).toBe(51)
  })

  it('resolveStack intersects mqtt on lte-m', () => {
    const plan = resolveStack('lte-m', 'mqtt')
    expect(plan.ok).toBe(true)
    if (!plan.ok) return
    expect(plan.envelope.payloadBytes.typical).toBeLessThanOrEqual(1000)
    expect(plan.envelope.bitrateBps.typical).toBe(getLink('lte-m')?.bitrateBps.typical)
  })

  it('rejects app/sensor overlays as no_pipe', () => {
    expect(forLink('mqtt', 10)).toMatchObject({
      ok: false,
      reason: 'no_pipe',
    })
    expect(forLink('matter', 10)).toMatchObject({
      ok: false,
      reason: 'no_pipe',
    })
    expect(forLink('gnss', 0)).toMatchObject({
      ok: false,
      reason: 'unknown_link',
    })
  })

  it('plans sat + DECT + Weightless distinctly', () => {
    expect(forLink('starlink', 800)).toMatchObject({
      ok: true,
      allowFatHeal: true,
    })
    expect(forLink('satellite', 40)).toMatchObject({
      ok: true,
      allowFatHeal: false,
    })
    expect(forLink('iridium', 100)).toMatchObject({ ok: true })
    expect(forLink('dect-nr+', 200)).toMatchObject({ ok: true })
    expect(forLink('weightless-n', 20)).toMatchObject({
      ok: true,
      allowFatHeal: false,
    })
    expect(forLink('dash7', 40)).toMatchObject({ ok: true })
    expect(forLink('wimax', 800)).toMatchObject({
      ok: true,
      allowFatHeal: true,
    })
  })
})