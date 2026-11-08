import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { Save } from '../systems/Save.js';
import { Google } from '../systems/Google.js';
import { textStyle } from '../ui/theme.js';

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super('Login');
  }

  create() {
    drawMenuBackground(this);
    const google = Google.available();
    // With Google sign-in the panel is taller, to fit its button under the form
    const top = google ? 100 : 120;
    panel(this, 640, google ? 400 : 380, 560, google ? 600 : 520);
    const title = this.add.text(640, top + 40, 'Who is playing?', textStyle(52, '#ffd93b')).setOrigin(0.5);
    const sub = this.add.text(640, top + 92, 'New name = new player. Same name + PIN = log back in.', textStyle(20, '#c9d3ff')).setOrigin(0.5);
    this.add.text(640, google ? 676 : 600, 'Your progress is saved online, so you can play on any device.', textStyle(18, '#9aa3c7')).setOrigin(0.5);

    const players = Save.players();
    const chips = players.length
      ? `<div class="kd-chips">${players.map((p) => `<button type="button" class="kd-chip" data-name="${esc(p)}">${esc(p)}</button>`).join('')}</div>`
      : '';

    const googleHtml = !google ? '' : `
        <div class="kd-or"><span>or</span></div>
        <div class="kd-google">${Google.isNative() ? '<button type="button" class="kd-gbtn"><b>G</b> Sign in with Google</button>' : ''}</div>`;
    const form = this.add.dom(640, google ? 432 : 420).createFromHTML(`
      <form class="kd-login" autocomplete="off">
        ${chips}
        <input class="kd-input" name="name" maxlength="12" placeholder="Your name" />
        <input class="kd-input" name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="4-digit PIN" />
        <div class="kd-error"></div>
        <button class="kd-go" type="submit">Let's fight!</button>
        ${googleHtml}
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

    // ----- Google sign-in -----
    // After Google says who the player is, the first time they also choose a player name.
    let googleToken = null;
    const go = el.querySelector('.kd-go');
    const googleBox = el.querySelector('.kd-google');
    const finishGoogle = async (name, pin) => {
      go.disabled = true;
      go.textContent = 'Connecting...';
      const result = await Save.loginGoogle(googleToken, name, pin);
      go.disabled = false;
      go.textContent = googleToken && name ? 'Continue' : "Let's fight!";
      if (result.ok) {
        this.scene.start('Hub', { welcome: result.created ? `Welcome, ${result.name}!` : `Welcome back, ${result.name}!` });
        return;
      }
      if (result.needName) {
        // First Google sign-in: switch the form to "choose your name"
        title.setText('Choose your name');
        sub.setText('New name = new player. Your player already exists? Enter its PIN to link it.');
        el.querySelector('.kd-chips')?.remove();
        el.querySelector('.kd-or')?.remove();
        googleBox.remove();
        pinIn.placeholder = 'PIN (only to link a player)';
        go.textContent = 'Continue';
        nameIn.focus();
        return;
      }
      error.textContent = result.error;
      if (!name) googleToken = null;
      pinIn.value = '';
    };
    if (google) {
      const onToken = (token) => {
        googleToken = token;
        error.textContent = '';
        finishGoogle();
      };
      const onError = (msg) => { error.textContent = msg; };
      if (Google.isNative()) {
        googleBox.querySelector('.kd-gbtn').addEventListener('click', async () => {
          const token = await Google.signInNative();
          if (token) onToken(token);
          else onError('Google sign-in was cancelled.');
        });
      } else Google.renderButton(googleBox, onToken, onError);
    }

    el.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameIn.value.trim();
      const pin = pinIn.value.trim();
      if (googleToken) {
        if (name.length < 2) {
          error.textContent = 'Enter a name (at least 2 letters).';
          return;
        }
        if (pin && !/^\d{4}$/.test(pin)) {
          error.textContent = 'The PIN must be exactly 4 numbers.';
          return;
        }
        finishGoogle(name, pin || undefined);
        return;
      }
      if (name.length < 2) {
        error.textContent = 'Enter a name (at least 2 letters).';
        return;
      }
      if (!/^\d{4}$/.test(pin)) {
        error.textContent = 'The PIN must be exactly 4 numbers.';
        return;
      }
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
