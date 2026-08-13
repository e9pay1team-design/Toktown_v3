// ─── 내 마을 게임 엔진 (V1 프로토타입 이식) ───────────────────────
// 캔버스 rAF 루프: 플로팅 조이스틱/키보드 이동, 축분리 충돌 슬라이드,
// 카메라 이징 추적, NPC 배회+말풍선, 상호작용 타깃 감지, 풋프린트
// 배치 커서, 나비/갈매기 앰비언트, 밤 조명. React 는 오버레이 UI 만
// 담당하고 월드 렌더는 전부 이 클래스가 그린다.

import {
  TW,
  TH,
  VW,
  VH,
  VT,
  toScreen,
  vidx,
  vinBounds,
  canPlaceFootprint,
  type VillageWorld,
  type VTerrainId,
} from './villageWorld';
import {
  drawVTile,
  drawVFoam,
  drawVProp,
  drawVCharacter,
  drawVBubble,
  drawVButterfly,
  drawVGull,
  drawVPlacementCursor,
  drawTemplateBuilding,
  drawVLandmark,
  drawVNameplate,
  VPALETTE,
  type VCharSkin,
  type VFacing,
  type VBuildingSkin,
} from './villageDraw';

/** 마을에 놓인 것 (NPC 제외) — 컴포넌트가 렌더 준비된 형태로 넘긴다 */
export interface PlacedThing {
  id: number;
  kind: 'store' | 'landmark' | 'decor';
  bx: number;
  by: number;
  w: number;
  h: number;
  label: string;
  /** store 전용 */
  emoji?: string;
  skin?: VBuildingSkin;
  /** landmark 전용 */
  lmId?: string;
  /** decor 전용 — villageDraw prop type */
  decorType?: string;
  blocking: boolean;
}

/** 마을을 돌아다니는 주민 (기본 NPC + 배치된 특수 NPC) */
export interface VillagerDef {
  id: string;
  name: string;
  skin: VCharSkin;
  anchor: { x: number; y: number };
  radius: number;
  chatter: string[];
}

export type VInteractTarget =
  | { kind: 'thing'; id: number; label: string }
  | { kind: 'npc'; id: string; label: string };

export interface VillageHooks {
  onInteractChange(target: VInteractTarget | null): void;
  onPlacementChange(tile: { bx: number; by: number; ok: boolean } | null): void;
}

interface VillagerRuntime {
  def: VillagerDef;
  x: number;
  y: number;
  facing: VFacing;
  phase: number;
  moving: boolean;
  restUntil: number;
  target: { x: number; y: number } | null;
  chatterIdx: number;
  chatterUntil: number;
}

interface Butterfly {
  x: number;
  y: number;
  tx: number;
  ty: number;
  flap: number;
  color: string;
}

const PLAYER_SPEED = 3.6;
const NPC_SPEED = 1.4;
const PLAYER_RADIUS = 0.28;
const INTERACT_RANGE = 1.6;
const JOYSTICK_RADIUS = 58;
const TAP_SLOP = 10;
const ZOOM = 0.84;

export class VillageGame {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private lastT = 0;
  private time = 0;
  private dpr = 1;
  private vw = 0;
  private vh = 0;

  private player = { x: 0, y: 0, facing: 's' as VFacing, phase: 0, moving: false };
  private cam = { sx: 0, sy: 0 };
  private villagers: VillagerRuntime[] = [];
  private butterflies: Butterfly[] = [];
  private gull = { angle: 0 };

  private move = { x: 0, y: 0 };
  private keys = new Set<string>();
  private stick: { id: number; ox: number; oy: number; moved: boolean } | null = null;
  private stickView: { ox: number; oy: number; dx: number; dy: number } | null = null;

  private things: PlacedThing[] = [];
  private dynBlocked = new Set<number>();
  private placement: { w: number; h: number } | null = null;
  private placementTile: { bx: number; by: number; ok: boolean } | null = null;
  private lastTarget: VInteractTarget | null = null;
  private playerSkin: VCharSkin;

