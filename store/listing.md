# Chrome Web Store listing

Copy each section into the matching field of the Developer Dashboard.

## Store listing tab

**Name** (from `manifest.json`): Mac Mode for WhatsApp Web

**Summary** (from `manifest.json`, 118 of 132 characters):
Mac app shortcuts, SF Pro, and right-to-left fixes for WhatsApp Web. Unofficial; not affiliated with WhatsApp or Meta.

**Category:** Communication

**Language:** English

**Description:**

```text
Make WhatsApp Web look and behave like the WhatsApp Mac app.

WHAT IT DOES
• Mac look: SF Pro (the Mac system font) and thin scrollbars that appear only when you hover.
• Right-to-left that reads right: Hebrew and Arabic messages align right, line by line, and the timestamp moves to the left so it never covers the last line.
• No nags: hides the "Download the app" card and the "See more chat history on the app" strip.
• Mac app shortcuts: ⌘1–9 opens a chat, ⌘⇧] and ⌘⇧[ move to the next and previous chat, and ⌘N, ⌘F, ⌘⇧U, ⌘⇧M, ⌘⇧E, ⌘⇧P and ⌘, work like in the Mac app.
• Breaks safely: if WhatsApp changes its page, WhatsApp keeps working, and a small orange dot in the corner tells you which part stopped working.

ABOUT THE SHORTCUTS
Chrome keeps some keys for itself, such as ⌘N and ⌘1–9. To get them, install WhatsApp Web as an app (Chrome menu → Cast, save, and share → Install page as app) and add the free Karabiner-Elements rule from the project page. The look, right-to-left fixes and nag removal work without it.

PRIVACY
The extension runs only on web.whatsapp.com. It collects no data, sends nothing anywhere, has no extra permissions, and loads no remote code. It only adds styles and keyboard handling to the page.

Unofficial. Not affiliated with, endorsed by, or sponsored by WhatsApp or Meta. WhatsApp is a trademark of WhatsApp LLC.
```

**Images** (in `store/screenshots/`, rebuild with `tools/render_store_images.sh`):

| Field | File | Size |
|---|---|---|
| Screenshot 1 | `1-hero.png` | 1280×800 |
| Screenshot 2 | `2-rtl.png` | 1280×800 |
| Screenshot 3 | `3-shortcuts.png` | 1280×800 |
| Screenshot 4 | `4-clean.png` | 1280×800 |
| Screenshot 5 | `5-failsafe.png` | 1280×800 |
| Small promo tile | `promo-tile.png` | 440×280 |
| Store icon | `icons/icon128.png` | 128×128 |

All chat names and messages in the screenshots are invented.

**Homepage URL / Support URL:** https://github.com/bengry/whatsapp-web-native (must be public first)

## Privacy practices tab

**Single purpose:**
Restyles WhatsApp Web and adds keyboard shortcuts so it looks and behaves like the WhatsApp Mac app.

**Host permission justification** (content script on `https://web.whatsapp.com/*`):
The extension's only purpose is to change WhatsApp Web, so its styles and keyboard handling run on that site and nowhere else.

**Remote code:** No, I am not using remote code.

**Data usage:** Collects none of the listed data types. Tick all three certifications:
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** https://github.com/bengry/whatsapp-web-native/blob/main/PRIVACY.md (must be public first)
