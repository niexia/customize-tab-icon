# Changicon — agent instructions

This file is the repository's operating manual for coding agents. It is loaded
automatically from the project root. Nested [`docs/AGENTS.md`](docs/AGENTS.md)
adds documentation-specific rules when you work under `docs/`.

## What this project is

Changicon is a Chrome Manifest V3 extension that replaces the favicon of web
pages with a user-chosen icon (emoji, up to two characters, a Lucide icon, or an
uploaded image) for one page, one subdomain, or a whole site. It is built with **WXT 0.20 +
React 19 + TypeScript + Tailwind 4 + shadcn/Radix**, tested with Vitest, packaged
with pnpm.

- Version: `package.json`; WXT derives the manifest version from it.
- Store: <https://chromewebstore.google.com/detail/changicon/pcnnpfojchdoapfnaanpibdkjbdmglhi>
- Target: Chrome MV3. A Firefox MV2 build exists for local checks but is not the
  published target.

## Commands

Prerequisites: Node 22+ (see `.nvmrc`) and pnpm (pinned in `package.json`).

```bash
pnpm install             # install; postinstall runs wxt prepare
pnpm dev                 # WXT dev server (Chrome)
pnpm build               # production build → .output/chrome-mv3
pnpm zip                 # build + zip → .output/changicon-<version>-chrome.zip
pnpm compile             # tsc --noEmit
pnpm lint                # ESLint
pnpm test                # Vitest (includes docs + agent-config checks)
pnpm check               # compile + lint + test + build
pnpm changelog --minor   # changelogen: bump + prepend CHANGELOG entry
pnpm store:assets        # rebuild + capture store assets and README images
```

`pnpm check` is the definition of done for code changes. It must pass before a
commit that changes runtime behavior.

## Development loop

1. **Load context.** Read [`docs/architecture.md`](docs/architecture.md) before
   changing runtime behavior, storage, messaging, or permissions. Under `docs/`,
   read [`docs/AGENTS.md`](docs/AGENTS.md). Load a task skill only when the task
   matches one (release or store); do not preload every document.
2. **Do what the task requires, and keep it scoped.** Fix the root cause;
   include the migrations, structural changes, tests, and docs the fix actually
   needs. Do not optimize for a small diff at the expense of correctness. Keep
   `lib/icon-key.ts` pure, add Vitest coverage for logic, and preserve the
   messaging/storage contracts. Do not refactor unrelated code or reformat whole
   files.
3. **Sync affected surfaces.** Use the doc-sync matrix in
   [`docs/release-process.md`](docs/release-process.md). Update architecture
   before store copy. Internal refactors and test-only changes do not need
   doc churn.
4. **Prove it.** Run `pnpm check`; for content-script, favicon-DOM, or manifest
   changes, also run the manual smoke test below and inspect the built
   `.output/chrome-mv3/manifest.json` when permissions changed.
5. **Report.** Summarize what changed, what was verified, and any remaining
   risk. Leave changes uncommitted by default; commit only when the user asks.
   Never tag, push, or publish without an explicit request.

