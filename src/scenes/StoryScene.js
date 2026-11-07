import { STORY } from '../data/story.js';
import { HEROES } from '../data/hero.js';
import { FIGHTERS } from '../data/fighters.js';
import { drawMenuBackground } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
import { textStyle } from '../ui/theme.js';

// A short story scene: portraits and lines of talk. Tap to go on, or skip.
// data: { id, next: { scene, data } } - where to go when it ends.
export default class StoryScene extends Phaser.Scene {
  constructor() {
    super('Story');
  }

  create(data) {
    this.story = STORY[data.id];
    this.storyId = data.id;
    this.next = data.next ?? { scene: 'Hub' };
    drawMenuBackground(this);
    this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.35).setOrigin(0);
    const title = this.add.text(640, 70, this.story.title, textStyle(54, '#ffd93b')).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 500 });

    this.portrait = this.add.image(0, 330, '__DEFAULT').setVisible(false);
    this.box = this.add.graphics();
    this.box.fillStyle(0x10131c, 0.94).fillRoundedRect(80, 470, 1120, 200, 18);
    this.box.lineStyle(3, 0xffd93b, 0.9).strokeRoundedRect(80, 470, 1120, 200, 18);
    this.nameText = this.add.text(120, 500, '', textStyle(32, '#ffd93b')).setOrigin(0, 0.5);
    this.lineText = this.add.text(120, 540, '', { ...textStyle(28), wordWrap: { width: 1040 } });
    this.hint = this.add.text(1170, 650, 'Tap ▶', textStyle(22, '#c9d3ff')).setOrigin(1, 0.5);
    this.tweens.add({ targets: this.hint, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
    makeButton(this, 1180, 40, 150, 50, 'Skip', () => this.finish(), { fontSize: 24, color: 0x3a4470 });

    this.index = -1;
    this.input.on('pointerdown', () => {
      if (this.uiClickFrame === this.game.loop.frame) return;
      this.advance();
    });
    this.advance();
  }

  textureFor(who) {
    if (HEROES[who]) return `hero_${who}_0`;
    if (FIGHTERS[who]) return `${FIGHTERS[who].texture}_0`;
    return who;
  }

  advance() {
    // A tap while the line is still typing shows the whole line
    if (this.typing) {
      this.typing.remove();
      this.typing = null;
      this.lineText.setText(this.story.lines[this.index].text);
      return;
    }
    this.index++;
    if (this.index >= this.story.lines.length) {
      this.finish();
      return;
    }
    const line = this.story.lines[this.index];
    // Heroes and friends stand on the left, enemies on the right
    const friend = !!(HEROES[line.who] || FIGHTERS[line.who]);
    const x = friend ? 260 : 1020;
    let key = this.textureFor(line.who);
    if (this.textures.exists(`art_${key}`)) key = `art_${key}`;
    const size = this.textures.get(key).getSourceImage().width;
    this.portrait.setTexture(key).setVisible(true).setFlipX(!friend).setScale(260 / size).setPosition(x, 330).setAlpha(0);
    this.tweens.add({ targets: this.portrait, alpha: 1, y: 320, duration: 250 });
    this.nameText.setText(line.name).setX(friend ? 120 : 1160).setOrigin(friend ? 0 : 1, 0.5);
    this.lineText.setText('');
    let n = 0;
    this.typing = this.time.addEvent({
      delay: 22,
      repeat: line.text.length - 1,
      callback: () => {
        n++;
        this.lineText.setText(line.text.slice(0, n));
        if (n >= line.text.length) this.typing = null;
      },
    });
  }

  finish() {
    if (this.done) return;
    this.done = true;
    Save.update((p) => {
      if (!p.seenStory.includes(this.storyId)) p.seenStory.push(this.storyId);
    });
    this.scene.start(this.next.scene, this.next.data);
  }
}
