# Changicon — Chrome Web Store submission

<!-- release: 1.1.0 -->

Copy-paste sheet for updating the store. Assets are in [`assets/`](assets/); the
public policy is [`../docs/privacy.md`](../docs/privacy.md); the end-to-end
release steps are in [`../docs/release-process.md`](../docs/release-process.md).

- Dashboard: <https://chrome.google.com/webstore/devconsole>
- Extension ID: `pcnnpfojchdoapfnaanpibdkjbdmglhi`
- Current version: `1.1.0` (last store build: `1.0.1`)
- Homepage: <https://github.com/niexia/customize-tab-icon>
- Support: <https://github.com/niexia/customize-tab-icon/issues>
- Privacy policy: <https://github.com/niexia/customize-tab-icon/blob/main/docs/privacy.md>

Chrome Web Store API v1.1 was retired on 2026-10-15, so upload the zip in the
dashboard; WXT 0.20's `wxt submit` does not work. API v2 needs WXT ≥ 0.21.5,
Node 22, and a service account (future migration).

## Product details

| Field | Value | Limit |
| --- | --- | --- |
| Title (manifest `name`) | `Changicon` | 9 / 75 |
| Summary (manifest `description`) | `Give any tab a custom icon — emoji, text, line icons, or your own image. Apply it to one page or a whole site.` | 110 / 132 |
| Category | **Tools** | — |
| Language | **English** | — |
| Visibility | **Public** | — |
| Mature content | **No** | — |
| Official URL | leave empty | — |
| Homepage / Support | repository / issues URLs above | — |

Title and summary come from the package; change `wxt.config.ts`, rebuild, and
upload a new package rather than editing only the dashboard. Additional store
locales are optional; the extension UI is English.

### Description

Plain text, **1,862 / 16,000** characters. Paste the block:

```text
Changicon lets you replace the favicon of any web page with a graphic you choose, so every tab is easy to recognize at a glance.

Pick what fits the page:
• Emoji — search the full emoji library and use any emoji.
• Text — up to two characters, auto-fitted into a clean badge.
• Library — browse a large Lucide set with instant search.
• Images — upload a PNG, JPG, WebP, GIF, or SVG (up to 5 MB), then crop to fill or fit the whole picture.

Choose where it applies:
• This page — only the current address.
• Whole site — every page on the domain, including subdomains. Page-specific picks still override the site-wide one.

Make it yours:
• White rounded tile or transparent background.
• Light, dark, or system theme.
• Reset any tab to the site's original favicon without reloading.
• "Clear all" removes every saved glyph.

Private by design:
• Custom artwork is generated on your device.
• Settings and images are stored locally in Chrome storage.
• No account, no analytics, no tracking, and no network requests.
• The extension only changes the page's favicon link; it does not read page content.

Good to know:
• Works on regular http(s) pages. Chrome's own pages, the Chrome Web Store, and the PDF viewer can't be customized.
• The site-wide choice uses the domain (for example, news.example.com and example.com share one graphic).
• Artwork is stored per browser profile and is not synced between devices.

Permissions and why they are needed:
• storage — save your artwork and preferences.
• activeTab — read the current tab's address and favicon when you open the popup.
• scripting — add the content script to tabs that were already open before install or update.
• Access to websites — required to replace the favicon on any page you choose.

Changicon is open source under the MIT license. Source, issues, and the privacy policy are linked below.
```

Keep "favicon" to five or fewer uses; avoid HTML and keyword stuffing.

## Graphic assets

Truecolor PNGs, exact sizes, no store-added padding. Upload the five screenshots
in this order.

| Field | File | Size |
| --- | --- | --- |
| Store icon | [`assets/store-icon-128.png`](assets/store-icon-128.png) | 128×128 |
| Screenshot 1 | [`assets/screenshot-1-hero.png`](assets/screenshot-1-hero.png) | 1280×800 |
| Screenshot 2 | [`assets/screenshot-2-emoji.png`](assets/screenshot-2-emoji.png) | 1280×800 |
| Screenshot 3 | [`assets/screenshot-3-icons.png`](assets/screenshot-3-icons.png) | 1280×800 |
| Screenshot 4 | [`assets/screenshot-4-site.png`](assets/screenshot-4-site.png) | 1280×800 |
| Screenshot 5 | [`assets/screenshot-5-text.png`](assets/screenshot-5-text.png) | 1280×800 |
| Small promo | [`assets/small-promo-440x280.png`](assets/small-promo-440x280.png) | 440×280 |
| Marquee | [`assets/marquee-1400x560.png`](assets/marquee-1400x560.png) | 1400×560 |

Regenerate after a UI change: `pnpm store:assets` (rebuilds, captures the real
popup with a mock `chrome.*` environment, writes `store/assets` and
`docs/screenshots`). The native file input follows the host OS language, so the
upload popover is not one of the five English screenshots.

## Privacy practices

**Single purpose:**

```text
Changicon has one purpose: to let the user replace the favicon (the icon shown in a browser tab) of web pages with an icon they choose, either for the current page or for a whole site. All icon generation and storage happen locally in the browser.
```

