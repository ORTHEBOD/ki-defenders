# Ki Defenders — Game Design Document (v0.1)

> Working title. A tower defense game in Dragon Ball style, with original characters.
> Status: planning. No code yet.

---

## 1. The idea in one sentence

Enemies from an evil space army march toward your base. You place martial-arts fighters as towers, each one shooting ki blasts and transforming into stronger forms. You also control one main hero who levels up across the whole game.

---

## 2. Decisions so far

| Topic | Decision |
|---|---|
| Platform | Web first (PC + phone browser) → then Android app (Play Store) and PC app |
| iPhone | Not planned (needs a Mac) |
| Characters | Original characters in Dragon Ball style (names, art and attacks all in data files, easy to change) |
| Art style | 2D anime, made with AI image tools; placeholder art first |
| Screen | Landscape first; portrait option in settings later |
| Language | English |
| Levels | 10 levels across 3 maps (worlds) |
| Path types | Most levels use a fixed path; some use maze building |
| Towers | 5 fighters, each with 3 transformation forms |
| Hero | 1 main hero: tap/click to move, earns XP, skill tree, progress kept forever |
| More heroes | Later update: unlock and switch between several heroes |
| Bosses | Yes |
| Modes | Story levels + Endless mode |
| Difficulty | Easy / Normal / Hard, with a bigger reward on harder modes |
| Story | Short dialogue scenes between levels |
| Save / login | PIN login like the last game, progress saved online |
| Social | Online leaderboard (for now) |
| Sound | Sound effects + music |
| Deadline | None, built for fun |

---

## 3. Technology

| Part | Tool | Why |
|---|---|---|
| Game engine | **Phaser 3** (JavaScript) | Built for 2D browser games, handles sprites, animation, touch, sound |
| Build tool | **Vite** | Fast local dev server, simple build for Netlify |
| Hosting | **Netlify** | Same as the last game |
| Backend | **Netlify Functions + Netlify Blobs** | Reuse PIN login + saved data from the last game |
| Android app (later) | **Capacitor** | Wraps the same web game into an Android app |
| PC app (later) | **Electron** (or Tauri) | Wraps the same web game into a Windows app / Steam |

The same code runs everywhere, so there's no rewrite when moving to apps.

---

## 4. Core gameplay

1. A level starts, and you get some **Ki** (the in-level money).
2. Place fighters on build spots (fixed-path levels) or anywhere on the grid (maze levels).
3. Press **Start wave**. Enemies walk the path toward your base.
4. Killing enemies gives Ki. Spend it to place, upgrade or **transform** fighters.
5. If an enemy reaches the base, you lose lives. At 0 lives you lose.
6. Survive all waves (last wave = boss) and you win, with rewards based on difficulty and lives left.

### Fixed path levels
Classic: the road is drawn on the map, and fighters go on build spots next to it.

### Maze levels
An open field. Fighters block movement, so you build the path yourself. The game never lets you fully block the way (the path is always checked).

---

## 5. The 5 fighters (towers)

Each fighter has **3 forms**. Base → Form 2 (gold aura) → Form 3 (blue/divine aura). Each form changes the look, the stats and adds a new effect.

| # | Name (placeholder) | Role | Attack | Form 3 bonus |
|---|---|---|---|---|
| 1 | **Kaito** | Brawler | Fast close-range punches, hits one enemy | Combo: every 5th hit stuns |
| 2 | **Ronin** | Beam sniper | Long-range piercing beam through a line of enemies | Beam hits flying enemies with double damage |
| 3 | **Blaze** | Barrage | Rapid ki blasts that explode (area damage) | Explosions leave a burning ground |
| 4 | **Lumi** | Control | Flash of light that slows / blinds enemies in range | Short freeze of all enemies in range |
| 5 | **Master Oru** | Support | Boosts damage of nearby fighters + makes extra Ki | Aura also boosts the hero |

Upgrades inside each form: small stat upgrades (damage, range, speed). The transformation is the big upgrade.
In the game each fighter has 6 tiers: 2 stars in Base, 2 in Super Form, 2 in Ascended Form. Master Oru's Ascended
bonus currently makes nearby fighters attack faster (the hero boost comes with the hero in Phase 3).

---

## 6. The main hero

- **Name (placeholder):** Zenko
- **Control:** tap/click on the map, and the hero runs there. He auto-attacks the nearest enemy.
- **Abilities:** 3 ability buttons with cooldowns, plus 1 ultimate:
  - **Kai Wave**: big beam in a direction
  - **Flash Step**: instant teleport to a point
  - **Power Up**: short burst of speed and damage
  - **Ultimate, Spirit Orb**: charge a giant ball and throw it (huge area damage)
- **XP and levels:** the hero earns XP from kills and finished levels. The level is **kept for the whole game**, never reset.
- **Skill tree:** 1 skill point per level, 3 branches:
  - **Strength**: damage, critical hits, stronger Kai Wave
  - **Speed**: move speed, attack speed, shorter cooldowns
  - **Ki mastery**: more Ki per kill, boosts nearby towers, stronger ultimate
