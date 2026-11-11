# Ki Defenders – AI art prompts

Free tools that work well: **ChatGPT**, **Google Gemini**, **Bing Image Creator**, **Leonardo.ai**.

## How it works

1. Open a **new chat for each character**. Paste the **STYLE** text, then the character's line.
2. When you like the picture, stay in the **same chat** and ask for its forms one by one with the
   **FORM** lines below. The tool then keeps the same face and clothes and only changes the hair.
3. Save each picture with the exact **file** name (for example `kaito_1.png`). A white background is fine,
   Claude cuts it out.
4. Send the pictures to Claude (or put them in the `art/` folder). Any picture you don't make yet keeps
   the drawn art, so you can add them a few at a time.

## STYLE (paste this first, every time)

> 2D anime game character for a mobile tower defense game, ORIGINAL character design (must not look like
> any existing anime or manga character), full body, facing slightly right, ready fighting pose,
> very thick clean black outlines, simple bold shapes, flat cel shading with few details, bright vivid colors,
> chibi proportions (big head, short body), whole body inside the picture with a little space around it,
> plain white background, no text, no ground shadow, no aura or glow around the body, square image

Why these words:
- **ORIGINAL / must not look like…**: needed for Google Play. Never write names of real anime characters.
- **very thick outlines, simple shapes, few details**: the game shows characters small (about 64 pixels),
  so thin lines and small details disappear.
- **no aura**: the game draws its own colored flame aura behind the fighter.

## FORM lines (in the same chat, after the base picture)

Every fighter and hero has 6 forms. File endings: `_0` base, `_1` … `_5`.

| Ending | Form | Ask for |
|---|---|---|
| `_1` | Super Form | Same character, same pose and clothes. Only change: hair becomes bright glowing golden yellow and a bit spikier, eyes turn teal-green. |
| `_2` | Super Form 2 | Same as the golden form, hair even spikier and standing taller, with small blue lightning sparks around the body. |
| `_3` | Super Form 3 | Same as form 2, but the golden hair is very long and spiky, falling down to the waist, more lightning sparks. |
| `_4` | Divine Form | Same character, normal hair length, hair becomes glowing crimson red, eyes red, calm confident face. |
| `_5` | Ascended Form | Same character, normal hair length, hair becomes glowing light sky blue, eyes blue. |

## Fighters (towers)

| File | Character line |
|---|---|
| `kaito_0` | **Kaito, brawler.** Cheerful teen boy, short messy black hair swept back with one long front strand, sleeveless orange-red martial arts top with a white undershirt, green sash belt, black loose pants, red fingerless gloves, white wrapped shins, fists raised |
| `ronin_0` | **Ronin, beam sniper.** Calm cool teen boy, silver-white hair tied in a short ponytail, long dark navy coat-style gi with a high collar, red belt, black pants and boots, one arm pointing forward with two fingers like a gun |
| `blaze_0` | **Blaze, explosions.** Hot-headed teen boy with a wild dark red mohawk, black sleeveless top with flame patterns at the bottom, orange belt, grey pants, black boots, a small fire ball in each hand |
| `lumi_0` | **Lumi, control.** Graceful teen girl, purple hair in two buns, white and teal martial arts dress with long sleeves, teal belt and boots, both hands open in front with soft light |
| `oru_0` | **Master Oru, support.** Small wise old master, bald head with long white eyebrows and a long white beard, brown monk robe with a red sash, wooden walking staff, kind smile |

Optional for a fighter: the drawn game also gives a **headband** at 2 stars and a **cape** at 3 stars of each form.
Pictures skip that; the stars under the fighter still show the upgrade.

## Attack poses (the hit animation)

Each time a fighter attacks, the game shows its **attack picture** for a moment and then goes back to the
normal one, with a small jump toward the enemy. So every form can have a second picture: file name ends
with `_attack` (`kaito_0_attack`, `kaito_1_attack` …). Without it, the fighter only does the small jump.

