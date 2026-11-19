import { Buffer } from 'buffer'
import { createLogger } from '@westlane/pino-blanc/browser'
import {
  FRAME_ILLOCUTIONS,
  SYMBOL_ACK,
  SYMBOL_BASE,
  SYMBOL_INTENT,
  SYMBOL_QUERY,
  SYMBOL_READING,
  addSnapshot,
  checkTuneFrame,
  codesCodec,
  codesToCompact,
  createVocabSnapshot,
  createVocabStore,
  decodeCompactFrame,
  encodePackedBytes,
  expandWithStore,
  frameSymbolName,
  intentCodec,
  intentToCompact,
  labelsForIds,
  packedCodec,
  publishAppend,
  snapshotToTable,
  tuneCodec,
  tuneToCompact,
  type CompactFrame,
  type ExpandFailure,
  type LabelMap,
  type SymbolTableEntry,
  type VocabMigration,
  type VocabSnapshot,
  type FrameSession,
} from '@local-hosting/frames'
import { composeWords } from '@local-hosting/compose'
import './style.css'

const log = createLogger('frames-demo')
const loggedHeals = new Set<string>()
/** Tips already fat-pulled this session (avoid repeat pulls). */
const healedTips = new Set<string>()

function logNeedHeal(failure: Extract<ExpandFailure, { reason: 'need_heal' }>): void {
  if (loggedHeals.has(failure.fingerprint)) return
  loggedHeals.add(failure.fingerprint)
  log.warn('need_heal — park frame and fat-pull tip', {
    reason: failure.reason,
    fingerprint: failure.fingerprint,
  })
}

