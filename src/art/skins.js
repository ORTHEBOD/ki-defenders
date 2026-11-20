import { SKINS } from '../data/skins.js';

// The texture `key` repainted in a skin's colors (src/data/skins.js), as the texture `key~skin`.
// Made the first time it is needed. With no skin (or no such texture) it is `key` itself.
export function skinTexture(scene, key, skin) {
  const def = SKINS[skin];
  if (!def || !scene.textures.exists(key)) return key;
  const out = `${key}~${skin}`;
  if (scene.textures.exists(out)) return out;
  const src = scene.textures.get(key).getSourceImage();
  const canvas = document.createElement('canvas');
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  paint(data.data, def.colors.map((c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255]));
  ctx.putImageData(data, 0, 0);
  scene.textures.addCanvas(out, canvas);
  return out;
}

// Every pixel takes the skin color for its brightness, except the dark outline, the eye whites and the skin
function paint(px, stops) {
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 8) continue;
    const r = px[i] / 255;
    const g = px[i + 1] / 255;
    const b = px[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max ? (max - min) / max : 0;
    if (max < 0.16 || (sat < 0.08 && max > 0.92)) continue;
    let hue = 0;
    if (max !== min) {
      if (max === r) hue = 60 * (((g - b) / (max - min) + 6) % 6);
      else if (max === g) hue = 60 * ((b - r) / (max - min) + 2);
      else hue = 60 * ((r - g) / (max - min) + 4);
    }
    if (hue >= 8 && hue <= 45 && sat >= 0.15 && sat <= 0.62 && max > 0.5) continue;
    // Brightness, a little stronger, along the skin's colors
    const lum = Math.min(1, Math.max(0, (0.3 * r + 0.59 * g + 0.11 * b - 0.5) * 1.15 + 0.5));
    const t = lum * (stops.length - 1);
    const k = Math.min(stops.length - 2, Math.floor(t));
    const f = t - k;
    for (let c = 0; c < 3; c++) px[i + c] = stops[k][c] + (stops[k + 1][c] - stops[k][c]) * f;
  }
}
