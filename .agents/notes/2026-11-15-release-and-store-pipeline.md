# 2026-11-15 — release, store, and documentation pipeline

- **Status:** superseded by [2026-11-15 simplify the store kit and tooling](2026-11-15-simplify-store-and-tooling.md)

> The store kit is now a single `store/README.md`; changelog generation uses
> `changelogen`; the docs checks run in Vitest instead of `scripts/docs-check.mjs`.
> This note is kept as the original design record.
- **Context:** v1.1.0 adds whole-site icons, icon backgrounds, image fit, and
  original-favicon preservation. The Chrome Web Store listing still had no
  stored assets in the repo, no changelog, and the only architecture diagram
  (`docs/flow.excalidraw.png`) predates domain scope, migrations, and the
  background/fit features. There was no repeatable way to keep the listing and
  docs in sync.

## Decisions

### 1. Documentation is a release gate, not a best effort

`docs/architecture.md` and `docs/release-process.md` carry
`<!-- release: X.Y.Z -->`. `scripts/docs-check.mjs` compares it with
`package.json`, checks the changelog heading, validates every store asset's
dimensions and alpha channel, verifies README screenshots exist, and checks
relative links. It runs in `pnpm check` and in CI.

Trade-off: a release can fail on a marker even when the architecture did not
change. That is intentional — it forces a human/agent to look at the diagrams and
confirm them rather than letting docs rot. The marker is bumped only after the
content is reviewed.

### 2. A zero-dependency changelog generator

`scripts/changelog.mjs` parses Conventional Commits and writes Keep a Changelog
entries with commit links. It only includes `feat`, `fix`, `perf`, and `refactor`
so release notes stay user-facing. It works offline and needs no GitHub token.

Alternatives considered:

- **changelogen** — better polished output and can tag/create releases, but adds
  a dependency and its GitHub-release path needs a token. The commands remain
  documented in `docs/release-process.md` for teams that prefer it.
- **conventional-changelog-cli** — generates notes but does not bump versions,
  and needs an extra preset package.
- **release-please** — excellent for PR-based automation, but heavyweight for a
  single-maintainer extension and its default `GITHUB_TOKEN` releases do not
  trigger tag workflows.

The commit range for the first entry was explicit (`--from 41b81a2`) because the
repository had no tags.

### 3. Manual Chrome Web Store submission for now

WXT 0.20.27 bundles `publish-browser-extension` 4.0.5, which uses the CWS API
v1.1 upload endpoint. Google retired that API on 2026-10-15 (the library itself
marks it deprecated). WXT ≥ 0.21.5 + Node 22 + a service account is the v2 path,
but that is a toolchain upgrade with its own risk. The release workflow therefore
stops at the GitHub Release; store submission is documented as a manual
dashboard step. Do not add a `wxt submit` step that silently fails.

### 4. Screenshots come from the real popup, composed around a browser mock

`scripts/store/build-assets.mjs` copies the built extension, injects a minimal
`chrome.*` mock and a scenario driver, serves it on localhost, and captures the
real popup with headless Chrome. The five 1280×800 frames are composed in HTML
with a browser-window mock; no UI is reimplemented. The mock is development-only.

Why not use the existing `docs/design.png` / `showcase.png`? They are high quality
but show an older UI and cannot be regenerated per release. Fresh captures also
let the screenshots show the actual store-ready text and scope settings.

Known caveat: the native file input follows the host OS language. The upload
screenshot is generated for localized listings but is not one of the five English
store screenshots; the text-badge flow is used instead. The alternative — editing
the control after capture — would misrepresent the UI.

### 5. Store assets are committed

The five screenshots, promo tiles, icon, and README captures are checked in.
Reviewers and future agents can audit the exact listing without a browser, and
the release workflow does not need a screenshot step. `docs:check` guards their
dimensions and alpha channels; the regeneration command is documented.

### 6. `.agents/skills` + `AGENTS.md` + scripts

- `AGENTS.md` is the portable, auto-loaded contract (commands, invariants,
  release protocol, verification).
- `docs/AGENTS.md` adds documentation rules when work enters `docs/`.
- `.agents/skills/{release-chrome-extension,store-listing,sync-docs}` are
  auto-discovered by DSH (rank 200) and loaded on demand for procedural work.
- `scripts/` and CI are the deterministic enforcement; a skill is guidance and
  must not be the only place a rule exists.
- `.agents/notes/` (this file) is a design record, not auto-loaded.

## Consequences

- A release now touches docs, changelog, assets, store copy, and code in one
  reviewable commit. The checklist is longer, but the store and repository cannot
  silently diverge.
- The first changelog entry is generated from a commit range, not a tag; future
  releases can use the tag default.
- The store upload remains a human action until the WXT/API v2 migration.
- The screenshot harness depends on a local Chrome and a macOS/Linux machine; the
  committed assets mean CI does not need it.

## Follow-ups

1. **Privacy policy URL:** move from the GitHub blob URL to GitHub Pages (or a
   project site) before submission if possible. Update `store/README.md` and the
   dashboard.
2. **CWS API v2:** upgrade WXT to ≥ 0.21.5 (Node 22 is now the baseline), re-run
   `wxt submit init`, add service-account secrets, and add a gated submit step.
3. **Localization:** decide whether to add a `zh_CN` listing and `_locales/`
   messages; do not ship an English UI with a Chinese listing without saying so.
4. **Screenshot locale:** if an English upload screenshot is needed, capture on
   an English-locale OS or CI browser rather than retouching.
5. **Mermaid rendering:** preview the diagrams on GitHub after the first push;
   the syntax checker in CI does not render them.
6. **Action versions:** the release workflow pins current majors (2026-11-15);
   re-check them when GitHub deprecates Node runtimes.

## Evidence

- `docs/AGENTS.md` was injected into the working session immediately after it was
  written under `docs/`.
- The three new skills appeared in the session skill catalog on the next step
  after `.agents/skills/*/SKILL.md` was written, without a restart.
- `pnpm store:assets` generated 5 × 1280×800 screenshots, 2 promo tiles, and 6
  README captures from the real popup bundle.
