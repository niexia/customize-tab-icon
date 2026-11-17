/**
 * Generate the Chrome Web Store graphic assets and README screenshots from the
 * real popup UI.
 *
 * Usage:
 *   pnpm build
 *   pnpm store:assets
 *
 * Requirements: Node 20+, a local Google Chrome/Chromium. The script serves
 * files from localhost only and never touches the network beyond that.
 */
import { spawn, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BUILD_DIR = join(ROOT, '.output/chrome-mv3');
const DEMO_DIR = join(ROOT, '.store-demo');
const STORE_ASSETS = join(ROOT, 'store/assets');
const DOCS_SCREENS = join(ROOT, 'docs/screenshots');
const CHROME = findChrome();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const SHOTS = [
  {
    slug: 'screenshot-1-hero',
    eyebrow: 'TAB ICON CUSTOMIZER',
    title: 'Give every tab a face you <em>recognize.</em>',
    sub: 'Emoji, text, line icons, or your own image — set it for one page, one subdomain, or a whole site, instantly.',
    points: [
      'Works on any http(s) page',
      'Light, dark, or match your system',
      'Reset to the original favicon anytime',
    ],
    accent: '#a5b4fc',
    glowA: 'rgba(99, 102, 241, 0.38)',
    glowB: 'rgba(236, 72, 153, 0.20)',
    scenario: 'main',
    scope: 'page',
    theme: 'dark',
    popupHeight: 540,
    tabs: [
      { emoji: '📚', label: 'Docs' },
      { emoji: '🎵', label: 'Music' },
      { text: 'S', label: 'Shop' },
      { emoji: '💬', label: 'Chat' },
      { text: 'N', label: 'News' },
    ],
    pageTitle: 'Everything in one place',
    pageSub: 'Your personalized start page.',
    foot: 'No accounts · No tracking · Icons generated locally',
  },
  {
    slug: 'screenshot-2-emoji',
    eyebrow: 'EMOJI',
    title: 'Pick any emoji.<br /><em>Make it yours.</em>',
    sub: 'Search the full emoji set and turn a tab into something you actually notice.',
    points: ['Thousands of emoji, searchable', 'Applied instantly', 'No extra downloads'],
    accent: '#fcd34d',
    glowA: 'rgba(245, 158, 11, 0.30)',
    glowB: 'rgba(236, 72, 153, 0.18)',
    scenario: 'emoji',
    scope: 'page',
    theme: 'dark',
    popupHeight: 600,
    tabs: [
      { emoji: '🎧', label: 'Music' },
      { emoji: '🎨', label: 'Design' },
      { emoji: '🚀', label: 'Launch' },
      { emoji: '🍜', label: 'Food' },
      { emoji: '🐱', label: 'Cats' },
    ],
    pageTitle: 'Your library',
    pageSub: 'A calmer place for the things you love.',
    foot: 'One emoji picker · Every tab',
  },
  {
    slug: 'screenshot-3-icons',
    eyebrow: 'ICON LIBRARY',
    title: 'Thousands of icons. <em>One search.</em>',
    sub: 'Find the right Lucide icon, or type two letters for a clean text badge.',
    points: ['Search by name', 'Crisp SVG output', 'White or transparent'],
    accent: '#6ee7b7',
    glowA: 'rgba(16, 185, 129, 0.28)',
    glowB: 'rgba(56, 189, 248, 0.18)',
    scenario: 'icon',
    scope: 'page',
    theme: 'dark',
    popupHeight: 600,
    tabs: [
      { text: 'AI', label: 'Studio' },
      { text: 'DB', label: 'Database' },
      { text: 'UI', label: 'Design' },
      { text: 'PR', label: 'Reviews' },
      { text: 'CI', label: 'Deploys' },
    ],
    pageTitle: 'Build faster',
    pageSub: 'The dashboard for your team’s next release.',
    foot: 'Lucide icons · Text badges · SVG',
  },
  {
    slug: 'screenshot-4-site',
    eyebrow: 'PAGE · SUBDOMAIN · SITE',
    title: 'One icon for the <em>whole site.</em>',
    sub: 'Set an icon for one page, one subdomain, or the whole domain — including its subdomains.',
    points: ['Per-page overrides', 'Per-subdomain control', 'Whole domain in one click'],
    accent: '#7dd3fc',
    glowA: 'rgba(14, 165, 233, 0.32)',
    glowB: 'rgba(99, 102, 241, 0.20)',
    scenario: 'main',
    scope: 'domain',
    theme: 'dark',
    popupHeight: 540,
    tabs: [
      { image: '/icon/128.png', label: 'Docs' },
      { image: '/icon/128.png', label: 'Blog' },
      { image: '/icon/128.png', label: 'Shop' },
      { image: '/icon/128.png', label: 'Help' },
      { image: '/icon/128.png', label: 'Login' },
    ],
    pageTitle: 'Acme Inc.',
    pageSub: 'One brand, one icon, across every page of the site.',
    foot: 'Per page · Per subdomain · Whole site',
  },
  {
    slug: 'screenshot-5-text',
    eyebrow: 'TEXT BADGES',
    title: 'Two letters.<br /><em>Instant identity.</em>',
    sub: 'Type up to two characters and get a clean, auto-fitted badge for the tab.',
    points: ['Up to 2 characters', 'Auto-fitted type', 'White or transparent'],
    accent: '#fda4af',
    glowA: 'rgba(244, 63, 94, 0.28)',
    glowB: 'rgba(168, 85, 247, 0.18)',
    scenario: 'text',
    scope: 'page',
    theme: 'dark',
    popupHeight: 540,
    tabs: [
      { text: 'YT', label: 'Docs' },
      { text: 'GH', label: 'Code' },
      { text: 'GM', label: 'Mail' },
      { text: 'N', label: 'Notes' },
      { text: 'X', label: 'Social' },
    ],
    pageTitle: 'Workspace',
    pageSub: 'A two-letter badge is easy to spot in a crowded tab bar.',
    foot: 'Text badges · Auto-fitted · Any page',
  },
];

const POPUP_SHOTS = [
  { file: 'popup-dark.png', scenario: 'main', theme: 'dark', height: 540, scale: 2 },
  { file: 'popup-emoji.png', scenario: 'emoji', theme: 'dark', height: 600, scale: 2 },
  { file: 'popup-icons.png', scenario: 'icon', theme: 'dark', height: 600, scale: 2 },
  { file: 'popup-text.png', scenario: 'text', theme: 'dark', height: 540, scale: 2 },
  { file: 'popup-upload.png', scenario: 'upload', theme: 'dark', height: 600, scale: 2 },
  { file: 'popup-light.png', scenario: 'main', theme: 'light', height: 540, scale: 2 },
];

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    'google-chrome',
    'chromium',
    'chromium-browser',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes('/') && existsSync(candidate)) return candidate;
    if (!candidate.includes('/')) {
      const which = spawnSync('which', [candidate], { encoding: 'utf8' });
      if (which.status === 0) return candidate;
    }
  }

  throw new Error('Chrome not found. Set CHROME_PATH to a Chrome/Chromium binary.');
}

