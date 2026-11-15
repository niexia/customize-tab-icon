#!/usr/bin/env node
/**
 * Verify that documentation and store assets match the package version.
 *
 * Part of `pnpm check`; runs in CI. It intentionally checks structure and
 * freshness markers, not prose accuracy.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;
const errors = [];
const notes = [];

const DOC_FILES = [
  'README.md',
  'CHANGELOG.md',
  'AGENTS.md',
  'docs/README.md',
  'docs/AGENTS.md',
  'docs/architecture.md',
  'docs/release-process.md',
  'store/README.md',
  'store/listing.md',
  'store/permissions.md',
  'store/privacy.md',
  'store/review-notes.md',
  'store/checklist.md',
  'store/promo-video.md',
];

const SHOT_SLUGS = ['hero', 'emoji', 'icons', 'site', 'text'];

const REQUIRED_ASSETS = [
  'store/assets/store-icon-128.png',
  'store/assets/small-promo-440x280.png',
  'store/assets/marquee-1400x560.png',
  ...[1, 2, 3, 4, 5].map((n) => `store/assets/screenshot-${n}-${SHOT_SLUGS[n - 1]}.png`),
];

for (const file of DOC_FILES) {
  if (!existsSync(join(ROOT, file))) errors.push(`missing document: ${file}`);
}

checkMarker('docs/architecture.md');
checkMarker('docs/release-process.md');
checkChangelog();
checkAssets();
checkManifest();
checkReadmeImages();
checkRelativeLinks(DOC_FILES);

if (notes.length > 0) {
  for (const note of notes) console.log(`note: ${note}`);
}

if (errors.length > 0) {
  console.error(`docs:check failed for v${version}:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`docs:check passed for v${version} (${DOC_FILES.length} docs, ${REQUIRED_ASSETS.length} assets).`);

function checkMarker(file) {
  const path = join(ROOT, file);
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  const marker = `<!-- release: ${version} -->`;
  if (!text.includes(marker)) {
    errors.push(`${file}: expected "${marker}"`);
  }
}

function checkChangelog() {
  const path = join(ROOT, 'CHANGELOG.md');
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  if (!text.includes(`## [${version}]`)) {
    errors.push(`CHANGELOG.md: no "## [${version}]" entry`);
  }
}

function checkAssets() {
  for (const file of REQUIRED_ASSETS) {
    const path = join(ROOT, file);
    if (!existsSync(path)) {
      errors.push(`missing asset: ${file}`);
      continue;
    }

    const image = readFileSync(path);
    if (image.readUInt32BE(0) !== 0x89504e47) {
      errors.push(`${file}: not a PNG`);
      continue;
    }

    const width = image.readUInt32BE(16);
    const height = image.readUInt32BE(20);
    const colorType = image[25];
    const expected = expectedSize(file);
    if (expected && (width !== expected.width || height !== expected.height)) {
      errors.push(`${file}: expected ${expected.width}x${expected.height}, got ${width}x${height}`);
    }
    // The store icon may use transparency for its 16 px safe-area padding;
    // screenshots and promo tiles must be opaque.
    if (!file.includes('store-icon') && (colorType === 4 || colorType === 6)) {
      errors.push(`${file}: has an alpha channel (store images must be opaque)`);
    }
  }

  const screenshotDir = join(ROOT, 'store/assets');
  if (existsSync(screenshotDir)) {
    const screenshots = readdirSync(screenshotDir).filter(
      (name) => /^screenshot-\d+-.*\.png$/.test(name),
    );
    if (screenshots.length !== 5) {
      errors.push(`store/assets: expected 5 screenshots, found ${screenshots.length}`);
    }
  }
}

function expectedSize(file) {
  if (file.includes('screenshot-')) return { width: 1280, height: 800 };
  if (file.includes('small-promo')) return { width: 440, height: 280 };
  if (file.includes('marquee')) return { width: 1400, height: 560 };
  if (file.includes('store-icon')) return { width: 128, height: 128 };
  return null;
}

function checkManifest() {
  const path = join(ROOT, '.output/chrome-mv3/manifest.json');
  if (!existsSync(path)) {
    notes.push('no .output/chrome-mv3/manifest.json; run `pnpm build` to verify the built version');
    return;
  }
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  if (manifest.version !== version) {
    errors.push(`built manifest is ${manifest.version}, package.json is ${version}`);
  }
}

function checkReadmeImages() {
  const path = join(ROOT, 'README.md');
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  if (!/docs\/screenshots\/|store\/assets\//.test(text)) {
    errors.push('README.md: expected at least one product screenshot (docs/screenshots or store/assets)');
  }
}

function checkRelativeLinks(files) {
  for (const file of files) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, 'utf8');
    if (!file.endsWith('.md')) continue;
    const prose = text.replace(/```[\s\S]*?```/g, '');

    const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = linkPattern.exec(prose)) !== null) {
      const target = match[1].trim().replace(/^<|>$/g, '').split('#')[0];
      if (!target) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      if (target.startsWith('#')) continue;
      if (target.startsWith('/')) {
        errors.push(`${file}: root-relative link ${target}`);
        continue;
      }
      const resolved = resolve(dirname(path), target);
      if (!resolved.startsWith(ROOT)) {
        errors.push(`${file}: link escapes the repository: ${target}`);
        continue;
      }
      if (!existsSync(resolved)) {
        errors.push(`${file}: broken relative link ${target}`);
      }
    }
  }
}
