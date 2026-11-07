# Ki Defenders

An anime tower defense game (Phaser 3). See [GAME_DESIGN.md](GAME_DESIGN.md) for the full plan.

- **Play online:** https://ki-defenders.netlify.app (also https://orthebod.github.io/ki-defenders/)
- **Android and PC apps:** https://github.com/ORTHEBOD/ki-defenders/releases/latest

## Run it locally

From this folder:

```bash
python -m http.server 8080
```

Then open http://localhost:8080 (online saving needs the Netlify site; locally the game saves on the device).

## Project layout

- `src/data/` – fighters, heroes, enemies, levels, shop, story, AI art list (change names, stats and waves here)
- `src/objects/` – Fighter, Hero and Enemy logic
- `src/scenes/` – every screen (BootScene draws the placeholder art, GameScene is the battle)
- `src/systems/` – saving and online sync, routes and maze pathfinding, sound, settings, tutorial
- `src/ui/` – buttons, panels and text styles
- `netlify/functions/api.mjs` – the online server (login, save, leaderboard)
- `art/` – AI pictures (see [ART_PROMPTS.md](ART_PROMPTS.md))
- `apps/` – Android (Capacitor) and PC (Electron) app builds

## Building the apps

The apps are built on GitHub (no tools needed on this PC):
GitHub → **Actions** → **Build apps** → **Run workflow**. When it finishes, the files are on a new
Release: `ki-defenders.apk` (Android phone), `ki-defenders.aab` (Google Play),
`KiDefenders-Setup.exe` and `KiDefenders-Portable.exe` (Windows).

The Android signing key must stay the same for updates to install. It lives in the
`ANDROID_KEYSTORE_B64` and `ANDROID_KEYSTORE_PASS` repository secrets (a backup copy is kept
outside git in `.keys/`). Without them the build uses a one-time test key.
