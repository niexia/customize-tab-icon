# Changicon — agent instructions

This file is the repository's operating manual for coding agents. It is loaded
automatically from the project root. Nested [`docs/AGENTS.md`](docs/AGENTS.md)
adds documentation-specific rules when you work under `docs/`.

## What this project is

Changicon is a Chrome Manifest V3 extension that replaces the favicon of web
pages with a user-chosen icon (emoji, up to two characters, a Lucide icon, or an
uploaded image) for one page or a whole site. It is built with **WXT 0.20 +
React 19 + TypeScript + Tailwind 4 + shadcn/Radix**, tested with Vitest, packaged
with pnpm.

- Current version: **1.1.0** (`package.json`; the manifest version is derived).
- Store: <https://chromewebstore.google.com/detail/changicon/pcnnpfojchdoapfnaanpibdkjbdmglhi>
- Target: Chrome MV3. A Firefox MV2 build exists for local checks but is not the
  published target.

## First steps

1. Read this file and, for documentation work, [`docs/AGENTS.md`](docs/AGENTS.md).
2. Read [`docs/architecture.md`](docs/architecture.md) before changing runtime
   behavior, storage, messaging, or permissions.
3. Load the relevant skill from `.agents/skills/` **before** starting:
   - release work → `release-chrome-extension`
   - store copy/assets → `store-listing`
   - architecture/docs → `sync-docs`
4. Prefer the smallest change that satisfies the request. Do not refactor
   unrelated code or reformat whole files.

## Commands

Prerequisites: Node 22+ (see `.nvmrc`) and pnpm (pinned in `package.json`).

```bash
pnpm install             # install; postinstall runs wxt prepare
pnpm dev                 # WXT dev server (Chrome)
pnpm build               # production build → .output/chrome-mv3
pnpm zip                 # build + zip → .output/changicon-<version>-chrome.zip
pnpm compile             # tsc --noEmit
pnpm lint                # ESLint
pnpm test                # Vitest
pnpm check               # compile + lint + test + build
pnpm changelog --minor   # changelogen: bump + prepend CHANGELOG entry
pnpm store:assets        # rebuild + capture store assets and README images
```

`pnpm check` is the definition of done for code changes. It must pass before a
commit that changes runtime behavior.

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
5. **Page icon beats site icon.** `getEffectiveIcon` must keep this order; reset
   must reveal the site icon when one exists.
6. **Restore, don't delete.** On pages without a `<link rel="icon">`, keep the
   `#changicon-favicon` link on reset and point it at the original URL. Removing
   it makes Chrome keep the custom image.
7. **Site scope is the registrable domain**, not the exact host. The suffix list
   in `lib/icon-key.ts` is deliberate; update tests with it.
8. **Permissions are reviewed.** Do not add a permission without updating the
   permission justifications and privacy policy in `store/README.md` and the
   manifest rationale.
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
| `docs/` | Architecture, release process, agent docs |
| `store/` | Chrome Web Store copy and exact-size assets |
| `scripts/` | Release-docs test and the store screenshot harness |
| `.agents/skills/` | Auto-discovered agent skills |
| `.github/workflows/` | CI and tag-triggered release |

## Making changes

### Code

- Keep `lib/icon-key.ts` free of browser/storage imports; it is unit-tested.
- Add or update a Vitest test for pure logic changes (`lib/*.test.ts`).
- For UI changes, verify the popup at its real width (320 px) in both themes.
  The store harness is the fastest way to see it without loading the extension.
- Preserve the typed messaging protocol; add a message type rather than
  bypassing `lib/messaging.ts`.
- Do not change `wxt.config.ts` permissions or the content-script match without
  an explicit request and the permission/privacy updates in `store/README.md`.

### Docs

- Read [`docs/AGENTS.md`](docs/AGENTS.md) and follow its diagram conventions.
- Update the architecture **before** the store copy so the listing never
  promises behavior that does not exist.
- Bump the release markers only when preparing a release, after reviewing the
  document content.

### Store assets

- Run `pnpm store:assets`; do not hand-edit screenshots.
- The five screenshots must be 1280×800, opaque PNGs. The promo tiles are
  440×280 and 1400×560. The release-docs test verifies dimensions and alpha.
