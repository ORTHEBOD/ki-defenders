export const FONT = 'Bangers, "Arial Black", sans-serif';

export const COLORS = {
  panel: 0x10131c,
  card: 0x2a3350,
  ki: 0xffd93b,
  outline: 0x0d0d12,
};

export function textStyle(size = 24, color = '#ffffff') {
  return {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    stroke: '#10131c',
    strokeThickness: Math.max(3, Math.round(size / 6)),
  };
}
