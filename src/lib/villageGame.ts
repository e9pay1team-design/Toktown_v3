// ─── 내 마을 게임 엔진 (V1 프로토타입 이식 + 배치 모드) ───────────
// 걷기 모드: 플로팅 조이스틱/키보드 이동, 축분리 충돌 슬라이드, 카메라
// 이징 추적, NPC 배회+말풍선, 상호작용 타깃 감지, 나비/갈매기, 밤 조명.
// 배치 모드: 캐릭터·주민이 잠시 퇴장하고 오브젝트만 남는 편집 화면.
// 빈 곳 드래그=카메라 패닝, 오브젝트 탭=선택, 드래그=이동, 캔버스에
// 그려지는 ✓(확정)/✕(보관함 반환) 버튼으로 마무리한다.

import {
  TW,
  TH,
  VW,
  VH,
  VT,
  toScreen,
  toWorld,
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
  drawVBuildingLabel,
  drawVLandmark,
  drawVLandmarkLabel,
  drawVNameplate,
  vTilePath,
  VPALETTE,
  type VBuildingFacing,
  type VCharSkin,
  type VFacing,
  type VBuildingSkin,
} from './villageDraw';

/** 마을에 놓인 것 — 컴포넌트가 렌더 준비된 형태로 넘긴다 */
export interface PlacedThing {
  id: number;
  kind: 'store' | 'landmark' | 'decor' | 'npc';
  bx: number;
  by: number;
  w: number;
  h: number;
  label: string;
  /** store 전용 */
  emoji?: string;
  skin?: VBuildingSkin;
  /** store 전용 — 건물 방향 (기본 sw) */
  facing?: VBuildingFacing;
  /** landmark 전용 */
  lmId?: string;
  /** decor 전용 — villageDraw prop type */
  decorType?: string;
  /** npc 전용 — 배치 모드 정적 렌더용 */
  npcSkin?: VCharSkin;
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

/** 배치 모드에서 편집 중인 오브젝트의 렌더 정보 */
export interface EditMeta {
  kind: 'store' | 'landmark' | 'decor' | 'npc';
  refId: string;
  w: number;
  h: number;
  label: string;
  emoji?: string;
  skin?: VBuildingSkin;
  facing?: VBuildingFacing;
  lmId?: string;
  decorType?: string;
  npcSkin?: VCharSkin;
}

interface EditObject extends EditMeta {
  /** null = 보관함에서 새로 꺼낸 것 */
  placementId: number | null;
  bx: number;
  by: number;
  ok: boolean;
}

export interface VillageHooks {
  onInteractChange(target: VInteractTarget | null): void;
  /** ✓ — 배치 확정 (placementId null 이면 신규 place, 아니면 move) */
  onEditCommit(e: {
    placementId: number | null;
    kind: string;
    refId: string;
    bx: number;
    by: number;
    facing?: VBuildingFacing;
  }): void;
  /** ✕ — 보관함 반환 (placementId null 이면 그냥 취소) */
  onEditReturn(e: { placementId: number | null }): void;
  /** 편집 선택 상태 변화 (React 힌트 문구용) */
  onEditSelection(sel: { label: string; isNew: boolean; canRotate: boolean } | null): void;
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
  /** 목표로 못 가고 제자리걸음한 누적 시간 — 길막힘 감지용 */
  stuck: number;
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

/** 바닥에 깔리는 소품 — 지형 패스 직후에 그리고 깊이 정렬에서 제외.
    바닥 타일 위에는 1×1 소품·NPC 를 겹쳐 올릴 수 있다(건물·랜드마크 제외). */
export const GROUND_DECOR = new Set(['plaza-tile']);

const PLAYER_SPEED = 3.6;
const NPC_SPEED = 1.4;
const PLAYER_RADIUS = 0.28;
const INTERACT_RANGE = 1.6;
const JOYSTICK_RADIUS = 58;
const TAP_SLOP = 10;
const ZOOM = 0.84;
const EDIT_BTN_R = 16;

export class VillageGame {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private lastT = 0;
  private time = 0;
  private dpr = 1;
  private vw = 0;
  private vh = 0;
  private anchorX = 0;
  private anchorY = 0;

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
  private lastTarget: VInteractTarget | null = null;
  private playerSkin: VCharSkin;

