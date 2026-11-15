# Privacy practices and permission justifications

<!-- release: 1.1.0 -->

Paste-ready answers for the Chrome Web Store **Privacy practices** tab. The
dashboard wording can change; map each answer to the corresponding field and keep
the substance. The public policy is [`privacy.md`](privacy.md).

> Before submitting, verify the manifest still requests exactly these
> permissions. Remove any permission the extension no longer uses; the store
> requires a new package upload before the justification fields update.

Current manifest (`wxt.config.ts`):

```ts
permissions: ['storage', 'activeTab', 'scripting'],
host_permissions: ['*://*/*'],
```

There is **no** `tabs` permission, no `unlimitedStorage`, no `webRequest`, and no
remote host beyond the content-script match.

---

## 1. Single purpose

Paste:

```text
Changicon has one purpose: to let the user replace the favicon (the icon shown in a browser tab) of web pages with an icon they choose, either for the current page or for a whole site. All icon generation and storage happen locally in the browser.
```

Why this is narrow: the extension has one user-facing function (replace a tab's
favicon), one storage area (`chrome.storage.local`), no background worker, no
network access, no accounts, and no second feature such as a new-tab page,
search provider, or ad injection.

---

## 2. Permission justifications

Paste each block into the matching dashboard field. Each is deliberately specific
about what is read and what is not.

### `storage`

```text
Stores the user's chosen tab icons (PNG/SVG data URLs), the original favicon URLs needed to restore them, and the theme, background, and scope preferences. Everything is kept in chrome.storage.local on the user's device and is never transmitted.
```

### `activeTab`

```text
When the user opens the popup, the extension reads the active tab's URL and favIconUrl so it can show the current icon, offer Reset, and decide whether the page can be customized. This only happens for the tab the user invoked the extension on.
```

### `scripting`

```text
Tabs that were already open before the extension was installed or updated do not have the declarative content script. The popup injects the extension's own content script into those tabs so the user does not have to reload every page before an icon can be applied.
```

### Host permission `*://*/*`

```text
The content script must be able to replace the <link rel="icon"> element on any regular web page the user chooses to customize, and the popup must reach already-open tabs on the same site so a page or site icon updates everywhere immediately. The extension does not read page text, form values, cookies, or network requests; it reads and rewrites favicon link elements only, and only for pages where the user has applied an icon.
```

Why broad host access instead of optional per-site permissions: the user can
customize any page, and the extension cannot know the target site before the
user opens the popup. Narrowing this would either require an extra permission
prompt per site or break the "whole site" and open-tab sync flows. The content
script does not run on `chrome://`, `chrome-extension://`, or the Chrome Web
Store.

---

## 3. Remote code

Select **No, I am not using remote code**.

```text
All JavaScript and CSS are bundled in the extension package. Icons are generated locally with the Canvas API and XMLSerializer as data URLs. The extension does not load remote scripts, WebAssembly, or eval, and it makes no network requests.
```

---

## 4. Data usage disclosure

The extension handles only what is needed to remember and restore the user's
icons. Everything stays in `chrome.storage.local`.

| Data category | Selected? | What is stored | Where |
| --- | --- | --- | --- |
| Personally identifiable information | **No** | — | — |
| Health information | **No** | — | — |
| Financial and payment information | **No** | — | — |
| Authentication information | **No** | — | — |
| Personal communications | **No** | — | — |
| Location | **No** | — | — |
| Web history | **Yes** | The `host + pathname` of pages where the user applied an icon, plus the page's original favicon URL for restoring it | Local Chrome storage only |
| User activity | **No** | — | — |
| Website content | **No**¹ | Only the favicon link URL is read; page text, images, and form content are not read or stored | — |

¹ If a reviewer classifies the stored favicon URL as "website content," add that
category as well. The policy in `privacy.md` already discloses the favicon URL,
so the answer remains accurate either way. Do not select categories the
extension does not touch.

Why "Web history" is the right primary category: the extension stores the address
of pages the user explicitly customized so it can re-apply the icon on the next
load. It does not collect a general browsing history, page titles, timestamps, or
visited-page lists. It only writes a key when the user applies an icon.

### Certifications

Check every statement that applies; all of the following are true for Changicon:

- [x] I do not sell or transfer user data to third parties, outside of the
      approved use cases.
- [x] I do not use or transfer user data for purposes that are unrelated to my
      item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for
      lending purposes.

Additional statements that describe the implementation:

- No analytics, telemetry, crash reporting, advertising, or affiliate tracking.
- No server, no account, no cloud sync.
- No data is transmitted off the device.
- The user can delete individual icons with **Reset** and all icon data with
  **Clear all**; uninstalling removes the extension's storage.

---

## 5. Privacy policy

The dashboard requires a privacy policy URL whenever the item handles user data,
including local-only storage. Recommended URL while the repository is on GitHub:

```text
https://github.com/niexia/customize-tab-icon/blob/main/store/privacy.md
```

A GitHub Pages URL is a better long-term home. If you enable Pages, publish the
policy at a stable path and update the dashboard field and
[`listing.md`](listing.md). The policy must remain public, current, and
consistent with the answers above.

The policy includes the Limited Use statement required by the Chrome Web Store
User Data Policy:

```text
The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.
```

---

## 6. Other dashboard fields

| Field | Answer |
| --- | --- |
| Mature content | No |
| Visibility | Public |
| Regions | All regions, or the subset you intend |
| Pricing | Free |
| Test instructions | Optional; use [`review-notes.md`](review-notes.md) because of the broad host permission |
| Official URL | Leave empty |
| Homepage URL | `https://github.com/niexia/customize-tab-icon` |
| Support URL | `https://github.com/niexia/customize-tab-icon/issues` |

---

## 7. Keeping this file accurate

Change this file in the same commit as any of the following:

- a permission is added or removed in `wxt.config.ts`;
- a new storage key holds user data;
- data starts leaving the device (it must not, per the architecture invariants);
- the privacy policy URL or contact route changes.

Then re-run `pnpm docs:check` and re-read the store dashboard fields. Justification
text is not versioned by the Chrome Web Store API; it is edited in the dashboard
for the version you are submitting.
