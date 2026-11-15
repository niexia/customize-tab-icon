# Promo video (optional)

<!-- release: 1.1.0 -->

The Chrome Web Store accepts a YouTube link as the global promo video. It is
optional and not required for review. The listing is complete without it; this
storyboard is here so a future recording stays consistent with the screenshots.

## Specs

| Item | Value |
| --- | --- |
| Runtime | 20–30 seconds |
| Aspect | 16:9, 1920×1080 or 1280×720 |
| Audio | Optional; captions are recommended |
| Hosting | YouTube (public or unlisted) |
| Music | Use a track you have rights to (for example the YouTube Audio Library) |
| Content | Real UI only; no fake reviews, promises, or unavailable features |

## Storyboard

| Time | Visual | Caption / voice-over |
| --- | --- | --- |
| 0:00–0:03 | Browser with five tabs, each with a different emoji/text icon. Cursor moves to the toolbar. | “Your tabs all look the same.” |
| 0:03–0:06 | Click the Changicon toolbar icon; the popup opens over the page. | “Changicon gives every tab a face you recognize.” |
| 0:06–0:11 | Click Emoji, search, pick one. The active tab icon changes instantly. | “Pick an emoji…” |
| 0:11–0:15 | Click Reset page; the original favicon returns without a reload. | “…or reset it in one click.” |
| 0:15–0:20 | Switch Apply to “Whole site”, pick a text badge; open a second path/subdomain and show the same icon. | “One icon for the whole site — subdomains included.” |
| 0:20–0:24 | Switch to the light theme; upload a small image and confirm. | “Emoji, text, line icons, or your own image.” |
| 0:24–0:28 | Zoom out to the tab strip with five custom icons; end card: Changicon logo + “No tracking · Icons generated locally”. | “No account. No tracking. Just tabs that look like yours.” |

## Capture notes

- Use the store build from `.output/chrome-mv3` (or a clean profile install),
  never the dev server.
- Record at 60 fps and crop out the macOS menu bar; the store player may crop the
  edges, so keep the popup away from the frame border.
- Keep the browser zoom at 100% and the popup at its natural 320 px width.
- If you show the upload flow on a non-English OS, switch the OS/browser locale to
  English first; the native file control is not part of the extension.
- Add closed captions in English. Do not use claims that are not in
  [`listing.md`](listing.md), such as “syncs across devices” (it does not).

## Publishing

1. Upload the video to YouTube unlisted or public.
2. Add the URL to **Store listing → Global promo video**.
3. Check that the video is not age-restricted or private; reviewers must be able
   to play it.
4. Update this file with the final URL and date.

```text
YouTube URL: (not recorded yet)
Recorded:    —
```
