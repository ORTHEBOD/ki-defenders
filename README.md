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

## Publishing the website

Netlify publishes only the `live` branch. Work is pushed to `main` as usual, and the website changes only
when `main` is copied to `live`:

```bash
git push origin main:live
```

Each publish costs 15 of the free plan's 300 monthly Netlify credits, so publish a batch of changes at once.
Players playing costs almost nothing.

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

## Google sign-in (setup)

The "Sign in with Google" button stays hidden until `src/data/google.js` has a client ID.

1. https://console.cloud.google.com → create a project "Ki Defenders".
2. **Google Auth Platform → Branding**: app name, support email. Audience: External, then Publish.
3. **Clients → Create client → Web application**. Authorized JavaScript origins:
   `https://ki-defenders.netlify.app` and `https://orthebod.github.io`. Copy its Client ID into `src/data/google.js`.
4. **Clients → Create client → Android**. Package name `com.orthebod.kidefenders`, SHA-1 of the signing key:
   `99:1C:35:E7:86:A3:05:4F:C0:76:DF:CA:C6:19:12:D4:69:55:57:E3`
   (when the game is on Google Play, add a second Android client with the SHA-1 from Play Console → App signing).

Works on the website and the Android app. The PC app keeps name + PIN for now.

## Ads

`src/systems/Ads.js` holds both kinds of ads: reward videos in the shop (100 coins, 3 a day) and a short
ad between battles (at most one every 3 minutes). Both are stand-in screens until AdMob is connected.
