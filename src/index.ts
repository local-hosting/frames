import { ensureWireDefaults } from './registry/bootstrap.js'

ensureWireDefaults()

export type {
  SymbolKind,
  SymbolTableEntry,
  LocalSymbolTablePack,
  VocabSnapshot,
  VocabMigration,
  VocabMigrationRemap,
  VocabStore,
  LabelMap,
  LabeledEntry,
  ExpandFailure,
  ExpandCodesResult,
  CompressIdsResult,
  CompactFrame,
  WireCodec,
  BinaryCodec,
} from './types.js'

export {
  resolveIdByCode,
  resolveCodeById,
  resolveEntryById,
  entriesOfKind,
  assertVocabBase,
} from './expand/table.js'

export {
  expandCodes,
  compressIds,
  compressId,
  labelsForIds,
  expandCompactFrame,
  type ExpandCompactResult,
} from './expand/expand.js'

export {
  canonicalizeEntries,
  fingerprintEntries,
  fingerprintMatches,
  assertFingerprintMatches,
  fnv1a32,
} from './expand/fingerprint.js'

export {
  checkAppendOnly,
  assertAppendOnly,
  type AppendOnlyResult,
  type AppendOnlyViolation,
} from './expand/append-only.js'

export {
  createVocabSnapshot,
  snapshotToTable,
  createVocabStore,
  addSnapshot,
  publishSnapshot,
  publishAppend,
  setActive,
  expandWithStore,
  compressWithStore,
  type ExpandWithStoreResult,
  type AddSnapshotOptions,
} from './expand/store.js'

export type { CrosswalkEntry, CrosswalkIndex } from './expand/crosswalk.js'
export {
  buildCrosswalkIndex,
  legacyToId,
  idToLegacy,
  legacyToCode,
  codeToLegacy,
  mergeCrosswalkIntoTable,
  labelPackFromCrosswalk,
} from './expand/crosswalk.js'

export {
  encodeSymbolEnvelope,
  decodeSymbolEnvelope,
  baseToWire,
  baseFromWire,
  type SymbolEnvelope,
} from './codecs/symbol-envelope.js'

export {
  SYMBOL_READING,
  SYMBOL_DIGEST,
  SYMBOL_PATTERN,
  SYMBOL_BASE,
  SYMBOL_INTENT,
  SYMBOL_RATING,
  SYMBOL_QUERY,
  SYMBOL_ACK,
  SYMBOL_SIGNAL,
  SYMBOL_TREND,
  SYMBOL_NARRATIVE,
  SYMBOL_REPORT,
  SYMBOL_VERIFY,
  SYMBOL_KIND_NAMES,
  FRAME_SYMBOL_NAMES,
  frameSymbolName,
  symbolKindName,
} from './codecs/symbol-kinds.js'

export type {
  TaxonomyAxis,
  FrameDirection,
  FrameIllocution,
  ChannelKind,
  ReportPolarity,
} from './frame/taxonomy.js'
export {
  FRAME_ILLOCUTIONS,
  REFERENT_KINDS,
  CHANNEL_KINDS,
  REPORT_DEMAND,
  REPORT_OFFER,
  isReferentKind,
  knownFrameSymbol,
} from './frame/taxonomy.js'

export type {
  WireSession,
  TuneAgreement,
  TuneCheckResult,
} from './tune/agreement.js'
export { sessionsEqual, checkTune } from './tune/agreement.js'
export {
  tuneCodec,
  tuneToCompact,
  compactToTune,
  encodeTuneBody,
  decodeTuneBody,
  checkTuneWire,
  checkTuneFrame,
} from './tune/codec.js'

export {
  intentCodec,
  intentToCompact,
  compactToIntent,
  type IntentBody,
} from './codecs/intent.js'

export {
  codesCodec,
  codesToCompact,
  encodeCodesBody,
  decodeCodesBody,
} from './codecs/codes.js'

export { decodeCompactWire } from './frame/decode-wire.js'

export {
  bytesToHex,
  hexToBytes,
  fnv1a16,
  readU16LE,
  writeU16LE,
  readU32LE,
  writeU32LE,
} from './bits.js'

export {
  REPORT_CREATE_SIZE,
  encodeReportHeader,
  decodeReportHeader,
  reportHeaderType,
  encodeReportCreate,
  decodeReportCreate,
  reportCreateHeader,
  type ReportHeader,
  type ReportCreate,
} from './codecs/report-create.js'

export {
  INTENT_PACKED_VERSION,
  encodeIntentPackedBytes,
  decodeIntentPackedBytes,
  bindPackedVocabBase,
  intentPackedCodec,
  type IntentPackedCodec,
} from './codecs/intent-packed.js'

export {
  CODES_PACKED_VERSION,
  encodeCodesPackedBytes,
  decodeCodesPackedBytes,
  codesPackedCodec,
  type CodesPackedCodec,
} from './codecs/codes-packed.js'

export {
  PACKED_FIELD_IDS,
  registerPackedField,
  resolvePackedFieldId,
  resolvePackedFieldName,
  listPackedFields,
  type PackedFieldName,
} from './registry/packed-fields.js'

export {
  registerPackedCodec,
  setPackedFallback,
  listPackedCodecs,
  packedCodecForSymbol,
  encodePackedBytes,
  decodePackedBytes,
} from './registry/packed-codecs.js'

export {
  registerTextCodec,
  listTextCodecs,
  encodeCompactWire,
} from './registry/text-codecs.js'

export { ensureWireDefaults } from './registry/bootstrap.js'

export { packedCodec, type PackedCodec } from './codecs/packed.js'

export { createWireSystem, type WireSystem } from './system.js'

export type {
  WirelessLinkKind,
  WirelessPipeFit,
  ByteRange,
  BitrateRange,
  WirelessLinkProfile,
  WireEncodePrefer,
  OptimizeForLinkResult,
} from './link/index.js'
export {
  defineLink,
  WIRELESS_LINKS,
  getWirelessLink,
  listWirelessLinks,
  listThinPipeLinks,
  listFatPipeLinks,
  payloadFitsLink,
  optimizeForLink,
  isThinOnlyLink,
  canFatHealOnLink,
} from './link/index.js'
