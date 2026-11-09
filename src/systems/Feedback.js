// Tips and bug reports from players. Sent to the online server (see netlify/functions/api.mjs).
// Without internet a message waits on the device and is sent the next time the game is online.
import { Online } from './Online.js';
import { platform } from './Analytics.js';

const KEY = 'kd_feedback_waiting';

function waiting() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch (e) {
    return [];
  }
}

function keep(list) {
  try {
    if (list.length) localStorage.setItem(KEY, JSON.stringify(list.slice(-20)));
    else localStorage.removeItem(KEY);
  } catch (e) {
    // No storage: the message is lost, nothing else breaks
  }
}

export const Feedback = {
  // Returns 'sent', 'too_many' (10 an hour), or 'waiting' when it will be sent later
  async send(name, kind, text) {
    const message = { name, kind, text, platform: platform() };
    const res = await Online.feedback(message);
    if (res?.ok) return 'sent';
    if (res?.error === 'too_many') return 'too_many';
    keep([...waiting(), message]);
    return 'waiting';
  },

  // Sends the messages that were written offline
  async flush() {
    const list = waiting();
    if (!list.length) return;
    const left = [];
    for (const m of list) {
      const res = await Online.feedback(m);
      if (!res?.ok) left.push(m);
    }
    keep(left);
  },
};
