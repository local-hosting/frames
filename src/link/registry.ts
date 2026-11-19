import { getDefaultLinkRegistry, type LinkRegistry } from '@local-hosting/comms'
import type { LinkProfile } from './types.js'

export type { LinkRegistry } from '@local-hosting/comms'

let cached: LinkRegistry | undefined

function registry(): LinkRegistry {
  if (!cached) cached = getDefaultLinkRegistry()
  return cached
}

/** All catalog profiles (loads comms `catalog.json` on first call). */
export function listLinks(): readonly LinkProfile[] {
  return registry().listLinks()
}

export function getLink(id: string) {
  return registry().getLink(id)
}
export function getBearer(id: string) {
  return registry().getBearer(id)
}
export function getOverlay(id: string) {
  return registry().getOverlay(id)
}
export function listBearers() {
  return registry().listBearers()
}
export function listOverlays() {
  return registry().listOverlays()
}
export function listTags() {
  return registry().listTags()
}
export function listByTag(tagId: Parameters<LinkRegistry['listByTag']>[0]) {
  return registry().listByTag(tagId)
}
export function listThin() {
  return registry().listThin()
}
export function listFat() {
  return registry().listFat()
}
export function fitsLink(
  id: string,
  payloadBytes: number,
  opts?: { useMax?: boolean },
) {
  return registry().fitsLink(id, payloadBytes, opts)
}