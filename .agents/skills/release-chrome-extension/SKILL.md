---
name: release-chrome-extension
description: Use when preparing, tagging, or publishing a Changicon release — version bump, changelog, docs sync, store assets, zip, GitHub release, and Chrome Web Store submission.
---

# Release Changicon

Prepare a release end to end, or resume at the step the user asked for. Read the
repository [`AGENTS.md`](../../../AGENTS.md) first, then
[`docs/release-process.md`](../../../docs/release-process.md) and
[`store/checklist.md`](../../../store/checklist.md).

## Preconditions

- The user has **explicitly** asked for a release, tag, or store submission.
  Preparing files is not permission to publish.
- The working tree is clean, or the user accepts that unrelated changes will be
  included in the release commit.
- You know the target version (default: derive from the commits since the last
  tag). The current published baseline is `v1.1.0`; a new tag must be greater.
- Node 22+ and pnpm are available. The Chrome Web Store submission needs a
  browser and dashboard access; the agent may not be able to complete it.

## Steps

### 1. Baseline

```bash
git status --short
git log --oneline "$(git describe --tags --abbrev=0 2>/dev/null || echo HEAD~10)..HEAD"
pnpm install --frozen-lockfile
pnpm check
```

If the baseline fails, fix that first; do not fold unrelated fixes into a release
without saying so.

### 2. Choose the version

- Breaking storage/behavior change → major.
- New user-visible capability → minor.
- Fix / internal only → patch.
- The version must increase; Chrome Web Store rejects a lower version.

```bash
pnpm version <major|minor|patch> --no-git-tag-version
node -p "require('./package.json').version"
```

WXT derives `manifest.version` from `package.json`; never edit the built
manifest.

### 3. Changelog

```bash
# With tags:
pnpm changelog --version X.Y.Z --from "$(git describe --tags --abbrev=0)" --write
# First release / no tags:
pnpm changelog --version X.Y.Z --from <last-published-commit> --write
```

Review `CHANGELOG.md`. Curate wording, merge duplicate themes, and remove
internal-only entries. The generator only includes `feat`, `fix`, `perf`, and
`refactor`; that is intentional. Keep commit links.

If the script cannot see the right range, inspect
`git log --oneline <from>..HEAD` and pass an explicit `--from`.

### 4. Documentation

Follow [`sync-docs`](../sync-docs/SKILL.md):

1. Update `docs/architecture.md` diagrams, tables, and invariants if behavior,
   storage, messaging, or permissions changed.
2. Bump `<!-- release: X.Y.Z -->` in `docs/architecture.md` and
   `docs/release-process.md`.
3. Update `docs/release-process.md` if the process itself changed.
4. Update `store/listing.md` version/features and `README.md` if the user story
   changed.
5. Run `pnpm docs:check`.

Every release needs the markers and changelog; behavior changes also need the
relevant diagrams.

### 5. Store assets (if the UI changed)

```bash
pnpm store:assets
```

Review `store/assets/screenshot-1-hero.png` … `screenshot-5-text.png` (1280×800),
the promo tiles, and the README captures. Regenerate after any popup UI change.
Do not hand-edit images; see [`store-listing`](../store-listing/SKILL.md).

### 6. Verify

```bash
pnpm check          # compile, lint, test, build, docs:check
pnpm zip            # builds again and writes .output/changicon-X.Y.Z-chrome.zip
node -p "require('./.output/chrome-mv3/manifest.json').version"
ls -lh .output/*-chrome.zip
```

Manually smoke-test `.output/chrome-mv3` if the release changes runtime behavior:
apply, reload, reset, whole-site, clear-all, unsupported page. Check the console
for errors and network requests.

### 7. Commit and tag

Only after the user confirms publication:

```bash
git add -A
git commit -m "chore(release): vX.Y.Z"
git tag vX.Y.Z
git push origin main --follow-tags
```

The tag triggers `.github/workflows/release.yml` (checks, zip, GitHub Release).
Verify the workflow and the release asset. Do not create a GitHub Release by hand
with a different body than `CHANGELOG.md`.

### 8. Chrome Web Store

**Manual in 2026.** The v1.1 API used by WXT 0.20's `wxt submit` was retired on
2026-10-15. Do not run `wxt submit` and claim success.

1. Upload `.output/changicon-X.Y.Z-chrome.zip` in the Developer Dashboard.
2. Update the listing from `store/listing.md`; upload the five screenshots, the
   440×280 tile, the 1400×560 marquee, and the 128×128 icon.
3. Fill Privacy practices from `store/permissions.md`; remote code = No; privacy
   policy URL live.
4. Paste `store/review-notes.md` into Test instructions if available.
5. Confirm distribution, submit, and report the review state.

API v2 automation is a separate migration: WXT ≥ 0.21.5, Node 22, service
account, `wxt submit init`. If the user asks for it, treat it as a dependency
upgrade with its own tests, not a release step.

## Guardrails

- Do not publish, tag, or push a release without explicit user permission.
- Do not hand-edit the built manifest, screenshots, or the changelog links.
- Do not add a permission or remote code to make a release "easier".
- Do not lower the version; the store requires an increase.
- Do not skip `pnpm check` or `pnpm docs:check`; both are enforced by CI.
- If a step fails, stop and report the exact command, output, and remaining
  state. Do not tag a partial release.

## Output

Report:

- version and tag;
- changelog entry summary;
- docs updated (paths);
- assets regenerated or unchanged;
- check/zip results and the zip path;
- GitHub Release URL (if pushed);
- Chrome Web Store status (submitted / pending / blocked and why).
