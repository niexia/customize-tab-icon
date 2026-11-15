# Changicon — Chrome Web Store kit

<!-- release: 1.1.0 -->

Everything needed to publish or update Changicon in the Chrome Web Store:
listing copy, asset map, privacy answers, reviewer steps, and the public privacy
policy. Images live in [`assets/`](assets/); the current build is `1.1.0`.

- Dashboard: <https://chrome.google.com/webstore/devconsole>
- Extension ID: `pcnnpfojchdoapfnaanpibdkjbdmglhi`
- Homepage: <https://github.com/niexia/customize-tab-icon>
- Support: <https://github.com/niexia/customize-tab-icon/issues>
- Privacy policy URL:
  <https://github.com/niexia/customize-tab-icon/blob/main/store/README.md#privacy-policy>
- Release process: [`../docs/release-process.md`](../docs/release-process.md)

> The last published store build was `1.0.1`. This repository is prepared for
> `1.1.0`; the dashboard only shows the new version after the zip is uploaded.
> Chrome Web Store API v1.1 was retired on 2026-10-15, so submission is manual
> until the WXT/API v2 migration described in the release process.

## At a glance

| Field | Value | Limit |
| --- | --- | --- |
| Title (manifest `name`) | `Changicon` | 9 / 75 |
| Summary (manifest `description`) | `Give any tab a custom icon — emoji, text, line icons, or your own image. Apply it to one page or a whole site.` | 110 / 132 |
| Detailed description | Section below | 1,862 / 16,000 |
| Category | **Tools** | — |
| Language | **English** | — |
| Visibility | **Public** | — |
| Mature content | **No** | — |
| Pricing | Free | — |

Title and summary are rendered from the package; keep them in sync with
`wxt.config.ts` and `package.json`, rebuild, and upload a new package rather than
editing only the dashboard. A longer title changes the browser action label and
the extension's identity.

## Listing copy

### Detailed description

Plain text (the dashboard does not render Markdown). Paste the block below.

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

Avoid HTML, keyword stuffing, or claims the extension cannot support. The copy
keeps "favicon" to five occurrences and uses synonyms elsewhere.

### Additional fields

| Dashboard field | Value |
| --- | --- |
| Official URL | Leave empty (not an official site for a third-party brand) |
| Homepage URL | `https://github.com/niexia/customize-tab-icon` |
| Support URL | `https://github.com/niexia/customize-tab-icon/issues` |
| Privacy policy URL | `https://github.com/niexia/customize-tab-icon/blob/main/store/README.md#privacy-policy` |
| Mature content | No |
| Regions | All regions, or the intended subset |
| Promo video | Optional; see the storyboard below |

A GitHub Pages URL is a better long-term home for the policy. If Pages is
enabled, publish the `Privacy policy` section at a stable URL and update this
table. The policy must stay public, current, and consistent with the data
disclosures below.

### Localization

Optional. The extension UI is English; only add a second store locale if the
screenshots and description can stay consistent. Name and summary are localized
through `_locales/<locale>/messages.json`; the detailed description, screenshots,
and video are entered per locale in the dashboard. Promo tiles cannot be
localized.

## Graphic assets

All files are exact-size truecolor PNGs. Upload the five screenshots in order.

| Field | File | Size | Notes |
| --- | --- | --- | --- |
| Store icon | [`assets/store-icon-128.png`](assets/store-icon-128.png) | 128×128 | Same artwork as the packaged icon; 96×96 safe area recommended |
| Screenshot 1 | [`assets/screenshot-1-hero.png`](assets/screenshot-1-hero.png) | 1280×800 | Page-scoped icon, mixed tab icons |
| Screenshot 2 | [`assets/screenshot-2-emoji.png`](assets/screenshot-2-emoji.png) | 1280×800 | Emoji picker |
| Screenshot 3 | [`assets/screenshot-3-icons.png`](assets/screenshot-3-icons.png) | 1280×800 | Lucide search |
| Screenshot 4 | [`assets/screenshot-4-site.png`](assets/screenshot-4-site.png) | 1280×800 | Whole-site scope |
| Screenshot 5 | [`assets/screenshot-5-text.png`](assets/screenshot-5-text.png) | 1280×800 | Two-character badge |
| Small promo tile | [`assets/small-promo-440x280.png`](assets/small-promo-440x280.png) | 440×280 | Effectively required; items without one are listed later |
| Marquee promo tile | [`assets/marquee-1400x560.png`](assets/marquee-1400x560.png) | 1400×560 | Optional; needed for marquee placement |

