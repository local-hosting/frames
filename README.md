# `@local-hosting/frames`

CompactFrame codecs: encode/decode frames, expand codes ↔ ids via a shared symbol table. Compose sits upstream (`spatial-ai → local-ai → compose → frames`).

The full table syncs on the **fat** pipe. Thin frames carry a **content fingerprint tip** + codes.

**`@local-hosting/comms` is optional** for this package: the default entry and `./core` are codecs only and install without comms. For wire budgets + encode preference, add comms and import **`@local-hosting/frames/link`** (`planFrame`, `forLink`, `preferEncodeFor`, `encodeThinFrame`).

## Browser demo

From repo root: `yarn demo` (runs `yarn workspace @local-hosting/frames dev`).

## Usage

```ts
import {
  createVocabSnapshot,
  createVocabStore,
  expandWithStore,
  intentToCompact,
} from '@local-hosting/frames'
```

```ts
// optional — requires `@local-hosting/comms` alongside frames:
import { planFrame, forLink } from '@local-hosting/frames/link'
```

`@local-hosting/frames` and `@local-hosting/frames/core` resolve to the same `core` module.

## Commands

```bash
yarn workspace @local-hosting/frames typecheck
yarn workspace @local-hosting/frames test
yarn workspace @local-hosting/frames build
yarn workspace @local-hosting/frames dev
```