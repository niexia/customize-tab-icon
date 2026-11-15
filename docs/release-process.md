# Release process

<!-- release: 1.1.0 -->

This is the checklist for shipping a Changicon version. It covers the changelog,
documentation, store assets, the GitHub release, and Chrome Web Store submission.

- Applies to: **v1.1.0**
- Related: [Architecture](architecture.md) · [Store kit](../store/README.md) · [AGENTS.md](../AGENTS.md)

---

## 1. Versioning and commit messages

Changicon follows [Semantic Versioning](https://semver.org/):

| Change | Bump | Example |
| --- | --- | --- |
| New user-visible capability | minor | `feat: apply an icon to a whole site` |
| Backward-compatible fix | patch | `fix: keep the original favicon on reset` |
| Breaking storage/behavior change | major | `feat!: replace per-host site icons with registrable domains` |

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional BREAKING CHANGE: description]
```

Types used by the changelog generator: `feat`, `fix`, `perf`, `refactor`.
`docs`, `test`, `build`, `ci`, `chore`, and `style` are allowed but do not appear
in release notes. A `!` after the type/scope or a `BREAKING CHANGE:` footer puts
the commit in the breaking-changes section.

Examples from this repository:

- `feat: add support for applying icons to whole sites and subdomains`
- `fix(icon-display): retry a failed icon URL`
- `feat!: move site icons to registrable domains`

---

## 2. Changelog

`CHANGELOG.md` is generated from the commit range with a zero-dependency script,
so it works locally and in CI without network access.

### Generate the next entry

```bash
# 1. Bump the package version (WXT copies it into the manifest).
pnpm version minor --no-git-tag-version

# 2. Generate the entry. With tags present, --from defaults to the latest tag.
pnpm changelog --version 1.1.0 --from v1.0.1 --write

# 3. Review the entry; curate wording and group related commits if needed.
```

Useful flags:

| Flag | Meaning |
| --- | --- |
| `--version <semver>` | Version heading (defaults to `package.json`) |
| `--from <ref>` | Start of the range (defaults to the latest tag, else the first commit) |
| `--to <ref>` | End of the range (defaults to `HEAD`) |
| `--date <YYYY-MM-DD>` | Override the entry date |
| `--write` | Write `CHANGELOG.md` (otherwise print to stdout) |
| `--force` | Replace an existing entry for the version |
| `--output <file>` | Use another changelog file |

The generated format is Keep a Changelog:

```markdown
## [1.1.0] - 2026-11-15

### Features

