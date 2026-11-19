# `@local-hosting/frames`

CompactFrame codecs: encode/decode frames, expand codes ↔ ids via a shared symbol table. Compose sits upstream (`spatial-ai → local-ai → compose → frames`).

The full table syncs on the **fat** pipe. Thin frames carry a **content fingerprint tip** + codes.

Link budgets and bearer profiles live in **`@local-hosting/comms`**; call `planFrame` / `forLink` before thin encode when size matters.

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
import { planFrame, forLink } from '@local-hosting/frames/link'
// or codecs only:
import { expandCompactFrame } from '@local-hosting/frames/core'
```

## Commands

```bash
yarn workspace @local-hosting/frames typecheck
yarn workspace @local-hosting/frames test
yarn workspace @local-hosting/frames build
yarn workspace @local-hosting/frames dev
```