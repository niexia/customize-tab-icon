# Chrome Web Store listing — Changicon

<!-- release: 1.1.0 -->

Copy-paste copy for the Chrome Web Store Developer Dashboard. Character counts
include spaces and were verified against `package.json` v1.1.0.

- Dashboard: <https://chrome.google.com/webstore/devconsole>
- Extension ID: `pcnnpfojchdoapfnaanpibdkjbdmglhi`
- Listing assets: [`assets/`](assets/) · Asset guide: [`README.md`](README.md)
- Privacy practices: [`permissions.md`](permissions.md) · Policy: [`privacy.md`](privacy.md)
- Reviewer notes: [`review-notes.md`](review-notes.md)

---

## Product details

| Field | Value | Limit |
| --- | --- | --- |
| Title (from package) | `Changicon` | 9 / 75 |
| Summary (from package) | `Give any tab a custom icon — emoji, text, line icons, or your own image. Apply it to one page or a whole site.` | 110 / 132 |
| Category | **Tools** | — |
| Language | **English** | — |
| Store icon | `assets/store-icon-128.png` (128×128) | required |

The title comes from the manifest `name` and the summary from the manifest
`description`. Both are rendered by Chrome from the package; keep them in sync
with `wxt.config.ts` and `package.json`. Changing the name changes the browser
action label and the extension's identity; if you want a longer store title,
update `wxt.config.ts`, rebuild, and re-upload rather than editing only the
dashboard.

### Detailed description

Plain text (the dashboard does not render Markdown). Paste the block below.
Length: **1,844 / 16,000** characters.

```text
Changicon lets you replace the favicon of any web page with an icon you choose, so every tab is easy to recognize at a glance.

Pick what fits the page:
• Emoji — search the full emoji library and use any emoji.
• Text — up to two characters, auto-fitted into a clean badge.
• Icons — browse a large Lucide icon set with instant search.
• Images — upload a PNG, JPG, WebP, GIF, or SVG (up to 5 MB), then crop to fill or fit the whole picture.

Choose where it applies:
• This page — only the current address.
• Whole site — every page on the domain, including subdomains. Page-specific icons still override the site icon.

Make it yours:
• White rounded tile or transparent background.
• Light, dark, or system theme.
• Reset any tab to the site's original favicon without reloading.
• "Clear all" removes every saved icon.

Private by design:
• Custom icons are generated on your device.
• Settings and icons are stored locally in Chrome storage.
• No account, no analytics, no tracking, and no network requests.
• The extension only changes the page's favicon link; it does not read page content.

Good to know:
• Works on regular http(s) pages. Chrome's own pages, the Chrome Web Store, and the PDF viewer can't be customized.
• The site icon uses the domain (for example, news.example.com and example.com share one icon).
• Icons are stored per browser profile and are not synced between devices.

Permissions and why they are needed:
• storage — save your icons and preferences.
• activeTab — read the current tab's address and favicon when you open the popup.
• scripting — add the content script to tabs that were already open before install or update.
• Access to websites — required to replace the favicon on any page you choose.

Changicon is open source under the MIT license. Source, issues, and the privacy policy are linked below.
```

Avoid adding HTML, repeated keywords, or unverifiable claims. The store policy
treats a keyword repeated more than five times as keyword spam; the copy above
uses "favicon" five times and no other term excessively.

---

## Graphic assets

Upload in this order. Every file is PNG, exactly sized, and has no alpha channel;
`pnpm docs:check` verifies this.

