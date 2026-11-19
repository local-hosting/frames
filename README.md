# `@local-hosting/wire`

Thin-pipe frames: codecs encode/decode `CompactFrame`; **expand** turns codes ↔ ids via a shared symbol table. Non-AI text compose + languages: sibling `@local-hosting/compose` (`ai → compose → wire`).

The full table and labels sync on the **fat** pipe. Thin frames carry a **content fingerprint tip** + codes. Same tip id on both pipes — thick moves the table, thin quotes it.

| Path | Role |
|------|------|
| [`src/`](./src) | Library |
| [`apps/demo`](./apps/demo) | Browser demo (compose + wire) |

## Layout (`src/`)

- `expand/` — symbol table, fingerprint, vocab store, crosswalk, expand/compress
- `tune/` — channel agreement (`SYMBOL_BASE`: net + key_epoch + vocab tip); no crypto material
- `frame/` — taxonomy + text decode helper
- `codecs/` — intent, intent-packed, codes, codes-packed, report-create
- `registry/` — packed codecs, packed fields (`band`/`act`/`ok`/`offer`), text codecs
- `link/` — one module per wireless protocol + `optimizeForLink(protocol, bytes)`
- `system.ts` — `createWireSystem(table)` host facade

## Core

- `tuneToCompact` / `checkTune` — radio-style tune before payload (host owns keys)
- `VocabStore` frontier: `expandWithStore` (exact tip → same-lineage superset → migration → `need_heal`)
- `fingerprintEntries` — tip id for fat packs + thin `vocab_base`
- Single-table `expandCompactFrame` still fail-closed on tip mismatch
- Crosswalk: short token ↔ id ↔ uint16
- `CompactFrame` + `WireCodec` / `BinaryCodec`
- Registries (append-only / first-match):
  - `registerPackedCodec(symbol, codec)` — dense layouts (intent is built-in)
  - `setPackedFallback(codec)` — default codes-packed
  - `registerPackedField(name, id)` — numeric thin-pipe fields
  - `registerTextCodec(codec)` — sim/debug envelopes
- `encodePackedBytes` / `decodePackedBytes` / `createWireSystem`

## Usage

```ts
import {
  createVocabSnapshot,
  createVocabStore,
  expandWithStore,
  intentToCompact,
} from '@local-hosting/wire'

const snap = createVocabSnapshot({ lineage: 'community:demo', epoch: 1, entries })
const store = createVocabStore(snap)
const frame = intentToCompact(store.active, { … })
const expanded = expandWithStore(store, frame)
```

Hosts supply their own crosswalk entries and vocab packs — this package has no baked catalog / locker / Loro dependency.

**Taxonomy:** wire is grammar (illocution + coarse referent + channel), not a noun ontology. Referents: `event` / `action` / `place` / `resource` / `actor`. `query` = ask for information; need/offer (“need lodging”) = `report` with `REPORT_DEMAND` / `REPORT_OFFER` + subject code. `rating` = feedback on a proposal; `verify` = approve a specific report/observation. Food/medicine/lodging stay `resource` vocab rows (app/catalog), not new kinds.

**Wire stability:** never reorder `REFERENT_KINDS` or reuse packed field ids; append-only codes within a lineage.

## Publish / heal

Never reuse a `(kind, code)` pair for a different id. Publish with `publishSnapshot` (or check with `assertAppendOnly`) so codes stay append-only within a lineage.

The on-air tip is the content fingerprint from `fingerprintEntries(entries)` (`fp-…`). Human labels like `0.3.0` are display-only — never encode or compare against them.

Push the snapshot body on the fat pipe first so peers can heal, then encode thin frames with the new `active` tip.

When `expandWithStore` returns `need_heal`, park the frame and fat-pull that fingerprint. Do not soft-match tips.

**Link budgets:** each sensors catalog technology slug has its own module under `link/protocols/`. Call `optimizeForLink('lorawan', packedBytes)` before encode — LoRa-class (including bare `lora` / Meshtastic) returns `preferEncode: 'packed'` and `allowFatHeal: false`; `wifi` / `lte-m` / `ethernet` allow fat heal.

If lineages diverge, ship a `VocabMigration` with remaps or tombstones between tips. Do not last-write-wins merge meanings.

Anything that binds a channel or encoder (including LoRa adapters) should key off `vocab_tip` (`fp-…`), not the human label.

## Commands

From the **local-hosting** root:

```bash
yarn install && yarn workspace @local-hosting/wire typecheck && yarn workspace @local-hosting/wire test && yarn workspace @local-hosting/wire build
yarn demo
```
