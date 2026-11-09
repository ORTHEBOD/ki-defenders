import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
import { Feedback } from '../systems/Feedback.js';
import { textStyle } from '../ui/theme.js';

// "Tips & bugs": the player writes the game's maker an idea to make the game better, or a bug to fix.
export default class FeedbackScene extends Phaser.Scene {
  constructor() {
    super('Feedback');
  }

  create() {
    const player = Save.current();
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Tips & bugs', textStyle(44, '#ffd93b')).setOrigin(0.5);
    this.add.text(640, 90, 'Tell us how to make the game better, or what went wrong. We read every message!',
      textStyle(20, '#c9d3ff')).setOrigin(0.5);
    panel(this, 640, 400, 760, 520);
    Feedback.flush();

    const form = this.add.dom(640, 410).createFromHTML(`
      <form class="kd-feedback" autocomplete="off">
        <div class="kd-kinds">
          <button type="button" class="kd-kind on" data-kind="tip">💡 Tip to upgrade</button>
          <button type="button" class="kd-kind" data-kind="bug">🐞 Bug to fix</button>
        </div>
        <textarea class="kd-text" name="text" maxlength="1000"
          placeholder="Write here... (for a bug: what did you do, and what happened?)"></textarea>
        <div class="kd-count">0 / 1000</div>
        <div class="kd-msg"></div>
        <button class="kd-go" type="submit">Send</button>
      </form>
    `);
    const el = form.node.querySelector('form');
    const text = el.querySelector('textarea');
    const count = el.querySelector('.kd-count');
    const msg = el.querySelector('.kd-msg');
    const go = el.querySelector('.kd-go');
    let kind = 'tip';

    el.querySelectorAll('.kd-kind').forEach((b) => b.addEventListener('click', () => {
      kind = b.dataset.kind;
      el.querySelectorAll('.kd-kind').forEach((o) => o.classList.toggle('on', o === b));
    }));
    text.addEventListener('input', () => {
      count.textContent = `${text.value.length} / 1000`;
      msg.textContent = '';
    });
    el.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const words = text.value.trim();
      if (words.length < 3) {
        msg.style.color = '#ff6b6b';
        msg.textContent = 'Write a few words first.';
        return;
      }
      go.disabled = true;
      go.textContent = 'Sending...';
      const result = await Feedback.send(player?.name, kind, words);
      go.disabled = false;
      go.textContent = 'Send';
      msg.style.color = result === 'too_many' ? '#ff6b6b' : '#5be35b';
      msg.textContent = {
        sent: 'Thank you! Your message was sent.',
        waiting: "Thank you! No internet now - it will be sent when you're online.",
        too_many: 'That is a lot of messages! Try again in an hour.',
      }[result];
      if (result !== 'too_many') {
        text.value = '';
        count.textContent = '0 / 1000';
      }
    });
  }
}