- The native `<input type="file">` follows the host OS language; keep English
  screenshots on an English-locale machine or use the text-badge shot. Do not
  retouch the control.

## Release protocol

Full detail: [`docs/release-process.md`](docs/release-process.md). Short form:

```bash
pnpm changelog --minor                         # or without a flag to infer semver
# changelogen updates package.json + CHANGELOG.md; it does not tag or push
# update docs markers + diagrams + store copy/assets
pnpm check
pnpm zip
git add -A
git commit -m "chore(release): vX.Y.Z"
git tag vX.Y.Z
git push origin main --follow-tags
```

- Tags trigger `.github/workflows/release.yml`, which runs checks, zips, and
  creates the GitHub Release with the zip attached.
- **Do not push a tag or publish to the Chrome Web Store without an explicit
  user request.** Preparing a release (version, changelog, docs, zip) is not
  permission to publish it.
- Chrome Web Store submission is **manual** in 2026: the API v1.1 path used by
  WXT 0.20's `wxt submit` was retired on 2026-10-15. Upload the zip in the
  Developer Dashboard. API v2 automation requires WXT ≥ 0.21.5, Node 22, and a
  service account; document it, do not pretend it works today.
- The store version must increase; never re-upload an older version or edit the
  built manifest by hand.

## Verification expectations

| Change | Minimum verification |
| --- | --- |
| Pure helper / storage key | `pnpm test` + `pnpm compile` |
| Popup UI | `pnpm check` + screenshot review (`pnpm store:assets`) |
| Content script / favicon DOM | `pnpm test` + manual check on a real page: apply, reload, reset |
| Permissions / manifest | `pnpm build`, inspect `.output/chrome-mv3/manifest.json`, update store docs |
| Docs only | `pnpm test` (or `pnpm exec vitest run scripts/release-docs.test.ts`) |
| Release | `pnpm check`, zip smoke test, dashboard preview |

Manual smoke test (load `.output/chrome-mv3` unpacked):

1. Apply an emoji to a page; reload; the icon persists.
2. Reset; the original favicon returns without a reload.
3. Apply a whole-site icon; open a second path and a subdomain; the icon applies.
4. Clear all; all tabs return to their own icons.
5. Check the service worker/console for errors; there should be no network
   requests from the extension.

## Commit and PR style

- Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `docs: ...`,
  `chore: ...`. The changelog generator only reads `feat`, `fix`, `perf`, and
  `refactor`; use the right type for user-visible work.
- One logical change per commit. Include docs/store updates in the same commit as
  the behavior change when practical.
- Do not commit `.output/`, `.store-demo/`, `node_modules/`, or secrets.
  `.env.submit` is gitignored for future store credentials.
- A commit that changes behavior without a docs update should be treated as
  incomplete, even if CI passes (the marker only protects releases).

## Agent skills

Skills are auto-discovered from `.agents/skills/<name>/SKILL.md` (DSH and
compatible harnesses). The root `AGENTS.md` is auto-loaded; skills are loaded on
demand. Use the skill catalog when the task matches one of:

| Skill | Use for |
| --- | --- |
| `release-chrome-extension` | Version bump, changelog, docs sync, zip, tag, GitHub release, store submission |
| `store-listing` | Store copy, permissions/privacy answers, screenshot/promo regeneration |
| `sync-docs` | Architecture diagrams, docs markers, doc-sync matrix |

If a skill and this file disagree, the skill is more specific for its task; if
either disagrees with the code or the Chrome Web Store policy, verify and update
the documentation rather than following it blindly.

## Known constraints

- Content scripts run on `http(s)` top frames only; `chrome://`, extension pages,
  and the Chrome Web Store cannot be customized.
- `chrome.storage.local` is 10 MB; icons are data URLs. Do not store full images
  or per-pixel data beyond the 128 px icon.
- There is no cross-device sync (`storage.local`, not `storage.sync`).
- The registrable-domain helper uses a bundled subset of multi-level suffixes,
  not the full Public Suffix List.
- The popup closes when it loses focus; keep async work short and user-triggered.
