# `.agents/` — portable agent context

This directory keeps the repository's engineering context next to the code:

```
AGENTS.md                 ← loaded automatically from the project root
docs/AGENTS.md            ← loaded when work reaches docs/
.agents/
  skills/
    release-chrome-extension/SKILL.md
    store-listing/SKILL.md
    sync-docs/SKILL.md
  notes/
    2026-11-15-release-and-store-pipeline.md
```

## How discovery works

In DeepSeek Harness (DSH), the local skill provider scans these roots in rank
order:

| Rank | Root | Source |
| --- | --- | --- |
| 100 | `<project>/.dsh/skills` | project-specific DSH skills |
| 200 | `<project>/.agents/skills` | shared project skills (this directory) |
| 400 | `~/.dsh/skills` | user skills |
| 500 | `~/.agents/skills` | shared user skills |

A skill is either `<root>/<name>/SKILL.md` or a flat `<root>/<name>.md`. Nested
`**/SKILL.md` is not discovered. The frontmatter must be kebab-case `name` plus
`description`; `whenToUse`, `disable-model-invocation`, and `user-invocable` are
optional. The project root is the nearest ancestor with `.git`.

`AGENTS.md` and `CLAUDE.md` are separate: they are loaded automatically for the
workspace, from broad to specific, including nested files once an agent reads or
writes inside that directory (for example `docs/AGENTS.md`). `notes/` is **not**
auto-loaded; it is a design-record archive for humans and agents that choose to
read it.

The skills here were discovered by the running DSH session as soon as the files
were written; the `AGENTS.md` files were injected into the session on the next
step. No restart or plugin install is required.

## Adding or changing a skill

1. Create `.agents/skills/<kebab-name>/SKILL.md`.
2. Start the file with:

   ```yaml
   ---
   name: <kebab-name>
   description: Use when ...
   ---
   ```

3. Keep the body procedural: preconditions, exact commands, guardrails, output.
   Link to repository files with relative paths; the skill base directory is the
   bundle directory, so `../../../` reaches the repo root.
4. Verify the description is specific enough to route from the skill catalog —
   it is the only text the model sees before loading the body.
5. Do not put secrets or machine-specific absolute paths in a skill.

## Skills are guidance; tests and CI are enforcement

A skill is loaded on demand and can be skipped. The guarantees come from:

- `pnpm check` (compile/lint/test/build); `pnpm test` includes the release-docs
  checks for markers, changelog, and store assets;
- the release workflow on `v*` tags;
- `changelogen` reading Conventional Commits and the latest tag;
- the release-docs test in `scripts/release-docs.test.ts`.

Write skills so that following them produces the same result as the tests.

## Compatibility with other agents

`AGENTS.md` is the portable layer (Codex, Cursor, Copilot, DSH, and others read
it or a compatible file). `.agents/skills` is supported by DSH and a growing set
of harnesses; tools that do not discover it can still read `AGENTS.md` and the
skill files manually. Do not duplicate the commands in multiple agent-specific
files unless a tool requires it; edit `AGENTS.md` as the single source of truth.
