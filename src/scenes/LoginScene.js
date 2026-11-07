import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { Save } from '../systems/Save.js';
import { textStyle } from '../ui/theme.js';

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super('Login');
  }

  create() {
    drawMenuBackground(this);
    panel(this, 640, 380, 560, 520);
    this.add.text(640, 160, 'Who is playing?', textStyle(52, '#ffd93b')).setOrigin(0.5);
    this.add.text(640, 212, 'New name = new player. Same name + PIN = log back in.', textStyle(20, '#c9d3ff')).setOrigin(0.5);
    this.add.text(640, 600, 'Your progress is saved online, so you can play on any device.', textStyle(18, '#9aa3c7')).setOrigin(0.5);

    const players = Save.players();
    const chips = players.length
      ? `<div class="kd-chips">${players.map((p) => `<button type="button" class="kd-chip" data-name="${esc(p)}">${esc(p)}</button>`).join('')}</div>`
      : '';

    const form = this.add.dom(640, 420).createFromHTML(`
      <form class="kd-login" autocomplete="off">
        ${chips}
        <input class="kd-input" name="name" maxlength="12" placeholder="Your name" />
        <input class="kd-input" name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="4-digit PIN" />
        <div class="kd-error"></div>
        <button class="kd-go" type="submit">Let's fight!</button>
      </form>
    `);

    const el = form.node.querySelector('form');
    const nameIn = el.querySelector('[name=name]');
    const pinIn = el.querySelector('[name=pin]');
    const error = el.querySelector('.kd-error');

    el.querySelectorAll('.kd-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        nameIn.value = chip.dataset.name;
        pinIn.focus();
      });
    });
    [nameIn, pinIn].forEach((i) => i.addEventListener('input', () => { error.textContent = ''; }));

    el.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameIn.value.trim();
      const pin = pinIn.value.trim();
      if (name.length < 2) {
        error.textContent = 'Enter a name (at least 2 letters).';
        return;
      }
      if (!/^\d{4}$/.test(pin)) {
        error.textContent = 'The PIN must be exactly 4 numbers.';
        return;
      }
      const go = el.querySelector('.kd-go');
      go.disabled = true;
      go.textContent = 'Connecting...';
      const result = await Save.login(name, pin);
      go.disabled = false;
      go.textContent = "Let's fight!";
      if (!result.ok) {
        error.textContent = result.error;
        pinIn.value = '';
        return;
      }
      this.scene.start('Hub', { welcome: result.created ? `Welcome, ${name}!` : `Welcome back, ${name}!` });
    });
  }
}
