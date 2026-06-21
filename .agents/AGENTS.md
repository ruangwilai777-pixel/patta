# Patta Transport & Logistics - Project Rules

## ⚠️ CRITICAL: DO NOT CHANGE THE BUNDLE

This project uses a **pre-compiled production bundle** served from `public/`. 

**The active bundle files are:**
- `public/assets/main-Dcs-rvvl.js` — Main JavaScript bundle
- `public/assets/main-gNL91H-p.css` — Main CSS

**The entry point is:**
- `public/index.html` — References the bundle above + contains CSS/JS patches

**DO NOT:**
- Run `npm run build` or `vite build` — this will overwrite/break the bundle
- Change the `<script>` tag in `index.html` to point to a different JS file
- Create new HTML entry points (e.g., `admin.html`)
- Add new JS/CSS bundle files to `assets/` or `public/assets/`
- Modify `vite.config.js` to change build output

## How to Make Changes

All UI changes should be done via **CSS/JS injection in `index.html`** (and `public/index.html` — they must stay in sync).

Look for the `<script>` block near `</body>` containing "DOM Patch" — this is where runtime patches go:
- CSS overrides: Add to the `style.textContent` block
- DOM manipulation: Add to the `setInterval` callback

## File Structure

```
index.html              ← Main entry (root copy, must match public/index.html)
public/
  index.html            ← Main entry served by Vercel
  assets/
    main-Dcs-rvvl.js    ← THE bundle (DO NOT REPLACE)
    main-gNL91H-p.css   ← THE stylesheet
  driver.webmanifest    ← PWA manifest
  icon-192.png          ← App icon
  icon-512.png          ← App icon
  apple-touch-icon.png  ← iOS icon
vercel.json             ← Vercel routing config
src/                    ← Source code (for reference only, NOT actively compiled)
```

## Deployment

- Hosted on **Vercel** at `patta-psi.vercel.app`
- Pushing to `main` branch auto-deploys
- Vercel serves files from the repo root; `public/` files are copied to root at serve time