  constructor(
    private canvas: HTMLCanvasElement,
    private world: VillageWorld,
    private hooks: VillageHooks,
    playerSkin: VCharSkin,
  ) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
    this.playerSkin = playerSkin;

    this.player.x = world.spawn.x;
    this.player.y = world.spawn.y;
    const start = toScreen(this.player.x, this.player.y);
    this.cam.sx = start.sx;
    this.cam.sy = start.sy;

    // 나비 3마리 — 광장 주변 잔디에서 시작.
    const colors = ['#f2b3c9', '#ffd166', '#c7ddf2'];
    for (let i = 0; i < 3; i++) {
      const bx = world.plaza.tx - 3 + i * 3;
      const by = world.plaza.ty + 2 + (i % 2) * 3;
      this.butterflies.push({ x: bx, y: by, tx: bx, ty: by, flap: i * 2, color: colors[i] });
    }

    this.attach();
    this.resize();
  }

  // ------------------------------------------------------------ lifecycle

  start(): void {
    if (this.raf) return;
    this.lastT = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - this.lastT) / 1000);
      this.lastT = now;
      this.time += dt;
      this.update(dt);
      this.render();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.detach();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.vw = Math.max(1, rect.width);
    this.vh = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.vw * this.dpr);
    this.canvas.height = Math.round(this.vh * this.dpr);
  }

  // ------------------------------------------------------------ public API

  setPlayerSkin(skin: VCharSkin): void {
    this.playerSkin = skin;
  }

  setThings(things: PlacedThing[]): void {
    this.things = things;
    this.dynBlocked = new Set();
    for (const t of things) {
      if (!t.blocking) continue;
      for (let ty = t.by; ty < t.by + t.h; ty++) {
        for (let tx = t.bx; tx < t.bx + t.w; tx++) {
          if (vinBounds(tx, ty)) this.dynBlocked.add(vidx(tx, ty));
        }
      }
    }
    // 배치물이 플레이어를 깔고 앉았다면 근처 빈 칸으로 밀어낸다.
    if (!this.canStand(this.player.x, this.player.y)) {
      const spot = this.nearestWalkable(Math.floor(this.player.x), Math.floor(this.player.y));
      this.player.x = spot.tx + 0.5;
      this.player.y = spot.ty + 0.5;
    }
  }

  setVillagers(defs: VillagerDef[]): void {
    const prev = new Map(this.villagers.map((v) => [v.def.id, v]));
    this.villagers = defs.map((def) => {
      const old = prev.get(def.id);
      if (old) {
        old.def = def;
        return old;
      }
      const spot = this.nearestWalkable(Math.floor(def.anchor.x), Math.floor(def.anchor.y));
      return {
        def,
        x: spot.tx + 0.5,
        y: spot.ty + 0.5,
        facing: 's' as VFacing,
        phase: 0,
        moving: false,
        restUntil: 1 + Math.random() * 3,
        target: null,
        chatterIdx: Math.floor(Math.random() * def.chatter.length),
        chatterUntil: 0,
      };
    });
  }

  /** 배치 모드 시작/해제 — w×h 풋프린트 커서가 플레이어 앞을 따라다닌다 */
  setPlacement(size: { w: number; h: number } | null): void {
    this.placement = size;
    if (!size) {
      this.placementTile = null;
      this.hooks.onPlacementChange(null);
    }
  }

  getPlacementTile(): { bx: number; by: number; ok: boolean } | null {
    return this.placementTile;
  }

  getPlayerTile(): { tx: number; ty: number } {
    return { tx: Math.floor(this.player.x), ty: Math.floor(this.player.y) };
  }

  // ------------------------------------------------------------ collision

  private solid(tx: number, ty: number): boolean {
    if (!vinBounds(tx, ty)) return true;
    const i = vidx(tx, ty);
    return this.world.blocked[i] === 1 || this.dynBlocked.has(i);
  }

  private canStand(x: number, y: number): boolean {
    const r = PLAYER_RADIUS;
    return (
      !this.solid(Math.floor(x - r), Math.floor(y - r)) &&
      !this.solid(Math.floor(x + r), Math.floor(y - r)) &&
      !this.solid(Math.floor(x - r), Math.floor(y + r)) &&
      !this.solid(Math.floor(x + r), Math.floor(y + r))
    );
  }

  private nearestWalkable(tx: number, ty: number): { tx: number; ty: number } {
    if (!this.solid(tx, ty)) return { tx, ty };
    for (let r = 1; r < 10; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          if (!this.solid(tx + dx, ty + dy)) return { tx: tx + dx, ty: ty + dy };
        }
      }
    }
    return { tx, ty };
  }

  // ------------------------------------------------------------ input

  private attach(): void {
    this.canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private detach(): void {
    this.canvas.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private onDown = (e: PointerEvent) => {
    if (this.stick) return;
    const rect = this.canvas.getBoundingClientRect();
    this.stick = {
      id: e.pointerId,
      ox: e.clientX - rect.left,
      oy: e.clientY - rect.top,
      moved: false,
    };
    this.stickView = { ox: this.stick.ox, oy: this.stick.oy, dx: 0, dy: 0 };
  };

  private onMove = (e: PointerEvent) => {
    if (!this.stick || e.pointerId !== this.stick.id) return;
    const rect = this.canvas.getBoundingClientRect();
    const dx = e.clientX - rect.left - this.stick.ox;
    const dy = e.clientY - rect.top - this.stick.oy;
    const len = Math.hypot(dx, dy);
    if (len > TAP_SLOP) this.stick.moved = true;
    const clamped = Math.min(len, JOYSTICK_RADIUS);
    const nx = len > 0.001 ? (dx / len) * (clamped / JOYSTICK_RADIUS) : 0;
    const ny = len > 0.001 ? (dy / len) * (clamped / JOYSTICK_RADIUS) : 0;
    const mag = Math.hypot(nx, ny);
    if (mag < 0.16) {
      this.move.x = 0;
      this.move.y = 0;
    } else {
      this.move.x = nx;
      this.move.y = ny;
    }
    this.stickView = {
      ox: this.stick.ox,
      oy: this.stick.oy,
      dx: len > 0.001 ? (dx / len) * clamped : 0,
      dy: len > 0.001 ? (dy / len) * clamped : 0,
    };
  };

  private onUp = (e: PointerEvent) => {
    if (!this.stick || e.pointerId !== this.stick.id) return;
    this.stick = null;
    this.stickView = null;
    this.move.x = 0;
    this.move.y = 0;
  };

  private onKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    this.keys.add(e.key.toLowerCase());
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  // ------------------------------------------------------------ update

  private update(dt: number): void {
    let mx = this.move.x;
    let my = this.move.y;
    const k = this.keys;
    if (k.has('arrowleft') || k.has('a')) mx -= 1;
    if (k.has('arrowright') || k.has('d')) mx += 1;
    if (k.has('arrowup') || k.has('w')) my -= 1;
    if (k.has('arrowdown') || k.has('s')) my += 1;
    const mag = Math.hypot(mx, my);
    if (mag > 1) {
      mx /= mag;
      my /= mag;
    }

    const moving = Math.hypot(mx, my) > 0.05;
    this.player.moving = moving;

    if (moving) {
      // 화면 드래그 방향 → 월드 방향 (위로 끌면 북쪽으로 걷는다).
      const a = mx / (TW / 2);
      const b = my / (TH / 2);
      let dx = (b + a) / 2;
      let dy = (b - a) / 2;
      const dlen = Math.hypot(dx, dy);
      if (dlen > 0.0001) {
        dx /= dlen;
        dy /= dlen;
      }
      const step = PLAYER_SPEED * dt * Math.min(1, Math.hypot(mx, my));
      const nx = this.player.x + dx * step;
      const ny = this.player.y + dy * step;
      if (this.canStand(nx, this.player.y)) this.player.x = nx;
      if (this.canStand(this.player.x, ny)) this.player.y = ny;
      this.player.facing = facingFromWorldDelta(dx, dy);
      this.player.phase += dt * 11;
    } else {
      this.player.phase = 0;
    }

    // 카메라 이징.
    const goal = toScreen(this.player.x, this.player.y);
    const ease = 1 - Math.pow(0.0015, dt);
    this.cam.sx += (goal.sx - this.cam.sx) * ease;
    this.cam.sy += (goal.sy - this.cam.sy) * ease;

    this.updateVillagers(dt);
    this.updateAmbient(dt);
    this.updateInteract();
    this.updatePlacement();
  }

  private updateVillagers(dt: number): void {
    for (const n of this.villagers) {
      n.restUntil -= dt;
      if (!n.target && n.restUntil <= 0) {
        const a = n.def.anchor;
        for (let attempt = 0; attempt < 8; attempt++) {
          const tx = Math.floor(a.x + (Math.random() * 2 - 1) * n.def.radius);
          const ty = Math.floor(a.y + (Math.random() * 2 - 1) * n.def.radius);
          if (!this.solid(tx, ty)) {
            n.target = { x: tx + 0.5, y: ty + 0.5 };
            break;
          }
        }
        n.restUntil = 2 + Math.random() * 4;
      }

      if (n.target) {
        const dx = n.target.x - n.x;
        const dy = n.target.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.08) {
          n.target = null;
          n.moving = false;
          n.phase = 0;
        } else {
          const step = Math.min(d, NPC_SPEED * dt);
          const ux = dx / d;
          const uy = dy / d;
          const nx = n.x + ux * step;
          const ny = n.y + uy * step;
          const blockedX = this.solid(Math.floor(nx), Math.floor(n.y));
          const blockedY = this.solid(Math.floor(n.x), Math.floor(ny));
          if (!blockedX) n.x = nx;
          if (!blockedY) n.y = ny;
          if (blockedX && blockedY) n.target = null;
          n.moving = true;
          n.phase += dt * 9;
          n.facing = facingFromWorldDelta(ux, uy);
        }
      } else {
        n.moving = false;
      }

      if (this.time > n.chatterUntil) {
        n.chatterIdx = (n.chatterIdx + 1) % Math.max(1, n.def.chatter.length);
        n.chatterUntil = this.time + 5 + Math.random() * 4;
      }
    }
  }

  private updateAmbient(dt: number): void {
    // 나비: 목표 칸으로 흐느적 이동, 도착하면 근처 새 목표.
    for (const b of this.butterflies) {
      b.flap += dt * 14;
      const dx = b.tx - b.x;
      const dy = b.ty - b.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.12) {
        const nx = b.x + (Math.random() * 2 - 1) * 4;
        const ny = b.y + (Math.random() * 2 - 1) * 4;
        const tx = Math.max(3, Math.min(VW - 6, Math.round(nx)));
        const ty = Math.max(3, Math.min(VH - 6, Math.round(ny)));
        if (vinBounds(tx, ty) && this.world.terrain[vidx(tx, ty)] !== VT.Water) {
          b.tx = tx + 0.5;
          b.ty = ty + 0.5;
        }
      } else {
        const sp = 0.9 * dt;
        b.x += (dx / d) * sp;
        b.y += (dy / d) * sp;
      }
    }
    // 갈매기: 앞바다 상공을 크게 돈다.
    this.gull.angle += dt * 0.25;
  }

  private updateInteract(): void {
    let best: VInteractTarget | null = null;
    let bestD = INTERACT_RANGE;

    for (const t of this.things) {
      // 건물은 문 앞, 소품은 중심이 기준.
      const px = t.kind === 'decor' ? t.bx + t.w / 2 : t.bx + t.w / 2;
      const py = t.kind === 'decor' ? t.by + t.h / 2 : t.by + t.h + 0.5;
      const dist = Math.hypot(px - this.player.x, py - this.player.y);
      if (dist < bestD) {
        bestD = dist;
        best = { kind: 'thing', id: t.id, label: t.label };
      }
    }
    for (const n of this.villagers) {
      const dist = Math.hypot(n.x - this.player.x, n.y - this.player.y);
      if (dist < bestD) {
        bestD = dist;
        best = { kind: 'npc', id: n.def.id, label: n.def.name };
      }
    }

    if (targetKey(best) !== targetKey(this.lastTarget)) {
      this.lastTarget = best;
      this.hooks.onInteractChange(best);
    }
  }

  /** 배치 커서: 플레이어가 보는 방향 앞 칸을 원점으로 풋프린트를 편다 */
  private updatePlacement(): void {
    if (!this.placement) return;
    const { w, h } = this.placement;
    const { tx, ty } = this.getPlayerTile();
    const co = -Math.floor((w - 1) / 2);
    const ro = -Math.floor((h - 1) / 2);
    const byFacing: Record<VFacing, [number, number]> = {
      e: [tx + 1, ty + ro],
      w: [tx - w, ty + ro],
      s: [tx + co, ty + 1],
      n: [tx + co, ty - h],
    };
    const primary = byFacing[this.player.facing];
    const candidates: [number, number][] = [
      primary,
      byFacing.s,
      byFacing.e,
      byFacing.w,
      byFacing.n,
    ];
    let bx = primary[0];
    let by = primary[1];
    let ok = false;
    for (const [cx, cy] of candidates) {
      if (canPlaceFootprint(this.world, this.dynBlocked, cx, cy, w, h)) {
        bx = cx;
        by = cy;
        ok = true;
        break;
      }
    }
    const prev = this.placementTile;
    if (!prev || prev.bx !== bx || prev.by !== by || prev.ok !== ok) {
      this.placementTile = { bx, by, ok };
      this.hooks.onPlacementChange(this.placementTile);
    }
  }

  // ------------------------------------------------------------ render

  private nightFactor(): number {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    if (h >= 20 || h < 5) return 1;
    if (h >= 18) return (h - 18) / 2;
    if (h < 7) return 1 - (h - 5) / 2;
    return 0;
  }

  private render(): void {
    const ctx = this.ctx;
    const night = this.nightFactor();

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = VPALETTE.waterDeep;
    ctx.fillRect(0, 0, this.vw, this.vh);

    // 플레이어를 화면 중앙보다 살짝 아래에 두어 앞쪽이 더 보이게.
    const anchorX = this.vw / 2;
    const anchorY = this.vh * 0.54;
    const applyCamera = () => {
      ctx.translate(anchorX, anchorY);
      ctx.scale(ZOOM, ZOOM);
      ctx.translate(-this.cam.sx, -this.cam.sy);
    };
    ctx.save();
    applyCamera();

    const visible = (sx: number, sy: number, pad = 120) => {
      const vx = (sx - this.cam.sx) * ZOOM + anchorX;
      const vy = (sy - this.cam.sy) * ZOOM + anchorY;
      return vx > -pad && vx < this.vw + pad && vy > -pad * 2 && vy < this.vh + pad;
    };

    // 지형.
    for (let ty = 0; ty < VH; ty++) {
      for (let tx = 0; tx < VW; tx++) {
        const { sx, sy } = toScreen(tx + 0.5, ty + 0.5);
        if (!visible(sx, sy)) continue;
        drawVTile(ctx, tx, ty, this.world.terrain[vidx(tx, ty)] as VTerrainId, this.time);
      }
    }
    for (let i = 0; i < this.world.shore.length; i++) {
      const t = this.world.shore[i];
      const tx = t % VW;
      const ty = Math.floor(t / VW);
      const { sx, sy } = toScreen(tx + 0.5, ty + 0.5);
      if (!visible(sx, sy)) continue;
      drawVFoam(ctx, tx, ty, this.time);
    }

    if (this.placement && this.placementTile) {
      drawVPlacementCursor(
        ctx,
        this.placementTile.bx,
        this.placementTile.by,
        this.placement.w,
        this.placement.h,
        this.placementTile.ok,
        this.time,
      );
    }

    // 깊이 정렬 렌더 패스.
    type Item = { d: number; draw: () => void };
    const items: Item[] = [];

    for (const t of this.things) {
      const front = toScreen(t.bx + t.w, t.by + t.h);
      if (!visible(front.sx, front.sy, 220)) continue;
      const px = t.bx + t.w / 2;
      const py = t.by + t.h + 0.5;
      const dist = Math.hypot(px - this.player.x, py - this.player.y);
      const focus = clamp01(1 - (dist - INTERACT_RANGE) / 3.5);
      if (t.kind === 'store') {
        items.push({
          d: t.bx + t.w + t.by + t.h,
          draw: () =>
            drawTemplateBuilding(ctx, t.bx, t.by, t.w, t.h, t.skin!, {
              focus,
              label: t.label,
              emoji: t.emoji ?? '🏪',
              time: this.time,
            }),
        });
      } else if (t.kind === 'landmark') {
        items.push({
          d: t.bx + t.w + t.by + t.h,
          draw: () =>
            drawVLandmark(ctx, t.lmId ?? 'cathedral', t.bx, t.by, {
              focus,
              label: t.label,
              time: this.time,
            }),
        });
      } else {
        const cx = t.bx + 0.5;
        const cy = t.by + 0.5;
        items.push({
          d: this.entityDepth(cx, cy),
          draw: () => {
            drawVProp(ctx, { type: t.decorType ?? 'bench', x: cx, y: cy, v: (t.id % 97) / 97 }, this.time);
            if (focus > 0.55) {
              const { sx, sy } = toScreen(cx, cy);
              drawVNameplate(ctx, sx, sy - 52, t.label, { alpha: focus * 0.9, accent: '#8b5a37' });
            }
          },
        });
      }
    }

    for (const p of this.world.props) {
      const { sx, sy } = toScreen(p.x, p.y);
      if (!visible(sx, sy, 160)) continue;
      items.push({ d: this.entityDepth(p.x, p.y), draw: () => drawVProp(ctx, p, this.time) });
    }

    for (const n of this.villagers) {
      const { sx, sy } = toScreen(n.x, n.y);
      if (!visible(sx, sy, 160)) continue;
      const near = Math.hypot(n.x - this.player.x, n.y - this.player.y) < 4.5;
      items.push({
        d: this.entityDepth(n.x, n.y),
        draw: () => {
          drawVCharacter(ctx, n.x, n.y, {
            facing: n.facing,
            phase: n.phase,
            moving: n.moving,
            skin: n.def.skin,
            scale: 0.94,
          });
          if (near && n.def.chatter.length > 0) {
            drawVBubble(ctx, n.x, n.y, n.def.chatter[n.chatterIdx], this.time);
          }
        },
      });
    }

    items.push({
      d: this.entityDepth(this.player.x, this.player.y) + 0.001,
      draw: () =>
        drawVCharacter(ctx, this.player.x, this.player.y, {
          facing: this.player.facing,
          phase: this.player.phase,
          moving: this.player.moving,
          skin: this.playerSkin,
        }),
    });

    // 나비 (지면 위 개체보다 위에 뜨도록 깊이 보정).
    for (const b of this.butterflies) {
      const { sx, sy } = toScreen(b.x, b.y);
      if (!visible(sx, sy, 80)) continue;
      const hover = Math.sin(b.flap * 0.35) * 4;
      items.push({
        d: this.entityDepth(b.x, b.y) + 0.5,
        draw: () => drawVButterfly(ctx, b.x, b.y, hover, b.flap, b.color),
      });
    }

    // 갈매기 — 앞바다 상공 선회.
    {
      const cx = VW - 4.5;
      const cy = VH - 4.5;
      const gx = cx + Math.cos(this.gull.angle) * 4.5;
      const gy = cy + Math.sin(this.gull.angle) * 3.2;
      const { sx, sy } = toScreen(gx, gy);
      if (visible(sx, sy, 120)) {
        items.push({
          d: this.entityDepth(gx, gy) + 3,
          draw: () => drawVGull(ctx, gx, gy, 58 + Math.sin(this.time * 1.3) * 6, this.time * 5),
        });
      }
    }

    items.sort((a, b) => a.d - b.d);
    for (const it of items) it.draw();

    ctx.restore();

    // 밤: 남색 틴트 + 가로등 광원.
    if (night > 0.01) {
      ctx.fillStyle = `rgba(22,31,74,${0.55 * night})`;
      ctx.fillRect(0, 0, this.vw, this.vh);
      ctx.save();
      applyCamera();
      ctx.globalCompositeOperation = 'lighter';
      const R = 92;
      const lampLike = [
        ...this.world.props.filter((p) => p.type === 'lamp'),
        ...this.things
          .filter((t) => t.kind === 'decor' && t.decorType === 'lamp')
          .map((t) => ({ x: t.bx + 0.5, y: t.by + 0.5 })),
      ];
      for (const p of lampLike) {
        const { sx, sy } = toScreen(p.x, p.y);
        if (!visible(sx, sy)) continue;
        const cy = sy - 50;
        const g = ctx.createRadialGradient(sx, cy, 2, sx, cy, R);
        g.addColorStop(0, `rgba(255,208,132,${0.34 * night})`);
        g.addColorStop(0.45, `rgba(255,196,118,${0.1 * night})`);
        g.addColorStop(1, 'rgba(255,196,118,0)');
        ctx.fillStyle = g;
        ctx.fillRect(sx - R, cy - R, R * 2, R * 2);
      }
      ctx.restore();
    }

    // 비네트.
    const vg = ctx.createRadialGradient(
      this.vw / 2,
      this.vh / 2,
      Math.min(this.vw, this.vh) * 0.42,
      this.vw / 2,
      this.vh / 2,
      Math.max(this.vw, this.vh) * 0.78,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(20,30,20,0.28)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.vw, this.vh);

    // 플로팅 조이스틱.
    const sv = this.stickView;
    if (sv) {
      ctx.beginPath();
      ctx.arc(sv.ox, sv.oy, JOYSTICK_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sv.ox + sv.dx, sv.oy + sv.dy, 24, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(90,80,70,0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  /**
   * 페인터 정렬 깊이. 점 하나는 다층 타일 박스와 스칼라 하나로는 완전히
   * 정렬되지 않으므로, 건물 앞면(+x/+y 면)을 지나면 그 건물 위로 띄운다.
   */
  private entityDepth(x: number, y: number): number {
    let d = x + y;
    for (const t of this.things) {
      if (t.kind === 'decor') continue;
      const bx1 = t.bx + t.w;
      const by1 = t.by + t.h;
      const bd = bx1 + by1;
      if (bd >= d && (x > bx1 || y > by1)) d = bd + 0.01;
    }
    return d;
  }
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** 월드 방향 → 바라보는 방향 (화면 기준 판정) */
function facingFromWorldDelta(dx: number, dy: number): VFacing {
  const sx = (dx - dy) * (TW / 2);
  const sy = (dx + dy) * (TH / 2);
  if (Math.abs(sx) > Math.abs(sy) * 2) return sx > 0 ? 'e' : 'w';
  return sy > 0 ? 's' : 'n';
}

function targetKey(t: VInteractTarget | null): string {
  if (!t) return '';
  return `${t.kind}:${t.kind === 'thing' ? t.id : t.id}`;
}
