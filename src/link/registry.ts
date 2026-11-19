import { lora } from './protocols/lora.js'
import { lorawan } from './protocols/lorawan.js'
import { meshtastic } from './protocols/meshtastic.js'
import { longfi } from './protocols/longfi.js'
import { sigfox } from './protocols/sigfox.js'
import { rpma } from './protocols/rpma.js'
import { mioty } from './protocols/mioty.js'
import { weightless } from './protocols/weightless.js'
import { dash7 } from './protocols/dash7.js'
import { dect_nr_plus } from './protocols/dect-nr-plus.js'
import { nb_iot } from './protocols/nb-iot.js'
import { lte_m } from './protocols/lte-m.js'
import { link_2g } from './protocols/2g.js'
import { link_3g } from './protocols/3g.js'
import { link_4g } from './protocols/4g.js'
import { link_5g } from './protocols/5g.js'
import { wifi } from './protocols/wifi.js'
import { wifi_halow } from './protocols/wifi-halow.js'
import { bluetooth } from './protocols/bluetooth.js'
import { eddystone } from './protocols/eddystone.js'
import { zigbee } from './protocols/zigbee.js'
import { thread } from './protocols/thread.js'
import { ieee_802_15_4 } from './protocols/ieee-802-15-4.js'
import { sixlowpan } from './protocols/6lowpan.js'
import { z_wave } from './protocols/z-wave.js'
import { wi_sun } from './protocols/wi-sun.js'
import { enocean } from './protocols/enocean.js'
import { wmbus } from './protocols/wmbus.js'
import { amazon_sidewalk } from './protocols/amazon-sidewalk.js'
import { dsrc } from './protocols/dsrc.js'
import { cv2x } from './protocols/cv2x.js'
import { iridium } from './protocols/iridium.js'
import { starlink } from './protocols/starlink.js'
import { satellite_generic } from './protocols/satellite-generic.js'
import { wimax } from './protocols/wimax.js'
import { matter } from './protocols/matter.js'
import { most_link } from './protocols/most-link.js'
import { nfc } from './protocols/nfc.js'
import { rfid } from './protocols/rfid.js'
import { infrared } from './protocols/infrared.js'
import { ultrasound } from './protocols/ultrasound.js'
import { gnss } from './protocols/gnss.js'
import { ethernet } from './protocols/ethernet.js'
import { mqtt } from './protocols/mqtt.js'
import { http } from './protocols/http.js'
import { blockchain } from './protocols/blockchain.js'
import type { WirelessLinkProfile } from './types.js'

export const WIRELESS_LINKS: readonly WirelessLinkProfile[] = [
  lora,
  lorawan,
  meshtastic,
  longfi,
  sigfox,
  rpma,
  mioty,
  weightless,
  dash7,
  dect_nr_plus,
  nb_iot,
  lte_m,
  link_2g,
  link_3g,
  link_4g,
  link_5g,
  wifi,
  wifi_halow,
  bluetooth,
  eddystone,
  zigbee,
  thread,
  ieee_802_15_4,
  sixlowpan,
  z_wave,
  wi_sun,
  enocean,
  wmbus,
  amazon_sidewalk,
  dsrc,
  cv2x,
  iridium,
  starlink,
  satellite_generic,
  wimax,
  matter,
  most_link,
  nfc,
  rfid,
  infrared,
  ultrasound,
  gnss,
  ethernet,
  mqtt,
  http,
  blockchain,
]

/** Common aliases → canonical profile id. */
const ALIASES: Record<string, string> = {
  ble: 'bluetooth',
  'bt-le': 'bluetooth',
  zwave: 'z-wave',
  'z-wave-lr': 'z-wave',
  'wireless-m-bus': 'wmbus',
  'wireless-mbus': 'wmbus',
  'wifi-ah': 'wifi-halow',
  '802.11ah': 'wifi-halow',
  '802.15.4': 'ieee-802-15-4',
  sidewalk: 'amazon-sidewalk',
  'amazon-sidewalk-network': 'amazon-sidewalk',
  /** Bare LoRa synonyms (not LoRaWAN). */
  'lora-phy': 'lora',
  'lora-bare': 'lora',
  sx1262: 'lora',
  sx1276: 'lora',
  'dect-2020': 'dect-nr-plus',
  'dect-nr+': 'dect-nr-plus',
  'dect-nr': 'dect-nr-plus',
  d7a: 'dash7',
  'dash7-alliance': 'dash7',
  'weightless-n': 'weightless',
  'weightless-p': 'weightless',
  'weightless-w': 'weightless',
  '802.16': 'wimax',
  'sat-iot': 'satellite',
  mss: 'satellite',
  swarm: 'satellite',
  globalstar: 'satellite',
  orbcomm: 'satellite',
  kineis: 'satellite',
}

const BY_ID = new Map(WIRELESS_LINKS.map((row) => [row.id, row]))

function resolveId(id: string): string {
  return ALIASES[id] ?? id
}

export function getWirelessLink(id: string): WirelessLinkProfile | undefined {
  return BY_ID.get(resolveId(id))
}

export function listWirelessLinks(): readonly WirelessLinkProfile[] {
  return WIRELESS_LINKS
}

export function listThinPipeLinks(): WirelessLinkProfile[] {
  return WIRELESS_LINKS.filter((l) => l.pipe === 'thin' || l.pipe === 'both')
}

export function listFatPipeLinks(): WirelessLinkProfile[] {
  return WIRELESS_LINKS.filter((l) => l.pipe === 'fat' || l.pipe === 'both')
}

export function payloadFitsLink(
  id: string,
  payloadBytes: number,
  opts: { useMax?: boolean } = {},
): boolean {
  const link = getWirelessLink(id)
  if (!link || link.pipe === 'none') return false
  const limit = opts.useMax ? link.payloadBytes.max : link.payloadBytes.typical
  return payloadBytes <= limit
}