;(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer

const seed: SymbolTableEntry[] = [
  { id: 'E_1', code: 1, kind: 'event' },
  { id: 'A_1', code: 10, kind: 'action' },
  { id: 'P_1', code: 20, kind: 'place' },
  { id: 'PR_1', code: 40, kind: 'actor' },
  { id: 'R_1', code: 50, kind: 'resource' },
]

let store = createVocabStore(
  createVocabSnapshot({
    lineage: 'community:demo',
    epoch: 1,
    entries: seed,
    label: '0.2.0',
  }),
)
const tipV1 = store.active
store = publishAppend(store, {
  lineage: 'community:demo',
  epoch: 2,
  label: '0.3.0',
  add: [{ id: 'A_2', code: 11, kind: 'action' }],
})
const table = snapshotToTable(store.byFingerprint.get(store.active)!)
const tip = store.active

/**
 * Off-air fat catalog (stub). `fp-badf00d` is a placeholder tip on the thin
 * frame; fat-pull returns a real snapshot + migration onto that tip.
 */
type FatPack = {
  snapshot: VocabSnapshot
  migration: VocabMigration
}

const healSnapshot = createVocabSnapshot({
  lineage: 'community:demo',
  epoch: 3,
  parent: tip,
  label: '0.3.1-heal',
  entries: [
    ...store.byFingerprint.get(tip)!.entries,
    { id: 'E_BAD', code: 999, kind: 'event' },
  ],
})

const FAT_CATALOG: Record<string, FatPack> = {
  'fp-badf00d': {
    snapshot: healSnapshot,
    migration: {
      from: 'fp-badf00d',
      to: healSnapshot.fingerprint,
      remaps: [{ kind: 'event', code: 999, toCode: 999 }],
    },
  },
}

function fatPullTip(fingerprint: string): boolean {
  if (healedTips.has(fingerprint)) return true
  const pack = FAT_CATALOG[fingerprint]
  if (!pack) {
    log.warn('fat-pull miss — no pack for tip', { fingerprint })
    return false
  }
  store = addSnapshot(store, pack.snapshot)
  store = {
    ...store,
    migrations: [...store.migrations, pack.migration],
  }
  healedTips.add(fingerprint)
  log.info('fat-pull heal — ingested tip', {
    parked: fingerprint,
    resolvedVia: pack.snapshot.fingerprint,
    label: pack.snapshot.label,
  })
  return true
}

const session: FrameSession = {
  net: 'community-demo',
  key_epoch: 1,
  vocab_tip: tip,
}

const labels: Record<string, LabelMap> = {
  E_1: { en: 'demo event' },
  A_1: { en: 'notify' },
  A_2: { en: 'escalate' },
  P_1: { en: 'lobby' },
  PR_1: { en: 'ops' },
  R_1: { en: 'radio' },
  E_BAD: { en: 'bad food' },
}

const frames: CompactFrame[] = [
  // Tune before payload (net + key epoch + vocab tip)
  tuneToCompact(session),
  tuneToCompact({ ...session, key_epoch: 9 }),
  intentToCompact(tip, {
    event_code: 1,
    band: 3,
    actor_codes: [40],
    action_codes: [10, 11],
    place_codes: [20],
  }),
  // Older tip — expands via active superset
  codesToCompact(SYMBOL_READING, tipV1, {
    event: [1],
    place: [20],
    resource: [50],
  }),
  codesToCompact(SYMBOL_QUERY, tip, {
    place: [20],
    actor: [40],
  }),
  codesToCompact(SYMBOL_ACK, tip, { action: [10] }, { ok: 1 }),
  // Synthetic unknown tip (hexspeak placeholder) — need_heal → fat-pull stub
  codesToCompact(SYMBOL_READING, 'fp-badf00d', { event: [999] }),
]

type WireViews = {
  text: string
  textChars: number
  packedHex: string
  packedBytes: number
}

function viewsFor(frame: CompactFrame): WireViews {
  const text =
    frame.symbol === SYMBOL_INTENT
      ? intentCodec.encode(frame)
      : frame.symbol === SYMBOL_BASE
        ? tuneCodec.encode(frame)
        : codesCodec.encode(frame)
  const bytes = encodePackedBytes(frame)
  return {
    text,
    textChars: text.length,
    packedHex: packedCodec.encode(frame),
    packedBytes: bytes.length,
  }
}

let selected = 0

const app = document.querySelector('#app')!
app.innerHTML = `
  <div class="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-3">
    <section class="flex min-h-0 flex-col border-b border-stone-300 md:border-b-0 md:border-r">
      <header class="border-b border-stone-300 px-4 py-3 text-sm font-medium tracking-wide text-stone-500">
        notebook
      </header>
      <ul id="rows" class="flex-1 overflow-auto" role="listbox" aria-label="messages"></ul>
    </section>
    <section class="flex min-h-0 flex-col border-b border-stone-300 md:border-b-0 md:border-r">
      <header class="border-b border-stone-300 px-4 py-3 text-sm font-medium tracking-wide text-stone-500">
        on-air
      </header>
      <div id="hex" class="flex flex-1 flex-col gap-2 overflow-auto p-4"></div>
    </section>
    <section class="flex min-h-0 flex-col">
      <header class="border-b border-stone-300 px-4 py-3 text-sm font-medium tracking-wide text-stone-500">
        expanded
      </header>
      <div id="out" class="flex flex-1 flex-col gap-3 overflow-auto p-4"></div>
    </section>
  </div>
  <footer class="composer-shell fixed inset-x-0 bottom-0 z-10 border-t">
    <div class="px-4 py-4 sm:px-6">
      <form id="composer" class="relative">
        <div class="composer-field overflow-hidden rounded-lg bg-white shadow-sm">
          <label for="message" class="sr-only">Add your message</label>
          <textarea
            rows="2"
            name="message"
            id="message"
            class="block w-full resize-none border-0 bg-transparent px-3 py-1.5 text-stone-900 placeholder:text-stone-400 focus:ring-0 sm:text-sm/6"
            placeholder="Type vocab words… e.g. demo event notify lobby ops high"
          ></textarea>
          <div class="py-2" aria-hidden="true">
            <div class="py-px">
              <div class="h-9"></div>
            </div>
          </div>
        </div>
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-between py-2 pl-3 pr-2">
          <div class="flex items-center gap-3">
            <div class="composer-swatches" aria-hidden="true">
              <span class="composer-swatch" style="--swatch: var(--panel-teal)"></span>
              <span class="composer-swatch" style="--swatch: var(--panel-gold)"></span>
              <span class="composer-swatch" style="--swatch: var(--panel-slate)"></span>
              <span class="composer-swatch" style="--swatch: var(--panel-green)"></span>
              <span class="composer-swatch" style="--swatch: var(--panel-violet)"></span>
              <span class="composer-swatch" style="--swatch: var(--panel-magenta)"></span>
              <span class="composer-swatch" style="--swatch: var(--panel-sky)"></span>
            </div>
            <p id="composer-hint" class="text-xs text-stone-400" aria-live="polite"></p>
          </div>
          <button
            type="submit"
            class="composer-send rounded-md px-2.5 py-1.5 text-sm font-semibold shadow-sm"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  </footer>
`

const rows = document.querySelector('#rows')!
const hex = document.querySelector('#hex')!
const out = document.querySelector('#out')!
const composer = document.querySelector('#composer') as HTMLFormElement
const messageInput = document.querySelector('#message') as HTMLTextAreaElement
const composerHint = document.querySelector('#composer-hint')!

function rowLabel(frame: CompactFrame): string {
  return frameSymbolName(frame.symbol) ?? String(frame.symbol)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function messageTags(frame: CompactFrame): string[] {
  const expanded = expandWithStore(store, frame)
  if (!expanded.ok) {
    return expanded.reason === 'need_heal' ? ['need_heal'] : []
  }
  const names = Object.values(expanded.ids).flatMap((ids) =>
    labelsForIds(ids ?? [], labels, 'en').map(({ id, label }) =>
      (label ?? id).toLowerCase(),
    ),
  )
  return names
}

function tagsHtml(tags: string[]): string {
  return tags
    .map(
      (tag) =>
        `<span class="row-tag inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium">${escapeHtml(tag)}</span>`,
    )
    .join('')
}

function colorJson(json: string): string {
  return escapeHtml(json).replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (match, stringLiteral: string | undefined, keyColon: string | undefined, keyword: string | undefined) => {
      if (stringLiteral !== undefined) {
        if (keyColon !== undefined) {
          return `<span class="json-key">${stringLiteral}</span>${keyColon}`
        }
        return `<span class="json-string">${stringLiteral}</span>`
      }
      if (keyword !== undefined) {
        return `<span class="json-keyword">${keyword}</span>`
      }
      return `<span class="json-number">${match}</span>`
    },
  )
}

function detailHtml(frame: CompactFrame): string {
  if (frame.symbol === SYMBOL_BASE) {
    return `<pre class="json-out font-mono text-sm leading-relaxed whitespace-pre-wrap">${colorJson(
      JSON.stringify(
        {
          symbol: 'base',
          role: 'tune beacon',
          agreement: {
            net: frame.fields?.net,
            key_epoch: frame.fields?.key_epoch,
            vocab_tip: frame.vocab_base,
          },
          check: checkTuneFrame(session, frame),
        },
        null,
        2,
      ),
    )}</pre>`
  }
  const expanded = expandWithStore(store, frame)
  if (!expanded.ok) {
    if (expanded.reason === 'need_heal') {
      logNeedHeal(expanded)
      const canPull = Boolean(FAT_CATALOG[expanded.fingerprint])
      return `
        <p class="pane-msg text-sm leading-relaxed">
          Can't expand — local store doesn't have tip
          <span class="font-mono">${escapeHtml(expanded.fingerprint)}</span>.
          Park the frame and fat-pull that vocab table, then retry.
        </p>
        ${
          canPull
            ? `<button
                type="button"
                data-fat-pull="${escapeHtml(expanded.fingerprint)}"
                class="composer-send mt-3 rounded-md px-2.5 py-1.5 text-sm font-semibold shadow-sm"
              >Fat-pull tip</button>`
            : `<p class="pane-meta mt-2 text-xs">No stub pack for this tip.</p>`
        }`
    }
    return `<pre class="json-out font-mono text-sm leading-relaxed whitespace-pre-wrap">${colorJson(JSON.stringify(expanded, null, 2))}</pre>`
  }
  const named = Object.fromEntries(
    Object.entries(expanded.ids).map(([kind, ids]) => [
      kind,
      labelsForIds(ids ?? [], labels, 'en').map(
        ({ id, label }) => label ?? id,
      ),
    ]),
  )
  const meta = FRAME_ILLOCUTIONS.find((f) => f.symbol === expanded.symbol)
  return `<pre class="json-out font-mono text-sm leading-relaxed whitespace-pre-wrap">${colorJson(
    JSON.stringify(
      {
        symbol: frameSymbolName(expanded.symbol) ?? expanded.symbol,
        role: meta?.role,
        direction: meta?.direction,
        tip: expanded.vocab_base,
        resolvedVia: expanded.resolvedVia,
        fields: expanded.fields,
        ids: named,
      },
      null,
      2,
    ),
  )}</pre>`
}

function render() {
  rows.innerHTML = frames
    .map((frame, i) => {
      const views = viewsFor(frame)
      const selectedCls =
        i === selected ? 'row-selected' : 'hover:bg-stone-200/70'
      return `
        <li role="option" aria-selected="${i === selected}">
          <button
            type="button"
            data-index="${i}"
            class="flex w-full flex-col gap-1 border-b border-stone-200 px-4 py-3 text-left ${selectedCls}"
          >
            <span class="flex flex-wrap gap-1">${tagsHtml(messageTags(frame))}</span>
            <span class="row-meta font-mono text-[11px]">${escapeHtml(rowLabel(frame))} · ${views.textChars}c</span>
            <span class="row-meta truncate font-mono text-[11px]">${escapeHtml(views.text)}</span>
          </button>
        </li>
      `
    })
    .join('')

  const selectedFrame = frames[selected]!
  const views = viewsFor(selectedFrame)
  hex.innerHTML = `
    <p class="pane-msg break-all font-mono text-sm leading-relaxed">${escapeHtml(views.packedHex)}</p>
    <p class="pane-meta font-mono text-[11px]">${views.packedBytes} bytes</p>
  `
  out.innerHTML = detailHtml(selectedFrame)
}

rows.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest('button[data-index]')
  if (!target) return
  selected = Number((target as HTMLButtonElement).dataset.index)
  render()
})

