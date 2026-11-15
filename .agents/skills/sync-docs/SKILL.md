---
name: sync-docs
description: Use when Changicon behavior, storage, messaging, permissions, or the release process changes and docs/architecture.md or docs/release-process.md must be updated with diagrams and release markers.
---

# Sync Changicon documentation

Read the repository [`AGENTS.md`](../../../AGENTS.md) and
[`docs/AGENTS.md`](../../../docs/AGENTS.md), then
[`docs/architecture.md`](../../../docs/architecture.md) and
[`docs/release-process.md`](../../../docs/release-process.md).

## Decide what changed

Use the doc-sync matrix in `docs/release-process.md`:

| Change | Update |
| --- | --- |
| New icon source/picker | Architecture module map + apply flow + store copy + screenshots + README |
| Storage key/migration | Data-model table, precedence/migration diagrams, release-process migration note |
| Scope/precedence | Flows 5.2–5.4, precedence diagram, store copy |
| Permission | Security section, store permissions/privacy, manifest rationale |
| Error/rollback path | Failure table + relevant sequence `alt` blocks |
| Release tooling | release-process checklist and this skill |
| Docs-only | Marker + link check |

## Diagram rules

- Keep Mermaid source inline; GitHub renders it. Do not replace diagrams with a
  screenshot.
- `flowchart` for structure, precedence, migrations, pipelines.
- `sequenceDiagram` for init/apply/reset/messaging, with `alt`/`opt` for
  fallbacks. Number steps with `autonumber`.
- `stateDiagram-v2` for the favicon DOM state machine.
- Quote labels with punctuation; avoid `{}` inside quoted labels (Mermaid may
  parse them as node shapes).
- Name real functions/storage keys in labels when it helps debugging.
- Happy path first, then errors. If a step is deliberate (for example, reset
  sending `clearWebsiteIcon` before removing storage), say why in the prose.

## Steps

1. Update the relevant architecture sections and diagrams. Keep the prose and
   diagram consistent; a diagram that contradicts the code is worse than none.
2. Update the store copy **after** the architecture, so it cannot overpromise.
3. Bump `<!-- release: X.Y.Z -->` in both `docs/architecture.md` and
   `docs/release-process.md` when preparing a release. Only bump after verifying
   the content for that version.
4. Update `docs/release-process.md` if commands, CI, or the store process
   changed.
5. Update `docs/README.md` if the document index or screenshot conventions
   changed.
6. Run:

   ```bash
   pnpm docs:check
   ```

   It validates markers, the changelog entry, asset dimensions/alpha, the built
   manifest version (when present), README screenshots, and relative links. Fix
   every error; do not pass `--force` or edit the checker to hide a stale doc.

## Link hygiene

- Use relative links for repository files; they work on GitHub and in the
  harness.
- Include `#anchor` only when the heading exists. Renaming a heading requires
  updating every link (search the repo for the old anchor).
- Do not link to `.output/`, `.store-demo/`, or local absolute paths.
- Store screenshots are linked from `store/listing.md`; README images use
  `docs/screenshots/`.

## Verification

- `pnpm docs:check` passes.
- Every diagram you changed is still valid Mermaid; preview it in GitHub or an
  IDE if possible.
- The version markers and `CHANGELOG.md` agree.
- No link points to a directory or a missing file.
- The docs do not claim a feature the code does not implement (check the
  Known limitations section when unsure).

## Output

Report the sections/diagrams changed, the marker version, `pnpm docs:check`
result, and any behavior that still needs documentation but could not be
verified.
