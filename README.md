# Ki Defenders

A Dragon Ball style tower defense game for the web (Phaser 3). See [GAME_DESIGN.md](GAME_DESIGN.md) for the full plan.

## Run it locally

From this folder:

```bash
python -m http.server 8080
```

Then open http://localhost:8080

## Project layout

- `src/data/` – fighters, enemies and levels (change names, stats and waves here)
- `src/objects/` – Fighter and Enemy logic
- `src/scenes/` – BootScene (placeholder art), GameScene (the level)
- `src/ui/` – buttons and text styles
