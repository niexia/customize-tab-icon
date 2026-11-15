#!/usr/bin/env node
/**
 * Generate a Keep-a-Changelog entry from Conventional Commits.
 *
 * Usage:
 *   node scripts/changelog.mjs --version 1.1.0 --from 41b81a2 --write
 *   node scripts/changelog.mjs --version 1.1.0 --from v1.0.1 --dry-run
 *
 * No dependencies: works offline in CI. If you prefer changelogen, the
 * commands are documented in docs/release-process.md.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(`Usage: node scripts/changelog.mjs [options]

  --version <semver>   Version for the new entry (default: package.json)
  --from <ref>         Start of the range (default: latest tag, else first commit)
  --to <ref>           End of the range (default: HEAD)
  --date <YYYY-MM-DD>  Entry date (default: today, local time)
  --output <file>      Changelog file (default: CHANGELOG.md)
  --write              Write the file (default: print to stdout)
  --force              Replace an existing entry for this version
  --help               Show this help`);
  process.exit(0);
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const version = args.version ?? pkg.version;
const outputPath = join(ROOT, args.output ?? 'CHANGELOG.md');
const to = args.to ?? 'HEAD';
const from = args.from ?? defaultFrom();
const date = args.date ?? new Date().toLocaleDateString('en-CA');
const repoUrl = repositoryUrl();

const SECTIONS = [
  ['feat', 'Features'],
  ['fix', 'Bug Fixes'],
  ['perf', 'Performance'],
  ['refactor', 'Refactoring'],
];


const commits = readCommits(from, to);
const entry = renderEntry(version, date, commits);

if (args.write) {
  writeEntry(entry, version);
} else {
  process.stdout.write(entry);
}

function parseArgs(argv) {
  const parsed = { write: false, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--help' || flag === '-h') parsed.help = true;
    else if (flag === '--write') parsed.write = true;
    else if (flag === '--force') parsed.force = true;
    else if (flag === '--version') parsed.version = argv[++i];
    else if (flag === '--from') parsed.from = argv[++i];
    else if (flag === '--to') parsed.to = argv[++i];
    else if (flag === '--date') parsed.date = argv[++i];
    else if (flag === '--output') parsed.output = argv[++i];
    else throw new Error(`Unknown argument: ${flag}`);
  }
  return parsed;
}

function git(...gitArgs) {
  return execFileSync('git', gitArgs, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function defaultFrom() {
  try {
    return git('describe', '--tags', '--abbrev=0');
  } catch {
    throw new Error(
      'No git tags found. Pass --from <ref> so the entry covers only the commits since the last release.',
    );
  }
}

function repositoryUrl() {
  const raw = pkg.repository?.url ?? '';
  return raw.replace(/^git\+/, '').replace(/\.git$/, '');
}

function readCommits(fromRef, toRef) {
  const raw = execFileSync(
    'git',
    ['log', `${fromRef}..${toRef}`, '--no-merges', '--pretty=format:%H%x1f%s%x1f%b%x1e'],
    { cwd: ROOT, encoding: 'utf8' },
  );

  return raw
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, subject, body = ''] = record.split('\x1f');
      return parseCommit(hash, subject, body);
    })
    .filter(Boolean);
}

function parseCommit(hash, subject, body) {
  if (/^chore\(release\):/i.test(subject)) return null;
  if (/^Merge (branch|pull request)/i.test(subject)) return null;

  const match = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/.exec(subject);
  if (!match) return null;

  const [, type, scope, bang, title] = match;
  const breaking = Boolean(bang) || /BREAKING[ -]CHANGE:/i.test(body);

  return {
    hash,
    short: hash.slice(0, 7),
    type,
    scope: scope ?? '',
    title: title.trim(),
    breaking,
  };
}

function renderEntry(version, date, commits) {
  const lines = [`## [${version}] - ${date}`, ''];
  const breaking = commits.filter((commit) => commit.breaking);

  if (breaking.length > 0) {
    lines.push('### ⚠ BREAKING CHANGES', '');
    for (const commit of breaking) lines.push(formatCommit(commit));
    lines.push('');
  }

  for (const [type, title] of SECTIONS) {
    const matches = commits.filter((commit) => commit.type === type);
    if (matches.length === 0) continue;
    lines.push(`### ${title}`, '');
    for (const commit of matches) lines.push(formatCommit(commit));
    lines.push('');
  }

  if (lines.length === 2) {
    lines.push('### Other Changes', '');
    for (const commit of commits) lines.push(formatCommit(commit));
    lines.push('');
  }

  return lines.join('\n');
}

function formatCommit(commit) {
  const scope = commit.scope ? `**${commit.scope}:** ` : '';
  const title = commit.title.charAt(0).toUpperCase() + commit.title.slice(1);
  const link = repoUrl ? ` ([${commit.short}](${repoUrl}/commit/${commit.hash}))` : ` (${commit.short})`;
  return `- ${scope}${title}${link}`;
}

function writeEntry(entry, version) {
  const preamble = `# Changelog

All notable changes to Changicon are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Commits follow [Conventional Commits](https://www.conventionalcommits.org/).

`;

  if (!existsSync(outputPath)) {
    writeFileSync(outputPath, `${preamble}${entry}\n`);
    console.log(`Created ${outputPath}`);
    return;
  }

  const current = readFileSync(outputPath, 'utf8');
  const header = `## [${version}]`;
  if (current.includes(header) && !args.force) {
    throw new Error(`${outputPath} already has an entry for ${version}. Use --force to replace it.`);
  }

  if (current.includes(header)) {
    const pattern = new RegExp(`## \\[${escapeRegExp(version)}\\][\\s\\S]*?(?=\\n## \\[|$)`);
    writeFileSync(outputPath, current.replace(pattern, `${entry.trim()}\n`));
    console.log(`Replaced ${version} in ${outputPath}`);
    return;
  }

  const firstEntry = current.indexOf('\n## [');
  const next =
    firstEntry === -1
      ? `${current.replace(/\s*$/, '')}\n\n${entry}\n`
      : `${current.slice(0, firstEntry + 1)}${entry}\n${current.slice(firstEntry + 1)}`;

  writeFileSync(outputPath, next);
  console.log(`Added ${version} to ${outputPath}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
