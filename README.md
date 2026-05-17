# Code Quest: Language Realms

A small browser game inspired by the provided Code Quest mockup. It now uses a 2D pixel/isometric roadmap with generated sprite assets, character movement, challenge panels, validation, and progression.

## Run

```sh
node server.mjs
```

Then open the URL printed in the terminal, usually `http://localhost:5173`.

## Gameplay

- Click a 3D realm or roadmap button to select a language.
- Start a quest from the selected realm.
- Edit the starter code in the arena.
- Run the check to earn XP, gems, badges, and unlock later realms.

The game stores progress in `localStorage`.

## Render Deployment

This repo includes a `render.yaml` Blueprint for Render.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/amosley0221/codequest)

Deploy from Render:

1. Push this project to `https://github.com/amosley0221/codequest`.
2. Open Render and choose **New > Blueprint**.
3. Select the `amosley0221/codequest` repo.
4. Render will create the `codequest` web service from `render.yaml`.

The app uses:

- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/`
- Runtime: Node

The server uses `process.env.PORT` and binds to `0.0.0.0` when deployed.

## PWA Install

The game is configured as a Progressive Web App.

Included PWA files:

- `manifest.webmanifest`
- `service-worker.js`
- `assets/pwa-icon-192.png`
- `assets/pwa-icon-512.png`
- `assets/pwa-maskable-512.png`

After deploying over HTTPS, Android Chrome should show an install prompt when eligible. On iOS, open the deployed site in Safari, tap Share, then choose **Add to Home Screen**.

## Project Tooling

This workspace now has a project-local npm at `.tools/npm/package/bin/npm-cli.js`, because global `npm` was not available in the shell.

Useful commands:

```sh
node .tools/npm/package/bin/npm-cli.js run vite
node .tools/npm/package/bin/npm-cli.js run playwright -- --version
```

Installed npm packages:

- `phaser`
- `@rive-app/canvas`
- `@rive-app/webgl2`
- `three`
- `gsap`
- `pixi.js`
- `howler`
- `matter-js`
- `@google/genai`
- `vite`
- `playwright`

Playwright Chromium is installed in the local user cache.

## Installed Browser Libraries

These browser-ready files live in `vendor/` and are loaded by `index.html`:

- `gsap.min.js` for smoother character, HUD, and map animations.
- `pixi.min.js` for future 2D sprite/canvas rendering.
- `howler.min.js` for music and sound effects.
- `matter.min.js` for future 2D physics and collision systems.
- `three.module.min.js` for Three.js/WebGL experiments already present in the project.

Nano Banana is not a local game library. It is an image-generation model/service accessed through Google's Gemini API, so it needs an API key instead of a static file in `vendor/`.

To generate a new local asset with Nano Banana:

```sh
GEMINI_API_KEY="your-key" node scripts/nano-banana-generate.mjs "pixel art wizard guide sprite, transparent background" assets/wizard-new.png
```

The script defaults to `gemini-2.5-flash-image`. You can override that with `NANO_BANANA_MODEL` if Google changes the recommended image model.

## Desktop Apps

The following macOS apps were installed into `/Applications`:

- Blender
- Rive
- Tiled

Aseprite was not installed because the official prebuilt macOS app is paid/account-gated, and building it from source requires a separate native build toolchain.