Screenshots are full-bleed, opaque, and have no store-added padding or rounded
corners. The store displays them downscaled; keep important text away from the
edges. `store-icon-128.png` is copied from `public/icon/128.png`.

### Regenerating assets

```bash
pnpm store:assets
```

The script rebuilds the popup, mounts it with a minimal `chrome.*` mock, serves
it on `127.0.0.1`, and captures the real UI with headless Chrome. It writes the
five 1280×800 frames and the promo tiles, plus the 2× `docs/screenshots/` used
by the README. It verifies dimensions and rejects alpha for screenshots before
writing. Requires Node 22+ and a local Chrome/Chromium (`CHROME_PATH` if not in
the macOS app path); no network access is used.

The native `<input type="file">` follows the host OS language, so the upload
popover is not one of the five English store screenshots. Capture on an
English-locale OS if you need that shot; do not retouch the control.

## Permissions and privacy practices

### Single purpose

```text
Changicon has one purpose: to let the user replace the favicon (the icon shown in a browser tab) of web pages with an icon they choose, either for the current page or for a whole site. All icon generation and storage happen locally in the browser.
```

The manifest requests `storage`, `activeTab`, `scripting`, and host access
`*://*/*`; there is no `tabs` permission, no `unlimitedStorage`, no `webRequest`,
and no remote host beyond the content-script match.

### Permission justifications

Paste each block into the matching dashboard field.

**`storage`**

```text
Stores the user's chosen tab icons (PNG/SVG data URLs), the original favicon URLs needed to restore them, and the theme, background, and scope preferences. Everything is kept in chrome.storage.local on the user's device and is never transmitted.
```

**`activeTab`**

```text
When the user opens the popup, the extension reads the active tab's URL and favIconUrl so it can show the current icon, offer Reset, and decide whether the page can be customized. This only happens for the tab the user invoked the extension on.
```

**`scripting`**

```text
Tabs that were already open before the extension was installed or updated do not have the declarative content script. The popup injects the extension's own content script into those tabs so the user does not have to reload every page before an icon can be applied.
```

**Host permission `*://*/*`**

```text
The content script must be able to replace the <link rel="icon"> element on any regular web page the user chooses to customize, and the popup must reach already-open tabs on the same site so a page or site icon updates everywhere immediately. The extension does not read page text, form values, cookies, or network requests; it reads and rewrites favicon link elements only, and only for pages where the user has applied an icon.
```

Broad host access is required because the user can customize any page and the
extension cannot know the target site before the popup opens. The content script
does not run on `chrome://`, `chrome-extension://`, or the Chrome Web Store.

### Remote code

Select **No, I am not using remote code**.

```text
All JavaScript and CSS are bundled in the extension package. Icons are generated locally with the Canvas API and XMLSerializer as data URLs. The extension does not load remote scripts, WebAssembly, or eval, and it makes no network requests.
```

### Data usage

Everything stays in `chrome.storage.local`; nothing is transmitted.

| Category | Selected | What is stored |
| --- | --- | --- |
| Personally identifiable information | No | — |
| Health, financial, authentication, personal communications, location | No | — |
| Web history | **Yes** | `host + pathname` of pages where the user applied an icon, plus the original favicon URL |
| User activity | No | — |
| Website content | No* | Only the favicon link URL is read; page text, images, and forms are not |

\* If a reviewer classifies the stored favicon URL as website content, add that
category; the privacy policy below already discloses it. Do not select categories
the extension does not touch.

