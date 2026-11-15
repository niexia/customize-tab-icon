# Chrome Web Store submission checklist

<!-- release: 1.1.0 -->

Run this before every submission. It assumes the repository release steps in
[`docs/release-process.md`](../docs/release-process.md) have already passed.

## Build and repository

- [ ] `package.json` version is the version being submitted (currently `1.1.0`).
- [ ] `.output/chrome-mv3/manifest.json` reports the same version.
- [ ] `pnpm check` passes (compile, lint, test, build, docs check).
- [ ] `CHANGELOG.md` has a `## [X.Y.Z]` entry for this version.
- [ ] `docs/architecture.md` and `docs/release-process.md` markers match the
      version.
- [ ] `pnpm zip` produced `.output/changicon-X.Y.Z-chrome.zip`.
- [ ] The zip was smoke-tested on a clean Chrome profile (load unpacked or
      install from the store after approval).

## Graphic assets

- [ ] Store icon: `store/assets/store-icon-128.png`, exactly 128×128, PNG.
- [ ] Five screenshots: `screenshot-1-hero.png` … `screenshot-5-text.png`,
      each exactly 1280×800, no alpha, no rounded corners added by the store.
- [ ] Small promo tile: `small-promo-440x280.png`, exactly 440×280.
- [ ] Marquee promo tile: `marquee-1400x560.png`, exactly 1400×560 (optional but
      recommended).
- [ ] Screenshots match the submitted version's UI; no old feature names,
      version numbers, or prices.
- [ ] No personal data, unrelated brands, or unlicensed images in the assets.
- [ ] Assets are fresh (`pnpm store:assets` after the last UI change).

## Store listing

- [ ] Title: `Changicon` (from the manifest; 9/75 characters).
- [ ] Summary: 110/132 characters, matches the manifest `description` in `wxt.config.ts` and `store/listing.md`.
- [ ] Description: 1,844/16,000 characters, plain text, no HTML.
- [ ] Category: **Tools**.
- [ ] Language: **English**.
- [ ] Official URL: empty.
- [ ] Homepage URL: `https://github.com/niexia/customize-tab-icon`.
- [ ] Support URL: `https://github.com/niexia/customize-tab-icon/issues`.
- [ ] Mature content: **No**.
- [ ] No keyword repeated more than five times; no unverifiable claims.
- [ ] Promo video: none, or the YouTube URL from `promo-video.md`.

## Privacy and permissions

- [ ] Single purpose matches `store/permissions.md`.
- [ ] Every manifest permission has a specific justification:
      `storage`, `activeTab`, `scripting`, `*://*/*`.
- [ ] No unused permission is declared.
- [ ] Remote code: **No**.
- [ ] Data usage selection matches the actual storage: **Web history**
      (and Website content only if you decide the stored favicon URL warrants it).
- [ ] All Limited Use certifications are checked.
- [ ] Privacy policy URL is public and returns the current policy:
      `https://github.com/niexia/customize-tab-icon/blob/main/store/privacy.md`.
- [ ] The policy includes the Limited Use statement.
- [ ] Test instructions from `store/review-notes.md` are pasted (optional but
      recommended for a broad host permission).

## Account and distribution

- [ ] The publisher account has 2-Step Verification enabled.
- [ ] The account has an available extension slot (default 2; request more if
      needed).
- [ ] Visibility: **Public** (or Unlisted/Private intentionally).
- [ ] Regions: all, or the intended subset.
- [ ] Pricing: free.
- [ ] If this is a beta build, the name ends with “BETA”/“DEVELOPMENT BUILD” and
      the description carries the required beta notice (not applicable to the
      normal listing).

## Submit and verify

- [ ] Package uploaded; the dashboard shows the expected version.
- [ ] Store listing preview looks correct on desktop and narrow layouts.
- [ ] Submitted for review; deferred publish is configured if you want a final
      look.
- [ ] Review status monitored; no duplicate submission while pending.
- [ ] After approval: install from the store on a clean profile and run the
      reviewer steps.
- [ ] GitHub Release `vX.Y.Z` exists with the zip attached.
- [ ] Update `store/listing.md` and the README if the store copy changed.

## After a rejection

1. Read the exact policy cited; do not resubmit unchanged.
2. Fix the package, listing, or disclosure.
3. Bump the version (the store requires a new version for a rejected package
   resubmission) and add a changelog entry.
4. Re-run `pnpm check` and `pnpm zip`.
5. Appeal only if you believe the rejection is a mistake; one appeal is allowed
   per violation.
