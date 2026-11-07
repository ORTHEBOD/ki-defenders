# Ki Defenders – AI art prompts

How to add a picture:

1. Make the image with an AI tool (Leonardo.ai, Midjourney, Bing Image Creator, ChatGPT, …).
2. Remove the background so it is **see-through** (most tools have "remove background", or use remove.bg).
3. Save it as PNG named exactly like the **file** column, inside the `art/` folder.
4. Add the name (without `.png`) to `ART_FILES` in `src/data/art.js` – or send me the files and I'll do it.

Any picture you don't add keeps the drawn art, so you can add them a few at a time.

## Style (put this at the start of every prompt)

> **STYLE:** 2D anime game character, full body, standing in a ready fighting pose facing slightly right,
> bold clean black outlines, cel shading, vivid colors, 90s shonen martial-arts anime look, chibi-ish proportions
> (big head, short body), centered, plain white background, no text, no shadow on the ground, square image 1024x1024

Tips:
- Keep the **same style line** for every image so everything matches.
- Make the 3 forms of a fighter from the same base picture (use "image to image" / "vary") and only change hair and aura.
- Feet near the bottom of the square, a little empty space on top.

## Fighters (3 forms each)

Form 0 = normal. Form 1 = **Super Form**: spiky glowing **golden** hair + golden aura. Form 2 = **Ascended Form**: glowing **light-blue** hair + blue aura.

| File | Prompt (after STYLE) |
|---|---|
| `kaito_0` | young cheerful brawler, black spiky hair, orange martial-arts gi, blue belt and wristbands, blue boots, fists raised |
| `kaito_1` | same as kaito_0 but golden glowing spiky hair, golden flame aura |
| `kaito_2` | same as kaito_0 but light blue glowing spiky hair, blue flame aura |
| `ronin_0` | calm beam sniper, silver-white spiky hair, dark navy gi, red belt, one arm pointing forward charging an energy beam |
| `ronin_1` | same as ronin_0, golden glowing hair, golden aura |
| `ronin_2` | same as ronin_0, light blue glowing hair, blue aura |
| `blaze_0` | hot-headed fighter, dark red spiky hair, red gi, black belt, holding a fiery ki ball in each hand |
| `blaze_1` | same as blaze_0, golden glowing hair, golden aura |
| `blaze_2` | same as blaze_0, light blue glowing hair, blue aura |
| `lumi_0` | graceful girl fighter, purple spiky hair, white gi, teal belt and boots, hands glowing with soft light |
| `lumi_1` | same as lumi_0, golden glowing hair, golden aura |
| `lumi_2` | same as lumi_0, light blue glowing hair, blue aura |
| `oru_0` | wise old martial-arts master, white hair and long white beard, brown gi, red belt, holding a wooden staff |
| `oru_1` | same as oru_0, golden glowing hair, golden aura |
| `oru_2` | same as oru_0, light blue glowing hair, blue aura |

## Heroes (normal + Power Up)

| File | Prompt (after STYLE) |
|---|---|
| `hero_zenko_0` | brave teen hero, black spiky hair, red-orange gi, black belt and boots, confident smile |
| `hero_zenko_1` | same as hero_zenko_0, golden glowing spiky hair, golden aura |
| `hero_mira_0` | fast teen girl striker, pink spiky ponytail, teal gi, dark blue belt and boots, lightning sparks |
| `hero_mira_1` | same as hero_mira_0, golden glowing hair, golden aura |
| `hero_goran_0` | big strong tank fighter, brown spiky hair, green gi, gold belt, broad shoulders, arms crossed |
| `hero_goran_1` | same as hero_goran_0, golden glowing hair, golden aura |
| `hero_sora_0` | calm ki master, blue spiky hair, white gi, purple belt and boots, glowing ki orb floating above one palm |
| `hero_sora_1` | same as hero_sora_0, golden glowing hair, golden aura |

## Enemies

Use this style line for enemies instead: **"2D anime game monster, alien invader soldier, bold black outlines, cel shading, cute but menacing, full body, facing left, plain white background, square image"**

| File | Prompt |
|---|---|
| `grunt` | purple horned alien foot soldier with grey armor plate and angry red eyes |
| `runner` | small fast green lizard alien with a long tail, running pose |
| `brute` | big slow red ogre alien with grey armor plates and tusks |
| `flyer` | small purple imp with bat wings, flying |
| `splitter` | pink slime blob with big eyes and a crack down the middle |
| `splitling` | tiny pink slime blob, cute |
| `medic` | alien healer in a white robe with a green cross, holding a staff with a glowing green orb |

## Bosses (make these bigger and more detailed)

| File | Prompt |
|---|---|
| `ogre` | Ogre Captain: huge green ogre with a captain helmet and a wooden club |
| `krag` | General Krag: tall purple alien general in white armor with horned helmet and a red cape |
| `scorpion` | Scorpion King: giant orange desert scorpion wearing a small gold crown |
| `sandKing` | Sand King Ozul: desert sorcerer king in gold robes with a tall golden crown and a sun staff |
| `mech` | War Mech: grey alien battle robot with arm cannons and a glowing blue core |
| `vorn` | Emperor Vorn: pale alien emperor with dark horns, white armor, purple cape, glowing pink gem on his forehead |

## Small items

| File | Prompt |
|---|---|
| `coin` | shiny gold coin icon, game item, simple |
| `wall` | small grey stone block with a glowing blue crystal, game item |
