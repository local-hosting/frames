import { codesCodec } from '../codecs/codes.js'
import { codesPackedCodec } from '../codecs/codes-packed.js'
import { intentCodec } from '../codecs/intent.js'
import { intentPackedCodec } from '../codecs/intent-packed.js'
import { SYMBOL_BASE, SYMBOL_INTENT } from '../codecs/symbol-kinds.js'
import { tuneCodec } from '../tune/codec.js'
import { tunePackedCodec } from '../tune/packed.js'
import {
  registerPackedCodec,
  setPackedFallback,
} from './packed-codecs.js'
import { registerTextCodec } from './text-codecs.js'

let bootstrapped = false

/** Idempotent default registrations for built-in codecs. */
export function ensureFrameDefaults(): void {
  if (bootstrapped) return
  bootstrapped = true

  setPackedFallback(codesPackedCodec)
  registerPackedCodec(SYMBOL_INTENT, intentPackedCodec)
  registerPackedCodec(SYMBOL_BASE, tunePackedCodec)

  registerTextCodec(intentCodec)
  registerTextCodec(tuneCodec)
  registerTextCodec(codesCodec)
}
