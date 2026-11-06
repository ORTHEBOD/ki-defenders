// The open field of a maze level. Fighters and walls block cells, and enemies always walk
// the shortest open way to the exit. A distance map from the exit (BFS) is rebuilt every time
// a cell changes, so every enemy just steps to the neighbour that is one step closer.

const DIRS = [[1, 0], [0, 1], [0, -1], [-1, 0]];

export default class Grid {
  constructor(def) {
    this.size = def.cell ?? 64;
    this.ox = def.x ?? 64;
    this.oy = def.y ?? 64;
    this.cols = def.cols;
    this.rows = def.rows;
    this.entry = { c: 0, r: def.entryRow };
    this.exit = { c: this.cols - 1, r: def.exitRow };
    this.blocked = new Uint8Array(this.cols * this.rows);
    this.rocks = def.rocks ?? [];
    for (const [c, r] of this.rocks) this.blocked[this.idx(c, r)] = 1;

    const e = this.center(this.entry.c, this.entry.r);
    const x = this.center(this.exit.c, this.exit.r);
    this.spawnPoint = { x: -40, y: e.y };
    this.start = { x: this.ox - 36, y: e.y }; // where the portal stands
    this.end = { x: this.ox + this.cols * this.size + 64, y: x.y }; // the base
    this.field = this.computeField();
  }

  idx(c, r) {
    return r * this.cols + c;
  }

  inside(c, r) {
    return c >= 0 && r >= 0 && c < this.cols && r < this.rows;
  }

  center(c, r) {
    return { x: this.ox + c * this.size + this.size / 2, y: this.oy + r * this.size + this.size / 2 };
  }

  cellAt(x, y) {
    const c = Math.floor((x - this.ox) / this.size);
    const r = Math.floor((y - this.oy) / this.size);
    return this.inside(c, r) ? { c, r } : null;
  }

  isRock(c, r) {
    return this.rocks.some(([rc, rr]) => rc === c && rr === r);
  }

  // Steps from every cell to the exit (-1 = no way out). `extra` is one more cell to treat as blocked.
  computeField(extra) {
    const field = new Int32Array(this.cols * this.rows).fill(-1);
    const isBlocked = (c, r) => this.blocked[this.idx(c, r)] || (extra && extra.c === c && extra.r === r);
    if (isBlocked(this.exit.c, this.exit.r)) return field;
    const queue = [this.exit];
    field[this.idx(this.exit.c, this.exit.r)] = 0;
    for (let i = 0; i < queue.length; i++) {
      const { c, r } = queue[i];
      const d = field[this.idx(c, r)];
      for (const [dc, dr] of DIRS) {
        const nc = c + dc;
        const nr = r + dr;
        if (!this.inside(nc, nr) || isBlocked(nc, nr) || field[this.idx(nc, nr)] !== -1) continue;
        field[this.idx(nc, nr)] = d + 1;
        queue.push({ c: nc, r: nr });
      }
    }
    return field;
  }

  // Why a cell can't be built on, or null if it can. Enemies must keep a way to the exit.
  buildProblem(c, r, enemies) {
    if (!this.inside(c, r) || this.blocked[this.idx(c, r)]) return 'taken';
    const busy = enemies.some((e) => e.alive && [e.cell, e.next].some((t) => t && t.c === c && t.r === r));
    if (busy) return 'enemy';
    const field = this.computeField({ c, r });
    if (field[this.idx(this.entry.c, this.entry.r)] < 0) return 'block';
    for (const e of enemies) {
      const t = e.alive && e.next;
      if (t && t.c !== undefined && field[this.idx(t.c, t.r)] < 0) return 'block';
    }
    return null;
  }

  setBlocked(c, r, value) {
    this.blocked[this.idx(c, r)] = value ? 1 : 0;
    this.field = this.computeField();
  }

  // The cell to walk to after `from`. Keeps going straight when that is just as short.
  stepFrom(from, dir) {
    if (from.c === this.exit.c && from.r === this.exit.r) return { ...this.end, end: true };
    const d = this.field[this.idx(from.c, from.r)];
    let best = null;
    for (const [dc, dr] of DIRS) {
      const c = from.c + dc;
      const r = from.r + dr;
      if (!this.inside(c, r) || this.field[this.idx(c, r)] !== d - 1) continue;
      const straight = dir && dir[0] === dc && dir[1] === dr;
      if (!best || straight) best = { c, r, dir: [dc, dr] };
      if (straight) break;
    }
    if (!best) return { ...this.end, end: true }; // should never happen: building is checked
    return { ...best, ...this.center(best.c, best.r) };
  }

  // ---- Route interface shared with Path: spawn / move ----

  spawn(e) {
    e.x = this.spawnPoint.x;
    e.y = this.spawnPoint.y;
    e.cell = null;
    e.dir = [1, 0];
    e.next = { ...this.entry, ...this.center(this.entry.c, this.entry.r) };
    this.updateProgress(e);
  }

  // Moves an enemy `step` pixels. Returns the x direction it moved, or 'done' at the base.
  move(e, step) {
    let dx = 0;
    while (step > 0) {
      const t = e.next;
      const ddx = t.x - e.x;
      const ddy = t.y - e.y;
      const d = Math.hypot(ddx, ddy);
      if (d > step) {
        e.x += (ddx / d) * step;
        e.y += (ddy / d) * step;
        dx = ddx;
        break;
      }
      e.x = t.x;
      e.y = t.y;
      step -= d;
      if (d > 0) dx = ddx;
      if (t.end) return 'done';
      e.cell = { c: t.c, r: t.r };
      e.next = this.stepFrom(e.cell, e.dir);
      if (e.next.dir) e.dir = e.next.dir;
    }
    this.updateProgress(e);
    return dx;
  }

  // Bigger = closer to the base (used to pick the enemy in front)
  updateProgress(e) {
    const t = e.next;
    const steps = t.end ? -1 : this.field[this.idx(t.c, t.r)];
    e.dist = 100000 - ((steps + 1) * this.size + Math.hypot(t.x - e.x, t.y - e.y));
  }

  // Cell centres along the current shortest way, for drawing it on the ground
  routePoints() {
    const pts = [this.spawnPoint];
    let cur = { ...this.entry, ...this.center(this.entry.c, this.entry.r) };
    let dir = [1, 0];
    if (this.field[this.idx(cur.c, cur.r)] < 0) return pts;
    for (let i = 0; i < this.cols * this.rows + 2; i++) {
      pts.push(cur);
      if (cur.end) break;
      const n = this.stepFrom(cur, dir);
      if (n.dir) dir = n.dir;
      cur = n;
    }
    return pts;
  }
}