Release is a separate, opt-in workflow; see [Release](#release).

## Non-negotiable invariants

1. **No network access in the extension.** Icons are generated locally as data
   URLs. Do not add remote fonts, CDNs, analytics, or API calls.
2. **No remote code.** No remote scripts, WebAssembly, `eval`, or dynamic code
   loading. MV3 review rejects it.
3. **No background service worker** unless a requirement truly cannot be met
   from the popup/content script. The current design is popup-driven with a
   `chrome.scripting.executeScript` fallback for pre-existing tabs.
4. **Storage keys are a contract.** Keys are shared by the popup and every
   content script. Adding, renaming, or changing the shape of a key requires a
   migration with an idempotent marker; never silently break existing icons.
5. **Narrower scope beats wider.** `getEffectiveIcon` must keep page > host >
   site; reset removes only the effective scope and reveals the next broader
   icon.
6. **Restore, don't delete.** On pages without a `<link rel="icon">`, keep the
   `#changicon-favicon` link on reset and point it at the original URL. Removing
   it makes Chrome keep the custom image.
7. **Site scope is the registrable domain**, not the exact host. The suffix list
   in `lib/icon-key.ts` is deliberate; update tests with it. Host scope keys on
   the exact hostname (including the port). Applying a wider scope must remove
   the narrower icons it would shadow, including a same-hostname host entry on
   an apex domain. Wider apply/reset must also push to already-open matching
   tabs; storage watchers alone miss tabs loaded before install/update.
8. **Permissions are reviewed.** Do not add, remove, or widen a permission
   without an explicit request. Update `docs/architecture.md`,
   `store/README.md` permission answers, and `docs/privacy.md` in the same
   change.
9. **No tracking.** No analytics, telemetry, crash reporting, ads, or data sale.
10. **Every release updates docs.** `docs/architecture.md`,
    `docs/release-process.md`, and `store/README.md` carry a
    `<!-- release: X.Y.Z -->` marker; the changelog must have the matching entry.
    The release-docs test in `pnpm test` enforces all three.

## Where things live

| Path | Role |
| --- | --- |
| `entrypoints/popup/App.tsx` | Active-tab load, apply/reset/clear orchestration, open-tab sync |
| `entrypoints/content.ts` | Content script: migrations, initial apply, watchers, observer, SPA handling |
| `lib/icons.ts` | Storage CRUD, precedence, migrations, watchers |
| `lib/favicon-dom.ts` | `setFavicon` / `clearFavicon` and original-attribute capture |
| `lib/icon-key.ts` | Pure URL/key/site-domain helpers (tested) |
| `lib/icon-image.ts` | Canvas/SVG generation and upload resizing |
| `lib/messaging.ts` | Typed popup ↔ content protocol |
| `components/` | Popup UI, providers, pickers |
| `docs/` | Architecture, release process, privacy policy, agent docs |
| `store/` | Chrome Web Store copy, permission answers, exact-size assets |
| `scripts/` | Release-docs test and the store screenshot harness |
| `.agents/skills/` | On-demand agent skills |
| `.github/workflows/` | CI and tag-triggered release |

## Working rules

### Code

- Keep `lib/icon-key.ts` free of browser/storage imports; it is unit-tested.
- Add or update a Vitest test for pure logic changes (`lib/*.test.ts`).
- For UI changes, verify the popup at its real width (320 px) in both themes.
  The store harness is the fastest way to see it without loading the extension.
- Preserve the typed messaging protocol; add a message type rather than
  bypassing `lib/messaging.ts`.
- Permission and content-script match changes are covered by invariant 8; do not
  bundle them into unrelated work.

### Docs

- Read [`docs/AGENTS.md`](docs/AGENTS.md) and follow its diagram conventions.
- Update the architecture **before** the store copy so the listing never promises
  behavior that does not exist.
- Bump release markers only when preparing a release, after reviewing the
  document content. Keep diagrams as editable Mermaid source.
- The release-docs test checks markers, the changelog entry, asset dimensions,
  relative links, and agent skill frontmatter.

### Store assets

- Run `pnpm store:assets`; do not hand-edit generated PNGs. The script rebuilds
  the popup, captures it with a mock `chrome.*` environment, and writes
  `store/assets/` plus `docs/screenshots/`.
- Regenerate when the popup UI or a user-visible flow changed, and review all
  five screenshots and both promo tiles.
- Exact asset rules live in [`store/README.md`](store/README.md) and the
  `store-listing` skill; the release-docs test enforces the sizes and opacity.

## Verification

| Change | Minimum verification |
| --- | --- |
| Pure helper / storage key | `pnpm test` + `pnpm compile` |
| Popup UI | `pnpm check` + screenshot review (`pnpm store:assets`) |
| Content script / favicon DOM | `pnpm test` + manual smoke test, including pre-opened tabs |
| Permissions / manifest | `pnpm build`, inspect `.output/chrome-mv3/manifest.json`, update architecture + store/README + docs/privacy |
| Docs only | `pnpm test` (or `pnpm exec vitest run scripts/release-docs.test.ts`) |
| Release | `pnpm check`, zip smoke test, dashboard preview |

Manual smoke test (load `.output/chrome-mv3` unpacked):

1. Apply an emoji to a page; reload; the icon persists.
2. Reset; the original favicon returns without a reload.
3. Open a second path and a subdomain of the same site in separate tabs
   **before** applying a whole-site icon; apply on one tab; both update without
   reloading; Reset site restores both.
4. Apply a **This subdomain** icon on a subdomain: the sibling subdomain and the
   apex keep their own icons, and Reset subdomain reveals the site icon when one
   exists. On `localhost`/an IP the site option is hidden and the label reads
   This server.
5. Clear all; tabs with the current content script return to their own icons. A
   tab loaded before the extension update may need one reload.
6. Check the popup and page consoles for errors; the extension should make no
   network requests.

## Release

Full runbook: [`docs/release-process.md`](docs/release-process.md) and the
`release-chrome-extension` skill. Short rules:

- Prepare a release only when asked. Preparing files is not permission to tag,
  push, or upload to the Chrome Web Store.
- A `vX.Y.Z` tag triggers `.github/workflows/release.yml` (checks, zip, GitHub
  Release). Chrome Web Store upload is manual: WXT 0.20's `wxt submit` uses the
  retired API v1; do not run it and claim success.
- The store version must increase. Never hand-edit the built manifest.
- Changelogen uses the latest git tag as its range. If no tag exists yet, tag the
  current release before generating the next changelog entry; otherwise it
  covers the whole history.

## Commit and PR style

- Leave changes uncommitted by default. Commit only when the user asks.
- When committing, use Conventional Commits (`feat(scope): ...`,
  `fix(scope): ...`, `docs: ...`, `chore: ...`) and one logical change per
  commit. The changelog generator only reads `feat`, `fix`, `perf`, and
  `refactor`; use the right type for user-visible work.
- Include docs/store updates in the same commit as the behavior change when
  practical. If user-visible behavior, a permission, or a storage/messaging
  contract changed, the matching docs update is part of done; internal
  refactors and tests do not require doc churn.
- Do not commit `.output/`, `.store-demo/`, `node_modules/`, or secrets.
  `.env.submit` is gitignored for future store credentials.

## Agent skills

Skills are discovered from `.agents/skills/<name>/SKILL.md` and loaded on
demand. Use:

| Skill | Use for |
| --- | --- |
| `release-chrome-extension` | Version bump, changelog, docs sync, zip, tag, GitHub release, store submission |
| `store-listing` | Store copy, permission answers, screenshots/promo, submission checks |

Documentation work uses [`docs/AGENTS.md`](docs/AGENTS.md) and the doc-sync
matrix in the release process; there is no separate docs skill.

If a skill and this file disagree, the skill is more specific for its task; if
either disagrees with the code or the Chrome Web Store policy, verify and update
the documentation rather than following it blindly.

## Known constraints

- Content scripts run on `http(s)` top frames only; `chrome://`, extension pages,
  and the Chrome Web Store cannot be customized.
- The extension requests `*://*/*` host access so whole-site changes can sync
  already-open tabs. Its content scripts already run on all sites.
- `chrome.storage.local` is 10 MB; icons are data URLs. Do not store full images
  or per-pixel data beyond the 128 px icon.
- There is no cross-device sync (`storage.local`, not `storage.sync`).
- The registrable-domain helper uses a bundled subset of multi-level suffixes,
  not the full Public Suffix List.
- The popup closes when it loses focus; keep async work short and user-triggered.
