# Changicon Privacy Policy

**Effective date:** 2026-11-15
**Applies to:** the Changicon browser extension (Chrome Web Store ID
`pcnnpfojchdoapfnaanpibdkjbdmglhi`) and its store listing.

Changicon is a local-only browser extension that replaces the favicon of web
pages with an icon you choose. This policy explains what it stores, why, and the
choices you have.

## The short version

- No server and no network requests.
- Icons and preferences are stored on your device in Chrome's extension storage.
- No account, analytics, telemetry, advertising, or tracking.
- The extension reads the address and favicon of the tab you invoke it on, and
  stores those values only when you apply or reset an icon.
- Delete individual icons with **Reset**, all icon data with **Clear all**, or
  uninstall the extension to remove its storage.

## What is stored

| Data | Why | When |
| --- | --- | --- |
| The icon you create (emoji, text, Lucide SVG, or uploaded image, converted to a data URL) | Show it in the tab and re-apply it later | Apply an icon |
| The customized page's address (`host + pathname`) | Match the icon to the page again | Apply an icon |
| The page's original favicon URL | Restore the site's own icon on reset | First apply to that page or site |
| Theme, background, and apply-to preferences | Keep the popup as you set it | Change a setting |

The extension does not store page text, form values, passwords, cookies,
keystrokes, mouse activity, location, health or financial information, or a
general browsing history. It does not read page content; it reads and rewrites
`<link rel="icon">` elements for pages where you applied an icon, and the active
tab's URL/favicon when you open the popup.

## How it is used

Only to display the icon, re-apply it on later visits, restore the site's
original favicon on reset, and remember popup preferences. No profiling,
advertising, or other use.

## Transmission, sharing, and third parties

- No transmission to the developer or any third party.
- No sale or rental of user data.
- No third-party code at runtime; all code is bundled, icons are generated
  locally, and no remote scripts or WebAssembly are loaded.
- Chrome stores extension data in your browser profile and may sync the profile
  according to your Google settings. That is controlled by Chrome/Google, not
  Changicon. Changicon uses `chrome.storage.local` (not `storage.sync`), so the
  extension itself does not sync icons between devices.

## Permissions

`storage` saves icons and preferences; `activeTab` reads the current tab's
address/favicon when you open the popup; `scripting` adds the content script to
tabs opened before install/update; website access is required to replace the
favicon on pages you choose. The content script does not run on `chrome://`,
`chrome-extension://`, or the Chrome Web Store.

## Retention and deletion

**Reset page/site** removes that page or site icon and restores the original
favicon. **Clear all** removes every saved icon and original favicon URL while
keeping theme/background/scope. Uninstalling removes the extension's storage.
There is no server-side copy to delete.

## Security

Data stays in Chrome's extension storage, protected by your browser profile and
operating-system account. Because there is no transmission, there is no
server-side data store to breach. Uploaded images are read locally and never
uploaded.

## Children

Changicon is a general-purpose browser utility, not directed to children under
13, and does not knowingly collect personal information from anyone.

## Limited Use statement

The use of information received from Google APIs will adhere to the Chrome Web
Store User Data Policy, including the Limited Use requirements.

Changicon does not currently use Google APIs; this statement is included because
the Chrome Web Store requires it for extensions that handle user data and may
apply if a future version integrates a Google service. Any such integration
would be disclosed before it ships.

## Changes and contact

If this policy changes, the effective date is updated and the new version is
published at the same URL; material data-handling changes are also described in
the release notes before submission. Questions or data requests: open an issue
at <https://github.com/niexia/customize-tab-icon/issues>. The Chrome Web Store
listing also shows the publisher contact address. Do not include sensitive
personal information in a public issue.
