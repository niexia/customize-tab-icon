# Changicon Privacy Policy

**Effective date:** 2026-11-15
**Applies to:** the Changicon browser extension (Chrome Web Store ID
`pcnnpfojchdoapfnaanpibdkjbdmglhi`) and this repository's store listing.

Changicon is a local-only browser extension that lets you replace the favicon
(the icon shown in a browser tab) of web pages with an icon you choose. This
policy explains what the extension stores, why, and the choices you have.

## The short version

- Changicon has **no server** and makes **no network requests**.
- Your icons and preferences are stored **on your device** in Chrome's extension
  storage.
- There is **no account, analytics, telemetry, advertising, or tracking**.
- The extension reads the address and favicon of the tab you invoke it on, and
  stores those values only when you apply or reset an icon.
- You can delete individual icons with **Reset**, or all icon data with **Clear
  all**; uninstalling the extension removes its storage.

## What the extension stores

| Data | Why it is stored | Where | When |
| --- | --- | --- | --- |
| The icon you create (emoji, text, Lucide SVG, or uploaded image, converted to a data URL) | To show it in the tab and re-apply it on later visits | `chrome.storage.local` | When you apply an icon |
| The address of the page you customized (`host + pathname`) | To match the icon to the page again | `chrome.storage.local` | When you apply an icon |
| The page's original favicon URL | To restore the site's own icon when you reset | `chrome.storage.local` | When you first apply an icon to that page or site |
| Theme, background, and apply-to preferences | To keep the popup looking and behaving the way you set it | `chrome.storage.local` | When you change a setting |

The extension does **not** store page text, form values, passwords, cookies,
keystrokes, mouse activity, location, health or financial information, or a
general browsing history. It does not read the content of the page; it only
reads and rewrites `<link rel="icon">` elements for pages where you applied an
icon, and the active tab's URL/favicon when you open the popup.

## How the data is used

The stored values are used only to:

1. display your custom icon in the tab;
2. apply the icon again when the page or site is opened;
3. restore the site's original favicon when you reset; and
4. remember your popup preferences.

There is no other use, profiling, advertising, or sharing.

## Transmission and third parties

- **No transmission.** Changicon does not send data to the developer or to any
  third party. It does not operate a backend and does not use a CDN, analytics
  service, crash reporter, or ad network.
- **No sale.** We do not sell or rent user data.
- **No third-party code at runtime.** All code is bundled in the extension
  package. Icons are generated locally with the Canvas API and serialized
  locally; no remote scripts or WebAssembly are loaded.
- **Chrome itself.** Chrome stores extension data in your browser profile and may
  sync your Chrome profile according to your Google settings. That behavior is
  controlled by Chrome/Google, not by Changicon. Changicon uses
  `chrome.storage.local` (not `storage.sync`), so the extension itself does not
  sync icons between devices.

## Permissions and why they are needed

| Permission | Use |
| --- | --- |
| `storage` | Save your icons, original favicon URLs, and preferences locally |
| `activeTab` | Read the current tab's address and favicon when you open the popup |
| `scripting` | Add the content script to tabs that were open before install/update so you do not have to reload them |
| Access to websites (`*://*/*`) | Replace the favicon on any regular web page you choose to customize, and update other open tabs on the same site |

The content script does not run on `chrome://` pages, `chrome-extension://` pages,
or the Chrome Web Store. It does not access pages where you have not applied an
icon except to check whether a stored icon matches the current address.

## Retention and deletion

- **Reset page / Reset site** removes the stored icon for that page or site and
  restores the site's own favicon.
- **Clear all** (trash icon in the popup footer) removes every saved icon and the
  associated original favicon URLs. Theme, background, and scope preferences are
  kept.
- **Uninstalling Changicon** removes the extension's storage from your browser
  profile.
- There is no server-side copy to delete.

## Security

All data stays within Chrome's extension storage, protected by your browser
profile and operating-system account. Because there is no transmission, there is
no server-side data store to breach. Icons are data URLs generated from local
content; uploaded images are read locally and never uploaded.

## Children

Changicon is a general-purpose browser utility and is not directed to children
under 13. It does not knowingly collect personal information from anyone.

## Limited Use statement

The use of information received from Google APIs will adhere to the Chrome Web
Store User Data Policy, including the Limited Use requirements.

Changicon does not currently use Google APIs; this statement is included because
the Chrome Web Store requires it for extensions that handle user data and may
apply if a future version integrates a Google service. Any such integration
would be disclosed before it ships.

## Changes to this policy

If this policy changes, the effective date above is updated and the new version
is published at the same URL. Material changes to data handling are also
described in the store listing's release notes before the version is submitted.
Continuing to use the extension after a change means you accept the updated
policy.

## Contact

Privacy questions or data requests: open an issue at
<https://github.com/niexia/customize-tab-icon/issues>. The Chrome Web Store
listing also shows the publisher contact address. Please do not include sensitive
personal information in a public issue.

## Related documents

- [Permission justifications for the Chrome Web Store](permissions.md)
- [Store listing](listing.md)
- [Architecture and privacy design](../docs/architecture.md#9-security-and-privacy)
