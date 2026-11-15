---
name: store-listing
description: Use when updating the Changicon Chrome Web Store listing — copy, screenshots, promo tiles, permission/privacy answers, or submission checks.
---

# Update the Changicon store listing

Everything is in [`store/README.md`](../../../store/README.md): live listing
copy, the asset map, permission justifications, data disclosures, reviewer
steps, the submission checklist, and the public privacy policy. Images are in
[`store/assets/`](../../../store/assets/); there is intentionally only one store
document.

## Facts to keep straight

| Item | Current value |
| --- | --- |
| Extension ID | `pcnnpfojchdoapfnaanpibdkjbdmglhi` |
| Version | `1.1.0` (must match `package.json` on release) |
| Title (manifest) | `Changicon` — 9/75 characters |
| Summary (manifest `description`) | 110/132 characters |
| Detailed description | 1,862/16,000 (dashboard limit) |
| Category / language | Tools / English |
| Screenshots | exactly 5, 1280×800, full-bleed, opaque PNG |
| Small promo tile | 440×280 |
| Marquee | 1400×560 |
| Store icon | 128×128, from `public/icon/128.png` |
| Remote code | No |
| Permissions | `storage`, `activeTab`, `scripting`, `*://*/*` |
| Data usage | local-only; recommended **Web history** (rationale is in the store README) |
| Privacy policy | `store/README.md#privacy-policy` |

Chrome Web Store API v1.1 is retired (2026-10-15). WXT 0.20's `wxt submit` does
not work; upload manually. API v2 needs WXT ≥ 0.21.5, Node 22, and a service
account — do not pretend it is configured.

## Workflow

1. **Behavior first.** If the feature set changed, update
   `docs/architecture.md` and the code; the store must not promise more than the
   extension does.
2. **Copy.** Update the relevant sections of [`store/README.md`](../../../store/README.md):
   title/summary counts, the description block, permission justifications, data
   usage, the checklist, and the version marker. Count characters; the summary
   hard limit is 132. Keep "favicon" and other keywords to five or fewer uses and
   avoid unverifiable claims.
3. **Privacy.** If the manifest or storage changed, update the justifications and
   the `Privacy policy` section in the same file. Keep the
   `#privacy-policy` heading and the Limited Use statement.
4. **Assets.** If the UI changed:

   ```bash
   pnpm store:assets
   ```

   This rebuilds the popup, mounts it with a mock Chrome API, captures the real
   UI, and writes the exact-size images plus `docs/screenshots/`. Review all five
   screenshots and both promo tiles; do not edit PNGs by hand.
5. **Validate.**

   ```bash
   pnpm test    # includes scripts/release-docs.test.ts
   ```

   It checks the single store document, five 1280×800 opaque screenshots, promo
   sizes, the icon size, release markers, changelog entry, and relative links.
6. **Submit manually.** Follow the checklist in the store README end to end;
   after upload, verify the dashboard preview, privacy fields, and test
   instructions.

## Asset rules

- 1280×800 or 640×400; use 1280×800. Exactly five. Square corners, no added
  padding; the store downscales to 640×400.
- Truecolor PNG without alpha (the test rejects color types 4 and 6).
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
- Data usage: **Web history** (addresses of customized pages). Add Website
  content only if a reviewer classifies the stored favicon URL that way; the
  policy already discloses it. Never select categories the extension does not
  handle.
- Certifications: no sale, no unrelated use, no creditworthiness use.
- Privacy policy URL must be public and current. Prefer GitHub Pages over a blob
  URL if available.

## Guardrails

- Do not add a second store document; keep the kit in `store/README.md`.
- Do not change the manifest `name` (the store title and browser label) without
  explicit approval; it changes the extension's identity.
- Do not add a permission to make a screenshot or feature easier.
- Do not use third-party brand icons or screenshots you do not have rights to.
- Do not submit while a review is pending; duplicate submissions slow review.
- Do not claim cross-device sync, cloud storage, or telemetry beyond what the
  code does.

## Output

Report the sections changed, asset sizes, `pnpm test` result, and the dashboard
fields that still need a human (upload, privacy URL, submit).
