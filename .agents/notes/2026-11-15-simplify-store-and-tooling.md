# 2026-11-15 — simplify the store kit and release tooling

- **Status:** implemented
- **Supersedes:** [release, store, and documentation pipeline](2026-11-15-release-and-store-pipeline.md)
- **Context:** The first pass split the store kit across seven Markdown files and
  added two custom scripts (`changelog.mjs`, `docs-check.mjs`). The assets and
  the screenshot harness were fine, but the documentation and tooling were more
  than a solo extension needs. Feedback: one store document, and prefer existing
  open-source tooling where possible.

## Decisions

### 1. One store document

All publishing information lives in [`store/README.md`](../../store/README.md):
listing copy, asset map, single purpose, permission justifications, data usage,
reviewer steps, checklist, promo-video notes, and the public privacy policy.
`store/assets/` remains the only other store content.

The privacy policy URL is now
`https://github.com/niexia/customize-tab-icon/blob/main/store/README.md#privacy-policy`.
The `Privacy policy` heading and `#privacy-policy` anchor are part of the
contract; renaming it breaks the dashboard URL. A dedicated page remains an
option if GitHub Pages is enabled later.

Trade-off: the file is longer and mixes marketing/legal content. In exchange,
there is one place to update and no cross-file drift. The release-docs test
asserts that `store/` contains exactly one Markdown file, so a second kit file
cannot appear by accident.

### 2. Changelog uses changelogen

The custom `scripts/changelog.mjs` is gone. `changelogen` (dev dependency)
generates the changelog from Conventional Commits and bumps the package:

```bash
pnpm exec changelogen   # preview
pnpm changelog --minor  # changelogen --bump --minor
```

[`changelog.config.json`](../../changelog.config.json) keeps Features, Bug Fixes,
Performance, and Refactoring; hides docs/chore/CI/build/test/style; and omits
authors. The generated heading is `## X.Y.Z`, while the curated 1.1.0 entry uses
`## [1.1.0] - date`; the release-docs test and the release workflow accept both.

Caveat: changelogen uses the latest tag as its range. There are no tags yet, so
`v1.1.0` must be tagged before the next changelog run; otherwise it would cover
the whole history and duplicate the curated entry.

### 3. Release checks run in Vitest, not a second script

`scripts/docs-check.mjs` and the `docs:check` package script are gone. The checks
live in [`scripts/release-docs.test.ts`](../../scripts/release-docs.test.ts) and
run with the normal test suite:

- required docs and release markers (`architecture`, `release-process`, store
  README) match `package.json`;
- `CHANGELOG.md` has the version heading (both styles);
- exactly five 1280×800 opaque screenshots, plus promo/icon sizes;
- `store/` has exactly one Markdown file;
- the privacy anchor exists;
- README has a product screenshot;
- relative links in the docs/store resolve.

`pnpm check` is now compile + lint + test + build, and CI/release run the same
test suite. One fewer script, one fewer package script, and the checks run in the
fast local loop.

### 4. Keep the screenshot harness isolated

`scripts/store/build-assets.mjs` plus the mock/scenario files stay. Generating
real screenshots requires a browser and a mock `chrome.*` environment; there is
no open-source package that does this for the popup specifically. The harness is
optional, writes only `store/assets/` and `docs/screenshots/`, and is not part of
CI.

## Consequences

- Store updates are one file plus assets; fewer chances to leave stale copy.
- Changelog generation uses a maintained package and the standard Conventional
  Commits flow.
- The release gate is the existing test runner; no custom CLI, no extra `check`
  stage.
- The privacy policy is inside the store README rather than a dedicated page.

## Follow-ups

1. Tag `v1.1.0` before the next release so changelogen has a range baseline.
2. If reviewers prefer a standalone policy page, enable GitHub Pages and move the
   `Privacy policy` section to a dedicated page, then update the URL.
3. Evaluate whether the screenshot harness can shrink further; it remains the
   only custom script and is not needed for normal development.
4. Keep the action versions and the WXT/API v2 migration under review.
