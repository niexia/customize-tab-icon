---
name: store-listing
description: Use when updating the Chrome Web Store listing for Changicon — description, screenshots, promo tiles, permissions/privacy answers, or the submission checklist.
---

# Update the Changicon store listing

The store kit lives in [`store/`](../../../store/). Read
[`store/README.md`](../../../store/README.md),
[`store/listing.md`](../../../store/listing.md),
[`store/permissions.md`](../../../store/permissions.md), and
[`store/privacy.md`](../../../store/privacy.md) before editing.

## Facts to keep straight

| Item | Current value |
| --- | --- |
| Extension ID | `pcnnpfojchdoapfnaanpibdkjbdmglhi` |
| Version | `1.1.0` (must match `package.json` on release) |
| Title (manifest) | `Changicon` — 9/75 characters |
| Summary | 110/132 characters |
| Detailed description | 1,844/16,000 (dashboard limit; 16,000 is the working limit) |
| Category | Tools |
| Language | English |
| Screenshots | exactly 5, 1280×800, full-bleed, opaque PNG |
| Small promo tile | 440×280 |
| Marquee | 1400×560 |
| Store icon | 128×128, from `public/icon/128.png` |
| Remote code | No |
| Permissions | `storage`, `activeTab`, `scripting`, `*://*/*` |
| Data usage | local-only; recommended **Web history** (see permissions.md rationale) |
| Privacy policy | public URL required; current GitHub blob URL in listing.md |

Chrome Web Store API v1.1 is retired (2026-10-15). WXT 0.20's `wxt submit`
does not work; upload manually in the dashboard. API v2 needs WXT ≥ 0.21.5,
Node 22, and a service account — do not pretend it is configured.

## Workflow

1. **Behavior first.** If the feature set changed, update
   `docs/architecture.md` and the code; the store must not promise more than the
   extension does.
2. **Copy.** Update `store/listing.md`:
   - title/summary/description (count characters; the summary hard limit is 132);
   - feature bullets and permission explanations;
   - the version line and asset table.
   Keep "favicon" and other keywords repeated no more than five times; avoid
   unverifiable claims.
3. **Permissions/privacy.** If the manifest changed, update
   `store/permissions.md` and `store/privacy.md` in the same commit. The policy
   must list every stored data type and the Limited Use statement.
4. **Assets.** If the UI changed:

   ```bash
   pnpm store:assets
   ```

   This rebuilds the popup, mounts it with a mock Chrome API, and captures the
   real UI. Review all five screenshots and both promo tiles. Do not edit the
   PNGs by hand.
5. **Validate.**

   ```bash
   pnpm docs:check
   ```

   It checks the five screenshots at 1280×800, promo sizes, the icon size, alpha
   channels, release markers, and relative links.
6. **Submit manually.** Follow `store/checklist.md` end to end. After uploading,
   confirm the dashboard preview, the privacy fields, and the test instructions.

## Asset rules

- 1280×800 or 640×400; use 1280×800. Exactly five. Square corners, no added
  padding; the store downscales to 640×400.
- Truecolor PNG without alpha. `docs:check` rejects color types 4 and 6.
- The small promo tile is effectively required even though one Google page calls
  it optional; upload it.
- The marquee is optional but required for marquee placement.
- Screenshots must match the submitted build. If the popup changes, regenerate.
- The native file input follows the host OS language. Do not retouch it; use the
  text-badge screenshot for English, or capture on an English-locale OS.

## Privacy answer guidance

- Single purpose: replace the tab favicon for a page or a whole site.
- `storage`: icons, original favicon URLs, settings — local only.
- `activeTab`: active tab URL/favicon when the popup opens.
- `scripting`: inject the content script into tabs opened before install/update.
- Host permission: replace `<link rel="icon">` on any page the user chooses;
  read/write favicon links only, no page content.
- Remote code: No.
- Data usage: **Web history** (addresses of customized pages). If a reviewer
  classifies the stored original favicon URL as website content, add that
  category; the policy already discloses it. Never select categories the
  extension does not handle.
- Certifications: no sale, no unrelated use, no creditworthiness use.
- Privacy policy URL must be public and current. Prefer GitHub Pages over a blob
  URL if available.

## Guardrails

- Do not change the manifest `name` (the store title and browser label) without
  explicit approval; it changes the extension's identity.
- Do not add a permission to make a screenshot or feature easier.
- Do not use third-party brand icons or screenshots you do not have rights to.
- Do not copy another extension's listing or screenshots.
- Do not submit while a review is pending; duplicate submissions slow review.
- Do not claim cross-device sync, cloud storage, or telemetry-free behavior
  beyond what the code does (the last one is true; keep it true).

## Output

Report which files changed, the asset sizes, `pnpm docs:check` result, and the
dashboard fields that still need a human (upload, privacy URL, submit).