out.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest('button[data-fat-pull]')
  if (!button) return
  const fingerprint = (button as HTMLButtonElement).dataset.fatPull
  if (!fingerprint) return
  if (!fatPullTip(fingerprint)) return
  render()
})

function previewCompose(text: string): void {
  const trimmed = text.trim()
  if (!trimmed) {
    composerHint.textContent = ''
    return
  }
  const pasted = decodeCompactFrame(trimmed)
  if (pasted) {
    const views = viewsFor(pasted)
    composerHint.textContent = `wire → packed ${views.packedBytes}B`
    return
  }
  const result = composeWords(trimmed, table, labels)
  if (!result.ok) {
    composerHint.textContent = result.reason
    return
  }
  const views = viewsFor(result.frame)
  const names = result.matched.map((m) => m.label).join(', ')
  const extra =
    result.unmatched.length > 0
      ? ` · unused: ${result.unmatched.join(' ')}`
      : ''
  composerHint.textContent = `${names} → ${views.packedBytes}B ${views.packedHex}${extra}`
}

function appendFrame(frame: CompactFrame): void {
  frames.push(frame)
  selected = frames.length - 1
  messageInput.value = ''
  composerHint.textContent = ''
  render()
  rows.querySelector(`button[data-index="${selected}"]`)?.scrollIntoView({
    block: 'nearest',
  })
}

composer.addEventListener('submit', (event) => {
  event.preventDefault()
  const text = messageInput.value.trim()
  if (!text) return

  const pasted = decodeCompactFrame(text)
  if (pasted) {
    appendFrame(pasted)
    return
  }

  const result = composeWords(text, table, labels)
  if (!result.ok) {
    composerHint.textContent = result.reason
    return
  }
  appendFrame(result.frame)
})

messageInput.addEventListener('input', () => {
  previewCompose(messageInput.value)
})

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    composer.requestSubmit()
  }
})

render()