In the **same chat**, right after the normal picture of that form, ask:

> Same character, same clothes, same colors, same drawing style and same size, now in an ATTACK pose:
> (attack line below). Facing right, whole body inside the picture, plain white background,
> no effects, no motion lines, no energy drawn (the game adds the effects).

| File | Attack line |
|---|---|
| `kaito_0_attack` | throwing a powerful straight punch to the right, punching arm fully stretched, back leg pushed back, fierce shout |
| `ronin_0_attack` | firing a beam: one arm stretched straight forward with two fingers pointing, other hand holding that wrist, focused eyes |
| `blaze_0_attack` | throwing a ball overhand: one arm swung forward high, the other arm back, leaning forward, angry grin |
| `lumi_0_attack` | both arms spread wide open to the sides, eyes closed, standing on her toes, hair and dress lifted a little |

Master Oru only helps the others, so he needs no attack pose.
Tips: if the character comes out smaller or bigger than the normal picture, ask again with
"same size as the previous picture". For the forms, ask for the attack pose right after each form's picture.

## Heroes

Note: hero pictures hide the gear drawn on the hero (gloves, armor, boots…). Make the fighters first;
heroes can come later.

| File | Character line |
|---|---|
| `hero_zenko_0` | **Zenko, balanced hero.** Brave teen boy, black spiky hair with a red headband, red-orange gi with a black undershirt, black belt and boots, confident smile |
| `hero_mira_0` | **Mira, fast striker.** Speedy teen girl, pink hair in a high ponytail, teal sporty gi with short sleeves, dark blue belt, dark blue shoes, one fist forward, one knee up |
| `hero_goran_0` | **Goran, tank.** Big strong friendly young man, short brown hair, green sleeveless gi, gold belt, very broad shoulders, arms crossed, small scar on the cheek |
| `hero_sora_0` | **Sora, ki master.** Calm teen boy, blue hair with long bangs, white robe-like gi with purple trim, purple belt and boots, a small glowing ki ball above one palm |

Forms for heroes: same FORM lines, files `hero_zenko_1` … `hero_zenko_5` and so on.

## Enemies

Use this STYLE instead:

> 2D anime game monster for a mobile tower defense game, original design, full body, facing left, walking pose,
> very thick clean black outlines, simple bold shapes, flat cel shading, bright colors, cute but menacing,
> whole body inside the picture, plain white background, no text, no ground shadow, square image

| File | Line |
|---|---|
| `grunt` | small purple horned alien foot soldier with a grey chest armor plate and angry yellow eyes |
| `runner` | small fast green lizard alien with orange back spikes and a long tail, running |
| `brute` | big slow red ogre alien with grey armor plates and small tusks |
| `flyer` | small purple imp with bat wings, flying |
| `splitter` | pink slime blob with big eyes and a crack down the middle |
| `splitling` | tiny cute pink slime blob |
| `medic` | alien healer in a white robe with a green cross, staff with a glowing green orb |

### Bosses (bigger, more detailed)

| File | Line |
|---|---|
| `ogre` | Ogre Captain: huge green ogre with a captain helmet and a wooden club |
| `krag` | General Krag: tall purple alien general in white armor, horned helmet, red cape |
| `scorpion` | Scorpion King: giant orange desert scorpion wearing a small gold crown |
| `sandKing` | Sand King Ozul: desert sorcerer king in gold robes, tall golden crown, sun staff |
| `mech` | War Mech: grey alien battle robot with arm cannons and a glowing blue core |
| `vorn` | Emperor Vorn: pale alien emperor with dark horns, white armor, purple cape, glowing pink gem on the forehead |

## Suggested order

1. The 5 fighters, base form (`_0`) with their attack poses (`_0_attack`), to see them all together on the map.
2. Their golden forms (`_1` and `_1_attack`), which players see early (from level 3).
3. The other forms, the heroes, then enemies and bosses.
