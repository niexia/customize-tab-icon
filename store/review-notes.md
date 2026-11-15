# Reviewer test instructions

<!-- release: 1.1.0 -->

Paste the text below into **Store listing → Test instructions** (or the
corresponding field in the Privacy practices tab). The field is optional, but
these steps make the broad host permission and the immediate favicon update easy
to verify.

No credentials, paid account, or special network setup are required.

---

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
9. Use the trash icon → "Clear all" to remove every saved icon. Theme, background, and scope settings remain.
10. Open chrome://extensions/. The popup shows "This page can't be customized" and does not throw errors.

Expected behavior:
- The page's content, forms, and network activity are unchanged; only the <link rel="icon"> element is rewritten.
- The extension works offline. It makes no network requests and has no remote code.
- The site-wide option uses the registrable domain, so www.example.com, news.example.com, and example.com share one icon.
- Chrome's own pages, chrome-extension:// pages, and the Chrome Web Store cannot be customized (Chrome does not allow content scripts there).

The broad host permission (*://*/*) is required because the user can customize any page and the extension must reach already-open tabs when a site-wide icon is applied. The content script does not read page text, form values, cookies, or network requests; it only replaces favicon link elements.
```

---

## Notes for the submitter

- Test the **packaged build** (`.output/chrome-mv3` loaded unpacked, or the
  uploaded zip), not the dev server.
- If you change the UI labels or flow, update the step numbers and wording here
  in the same commit.
- Review can take longer for a broad host permission. The test instructions are
  not a substitute for the permission justifications in
  [`permissions.md`](permissions.md).
- If the reviewer asks for a walkthrough video, a 30–45 second screen capture of
  steps 2–8 is enough; see [`promo-video.md`](promo-video.md) for the storyboard.