  private editMode = false;
  private edit: EditObject | null = null;
  private editDragging = false;
  private editPointer: {
    id: number;
    mode: 'pan' | 'drag';
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null = null;

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

    const colors = ['#f2b3c9', '#ffd166', '#c7ddf2'];
    for (let i = 0; i < 3; i++) {
      const bx = world.plaza.tx - 3 + i * 3;
      const by = world.plaza.ty + 2 + (i % 2) * 3;
      this.butterflies.push({ x: bx, y: by, tx: bx, ty: by, flap: i * 2, color: colors[i] });
    }

    // e2e 검증/디버깅 훅.
    (window as unknown as Record<string, unknown>).__toktownVillage = this;

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
    this.anchorX = this.vw / 2;
    this.anchorY = this.vh * 0.54;
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
    if (!this.editMode && !this.canStand(this.player.x, this.player.y)) {
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
        stuck: 0,
        chatterIdx: Math.floor(Math.random() * def.chatter.length),
        chatterUntil: 0,
      };
    });
  }

  /** 배치 모드 on/off — off 시 편집 중이던 오브젝트는 원위치(신규는 보관함 유지) */
  setEditMode(on: boolean): void {
    if (this.editMode === on) return;
    this.editMode = on;
    this.edit = null;
    this.editDragging = false;
    this.editPointer = null;
    this.move.x = 0;
    this.move.y = 0;
    this.keys.clear();
    this.stick = null;
    this.stickView = null;
    this.hooks.onEditSelection(null);
    if (on && this.lastTarget) {
      this.lastTarget = null;
      this.hooks.onInteractChange(null);
    }
  }

  isEditMode(): boolean {
    return this.editMode;
  }

  /** 편집 선택 해제 — 전체 회수 등 외부에서 배치 상태가 바뀔 때 호출 */
  cancelEdit(): void {
    if (!this.edit) return;
    this.edit = null;
    this.editDragging = false;
    this.editPointer = null;
    this.hooks.onEditSelection(null);
  }

