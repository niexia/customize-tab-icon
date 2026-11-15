---
name: sync-docs
description: Use when Changicon behavior, storage, messaging, permissions, or the release process changes and docs/architecture.md, docs/release-process.md, or store/README.md must be updated with diagrams and release markers.
---

# Sync Changicon documentation

Read the repository [`AGENTS.md`](../../../AGENTS.md) and
[`docs/AGENTS.md`](../../../docs/AGENTS.md), then
[`docs/architecture.md`](../../../docs/architecture.md),
[`docs/release-process.md`](../../../docs/release-process.md), and
[`store/README.md`](../../../store/README.md).

## Decide what changed

Use the doc-sync matrix in `docs/release-process.md`:

| Change | Update |
| --- | --- |
| New icon source/picker | Architecture module map + apply flow + store copy + screenshots + README |
| Storage key/migration | Data-model table, precedence/migration diagrams, release-process migration note |
| Scope/precedence | Flows 5.2–5.4, precedence diagram, store copy |
| Permission | Security section, store permission/privacy sections, manifest rationale |
| Error/rollback path | Failure table + relevant sequence `alt` blocks |
| Release tooling | release-process checklist and this skill |
| Docs-only | Markers + `pnpm test` |

## Diagram rules

- Keep Mermaid source inline; GitHub renders it. Do not replace a diagram with a
  screenshot.
- `flowchart` for structure, precedence, migrations, pipelines.
- `sequenceDiagram` for init/apply/reset/messaging, with `alt`/`opt` for
  fallbacks. Number steps with `autonumber`.
- `stateDiagram-v2` for the favicon DOM state machine.
- Quote labels with punctuation; avoid `{}` inside quoted labels.
- Name real functions/storage keys in labels when it helps debugging.
- Happy path first, then errors. Explain deliberate ordering (for example, reset
  sends `clearWebsiteIcon` before removing storage) in the prose.

## Steps

1. Update the relevant architecture sections and diagrams. Prose and diagram must
   agree; a diagram that contradicts the code is worse than none.
2. Update `store/README.md` **after** the architecture, so it cannot overpromise.
3. Bump `<!-- release: X.Y.Z -->` in `docs/architecture.md`,
   `docs/release-process.md`, and `store/README.md` when preparing a release,
   after verifying the content.
4. Update `docs/release-process.md` if commands, CI, or the store process
   changed (including the changelogen workflow).
5. Update `docs/README.md` if the document index or screenshot conventions change.
6. Run:

   ```bash
   pnpm test
   ```

   The release-docs test checks markers, the changelog entry, the single store
   document, asset dimensions/alpha, README screenshots, and relative links.

## Link hygiene

- Use relative links for repository files; they work on GitHub and in tests.
- Include `#anchor` only when the heading exists. Renaming a heading requires
  updating every link (search the repo for the old anchor).
- Do not link to `.output/`, `.store-demo/`, or local absolute paths.
- Store assets are linked from `store/README.md`; README images use
  `docs/screenshots/`.

## Verification

- `pnpm test` passes.
- Every changed diagram is valid Mermaid; preview it in GitHub or an IDE.
- The version markers, `CHANGELOG.md`, and `package.json` agree.
- No link points to a missing file.
- Docs do not claim a feature the code does not implement; check Known
  limitations when unsure.

## Output

Report the sections/diagrams changed, the marker version, `pnpm test` result, and
any behavior that still needs documentation but could not be verified.