**Permission justifications** (one per dashboard field):

```text
storage: Stores the user's chosen tab icons (PNG/SVG data URLs), the original favicon URLs needed to restore them, and the theme, background, and scope preferences. Everything is kept in chrome.storage.local on the user's device and is never transmitted.
```

```text
activeTab: When the user opens the popup, the extension reads the active tab's URL and favIconUrl so it can show the current icon, offer Reset, and decide whether the page can be customized. This only happens for the tab the user invoked the extension on.
```

```text
scripting: Tabs that were already open before the extension was installed or updated do not have the declarative content script. The popup injects the extension's own content script into those tabs so the user does not have to reload every page before an icon can be applied.
```

```text
Host permission (*://*/*): The content script must be able to replace the <link rel="icon"> element on any regular web page the user chooses to customize, and the popup must reach already-open tabs on the same site so a page or site icon updates everywhere immediately. The extension does not read page text, form values, cookies, or network requests; it reads and rewrites favicon link elements only, and only for pages where the user has applied an icon.
```

**Remote code:** select **No**.

```text
All JavaScript and CSS are bundled in the extension package. Icons are generated locally with the Canvas API and XMLSerializer as data URLs. The extension does not load remote scripts, WebAssembly, or eval, and it makes no network requests.
```

**Data usage:** select **Web history**. It stores `host + pathname` (and the
original favicon URL) only for pages where the user applied an icon; nothing is
transmitted. Do not select PII, health, financial, authentication, personal
communications, location, or user activity. Website content may be added only if
a reviewer classifies the stored favicon URL that way; [the
policy](../docs/privacy.md) already discloses it.

**Certifications:** check all three — no sale/transfer, no unrelated use, no
creditworthiness/lending use.

Privacy policy URL:
`https://github.com/niexia/customize-tab-icon/blob/main/docs/privacy.md`. A
GitHub Pages URL is better long-term; update this field if the policy moves.

## Reviewer test instructions

Optional, but recommended for the broad host permission.

```text
Changicon is a local-only favicon customizer. No account or credentials are needed.

1. Open any regular http(s) page, for example https://example.com/.
2. Click the Changicon toolbar icon. The popup shows the current page's icon, a "This page" label, and Reset.
3. Click "Emoji", choose any emoji. The tab icon changes immediately; the page does not reload.
4. Reload the page. The emoji icon is applied again automatically.
5. Click "Reset page". The site's original favicon returns without a reload.
6. Open "Text", type "YT", confirm. A two-character badge becomes the tab icon.
7. Open "Upload", choose any PNG/JPG/WebP/SVG under 5 MB, confirm. The image is cropped into a rounded icon; "Fit whole image" letterboxes it instead.
8. Set "Apply to" to "Whole site" and pick an icon. Open another path on the same domain (and a subdomain if available). The icon applies on load and replaces page-specific icons for that site.
9. Use the trash icon -> "Clear all"; all saved icons are removed and theme/background/scope remain.
10. Open chrome://extensions/. The popup shows "This page can't be customized" and no errors.

Expected: page content, forms, and network activity are unchanged; only the <link rel="icon"> element is rewritten. The extension works offline and makes no network requests. The site-wide option uses the registrable domain, so www.example.com, news.example.com, and example.com share one icon. Chrome's own pages, chrome-extension:// pages, and the Chrome Web Store cannot be customized.

The broad host permission (*://*/*) is required because the user can customize any page and the extension must reach already-open tabs when a site-wide icon is applied. The content script only replaces favicon link elements; it does not read page text, forms, cookies, or network requests.
```

## Submission checklist

- [ ] `package.json` and `.output/chrome-mv3/manifest.json` show the same version; `pnpm check` passes.
- [ ] `pnpm zip` produced `.output/changicon-X.Y.Z-chrome.zip`; smoke-tested on a clean profile.
- [ ] Changelog and release markers match (`pnpm test` covers both).
- [ ] Five screenshots are 1280×800 opaque; promo 440×280; marquee 1400×560; icon 128×128.
- [ ] Listing fields above pasted; no Markdown fences.
- [ ] Single purpose, four permission justifications, remote code = No, data usage, certifications filled.
- [ ] Privacy policy URL public and current.
- [ ] Test instructions pasted (optional).
- [ ] 2-Step Verification enabled; extension slot available; EU trader declaration completed if distributing there.
- [ ] Distribution/visibility/regions correct.
- [ ] After approval: install from store, verify apply/reload/reset/whole-site, and confirm the GitHub Release has the zip.
- [ ] If rejected: fix the cited policy, bump the version, resubmit; do not resubmit unchanged.

## Optional promo video

A YouTube link is optional. If recording: 20–30 s, 16:9, real UI, English
captions, no unlicensed music, no claims beyond this sheet. Show mixed tab icons,
the popup, emoji selection, reset, whole-site, and the end card "No tracking ·
Icons generated locally". Put the URL in **Global promo video**.