  /** 보관함에서 아이템을 꺼내 유효 타일에 스폰 — near 를 주면 그 주변(연속 배치), 없으면 화면 중앙 */
  spawnFromTray(meta: EditMeta, near?: { bx: number; by: number }): void {
    if (!this.editMode) return;
    const center = toWorld(this.cam.sx, this.cam.sy);
    let bx = near ? near.bx : Math.round(center.x - meta.w / 2);
    let by = near ? near.by : Math.round(center.y - meta.h / 2);
    bx = Math.max(0, Math.min(VW - meta.w, bx));
    by = Math.max(0, Math.min(VH - meta.h, by));
    // 가까운 유효 자리 나선 탐색.
    outer: for (let r = 0; r < 8; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (this.canPlaceEdit(meta, null, bx + dx, by + dy, meta.w, meta.h)) {
            bx += dx;
            by += dy;
            break outer;
          }
        }
      }
    }
    this.edit = {
      ...meta,
      placementId: null,
      bx,
      by,
      ok: this.canPlaceEdit(meta, null, bx, by, meta.w, meta.h),
    };
    this.editDragging = false;
    this.hooks.onEditSelection({
      label: meta.label,
      isNew: true,
      canRotate: meta.kind === 'store' || meta.kind === 'landmark',
    });
    // 스폰 지점으로 카메라 살짝 이동.
    const s = toScreen(bx + meta.w / 2, by + meta.h / 2);
    this.cam.sx = s.sx;
    this.cam.sy = s.sy;
  }

  getPlayerTile(): { tx: number; ty: number } {
    return { tx: Math.floor(this.player.x), ty: Math.floor(this.player.y) };
  }

  /** e2e 검증용 — 편집 상태·✓/✕ 버튼·타일의 캔버스 CSS 좌표 */
  getEditDebug(): {
    editMode: boolean;
    edit: {
      bx: number;
      by: number;
      ok: boolean;
      placementId: number | null;
      facing?: VBuildingFacing;
    } | null;
    buttons: {
      check: { x: number; y: number };
      cancel: { x: number; y: number };
      rotate: { x: number; y: number } | null;
    } | null;
    cam: { sx: number; sy: number };
    tileToCss: (tx: number, ty: number) => { x: number; y: number };
  } {
    const toCss = (s: { x: number; y: number }) => ({
      x: (s.x - this.cam.sx) * ZOOM + this.anchorX,
      y: (s.y - this.cam.sy) * ZOOM + this.anchorY,
    });
    const rects = this.editButtonCenters();
    return {
      editMode: this.editMode,
      edit: this.edit
        ? {
            bx: this.edit.bx,
            by: this.edit.by,
            ok: this.edit.ok,
            placementId: this.edit.placementId,
            facing: this.edit.facing,
          }
        : null,
      buttons:
        rects && !this.editDragging
          ? {
              check: toCss(rects.check),
              cancel: toCss(rects.cancel),
              rotate: rects.rotate ? toCss(rects.rotate) : null,
            }
          : null,
      cam: { sx: this.cam.sx, sy: this.cam.sy },
      tileToCss: (tx: number, ty: number) => {
        const s = toScreen(tx, ty);
        return toCss({ x: s.sx, y: s.sy });
      },
    };
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

  /** 편집 검증용 점유 집합 — 편집 중인 자신(excludeId)의 발자국은 뺀다.
      ground: 바닥 타일 / obj: 그 외 전부(문 앞 판정 겸용) / big: 건물·랜드마크 */
  private occupiedForEdit(excludeId: number | null): {
    ground: Set<number>;
    obj: Set<number>;
    big: Set<number>;
  } {
    const ground = new Set<number>();
    const obj = new Set<number>();
    const big = new Set<number>();
    for (const t of this.things) {
      if (excludeId !== null && t.id === excludeId) continue;
      const isGround = t.kind === 'decor' && GROUND_DECOR.has(t.decorType ?? '');
      const isBig = t.kind === 'store' || t.kind === 'landmark';
      for (let ty = t.by; ty < t.by + t.h; ty++) {
        for (let tx = t.bx; tx < t.bx + t.w; tx++) {
          if (!vinBounds(tx, ty)) continue;
          const i = vidx(tx, ty);
          if (isGround) ground.add(i);
          else {
            obj.add(i);
            if (isBig) big.add(i);
          }
        }
      }
    }
    return { ground, obj, big };
  }

  /** canPlaceFootprint 호출 한 벌 — 겹침 규칙:
      바닥 타일과 1×1 소품·NPC 는 같은 칸에 겹칠 수 있다(타일 위에 소품).
      바닥 타일끼리, 그리고 건물·랜드마크가 낀 조합은 겹칠 수 없다. */
  private canPlaceEdit(
    e: { kind: string; decorType?: string; facing?: VBuildingFacing },
    excludeId: number | null,
    bx: number,
    by: number,
    w: number,
    h: number,
  ): boolean {
    const { ground, obj, big } = this.occupiedForEdit(excludeId);
    const isGround = e.kind === 'decor' && GROUND_DECOR.has(e.decorType ?? '');
    const isBig = e.kind === 'store' || e.kind === 'landmark';
    const blocked = new Set(isGround ? ground : obj);
    if (isGround) for (const i of big) blocked.add(i);
    if (isBig) for (const i of ground) blocked.add(i);
    return canPlaceFootprint(this.world, blocked, bx, by, w, h, {
      doorFacing: e.facing,
      doorOccupied: obj,
    });
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

  /** 클라이언트 좌표 → 월드 스크린 좌표(카메라 역변환) */
  private clientToWorldScreen(cx: number, cy: number): { sx: number; sy: number } {
    const rect = this.canvas.getBoundingClientRect();
    const x = cx - rect.left;
    const y = cy - rect.top;
    return {
      sx: (x - this.anchorX) / ZOOM + this.cam.sx,
      sy: (y - this.anchorY) / ZOOM + this.cam.sy,
    };
  }

  private onDown = (e: PointerEvent) => {
    if (this.editMode) {
      this.onEditDown(e);
      return;
    }
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
    if (this.editMode) {
      this.onEditMove(e);
      return;
    }
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
    if (this.editMode) {
      this.onEditUp(e);
      return;
    }
    if (!this.stick || e.pointerId !== this.stick.id) return;
    this.stick = null;
    this.stickView = null;
    this.move.x = 0;
    this.move.y = 0;
  };

  private onKey = (e: KeyboardEvent) => {
    if (this.editMode) return;
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    this.keys.add(e.key.toLowerCase());
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  // ------------------------------------------------------------ 배치 모드 입력

  private onEditDown(e: PointerEvent): void {
    if (this.editPointer) return;
    const ws = this.clientToWorldScreen(e.clientX, e.clientY);

    // 1) ✓ / ↻ / ✕ 버튼.
    if (this.edit && !this.editDragging) {
      const btn = this.editButtonCenters();
      if (btn) {
        const rr = EDIT_BTN_R / ZOOM + 4;
        if (Math.hypot(ws.sx - btn.check.x, ws.sy - btn.check.y) < rr) {
          this.commitEdit();
          return;
        }
        if (btn.rotate && Math.hypot(ws.sx - btn.rotate.x, ws.sy - btn.rotate.y) < rr) {
          this.rotateEdit();
          return;
        }
        if (Math.hypot(ws.sx - btn.cancel.x, ws.sy - btn.cancel.y) < rr) {
          this.returnEdit();
          return;
        }
      }
    }

    const w = toWorld(ws.sx, ws.sy);
    const tx = Math.floor(w.x);
    const ty = Math.floor(w.y);

    // 2) 편집 중인 오브젝트를 잡으면 드래그 시작.
    if (this.edit && tx >= this.edit.bx && tx < this.edit.bx + this.edit.w && ty >= this.edit.by && ty < this.edit.by + this.edit.h) {
      this.editPointer = { id: e.pointerId, mode: 'drag', lastX: e.clientX, lastY: e.clientY, moved: false };
      return;
    }

    // 3) 배치돼 있는 다른 오브젝트를 잡으면 그것을 편집 대상으로.
    const hit = this.hitTestThing(tx, ty);
    if (hit) {
      // 이전 편집 대상은 조용히 원위치.
      this.edit = {
        placementId: hit.id,
        kind: hit.kind,
        refId: '',
        w: hit.w,
        h: hit.h,
        label: hit.label,
        emoji: hit.emoji,
        skin: hit.skin,
        facing: hit.facing,
        lmId: hit.lmId,
        decorType: hit.decorType,
        npcSkin: hit.npcSkin,
        bx: hit.bx,
        by: hit.by,
        ok: true,
      };
      this.hooks.onEditSelection({
        label: hit.label,
        isNew: false,
        canRotate: hit.kind === 'store' || hit.kind === 'landmark',
      });
      this.editPointer = { id: e.pointerId, mode: 'drag', lastX: e.clientX, lastY: e.clientY, moved: false };
      return;
    }

    // 4) 빈 곳 — 카메라 패닝. (신규 오브젝트 편집 중이면 선택 유지)
    if (this.edit && this.edit.placementId !== null && !this.editDragging) {
      // 기존 오브젝트 선택은 빈 곳 탭으로 해제(원위치 유지).
      this.edit = null;
      this.hooks.onEditSelection(null);
    }
    this.editPointer = { id: e.pointerId, mode: 'pan', lastX: e.clientX, lastY: e.clientY, moved: false };
  }

  private onEditMove(e: PointerEvent): void {
    const p = this.editPointer;
    if (!p || e.pointerId !== p.id) return;
    const dx = e.clientX - p.lastX;
    const dy = e.clientY - p.lastY;
    if (Math.hypot(e.clientX - p.lastX, e.clientY - p.lastY) > 2) p.moved = true;

    if (p.mode === 'pan') {
      this.cam.sx -= dx / ZOOM;
      this.cam.sy -= dy / ZOOM;
      this.clampCam();
    } else if (this.edit) {
      this.editDragging = true;
      const ws = this.clientToWorldScreen(e.clientX, e.clientY);
      const w = toWorld(ws.sx, ws.sy);
      let bx = Math.round(w.x - this.edit.w / 2);
      let by = Math.round(w.y - this.edit.h / 2);
      bx = Math.max(0, Math.min(VW - this.edit.w, bx));
      by = Math.max(0, Math.min(VH - this.edit.h, by));
      this.edit.bx = bx;
      this.edit.by = by;
      this.edit.ok = this.canPlaceEdit(this.edit, this.edit.placementId, bx, by, this.edit.w, this.edit.h);
    }
    p.lastX = e.clientX;
    p.lastY = e.clientY;
  }

  private onEditUp(e: PointerEvent): void {
    const p = this.editPointer;
    if (!p || e.pointerId !== p.id) return;
    this.editPointer = null;
    if (p.mode === 'drag') {
      // 드래그 끝 — 선택 상태로 두고 ✓/✕ 표시.
      this.editDragging = false;
    }
  }

  private editButtonCenters(): {
    check: { x: number; y: number };
    cancel: { x: number; y: number };
    rotate: { x: number; y: number } | null;
  } | null {
    if (!this.edit) return null;
    const top = toScreen(this.edit.bx + this.edit.w / 2, this.edit.by + this.edit.h / 2);
    const canRotate = this.edit.kind === 'store' || this.edit.kind === 'landmark';
    const lift = this.edit.kind === 'store' || this.edit.kind === 'landmark' ? 96 : 64;
    const y = top.sy - lift;
    const gap = canRotate ? 44 : 30;
    return {
      cancel: { x: top.sx - gap, y },
      rotate: canRotate ? { x: top.sx, y } : null,
      check: { x: top.sx + gap, y },
    };
  }

  /** ↻ — 건물·랜드마크 방향 전환 (sw 좌측 하단 ↔ se 우측 하단) */
  private rotateEdit(): void {
    if (!this.edit || (this.edit.kind !== 'store' && this.edit.kind !== 'landmark')) return;
    this.edit.facing = this.edit.facing === 'se' ? 'sw' : 'se';
    this.edit.ok = this.canPlaceEdit(
      this.edit,
      this.edit.placementId,
      this.edit.bx,
      this.edit.by,
      this.edit.w,
      this.edit.h,
    );
  }

  private commitEdit(): void {
    if (!this.edit || !this.edit.ok) return;
    const { placementId, kind, refId, bx, by, facing } = this.edit;
    this.edit = null;
    this.editDragging = false;
    this.hooks.onEditSelection(null);
    this.hooks.onEditCommit({ placementId, kind, refId, bx, by, facing });
  }

  private returnEdit(): void {
    if (!this.edit) return;
    const { placementId } = this.edit;
    this.edit = null;
    this.editDragging = false;
    this.hooks.onEditSelection(null);
    this.hooks.onEditReturn({ placementId });
  }

  private clampCam(): void {
    const corners = [toScreen(0, 0), toScreen(VW, 0), toScreen(VW, VH), toScreen(0, VH)];
    const xs = corners.map((c) => c.sx);
    const ys = corners.map((c) => c.sy);
    const pad = 80;
    this.cam.sx = Math.max(Math.min(...xs) + pad, Math.min(Math.max(...xs) - pad, this.cam.sx));
    this.cam.sy = Math.max(Math.min(...ys) + pad, Math.min(Math.max(...ys) - pad, this.cam.sy));
  }

  /** 타일 좌표에 놓인 배치물 (앞에 그려지는 것 우선) */
  private hitTestThing(tx: number, ty: number): PlacedThing | null {
    let best: PlacedThing | null = null;
    let bestD = -Infinity;
    for (const t of this.things) {
      if (tx >= t.bx && tx < t.bx + t.w && ty >= t.by && ty < t.by + t.h) {
        // 같은 칸에 바닥 타일과 소품이 겹쳐 있으면 위에 얹힌 소품을 먼저 잡는다.
        const onTop = !(t.kind === 'decor' && GROUND_DECOR.has(t.decorType ?? ''));
        const d = t.bx + t.w + t.by + t.h + (onTop ? 0.5 : 0);
        if (d > bestD) {
          bestD = d;
          best = t;
        }
      }
    }
    return best;
  }

  // ------------------------------------------------------------ update

  private update(dt: number): void {
    if (this.editMode) {
      // 배치 모드: 세계는 멈추지 않지만(파도·시간) 배우들은 무대 뒤에서 대기.
      return;
    }

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

    const goal = toScreen(this.player.x, this.player.y);
    const ease = 1 - Math.pow(0.0015, dt);
    this.cam.sx += (goal.sx - this.cam.sx) * ease;
    this.cam.sy += (goal.sy - this.cam.sy) * ease;

    this.updateVillagers(dt);
    this.updateAmbient(dt);
    this.updateInteract();
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
          n.stuck = 0;
        } else {
          const step = Math.min(d, NPC_SPEED * dt);
          const ux = dx / d;
          const uy = dy / d;
          const prevX = n.x;
          const prevY = n.y;
          const nx = n.x + ux * step;
          const ny = n.y + uy * step;
          const blockedX = this.solid(Math.floor(nx), Math.floor(n.y));
          const blockedY = this.solid(Math.floor(n.x), Math.floor(ny));
          if (!blockedX) n.x = nx;
          if (!blockedY) n.y = ny;
          // 길막힘 감지 — 양축이 막혔거나 실제 이동량이 계속 미미하면
          // 벽에 갖다 박는 대신 목표를 버리고 곧 다른 방향을 잡는다.
          const moved = Math.hypot(n.x - prevX, n.y - prevY);
          if (blockedX && blockedY) {
            n.target = null;
            n.stuck = 0;
            n.restUntil = 0.3 + Math.random() * 0.6;
            n.moving = false;
            n.phase = 0;
          } else if (moved < step * 0.45) {
            n.stuck += dt;
            if (n.stuck > 0.4) {
              n.target = null;
              n.stuck = 0;
              n.restUntil = 0.3 + Math.random() * 0.6;
              n.moving = false;
              n.phase = 0;
            }
          } else {
            n.stuck = 0;
          }
          if (n.target) {
            n.moving = true;
            n.phase += dt * 9;
            n.facing = facingFromWorldDelta(ux, uy);
          }
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
    this.gull.angle += dt * 0.25;
  }

  private updateInteract(): void {
    let best: VInteractTarget | null = null;
    let bestD = INTERACT_RANGE;

    for (const t of this.things) {
      if (t.kind === 'npc') continue; // 걷기 모드에선 배회 주민이 담당
      if (t.kind === 'decor' && GROUND_DECOR.has(t.decorType ?? '')) continue; // 바닥 타일은 밟는 것 — 살펴보기 대상 아님
      const se = (t.kind === 'store' || t.kind === 'landmark') && t.facing === 'se';
      const px = se ? t.bx + t.w + 0.5 : t.bx + t.w / 2;
      const py = se ? t.by + t.h / 2 : t.kind === 'decor' ? t.by + t.h / 2 : t.by + t.h + 0.5;
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

  // ------------------------------------------------------------ render

  private nightFactor(): number {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    if (h >= 20 || h < 5) return 1;
    if (h >= 18) return (h - 18) / 2;
    if (h < 7) return 1 - (h - 5) / 2;
    return 0;
  }

  private drawThing(t: PlacedThing | (EditObject & { id?: number }), focus: number, asEdit = false): void {
    const ctx = this.ctx;
    if (t.kind === 'store') {
      drawTemplateBuilding(ctx, t.bx, t.by, t.w, t.h, t.skin!, { emoji: t.emoji ?? '🏪', facing: t.facing });
    } else if (t.kind === 'landmark') {
      drawVLandmark(ctx, t.lmId ?? 'cathedral', t.bx, t.by, { time: this.time, facing: t.facing });
    } else if (t.kind === 'npc') {
      drawVCharacter(ctx, t.bx + 0.5, t.by + 0.72, {
        facing: 's',
        phase: 0,
        moving: false,
        skin: t.npcSkin ?? { body: '#343B4A', bodyDark: '#232936', fur: '#F2F4F8', furDark: '#2F3541', ear: 'bird' },
        scale: 0.94,
      });
      if (asEdit || focus > 0.55) {
        const { sx, sy } = toScreen(t.bx + 0.5, t.by + 0.5);
        drawVNameplate(ctx, sx, sy - 76, t.label, { alpha: 0.9, accent: '#4A5568' });
      }
    } else {
      // 소품은 이름 말풍선 없이 오브젝트만 그린다.
      const cx = t.bx + 0.5;
      const cy = t.by + 0.5;
      const seed = 'id' in t && t.id !== undefined ? t.id : 7;
      drawVProp(ctx, { type: t.decorType ?? 'bench', x: cx, y: cy, v: (Number(seed) % 97) / 97 }, this.time);
    }
  }

  private render(): void {
    const ctx = this.ctx;
    const night = this.editMode ? 0 : this.nightFactor();

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = VPALETTE.waterDeep;
    ctx.fillRect(0, 0, this.vw, this.vh);

    const applyCamera = () => {
      ctx.translate(this.anchorX, this.anchorY);
      ctx.scale(ZOOM, ZOOM);
      ctx.translate(-this.cam.sx, -this.cam.sy);
    };
    ctx.save();
    applyCamera();

    const visible = (sx: number, sy: number, pad = 120) => {
      const vx = (sx - this.cam.sx) * ZOOM + this.anchorX;
      const vy = (sy - this.cam.sy) * ZOOM + this.anchorY;
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

    // 바닥 소품(광장 돌바닥 타일) — 지형 직후, 캐릭터/오브젝트보다 아래에 깐다.
    for (const t of this.things) {
      if (t.kind !== 'decor' || !GROUND_DECOR.has(t.decorType ?? '')) continue;
      if (this.editMode && this.edit?.placementId === t.id) continue;
      const { sx, sy } = toScreen(t.bx + 0.5, t.by + 0.5);
      if (!visible(sx, sy)) continue;
      drawVProp(ctx, { type: t.decorType!, x: t.bx + 0.5, y: t.by + 0.5, v: 0 }, this.time);
    }

    // 배치 모드: 잔디 위 옅은 그리드 + 편집 오브젝트 발밑 커서.
    if (this.editMode) {
      ctx.strokeStyle = 'rgba(60,90,50,0.1)';
      ctx.lineWidth = 1;
      for (let ty = 0; ty < VH; ty++) {
        for (let tx = 0; tx < VW; tx++) {
          const terr = this.world.terrain[vidx(tx, ty)];
          if (terr !== VT.Grass && terr !== VT.GrassDark) continue;
          const { sx, sy } = toScreen(tx + 0.5, ty + 0.5);
          if (!visible(sx, sy, 40)) continue;
          vTilePath(ctx, tx + 0.5, ty + 0.5, -1);
          ctx.stroke();
        }
      }
      if (this.edit) {
        drawVPlacementCursor(ctx, this.edit.bx, this.edit.by, this.edit.w, this.edit.h, this.edit.ok, this.time);
      }
    }

    // 깊이 정렬 렌더 패스.
    type Item = { d: number; draw: () => void };
    const items: Item[] = [];

    for (const t of this.things) {
      if (this.editMode && this.edit?.placementId === t.id) continue; // 편집 중 원본 숨김
      if (!this.editMode && t.kind === 'npc') continue; // 걷기 모드에선 배회 주민이 그린다
      if (t.kind === 'decor' && GROUND_DECOR.has(t.decorType ?? '')) continue; // 바닥 패스에서 이미 그림
      const front = toScreen(t.bx + t.w, t.by + t.h);
      if (!visible(front.sx, front.sy, 220)) continue;
      const px = t.bx + t.w / 2;
      const py = t.by + t.h + 0.5;
      const dist = this.editMode ? 99 : Math.hypot(px - this.player.x, py - this.player.y);
      const focus = clamp01(1 - (dist - INTERACT_RANGE) / 3.5);
      const depth = t.kind === 'decor' || t.kind === 'npc' ? this.entityDepth(t.bx + 0.5, t.by + 0.5) : t.bx + t.w + t.by + t.h;
      items.push({ d: depth, draw: () => this.drawThing(t, focus) });
    }

    for (const p of this.world.props) {
      const { sx, sy } = toScreen(p.x, p.y);
      if (!visible(sx, sy, 160)) continue;
      items.push({ d: this.entityDepth(p.x, p.y), draw: () => drawVProp(ctx, p, this.time) });
    }

    if (!this.editMode) {
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

      for (const b of this.butterflies) {
        const { sx, sy } = toScreen(b.x, b.y);
        if (!visible(sx, sy, 80)) continue;
        const hover = Math.sin(b.flap * 0.35) * 4;
        items.push({
          d: this.entityDepth(b.x, b.y) + 0.5,
          draw: () => drawVButterfly(ctx, b.x, b.y, hover, b.flap, b.color),
        });
      }

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
    }

    // 편집 중 오브젝트 — 항상 최상단 근처에.
    if (this.editMode && this.edit) {
      const e = this.edit;
      items.push({
        d: e.bx + e.w + e.by + e.h + 50,
        draw: () => {
          ctx.save();
          ctx.globalAlpha = this.editDragging ? 0.82 : 1;
          this.drawThing(e, 1, true);
          ctx.restore();
        },
      });
    }

    items.sort((a, b) => a.d - b.d);
    for (const it of items) it.draw();

    // 건물/랜드마크 이름표 — 다른 오브젝트에 가려지지 않게 항상 최상단에.
    for (const t of this.things) {
      if (t.kind !== 'store' && t.kind !== 'landmark') continue;
      if (this.editMode && this.edit?.placementId === t.id) continue;
      const front = toScreen(t.bx + t.w, t.by + t.h);
      if (!visible(front.sx, front.sy, 220)) continue;
      const px = t.bx + t.w / 2;
      const py = t.by + t.h + 0.5;
      const dist = this.editMode ? 99 : Math.hypot(px - this.player.x, py - this.player.y);
      const focus = clamp01(1 - (dist - INTERACT_RANGE) / 3.5);
      if (t.kind === 'store') {
        drawVBuildingLabel(ctx, t.bx, t.by, t.w, t.h, t.label, t.skin?.accent ?? '#8b5a37', focus, this.time);
      } else {
        drawVLandmarkLabel(ctx, t.lmId ?? 'cathedral', t.bx, t.by, t.label, focus, this.time);
      }
    }
    if (this.editMode && this.edit && (this.edit.kind === 'store' || this.edit.kind === 'landmark')) {
      const e = this.edit;
      if (e.kind === 'store') {
        drawVBuildingLabel(ctx, e.bx, e.by, e.w, e.h, e.label, e.skin?.accent ?? '#8b5a37', 1, this.time);
      } else {
        drawVLandmarkLabel(ctx, e.lmId ?? 'cathedral', e.bx, e.by, e.label, 1, this.time);
      }
    }

    // ✓ / ↻ / ✕ 버튼 (편집 오브젝트 위, 드래그 중엔 숨김).
    if (this.editMode && this.edit && !this.editDragging) {
      const btn = this.editButtonCenters();
      if (btn) {
        const r = EDIT_BTN_R / ZOOM;
        // ✕ — 항상 활성.
        ctx.beginPath();
        ctx.arc(btn.cancel.x, btn.cancel.y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#E2554A';
        ctx.fill();
        ctx.strokeStyle = '#fffdf7';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(btn.cancel.x - r * 0.36, btn.cancel.y - r * 0.36);
        ctx.lineTo(btn.cancel.x + r * 0.36, btn.cancel.y + r * 0.36);
        ctx.moveTo(btn.cancel.x + r * 0.36, btn.cancel.y - r * 0.36);
        ctx.lineTo(btn.cancel.x - r * 0.36, btn.cancel.y + r * 0.36);
        ctx.stroke();
        // ↻ — 건물 방향 전환 (매장 건물만).
        if (btn.rotate) {
          ctx.beginPath();
          ctx.arc(btn.rotate.x, btn.rotate.y, r, 0, Math.PI * 2);
          ctx.fillStyle = '#5EB3CC';
          ctx.fill();
          ctx.strokeStyle = '#fffdf7';
          ctx.lineWidth = 3;
          ctx.stroke();
          // 원형 화살표.
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(btn.rotate.x, btn.rotate.y, r * 0.48, -Math.PI * 0.25, Math.PI * 1.05);
          ctx.stroke();
          const ax = btn.rotate.x + Math.cos(-Math.PI * 0.25) * r * 0.48;
          const ay = btn.rotate.y + Math.sin(-Math.PI * 0.25) * r * 0.48;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.moveTo(ax + r * 0.3, ay - r * 0.08);
          ctx.lineTo(ax - r * 0.16, ay - r * 0.3);
          ctx.lineTo(ax - r * 0.05, ay + r * 0.26);
          ctx.closePath();
          ctx.fill();
        }
        // ✓ — 자리가 유효할 때만 초록.
        ctx.beginPath();
        ctx.arc(btn.check.x, btn.check.y, r, 0, Math.PI * 2);
        ctx.fillStyle = this.edit.ok ? '#4E9B58' : '#b9bec7';
        ctx.fill();
        ctx.strokeStyle = '#fffdf7';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(btn.check.x - r * 0.4, btn.check.y + r * 0.02);
        ctx.lineTo(btn.check.x - r * 0.08, btn.check.y + r * 0.34);
        ctx.lineTo(btn.check.x + r * 0.42, btn.check.y - r * 0.3);
        ctx.stroke();
      }
    }

    ctx.restore();

    // 밤: 남색 틴트 + 가로등 광원 (배치 모드에선 항상 낮).
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

    // 비네트 (배치 모드에선 뷰를 가리지 않게 생략).
    if (!this.editMode) {
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
    }

    // 플로팅 조이스틱 (걷기 모드 전용).
    const sv = this.stickView;
    if (sv && !this.editMode) {
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
      if (t.kind === 'decor' || t.kind === 'npc') continue;
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