- **Whole-site icons:** one icon for every page on a domain, including subdomains. ([430477e](https://github.com/niexia/customize-tab-icon/commit/430477e))
```

The first release had no tags, so v1.1.0 was generated from the last published
version commit:

```bash
pnpm changelog --version 1.1.0 --from 41b81a2 --write
```

### Optional: changelogen instead

If you prefer the unjs tool (it can also tag and create GitHub releases), swap
the script for `changelogen` without changing the commit convention:

```bash
pnpm add -D changelogen
pnpm changelogen --bump                 # bump + prepend CHANGELOG.md
pnpm changelogen --bump --minor         # force the bump
pnpm changelogen --output CHANGELOG.md  # changelog only
```

`pnpm changelogen --bump` does not need a GitHub token; creating a GitHub
release does. See the [changelogen README](https://github.com/unjs/changelogen).

The repository script is intentionally small and dependency-free so CI and
offline agents can regenerate notes deterministically.

---

## 3. Documentation update

`pnpm docs:check` fails the build when the docs marker or changelog no longer
matches `package.json`. It also validates that every store asset exists at the
required size.

At minimum, every release updates:

1. **`CHANGELOG.md`** — the new version heading.
2. **`docs/architecture.md`** — the `<!-- release: X.Y.Z -->` marker, and any
   diagram/flow affected by the change.
3. **`docs/release-process.md`** — this marker and any process change.
4. **`store/listing.md`** — the version line and feature copy if behavior changed.
5. **`store/assets/`** and **`docs/screenshots/`** — regenerate when the popup UI
   or a user-visible flow changed.
6. **`README.md`** — features, screenshots, or links if the user-facing story
   changed.

### Doc sync matrix

| Change | Architecture | Release process | Store listing | Screenshots | README |
| --- | --- | --- | --- | --- | --- |
| New icon source / picker | update flow + module map | — | feature bullet | regenerate | feature bullet |
| Storage key or migration | update data model + migration diagram | note migration | — | — | — |
| Scope/precedence behavior | update flows + precedence | — | feature bullet | regenerate | feature bullet |
| Permission added/removed | permissions section | — | privacy practices | — | permissions |
| New error/rollback path | failure table | — | — | — | — |
| Release tooling only | — | update checklist | — | — | development section |

Update the architecture **before** the store text, so the listing never promises
behavior the code does not have.

---

## 4. Checks

```bash
pnpm install --frozen-lockfile
pnpm check            # compile, lint, test, build, docs:check
pnpm store:assets     # optional; only when the UI changed
```

`pnpm check` expands to `pnpm compile && pnpm lint && pnpm test && pnpm build &&
pnpm docs:check`. The store asset script requires a local Chrome/Chromium (or
`CHROME_PATH`); it is not part of CI because the generated PNGs are committed.

Before tagging, confirm:

- [ ] `package.json` version is the version you intend to publish.
- [ ] `.output/chrome-mv3/manifest.json` shows the same version.
- [ ] The changelog entry is reviewed and contains no accidental `chore` noise.
- [ ] The architecture marker is updated and diagrams still match the code.
- [ ] Store screenshots are current and exactly 1280×800.
- [ ] The privacy policy is live at the URL in `store/listing.md`.
- [ ] The permission justifications still match the manifest.

---

## 5. Build the archive

```bash
pnpm zip
ls -lh .output/*-chrome.zip
```

`wxt zip` builds production output again and writes
`.output/changicon-<version>-chrome.zip`. Do not hand-edit the built manifest;
the version comes from `package.json`.

The archive contains the compiled popup, content script, icons, and manifest.
There are no `node_modules`, source maps are excluded by the WXT production
build, and no remote code is bundled.

---

## 6. Tag and GitHub release

```bash
git add -A
git commit -m "chore(release): v1.1.0"
git tag v1.1.0
git push origin main --follow-tags
```

The tag triggers [`.github/workflows/release.yml`](../.github/workflows/release.yml):

1. checkout with full history and tags;
2. pnpm + Node from `.nvmrc`;
3. `pnpm install --frozen-lockfile`;
4. `pnpm compile`, `pnpm lint`, `pnpm test`, `pnpm docs:check`;
5. `pnpm zip`;
6. extract the `## [X.Y.Z]` section from `CHANGELOG.md`;
7. create the GitHub Release and attach `*-chrome.zip`.

The workflow needs only the default `GITHUB_TOKEN` with `contents: write`.

### Verify the release

- [ ] GitHub Release exists for `vX.Y.Z` and has the zip attached.
- [ ] The release body matches the changelog entry.
- [ ] The downloaded zip reports the expected `manifest.json` version.
- [ ] CI on `main` is green.

---

## 7. Chrome Web Store submission

### Current process (manual, 2026)

The Chrome Web Store API v1.1 used by WXT 0.20's `wxt submit` was retired on
**2026-10-15**. Until the toolchain is upgraded, upload manually:

1. Open the [Developer Dashboard](https://chrome.google.com/webstore/devconsole),
   select Changicon, and choose **Package → Upload new package**.
2. Upload `.output/changicon-<version>-chrome.zip`.
3. Update **Store listing** from `store/listing.md` (copy and assets from
   `store/assets/`). Screenshots: 5 × 1280×800; small promo tile 440×280;
   marquee 1400×560; store icon 128×128.
4. Update **Privacy practices** from `store/permissions.md`:
   single purpose, each permission justification, data usage, remote code = No.
5. Confirm the **Privacy policy URL** is live (`store/privacy.md`).
6. **Test instructions** from `store/review-notes.md` (optional but useful for a
   broad host permission).
7. **Distribution**: Public, all regions (or the regions you intend).
8. Submit for review. Deferred publishing is available if you want to review the
   result first; a deferred submission expires after 30 days.

Review usually takes a few days and can take weeks for new items or broad host
permissions. Do not resubmit duplicate packages while a review is pending.

### Future: API v2 automation

WXT ≥ 0.21.5 uses `publish-browser-extension` v6 and supports the Chrome Web
Store **API v2** with a service account. Node 22 is already the project baseline; the upgrade also needs a fresh
`wxt submit init` that writes `CHROME_API_VERSION=v2`.
The eventual workflow is:

```bash
pnpm wxt submit --chrome-zip .output/changicon-<version>-chrome.zip
```

with repository secrets:

- `CHROME_EXTENSION_ID`
- `CHROME_PUBLISHER_ID`
- `CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL`
- `CHROME_SERVICE_ACCOUNT_PRIVATE_KEY` (PEM with real newlines)

Until that migration lands, keep the workflow's store step manual. See
[Chrome Web Store service accounts](https://developer.chrome.com/docs/webstore/service-accounts) and
[publish-browser-extension config](https://github.com/aklinker1/publish-browser-extension/blob/main/docs/config-reference.md).

---

## 8. Post-release

- [ ] Smoke-test the store-installed build on a clean Chrome profile.
- [ ] Verify an icon applies, survives reload, and resets to the original.
- [ ] Verify whole-site applies across two subdomains.
- [ ] Verify the store listing renders the screenshots and description.
- [ ] Announce in the README/issue if the release changes behavior.

### Patch / rollback

Chrome Web Store versions must increase; you cannot re-upload an older version.
Rollback means shipping a new patch that restores the previous behavior:

1. Revert the offending commit on `main`.
2. Bump the patch version, add a changelog entry, run `pnpm check`.
3. Tag and publish a new package.

If the extension is broken at runtime, the fastest mitigation is to publish a
patch that removes the new behavior; Chrome will update installed users on the
next check. Content scripts from the previous version can remain in already-open
tabs until reload, which the popup's injection fallback tolerates.

---

## 9. Version-specific notes

### v1.1.0 (2026-11-15)

- Adds whole-site icons (registrable domain), icon background preference,
  image fit (cover/contain), original-favicon preservation, and popup height
  management.
- First release with generated store assets, a changelog, architecture docs,
  and agent release automation.
- Chrome Web Store API v1.1 is already retired; submission is manual.