function renderTabs(tabs, activeIndex = 0) {
  return tabs
    .map((tab, index) => {
      let favicon;
      if (tab.image) {
        favicon = `<span class="fav img" style="background-image:url('${tab.image}')"></span>`;
      } else if (tab.emoji) {
        favicon = `<span class="fav emoji">${tab.emoji}</span>`;
      } else {
        favicon = `<span class="fav">${tab.text}</span>`;
      }
      return `<div class="tab${index === activeIndex ? ' active' : ''}">${favicon}<span class="tab-label">${tab.label}</span></div>`;
    })
    .join('');
}

function renderPage(shot) {
  return `
    <div class="page">
      <h2>${shot.pageTitle}</h2>
      <p>${shot.pageSub}</p>
      <div class="cards"><div class="card"></div><div class="card"></div></div>
    </div>`;
}

function renderComposition(shot) {
  const points = shot.points
    .map((point) => `<div class="point"><span class="dot">✓</span>${point}</div>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1280px; height: 800px; overflow: hidden; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    background: #08080c; color: #f5f5f7;
  }
  .bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(900px 520px at 78% 18%, ${shot.glowA}, transparent 62%),
      radial-gradient(700px 460px at 18% 92%, ${shot.glowB}, transparent 60%),
      linear-gradient(160deg, #0b0b12 0%, #08080c 55%, #0a0a10 100%);
  }
  .grid {
    position: absolute; inset: 0; opacity: .16;
    background-image: linear-gradient(rgba(255,255,255,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.16) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(ellipse at 60% 40%, black, transparent 72%);
  }
  .stage { position: absolute; inset: 0; padding: 56px 64px; display: flex; align-items: flex-start; gap: 48px; }
  .copy { width: 390px; flex: none; }
  .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 30px; }
  .brand img { width: 52px; height: 52px; border-radius: 14px; box-shadow: 0 12px 30px rgba(0,0,0,.5); }
  .brand span { font-size: 24px; font-weight: 700; letter-spacing: -.02em; }
  .eyebrow { font-size: 13px; font-weight: 650; letter-spacing: .14em; text-transform: uppercase; color: ${shot.accent}; margin-bottom: 16px; }
  h1 { font-size: 42px; line-height: 1.08; letter-spacing: -.035em; margin: 0 0 18px; font-weight: 720; }
  h1 em { font-style: normal; color: ${shot.accent}; }
  .sub { font-size: 17px; line-height: 1.5; color: #b9b9c6; margin: 0 0 28px; }
  .points { display: grid; gap: 12px; }
  .point { display: flex; align-items: center; gap: 11px; font-size: 14px; color: #d6d6e0; }
  .dot { width: 22px; height: 22px; border-radius: 999px; background: rgba(255,255,255,.08); color: ${shot.accent}; display: grid; place-items: center; font-size: 12px; font-weight: 700; }
  .foot { position: absolute; left: 64px; bottom: 30px; font-size: 12px; letter-spacing: .02em; color: #6f6f80; }
  .win-wrap { position: relative; width: 720px; height: 640px; flex: none; }
  .win {
    position: absolute; inset: 0 0 44px 0; border-radius: 16px; overflow: hidden;
    background: #f7f7f9; border: 1px solid rgba(255,255,255,.14);
    box-shadow: 0 40px 90px rgba(0,0,0,.62), 0 2px 0 rgba(255,255,255,.10) inset;
  }
  .titlebar { height: 42px; background: #e9e9ee; display: flex; align-items: center; gap: 8px; padding: 0 14px; border-bottom: 1px solid #dcdce3; }
  .light { width: 11px; height: 11px; border-radius: 999px; }
  .tabbar { height: 40px; background: #e9e9ee; display: flex; align-items: flex-end; gap: 4px; padding: 0 10px; }
  .tab { height: 32px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border-radius: 9px 9px 0 0; font-size: 12px; color: #55555f; max-width: 132px; overflow: hidden; white-space: nowrap; }
  .tab.active { background: #fff; color: #1a1a1f; box-shadow: 0 -1px 0 #d8d8df; }
  .tab-label { overflow: hidden; text-overflow: ellipsis; }
  .fav { width: 16px; height: 16px; border-radius: 5px; display: grid; place-items: center; font-size: 11px; line-height: 1; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.08); flex: none; font-weight: 600; }
  .fav.emoji { font-size: 13px; background: transparent; box-shadow: none; }
  .fav.img { background-size: cover; background-position: center; }
  .toolbar { height: 44px; background: #fff; border-bottom: 1px solid #e6e6ea; display: flex; align-items: center; gap: 10px; padding: 0 12px; }
  .nav { color: #8a8a94; font-size: 15px; }
  .omnibox { flex: 1; height: 28px; border-radius: 999px; background: #f1f1f4; display: flex; align-items: center; gap: 8px; padding: 0 12px; font-size: 12px; color: #6b6b75; }
  .ext { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; background: #f1f1f4; flex: none; }
  .ext img { width: 18px; height: 18px; }
  .page { padding: 34px 30px; color: #24242b; max-width: 320px; }
  .page h2 { margin: 0 0 8px; font-size: 24px; letter-spacing: -.02em; }
  .page p { margin: 0 0 20px; color: #6c6c78; font-size: 13px; line-height: 1.45; }
  .cards { display: grid; grid-template-columns: repeat(2, 148px); gap: 12px; }
  .card { height: 104px; border-radius: 12px; background: #fff; border: 1px solid #ececf1; box-shadow: 0 6px 18px rgba(20,20,40,.05); }
  .card:nth-child(1) { background: linear-gradient(135deg, ${shot.accent}33, #fff); }
  .card:nth-child(2) { background: linear-gradient(135deg, #fff, ${shot.accent}1f); }
  .popup {
    position: absolute; right: 20px; top: 126px; width: 320px; height: ${shot.popupHeight}px;
    border-radius: 12px; overflow: hidden; background: ${shot.theme === 'light' ? '#ffffff' : '#09090b'};
    box-shadow: 0 30px 70px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.12);
  }
  .popup::before { content: ""; position: absolute; top: -7px; right: 26px; width: 14px; height: 14px; background: ${shot.theme === 'light' ? '#ffffff' : '#09090b'}; transform: rotate(45deg); border-left: 1px solid rgba(255,255,255,.12); border-top: 1px solid rgba(255,255,255,.12); z-index: 2; }
  .popup iframe { width: 320px; height: ${shot.popupHeight}px; border: 0; display: block; background: ${shot.theme === 'light' ? '#ffffff' : '#09090b'}; }
</style>
</head>
<body>
  <div class="bg"></div><div class="grid"></div>
  <div class="stage">
    <div class="copy">
      <div class="brand"><img src="/icon/128.png" alt="" /><span>Changicon</span></div>
      <div class="eyebrow">${shot.eyebrow}</div>
      <h1>${shot.title}</h1>
      <p class="sub">${shot.sub}</p>
      <div class="points">${points}</div>
    </div>
    <div class="win-wrap">
      <div class="win">
        <div class="titlebar"><span class="light" style="background:#ff5f57"></span><span class="light" style="background:#febc2e"></span><span class="light" style="background:#28c840"></span></div>
        <div class="tabbar">${renderTabs(shot.tabs)}</div>
        <div class="toolbar">
          <span class="nav">‹</span><span class="nav">›</span><span class="nav">⟳</span>
          <div class="omnibox">🔒 example.com</div>
          <span class="nav">☆</span>
          <div class="ext"><img src="/icon/128.png" alt="" /></div>
        </div>
        ${renderPage(shot)}
      </div>
      <div class="popup"><iframe src="/demo.html?scenario=${shot.scenario}&theme=${shot.theme}&scope=${shot.scope}"></iframe></div>
    </div>
  </div>
  <div class="foot">${shot.foot}</div>
</body>
</html>`;
}

function renderSmallPromo() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 440px; height: 280px; overflow: hidden; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    background: #08080c; color: #f5f5f7;
  }
  .bg { position: absolute; inset: 0; background: radial-gradient(360px 220px at 78% 6%, rgba(99,102,241,.55), transparent 64%), linear-gradient(160deg, #0c0c15, #08080c 72%); }
  .grid { position: absolute; inset: 0; opacity: .16; background-image: linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(ellipse at 60% 40%, black, transparent 75%); }
  .stage { position: absolute; inset: 0; padding: 26px 26px 22px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand img { width: 34px; height: 34px; border-radius: 9px; }
  .brand span { font-size: 17px; font-weight: 700; letter-spacing: -.02em; }
  h1 { margin: 22px 0 6px; font-size: 30px; line-height: 1.02; letter-spacing: -.035em; font-weight: 720; }
  h1 em { font-style: normal; color: #a5b4fc; }
  p { margin: 0; color: #b9b9c6; font-size: 12px; line-height: 1.45; max-width: 290px; }
  .tabs { display: flex; align-items: center; gap: 7px; margin-top: auto; }
  .fav { width: 32px; height: 32px; border-radius: 9px; background: #fff; display: grid; place-items: center; font-size: 19px; box-shadow: 0 6px 16px rgba(0,0,0,.35); }
  .fav.text { font-size: 13px; font-weight: 700; color: #111; letter-spacing: -.02em; }

</style>
</head>
<body>
  <div class="bg"></div><div class="grid"></div>
  <div class="stage">
    <div class="brand"><img src="/icon/128.png" alt="" /><span>Changicon</span></div>
    <h1>Your tabs.<br /><em>Your icons.</em></h1>
    <p>Emoji, text, line icons, or your own image — for any page, subdomain, or whole site.</p>
    <div class="tabs">
      <span class="fav">📚</span><span class="fav">🎵</span><span class="fav text">S</span><span class="fav">💬</span><span class="fav text">N</span>
    </div>
  </div>
</body>
</html>`;
}

function renderMarquee() {
  const rows = [
    { emoji: '📚', label: 'Docs', domain: 'docs.example.com' },
    { emoji: '🎵', label: 'Music', domain: 'music.example.com' },
    { text: 'S', label: 'Shop', domain: 'shop.example.com' },
    { emoji: '💬', label: 'Chat', domain: 'chat.example.com' },
    { text: 'N', label: 'News', domain: 'news.example.com' },
  ];

  const tabs = rows
    .map((row, index) => {
      const favicon = row.emoji
        ? `<span class="fav emoji">${row.emoji}</span>`
        : `<span class="fav">${row.text}</span>`;
      return `<div class="tab-card" style="transform: translateX(${[0, 18, 36, 18, 0][index]}px)">
        ${favicon}
        <span class="tab-copy"><strong>${row.label}</strong><small>${row.domain}</small></span>
        <span class="close">×</span>
      </div>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1400px; height: 560px; overflow: hidden; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; background: #08080c; color: #f5f5f7; }
  .bg { position: absolute; inset: 0; background: radial-gradient(900px 520px at 82% 10%, rgba(99,102,241,.46), transparent 60%), radial-gradient(700px 420px at 100% 100%, rgba(236,72,153,.22), transparent 62%), linear-gradient(150deg, #0c0c16, #08080c 70%); }
  .grid { position: absolute; inset: 0; opacity: .14; background-image: linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px); background-size: 56px 56px; mask-image: radial-gradient(ellipse at 55% 45%, black, transparent 75%); }
  .stage { position: absolute; inset: 0; padding: 54px 64px; display: flex; align-items: center; justify-content: space-between; gap: 40px; }
  .copy { width: 610px; flex: none; }
  .brand { display: flex; align-items: center; gap: 13px; margin-bottom: 26px; }
  .brand img { width: 46px; height: 46px; border-radius: 12px; }
  .brand span { font-size: 22px; font-weight: 700; letter-spacing: -.02em; }
  .eyebrow { font-size: 12px; font-weight: 650; letter-spacing: .16em; text-transform: uppercase; color: #a5b4fc; margin-bottom: 12px; }
  h1 { margin: 0 0 16px; font-size: 50px; line-height: 1.04; letter-spacing: -.04em; font-weight: 720; }
  h1 em { font-style: normal; color: #a5b4fc; }
  p { margin: 0; color: #bcbcc9; font-size: 17px; line-height: 1.5; max-width: 520px; }
  .points { display: flex; gap: 20px; margin-top: 24px; font-size: 12px; color: #9d9daf; }
  .tabs { width: 520px; flex: none; display: grid; gap: 12px; }
  .tab-card { width: 430px; height: 74px; display: flex; align-items: center; gap: 14px; padding: 0 18px; border-radius: 14px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.10); box-shadow: 0 16px 34px rgba(0,0,0,.38); backdrop-filter: blur(6px); }
  .fav { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: #fff; color: #111; font-size: 15px; font-weight: 700; flex: none; box-shadow: 0 0 0 1px rgba(0,0,0,.08); }
  .fav.emoji { font-size: 24px; }
  .tab-copy { display: grid; gap: 3px; min-width: 0; }
  .tab-copy strong { font-size: 15px; font-weight: 620; letter-spacing: -.01em; }
  .tab-copy small { font-size: 11px; color: #8b8b9d; }
  .close { margin-left: auto; color: #6e6e80; font-size: 18px; line-height: 1; }
  .foot { position: absolute; left: 64px; bottom: 22px; font-size: 11px; color: #6f6f80; letter-spacing: .03em; }
</style>
</head>
<body>
  <div class="bg"></div><div class="grid"></div>
  <div class="stage">
    <div class="copy">
      <div class="brand"><img src="/icon/128.png" alt="" /><span>Changicon</span></div>
      <div class="eyebrow">TAB ICON CUSTOMIZER</div>
      <h1>Make every tab<br /><em>instantly recognizable.</em></h1>
      <p>Give any page its own favicon — emoji, text, a line icon, or an image you upload. One page, one subdomain, or the whole site.</p>
      <div class="points"><span>✓ Free</span><span>✓ No tracking</span><span>✓ Works locally</span></div>
    </div>
    <div class="tabs">${tabs}</div>
  </div>
  <div class="foot">Changicon · chromewebstore.google.com/detail/changicon</div>
</body>
</html>`;
}

function prepareDemo() {
  if (!existsSync(join(BUILD_DIR, 'popup.html'))) {
    throw new Error('Missing .output/chrome-mv3. Run `pnpm build` first.');
  }

  rmSync(DEMO_DIR, { recursive: true, force: true });
  cpSync(BUILD_DIR, DEMO_DIR, { recursive: true });
  cpSync(join(ROOT, 'scripts/store/mock-chrome.js'), join(DEMO_DIR, 'mock-chrome.js'));
  cpSync(join(ROOT, 'scripts/store/scenario.js'), join(DEMO_DIR, 'scenario.js'));

  const html = readFileSync(join(DEMO_DIR, 'popup.html'), 'utf8')
    .replace(
      '<head>',
      '<head>\n    <script src="/mock-chrome.js"></script>\n    <script src="/scenario.js"></script>',
    )
    .replace(
      '</head>',
      '    <style>*,*::before,*::after{animation:none!important;transition:none!important}</style>\n  </head>',
    );

  writeFileSync(join(DEMO_DIR, 'demo.html'), html);
  mkdirSync(join(DEMO_DIR, '__shots'), { recursive: true });

  writeFileSync(join(DEMO_DIR, '__shots/shot.html'), renderSmallPromo());
  writeFileSync(join(DEMO_DIR, '__shots/marquee.html'), renderMarquee());
  for (const shot of SHOTS) {
    writeFileSync(join(DEMO_DIR, `__shots/${shot.slug}.html`), renderComposition(shot));
  }
}

function startServer() {
  const server = createServer((request, response) => {
    const urlPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const file = join(DEMO_DIR, urlPath);

    if (!file.startsWith(DEMO_DIR) || !existsSync(file)) {
      response.writeHead(404);
      response.end('not found');
      return;
    }

    try {
      response.writeHead(200, {
        'content-type': MIME[extname(file)] || 'application/octet-stream',
        'cache-control': 'no-store',
      });
      response.end(readFileSync(file));
    } catch {
      response.writeHead(404);
      response.end('not found');
    }
  });

  return new Promise((resolvePromise) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolvePromise({ server, port: address.port });
    });
  });
}

function screenshot({ url, output, width, height, scale = 1 }) {
  const profile = join(
    tmpdir(),
    `changicon-store-${process.pid}-${Math.random().toString(36).slice(2)}`,
  );
  const args = [
    '--headless',
    '--disable-gpu',
    '--disable-crash-reporter',
    '--no-sandbox',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--lang=en-US',
    '--user-data-dir=' + profile,
    '--window-size=' + width + ',' + height,
    '--force-device-scale-factor=' + scale,
    '--virtual-time-budget=12000',
    '--screenshot=' + output,
    url,
  ];

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(CHROME, args, {
      stdio: process.env.STORE_DEBUG ? 'inherit' : 'ignore',
    });

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      rejectPromise(
        new Error(
          `Chrome screenshot timed out for ${url}. Re-run with STORE_DEBUG=1 for Chrome output.`,
        ),
      );
    }, 60_000);

    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      rejectPromise(error);
    });

    child.on('exit', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      rmSync(profile, { recursive: true, force: true });

      if (code !== 0 || !existsSync(output)) {
        rejectPromise(
          new Error(
            `Chrome screenshot failed for ${url} (exit ${code}). Re-run with STORE_DEBUG=1 for Chrome output.`,
          ),
        );
        return;
      }

      try {
        const image = readFileSync(output);
        const pngWidth = image.readUInt32BE(16);
        const pngHeight = image.readUInt32BE(20);
        const colorType = image[25];
        const expectedWidth = width * scale;
        const expectedHeight = height * scale;

        if (pngWidth !== expectedWidth || pngHeight !== expectedHeight) {
          throw new Error(
            `${output}: expected ${expectedWidth}x${expectedHeight}, got ${pngWidth}x${pngHeight}`,
          );
        }

        // Chrome screenshots of an opaque page are truecolor; catch alpha
        // before it reaches the store (the Web Store rejects transparency).
        if (colorType === 4 || colorType === 6) {
          throw new Error(`${output}: PNG has an alpha channel (color type ${colorType}).`);
        }

        resolvePromise({ path: output, width: pngWidth, height: pngHeight, colorType });
      } catch (error) {
        rejectPromise(error);
      }
    });
  });
}

async function main() {
  prepareDemo();
  mkdirSync(STORE_ASSETS, { recursive: true });
  mkdirSync(DOCS_SCREENS, { recursive: true });

  cpSync(join(ROOT, 'public/icon/128.png'), join(STORE_ASSETS, 'store-icon-128.png'));

  const { server, port } = await startServer();
  const base = `http://127.0.0.1:${port}`;
  const results = [];

  try {
    for (const shot of SHOTS) {
      results.push(
        await screenshot({
          url: `${base}/__shots/${shot.slug}.html`,
          output: join(STORE_ASSETS, `${shot.slug}.png`),
          width: 1280,
          height: 800,
        }),
      );
    }

    results.push(
      await screenshot({
        url: `${base}/__shots/shot.html`,
        output: join(STORE_ASSETS, 'small-promo-440x280.png'),
        width: 440,
        height: 280,
      }),
    );

    results.push(
      await screenshot({
        url: `${base}/__shots/marquee.html`,
        output: join(STORE_ASSETS, 'marquee-1400x560.png'),
        width: 1400,
        height: 560,
      }),
    );

    for (const popup of POPUP_SHOTS) {
      results.push(
        await screenshot({
          url: `${base}/demo.html?scenario=${popup.scenario}&theme=${popup.theme}&scope=page`,
          output: join(DOCS_SCREENS, popup.file),
          width: 320,
          height: popup.height,
          scale: popup.scale,
        }),
      );
    }
  } finally {
    server.close();
  }

  console.log('Generated assets:');
  for (const result of results) {
    console.log(`  ${result.path.replace(ROOT + '/', '')} — ${result.width}x${result.height}`);
  }

  if (!process.argv.includes('--keep')) {
    rmSync(DEMO_DIR, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
