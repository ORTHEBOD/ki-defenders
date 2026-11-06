export function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// A path made of straight segments. Enemies store how far along it they are (travel).
// `remaining: true` makes progress (dist) count down to the base like the maze grid does,
// so flyers crossing a maze can be compared with enemies walking it.
export default class Path {
  constructor(points, opts = {}) {
    this.remaining = !!opts.remaining;
    this.points = points.map(([x, y]) => ({ x, y }));
    this.segments = [];
    let total = 0;
    for (let i = 0; i < this.points.length - 1; i++) {
      const a = this.points[i];
      const b = this.points[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      this.segments.push({ a, b, len, start: total });
      total += len;
    }
    this.length = total;
    this.start = this.points[0];
    this.end = this.points[this.points.length - 1];
  }

  // ---- Route interface shared with Grid: spawn / move ----

  spawn(e) {
    e.travel = 0;
    e.x = this.start.x;
    e.y = this.start.y;
    this.updateProgress(e);
  }

  // Put a new enemy where `from` is (a split or a summon), `back` pixels behind it
  place(e, from, back) {
    e.travel = Math.max(0, from.travel - back);
    const p = this.pointAt(e.travel);
    e.x = p.x;
    e.y = p.y;
    this.updateProgress(e);
  }

  // Moves an enemy `step` pixels. Returns the x direction it moved, or 'done' at the base.
  move(e, step) {
    e.travel += step;
    if (e.travel >= this.length) return 'done';
    const p = this.pointAt(e.travel);
    e.x = p.x;
    e.y = p.y;
    this.updateProgress(e);
    return p.dx;
  }

  updateProgress(e) {
    e.dist = this.remaining ? 100000 - (this.length - e.travel) : e.travel;
  }

  pointAt(dist) {
    const d = Math.max(0, Math.min(this.length, dist));
    for (const s of this.segments) {
      if (d <= s.start + s.len) {
        const t = (d - s.start) / s.len;
        return { x: s.a.x + (s.b.x - s.a.x) * t, y: s.a.y + (s.b.y - s.a.y) * t, dx: s.b.x - s.a.x, dy: s.b.y - s.a.y };
      }
    }
    const last = this.segments[this.segments.length - 1];
    return { x: last.b.x, y: last.b.y, dx: last.b.x - last.a.x, dy: last.b.y - last.a.y };
  }

  distanceTo(x, y) {
    let min = Infinity;
    for (const s of this.segments) {
      min = Math.min(min, distToSegment(x, y, s.a.x, s.a.y, s.b.x, s.b.y));
    }
    return min;
  }
}