- **Death:** the hero respawns at the base after 10 seconds *(default, can change)*.
- **Later update:** more heroes to unlock, choose one before each level, each with its own level and skill tree.

---

## 7. Enemies

| Enemy | Description |
|---|---|
| **Grunt** | Basic soldier, normal speed and health |
| **Runner** | Fast, low health |
| **Brute** | Slow, lots of health, armor (less damage from small hits) |
| **Flyer** | Flies over the path (and over maze walls), only some fighters can hit it |
| **Splitter** | Splits into 2 small ones when killed |
| **Medic** | Heals enemies around it |

### Bosses
- Each level ends with a **boss wave**.
- Every map ends with a **big boss** that has special attacks (shield, summoning grunts, stunning a fighter).

---

## 8. Maps and levels

| Map | Theme | Levels | Opens when |
|---|---|---|---|
| 1 | **Green Valley** (grass, trees, rocks) | 1–10 | From the start |
| 2 | **Desert Wasteland** (sand, cacti, bones) | 11–20 | Level 10 won + 15 stars |
| 3 | **Enemy Mothership** (metal, lights, crates) | 21–30 | Level 20 won + 40 stars |

- Each map: 8 road levels + 2 maze levels (levels x4 and x8). Every level ends with a boss wave.
- Level 10 / 20 / 30 bring the big bosses: General Krag, Sand King Ozul, Emperor Vorn.
- Mini bosses: Ogre Captain (valley), Scorpion King (desert), War Mech (mothership).
- Levels 2-30 are built from data: road shapes, auto-placed build spots, and waves that grow level by level.

---

## 9. Difficulty and rewards

| Difficulty | Enemies | Reward |
|---|---|---|
| Easy | Weaker, fewer | 1 ★ |
| Normal | Standard | 2 ★ |
| Hard | Stronger, faster, extra boss skill | 3 ★ |

- Stars (★) are saved per level. Stars open new maps.
- **Coins** are won in every battle (more for winning, more stars, later levels and Endless waves).
- **Shop:** equipment for the hero (weapon, armor, boots, amulet - 3 tiers each), and the **Lucky Spin**:
  coins, gear, or a new hero (a hero you already have turns into coins).
- **Hero XP:** every enemy type gives its own XP; enemies the hero defeats personally give double.
- **Heroes:** Zenko (start), Mira (speed), Goran (tank), Sora (ki master). Each has their own level, skills and gear.
- **Fun idea:** hidden **Star Orbs** (7 total) found in levels. Collect all 7 and make a wish (a big permanent reward).

---

## 10. Endless mode
- Unlocked after winning level 3. A boss every 10 waves.
- Waves never stop and get harder each wave.
- Score = the wave you reach, which goes to the **leaderboard**.

---

## 11. Story (short)
An evil space emperor, **Lord Vorak**, sends his army to conquer the planet. Zenko and his master Oru gather fighters to defend it. Short dialogue scenes with character portraits appear before and after levels. The final battle is on Vorak's mothership.

---

## 12. Save, login and leaderboard
- PIN login, same system as the last game (Netlify Functions + Blobs).
- Saved online: hero level, XP, skill tree, unlocked fighters, stars per level per difficulty, Zeni, Star Orbs, settings.
- Also saved locally, so the game works offline and syncs when online.
- Leaderboard: Endless mode best wave + total stars.

---

## 13. Settings
- Music volume / sound effects volume
- Start speed (1x / 2x / 3x), screen shake, full screen
- Screen orientation (landscape now, portrait later)
- Show damage numbers on/off

---

## 14. Art plan (AI tools)
- **Start:** simple placeholder art drawn in code, so the gameplay can be built and tested.
- **Then:** generate the anime art with AI tools (Leonardo.ai, Midjourney or similar).
- Keep **one style prompt** for all images so everything matches.
- Needed per fighter: idle pose + attack pose for each of the 3 forms (6 images minimum), plus a portrait for the story.
- Images: PNG with transparent background, same size for all.
- I'll prepare a list of prompts for every image when we get to that step.

---

## 15. Build roadmap

| Phase | What we build | Result |
|---|---|---|
| 1 | Project setup, 1 map, fixed path, 2 fighters, 2 enemies, waves, Ki, lives | Playable prototype |
| 2 | All 5 fighters, upgrades, transformations | Full tower system |
| 3 | Hero: move, abilities, XP, skill tree | Hero working |
| 4 | Maze levels + pathfinding | Both level types |
| 5 | All enemies + bosses | Full enemy set |
| 6 | 30 levels, 3 maps, story, coins + shop + Lucky Spin, 4 heroes, bigger skill tree, endless, settings, music | Full game loop (done) |
| 7 | Login, online save, leaderboard | Online features (done - needs the Netlify site connected) |
| 8 | AI art + sound + music | Looks and sounds good |
| 9 | Endless mode, polish, balance | Ready for friends |
| 10 | Android app (Capacitor) + PC app (Electron) | Store-ready |

---

## 16. Still open
- Final game name
- Final character names
- Hero death rule (default: respawn after 10 seconds)