Why Web history: the extension stores the address of pages the user explicitly
customized so it can re-apply the icon. It does not collect a general browsing
history, page titles, timestamps, or visited-page lists; a key is written only
when the user applies an icon.

### Certifications

- [x] I do not sell or transfer user data to third parties, outside of the
      approved use cases.
- [x] I do not use or transfer user data for purposes unrelated to the item's
      single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for
      lending purposes.

No analytics, telemetry, crash reporting, advertising, or affiliate tracking.
No server, account, or cloud sync. Users can delete one icon with **Reset** and
all icon data with **Clear all**; uninstalling removes the extension's storage.

## Reviewer test instructions

Optional for publishing, but recommended because of the broad host permission.
Paste this into **Test instructions**:

```text
Changicon is a local-only favicon customizer. No account or credentials are needed.

1. Open any regular http(s) page, for example https://example.com/.
2. Click the Changicon toolbar icon. The popup shows the current page's icon, a "This page" label, and a Reset button.
3. Click "Emoji", search or scroll, and pick any emoji. The tab icon changes immediately; the page does not reload.
4. Reload the page. The emoji icon is applied again automatically.
5. Click "Reset page". The site's original favicon returns immediately, without a reload.
6. Open "Text", type "YT", and click Confirm. A two-character badge becomes the tab icon.
7. Open "Upload", choose any PNG/JPG/WebP/SVG under 5 MB, and click Confirm. The image is cropped into a rounded tab icon. The "Fit whole image" checkbox letterboxes it instead.
8. Set "Apply to" to "Whole site" and pick an icon. Open another path on the same domain (and a subdomain if available). The same icon is applied on load, and page-specific icons for that site are replaced.
9. Use the trash icon -> "Clear all" to remove every saved icon. Theme, background, and scope settings remain.
10. Open chrome://extensions/. The popup shows "This page can't be customized" and does not throw errors.

Expected: page content, forms, and network activity are unchanged; only the <link rel="icon"> element is rewritten. The extension works offline and makes no network requests. The site-wide option uses the registrable domain, so www.example.com, news.example.com, and example.com share one icon. Chrome's own pages, chrome-extension:// pages, and the Chrome Web Store cannot be customized.

The broad host permission (*://*/*) is required because the user can customize any page and the extension must reach already-open tabs when a site-wide icon is applied. The content script does not read page text, form values, cookies, or network requests; it only replaces favicon link elements.
```

## Submission checklist

- [ ] Version in `package.json` is the version being submitted; `.output/chrome-mv3/manifest.json` matches.
- [ ] `pnpm check` passes; `pnpm zip` produced `.output/changicon-X.Y.Z-chrome.zip`.
- [ ] Changelog has the version entry and docs markers match (`pnpm test` covers both).
- [ ] The five screenshots are 1280×800, opaque, and match the submitted UI.
- [ ] Small promo tile 440×280; marquee 1400×560; store icon 128×128.
- [ ] Listing fields from this file are pasted; no Markdown fences.
- [ ] Privacy practices filled: single purpose, all four permission
      justifications, remote code = No, data usage, certifications.
- [ ] Privacy policy URL is public and returns the policy below.
- [ ] Test instructions pasted (optional but recommended).
- [ ] 2-Step Verification enabled; an extension slot is available.
- [ ] Distribution/visibility/regions and EU trader declaration are correct.
- [ ] Zip smoke-tested on a clean Chrome profile.
- [ ] After approval: install from the store, verify apply/reload/reset/whole-site,
      and check the GitHub Release has the zip attached.
- [ ] If rejected, fix the cited policy, bump the version, and resubmit; do not
      resubmit unchanged.

## Promo video (optional)

A YouTube link is optional. If recording, use a 20–30 second 16:9 video of the
real UI: mixed tab icons (0–3 s), open the popup (3–6 s), pick an emoji and show
the instant change (6–11 s), Reset (11–15 s), whole-site + a second subdomain
(15–20 s), light theme/upload (20–24 s), end card "No tracking · Icons generated
locally" (24–28 s). English captions; no unlicensed music; no claims beyond this
document. Add the URL to **Store listing → Global promo video**.

