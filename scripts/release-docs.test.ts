import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const version = String(
  JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')).version,
);
const requiredDocs = [
  'README.md',
  'CHANGELOG.md',
  'AGENTS.md',
  '.agents/README.md',
  'docs/README.md',
  'docs/AGENTS.md',
  'docs/architecture.md',
  'docs/release-process.md',
  'docs/privacy.md',
  'store/README.md',
];

const SKILLS_DIR = resolve(ROOT, '.agents/skills');
const agentSkillFiles = existsSync(SKILLS_DIR)
  ? readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `.agents/skills/${entry.name}/SKILL.md`)
  : [];

describe('release docs, store assets, and agent context', () => {
  it('keeps the store kit to one document', () => {
    const storeDocs = readdirSync(resolve(ROOT, 'store')).filter((name) => name.endsWith('.md'));
    expect(storeDocs).toEqual(['README.md']);
  });

  it('has every required document', () => {
    const missing = requiredDocs.filter((file) => !existsSync(resolve(ROOT, file)));
    expect(missing).toEqual([]);
  });

  it('has valid agent skill frontmatter', () => {
    const errors: string[] = [];

    for (const file of agentSkillFiles) {
      if (!existsSync(resolve(ROOT, file))) {
        errors.push(`${file}: missing`);
        continue;
      }

      const text = readFileSync(resolve(ROOT, file), 'utf8');
      const frontmatter = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
      if (!frontmatter) {
        errors.push(`${file}: missing YAML frontmatter`);
        continue;
      }

      const [, yaml = '', body = ''] = frontmatter;
      const expectedName = file.split('/')[2];
      const name = /^name:\s*([a-z0-9-]+)\s*$/m.exec(yaml)?.[1];
      const description = /^description:\s*\S.+$/m.test(yaml);

      if (name !== expectedName) {
        errors.push(`${file}: name must be "${expectedName}"`);
      }
      if (!description) {
        errors.push(`${file}: description is missing`);
      }
      if (!body.trim()) {
        errors.push(`${file}: body is empty`);
      }
    }

    expect(errors).toEqual([]);
  });

  it('routes every existing agent skill', () => {
    const agents = readFileSync(resolve(ROOT, 'AGENTS.md'), 'utf8');
    const skillsSection = agents.split('## Agent skills')[1]?.split(/\n## /)[0] ?? '';
    const routed = new Set(
      [...skillsSection.matchAll(/^\| `([a-z0-9-]+)` \|/gm)]
        .map((match) => match[1])
        .filter((name): name is string => Boolean(name)),
    );
    const skills = agentSkillFiles
      .map((file) => file.split('/')[2])
      .filter((name): name is string => Boolean(name));
    const missing = [...routed].filter(
      (name) => !existsSync(resolve(ROOT, `.agents/skills/${name}/SKILL.md`)),
    );
    const unrouted = skills.filter((name) => !routed.has(name));

    expect({ missing, unrouted }).toEqual({ missing: [], unrouted: [] });
  });

  it('marks the docs with the package version', () => {
    const marker = `<!-- release: ${version} -->`;
    const stale = ['docs/architecture.md', 'docs/release-process.md', 'store/README.md'].filter(
      (file) => !readFileSync(resolve(ROOT, file), 'utf8').includes(marker),
    );
    expect(stale).toEqual([]);
  });

  it('has a changelog entry for the package version', () => {
    const changelog = readFileSync(resolve(ROOT, 'CHANGELOG.md'), 'utf8');
    const heading = new RegExp(`^##\\s+\\[?v?${escapeRegExp(version)}\\]?`, 'm');
    expect(changelog).toMatch(heading);
  });

  it('keeps exactly five opaque 1280x800 screenshots', () => {
    const errors: string[] = [];
    for (const [index, name] of ['hero', 'emoji', 'icons', 'site', 'text'].entries()) {
      const file = `store/assets/screenshot-${index + 1}-${name}.png`;
      const info = pngInfo(file);
      if (!info) {
        errors.push(`${file}: missing or not a PNG`);
      } else if (info.width !== 1280 || info.height !== 800) {
        errors.push(`${file}: ${info.width}x${info.height}, expected 1280x800`);
      } else if (info.colorType === 4 || info.colorType === 6) {
        errors.push(`${file}: has an alpha channel`);
      }
    }

    const extra = readdirSync(resolve(ROOT, 'store/assets')).filter(
      (name) => /^screenshot-\d+-.*\.png$/.test(name),
    ).length;
    if (extra !== 5) errors.push(`store/assets: expected 5 screenshots, found ${extra}`);
    expect(errors).toEqual([]);
  });

  it('has the promo tiles and store icon at exact sizes', () => {
    const expected = {
      'store/assets/small-promo-440x280.png': [440, 280],
      'store/assets/marquee-1400x560.png': [1400, 560],
      'store/assets/store-icon-128.png': [128, 128],
    } as const;
    const errors: string[] = [];

    for (const [file, [width, height]] of Object.entries(expected)) {
      const info = pngInfo(file);
      if (!info) errors.push(`${file}: missing or not a PNG`);
      else if (info.width !== width || info.height !== height) {
        errors.push(`${file}: ${info.width}x${info.height}, expected ${width}x${height}`);
      }
    }
    expect(errors).toEqual([]);
  });

  it('shows a product screenshot in the README', () => {
    const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8');
    expect(readme).toMatch(/docs\/screenshots\/|store\/assets\//);
  });

  it('links to a complete public privacy policy', () => {
    const storeReadme = readFileSync(resolve(ROOT, 'store/README.md'), 'utf8');
    const policy = readFileSync(resolve(ROOT, 'docs/privacy.md'), 'utf8');
    expect(storeReadme).toContain('docs/privacy.md');
    expect(policy).toMatch(/^# Changicon Privacy Policy$/m);
    expect(policy).toMatch(/^## Limited Use statement$/m);
    expect(policy).toContain('Effective date');
  });

  it('has no broken relative links in the docs and store kit', () => {
    const errors: string[] = [];
    const files = [...requiredDocs, ...agentSkillFiles];

    for (const file of new Set(files)) {
      if (!existsSync(resolve(ROOT, file))) {
        errors.push(`${file}: missing`);
        continue;
      }

      const text = readFileSync(resolve(ROOT, file), 'utf8').replace(/```[\s\S]*?```/g, '');
      for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
        const target = (match[1] ?? '').trim().replace(/^<|>$/g, '').split('#')[0];
        if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
        if (!existsSync(resolve(ROOT, file, '..', target))) {
          errors.push(`${file}: broken link ${target}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });
});

function pngInfo(file: string) {
  if (!existsSync(resolve(ROOT, file))) return null;
  const image = readFileSync(resolve(ROOT, file));
  if (image.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: image.readUInt32BE(16), height: image.readUInt32BE(20), colorType: image[25] };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