| Dashboard field | File | Size | Notes |
| --- | --- | --- | --- |
| Store icon | [`assets/store-icon-128.png`](assets/store-icon-128.png) | 128×128 | Same artwork as the packaged extension icon |
| Screenshot 1 | [`assets/screenshot-1-hero.png`](assets/screenshot-1-hero.png) | 1280×800 | Hero: page-scoped icon, mixed tab icons |
| Screenshot 2 | [`assets/screenshot-2-emoji.png`](assets/screenshot-2-emoji.png) | 1280×800 | Emoji picker |
| Screenshot 3 | [`assets/screenshot-3-icons.png`](assets/screenshot-3-icons.png) | 1280×800 | Lucide icon search |
| Screenshot 4 | [`assets/screenshot-4-site.png`](assets/screenshot-4-site.png) | 1280×800 | Whole-site scope, one icon on every tab |
| Screenshot 5 | [`assets/screenshot-5-text.png`](assets/screenshot-5-text.png) | 1280×800 | Two-character text badge |
| Small promo tile | [`assets/small-promo-440x280.png`](assets/small-promo-440x280.png) | 440×280 | Required in practice; items without it are listed after items that have one |
| Marquee promo tile | [`assets/marquee-1400x560.png`](assets/marquee-1400x560.png) | 1400×560 | Optional; needed for marquee placement |
| Global promo video | — | — | Optional; see [`promo-video.md`](promo-video.md) |

Screenshots are full-bleed (no padding or rounded corners added by the store).
Upload exactly five; the store displays them downscaled, so the 1280×800
versions are preferred.

The images are generated from the real popup bundle with a mock extension
environment; see [`README.md`](README.md) for the pipeline and the one
localization caveat (the native file input follows the host OS language, which
is why the upload flow is not one of the five store screenshots).

---

## Additional fields

| Field | Value |
| --- | --- |
| Official URL | Leave empty. Changicon is not an official site for a third-party brand. |
| Homepage URL | `https://github.com/niexia/customize-tab-icon` |
| Support URL | `https://github.com/niexia/customize-tab-icon/issues` |
| Privacy policy URL | `https://github.com/niexia/customize-tab-icon/blob/main/store/privacy.md` |
| Mature content | **No** |
| Visibility | **Public** |
| Regions | All regions (or the subset you intend to support) |
| Pricing | Free |

The GitHub blob URL works as a policy URL, but a stable site is better. If you
enable GitHub Pages for this repository, publish `store/privacy.md` as
`https://niexia.github.io/customize-tab-icon/privacy.html` (or similar) and
replace the field above. Whatever URL you choose must be public, current, and
match the data disclosures in `permissions.md`.

---

## Privacy practices (summary)

The full paste-ready answers are in [`permissions.md`](permissions.md). In short:

- **Single purpose:** replace the tab icon (favicon) of web pages with an icon
  the user chooses, for one page or a whole site.
- **Permissions:** `storage`, `activeTab`, `scripting`, and site access
  `*://*/*`, each with a specific justification.
- **Remote code:** **No**.
- **Data usage:** stored locally and never transmitted. The recommended
  dashboard selection is **Web history**, because the extension stores the
  address of pages you customize in order to re-apply the icon. See the
  rationale and the exact wording in `permissions.md` before submitting.
- **Limited Use:** the policy in `privacy.md` includes the required statement.
- **Mature content:** No.
- **Test instructions:** optional for publishing; recommended because of the
  broad host permission. Use `review-notes.md`.

---

## Localization

A second locale is optional. The extension UI is English, so only add a
localized listing if you can keep the screenshots and description consistent.
Per-locale listings are managed with the language dropdown at the top of the
Store Listing page; the name and summary are localized through
`_locales/<locale>/messages.json`, while the detailed description and
screenshots are entered per locale in the dashboard. The small promo tile and
marquee cannot be localized.

If you add Simplified Chinese, add `listing.zh-CN.md` here, translate the
description, and add a `zh_CN` locale to `public/_locales/`. Do not machine-
translate the privacy policy; publish a reviewed translation or link to the
English policy.

---

## Updating this file

1. Change behavior, then update [`docs/architecture.md`](../docs/architecture.md).
2. Regenerate assets with `pnpm store:assets` if the UI changed.
3. Update the version line at the top and the feature copy above.
4. Run `pnpm docs:check`.
5. Paste the changed fields into the dashboard; do not paste Markdown fences.