## Privacy policy

**Effective date:** 2026-11-15
**Applies to:** the Changicon browser extension (Chrome Web Store ID
`pcnnpfojchdoapfnaanpibdkjbdmglhi`) and this store listing.

Changicon is a local-only browser extension that replaces the favicon of web
pages with an icon you choose. This policy explains what it stores, why, and the
choices you have.

### The short version

- No server and no network requests.
- Icons and preferences are stored on your device in Chrome's extension storage.
- No account, analytics, telemetry, advertising, or tracking.
- The extension reads the address and favicon of the tab you invoke it on, and
  stores those values only when you apply or reset an icon.
- Delete individual icons with **Reset**, all icon data with **Clear all**, or
  uninstall the extension to remove its storage.

### What is stored

| Data | Why | When |
| --- | --- | --- |
| The icon you create (emoji, text, Lucide SVG, or uploaded image, converted to a data URL) | Show it in the tab and re-apply it later | Apply an icon |
| The customized page's address (`host + pathname`) | Match the icon to the page again | Apply an icon |
| The page's original favicon URL | Restore the site's own icon on reset | First apply to that page/site |
| Theme, background, and apply-to preferences | Keep the popup as you set it | Change a setting |

The extension does not store page text, form values, passwords, cookies,
keystrokes, mouse activity, location, health or financial information, or a
general browsing history. It does not read page content; it reads and rewrites
`<link rel="icon">` elements for pages where you applied an icon, and the active
tab's URL/favicon when you open the popup.

### How it is used

Only to display the icon, re-apply it on later visits, restore the site's
original favicon on reset, and remember popup preferences. No profiling,
advertising, or other use.

### Transmission, sharing, and third parties

- No transmission to the developer or any third party.
- No sale or rental of user data.
- No third-party code at runtime; all code is bundled, icons are generated
  locally, and no remote scripts or WebAssembly are loaded.
- Chrome stores extension data in your browser profile and may sync the profile
  according to your Google settings. That is controlled by Chrome/Google, not
  Changicon. Changicon uses `chrome.storage.local` (not `storage.sync`), so the
  extension itself does not sync icons between devices.

### Permissions

`storage` saves icons and preferences; `activeTab` reads the current tab's
address/favicon when you open the popup; `scripting` adds the content script to
tabs opened before install/update; website access is required to replace the
favicon on pages you choose. The content script does not run on `chrome://`,
`chrome-extension://`, or the Chrome Web Store.

### Retention and deletion

**Reset page/site** removes that page or site icon and restores the original
favicon. **Clear all** removes every saved icon and original favicon URL while
keeping theme/background/scope. Uninstalling removes the extension's storage.
There is no server-side copy to delete.

### Security

Data stays in Chrome's extension storage, protected by your browser profile and
operating-system account. Because there is no transmission, there is no
server-side data store to breach. Uploaded images are read locally and never
uploaded.

### Children

Changicon is a general-purpose browser utility, not directed to children under
13, and does not knowingly collect personal information from anyone.

### Limited Use statement

The use of information received from Google APIs will adhere to the Chrome Web
Store User Data Policy, including the Limited Use requirements.

Changicon does not currently use Google APIs; this statement is included because
the Chrome Web Store requires it for extensions that handle user data and may
apply if a future version integrates a Google service. Any such integration
would be disclosed before it ships.

### Changes and contact

If this policy changes, the effective date is updated and the new version is
published at the same URL; material data-handling changes are also described in
the release notes before submission. Questions or data requests: open an issue
at <https://github.com/niexia/customize-tab-icon/issues>. The Chrome Web Store
listing also shows the publisher contact address. Do not include sensitive
personal information in a public issue.

## Maintaining this kit

- Behavior changes: update [`../docs/architecture.md`](../docs/architecture.md)
  first, then this file.
- UI changes: `pnpm store:assets`, review the five screenshots, and update the
  README images.
- Permission/data changes: update the justifications and policy section here in
  the same commit.
- Release steps and tooling: [`../docs/release-process.md`](../docs/release-process.md).
