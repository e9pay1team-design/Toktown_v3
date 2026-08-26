// ─── 내 마을 캔버스 드로잉 (V1 프로토타입 이식) ───────────────────
// 모든 픽셀을 코드로 그린다 — 이미지 에셋 0장. 지형/파도, 템플릿 건물
// (색·간판만 다른 기본형), 랜드마크 4종 커스텀, 소품, 동물 캐릭터
// (귀 모양·헤어), 말풍선, 나비/갈매기 등 생동감 요소.

import { TW, TH, toScreen, vtileHash, VT, type VTerrainId } from './villageWorld';
import type { StoreCategory } from '../types';

export const VPALETTE = {
  grass: '#8ed071',
  grassAlt: '#84c766',
  grassDark: '#77bd5c',
  grassBlade: '#6fae52',
  sand: '#f2e2b6',
  sandAlt: '#e9d6a5',
  sandDot: '#dcc68f',
  path: '#f0e7d6',
  pathAlt: '#e6dbc5',
  pathJoint: '#d8cbb1',
  water: '#5bbfe3',
  waterDeep: '#3f9fc8',
  waterLight: '#8ad6ef',
  foam: '#e8f9ff',
  trunk: '#a9724a',
  trunkDark: '#8b5a37',
  leaf: '#57ab5c',
  leafDark: '#3f8c48',
  leafLight: '#74c274',
  pine: '#3f8f62',
  pineDark: '#2f7550',
  rock: '#b9bec7',
  rockDark: '#98a0ab',
  ink: '#4a3b32',
  paper: '#fffdf7',
} as const;

const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function shadow(ctx: CanvasRenderingContext2D, sx: number, sy: number, rx: number, alpha = 0.16): void {
  ctx.fillStyle = `rgba(40,50,35,${alpha})`;
  ellipse(ctx, sx, sy, rx, rx * 0.45);
  ctx.fill();
}

/** 타일 다이아몬드 경로 */
export function vTilePath(ctx: CanvasRenderingContext2D, x: number, y: number, grow = 0.6): void {
  const { sx, sy } = toScreen(x, y);
  const hw = TW / 2 + grow;
  const hh = TH / 2 + grow;
  ctx.beginPath();
  ctx.moveTo(sx, sy - hh);
  ctx.lineTo(sx + hw, sy);
  ctx.lineTo(sx, sy + hh);
  ctx.lineTo(sx - hw, sy);
  ctx.closePath();
}

/** (x0,y0)-(x1,y1) 사각 풋프린트를 덮는 다이아몬드 경로 */
export function vFootprintPath(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  lift = 0,
): void {
  const a = toScreen(x0, y0);
  const b = toScreen(x1, y0);
  const c = toScreen(x1, y1);
  const d = toScreen(x0, y1);
  ctx.beginPath();
  ctx.moveTo(a.sx, a.sy - lift);
  ctx.lineTo(b.sx, b.sy - lift);
  ctx.lineTo(c.sx, c.sy - lift);
  ctx.lineTo(d.sx, d.sy - lift);
  ctx.closePath();
}

// ---------------------------------------------------------------- 지형

export function drawVTile(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  t: VTerrainId,
  time: number,
): void {
  const cx = tx + 0.5;
  const cy = ty + 0.5;
  const h = vtileHash(tx, ty);

  if (t === VT.Water) {
    // 겹치는 두 물결 + 타일 해시 오프셋 — 잔잔히 파도치는 바다.
    const wave =
      Math.sin(time * 1.2 + (tx + ty) * 0.42 + h * 1.6) +
      0.6 * Math.sin(time * 0.72 - (tx - ty) * 0.31);
    vTilePath(ctx, cx, cy);
    ctx.fillStyle =
      wave > 0.6 ? VPALETTE.waterLight : wave > -0.2 ? VPALETTE.water : VPALETTE.waterDeep;
    ctx.fill();
    if (wave > 1.15) {
      const { sx, sy } = toScreen(cx, cy);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ellipse(ctx, sx, sy, TW * 0.2, TH * 0.14);
      ctx.fill();
    }
    return;
  }

  vTilePath(ctx, cx, cy);
  if (t === VT.Sand) ctx.fillStyle = h > 0.5 ? VPALETTE.sand : VPALETTE.sandAlt;
  else if (t === VT.Path) ctx.fillStyle = h > 0.5 ? VPALETTE.path : VPALETTE.pathAlt;
  else if (t === VT.GrassDark) ctx.fillStyle = VPALETTE.grassDark;
  else ctx.fillStyle = h > 0.5 ? VPALETTE.grass : VPALETTE.grassAlt;
  ctx.fill();

  const { sx, sy } = toScreen(cx, cy);
  if (t === VT.Path) {
    ctx.strokeStyle = VPALETTE.pathJoint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, sy - TH * 0.34);
    ctx.lineTo(sx + TW * 0.34, sy);
    ctx.lineTo(sx, sy + TH * 0.34);
    ctx.lineTo(sx - TW * 0.34, sy);
    ctx.closePath();
    ctx.stroke();
  } else if (t === VT.Sand) {
    if (h > 0.72) {
      ctx.fillStyle = VPALETTE.sandDot;
      ctx.fillRect(sx - 5 + h * 8, sy - 1, 2, 2);
      ctx.fillRect(sx + 2 - h * 5, sy + 3, 2, 2);
    }
  } else if (h > 0.66) {
    ctx.strokeStyle = VPALETTE.grassBlade;
    ctx.lineWidth = 1.4;
    const bx = sx - 8 + h * 16;
    ctx.beginPath();
    ctx.moveTo(bx, sy + 3);
    ctx.lineTo(bx - 1.5, sy - 2);
    ctx.moveTo(bx + 4, sy + 4);
    ctx.lineTo(bx + 5, sy - 1);
    ctx.stroke();
  }
}

export function drawVFoam(ctx: CanvasRenderingContext2D, tx: number, ty: number, time: number): void {
  const cx = tx + 0.5;
  const cy = ty + 0.5;
  const pulse = (Math.sin(time * 1.9 + (tx - ty) * 0.7) + 1) / 2;
  ctx.globalAlpha = 0.12 + pulse * 0.26;
  vTilePath(ctx, cx, cy, -2 - pulse * 4);
  ctx.strokeStyle = VPALETTE.foam;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 건물

/** 벽/지붕/포인트 — 템플릿 건물이 갈아입는 3색 */
export interface VBuildingSkin {
  wall: string;
  wallShade: string;
  roof: string;
  roofShade: string;
  accent: string;
}

export const CATEGORY_SKINS: Record<StoreCategory, VBuildingSkin> = {
  국밥: { wall: '#fff3e4', wallShade: '#f2dcc4', roof: '#ef7f6d', roofShade: '#d2604f', accent: '#c2503f' },
  한식: { wall: '#fbeee7', wallShade: '#ecd9cd', roof: '#c1705a', roofShade: '#a05744', accent: '#834536' },
  면: { wall: '#fff6e0', wallShade: '#f0e3c2', roof: '#f0b455', roofShade: '#cf9137', accent: '#a9722a' },
  카페: { wall: '#eefaf4', wallShade: '#d5eae1', roof: '#4fb9a8', roofShade: '#369486', accent: '#2b7d70' },
  공연장: { wall: '#f6f2ff', wallShade: '#e2daf5', roof: '#a596e0', roofShade: '#8375c4', accent: '#6a5cab' },
};

export const CATEGORY_EMOJI: Record<StoreCategory, string> = {
  국밥: '🍲',
  한식: '🍚',
  면: '🍜',
  카페: '☕',
  공연장: '🥁',
};

const WALL_H = 46;
const ROOF_T = 9;
const OVERHANG = 0.15;

type Pt = { sx: number; sy: number };

function facePoint(p0: Pt, p1: Pt, u: number, v: number): { x: number; y: number } {
  return { x: p0.sx + (p1.sx - p0.sx) * u, y: p0.sy + (p1.sy - p0.sy) * u - v };
}

function faceQuad(
  ctx: CanvasRenderingContext2D,
  p0: Pt,
  p1: Pt,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
): void {
  const a = facePoint(p0, p1, u0, v0);
  const b = facePoint(p0, p1, u1, v0);
  const c = facePoint(p0, p1, u1, v1);
  const d = facePoint(p0, p1, u0, v1);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
}

/** 건물 방향 — sw: 문이 좌측 하단(+y) 면, se: 우측 하단(+x) 면 */
export type VBuildingFacing = 'sw' | 'se';

export interface VBuildingOpts {
  emoji: string;
  facing?: VBuildingFacing;
  /** 매장 카테고리 — 카테고리별 외장 디테일(굴뚝·기와·노렌·유리창·마퀴)을 얹는다 */
  cat?: string;
  /** 김·전광 애니메이션용 시간 */
  time?: number;
}

/**
 * 기본 템플릿 건물 — 랜드마크를 제외한 모든 건물이 이 한 벌을 쓰고,
 * 카테고리 색(skin)과 간판 이름만 바꿔 입는다 (기획 요구).
 */
export function drawTemplateBuilding(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  s: VBuildingSkin,
  opts: VBuildingOpts,
): void {
  const x0 = bx;
  const y0 = by;
  const x1 = bx + bw;
  const y1 = by + bh;
  const B = toScreen(x1, y0);
  const C = toScreen(x1, y1);
  const D = toScreen(x0, y1);

  // 바닥 그림자.
  ctx.save();
  ctx.translate(3, 4);
  vFootprintPath(ctx, x0, y0, x1, y1);
  ctx.fillStyle = 'rgba(40,50,35,0.18)';
  ctx.fill();
  ctx.restore();

  // 왼쪽(+y) 벽이 빛을 더 받는다 (조명은 방향과 무관하게 고정).
  faceQuad(ctx, D, C, 0, 1, 0, WALL_H);
  ctx.fillStyle = s.wall;
  ctx.fill();
  faceQuad(ctx, C, B, 0, 1, 0, WALL_H);
  ctx.fillStyle = s.wallShade;
  ctx.fill();

  // 방향에 따라 문·간판이 붙는 정면과 창문 면을 스왑.
  const se = opts.facing === 'se';
  const F0 = se ? C : D; // 정면 (sw: 좌하 D→C, se: 우하 C→B)
  const F1 = se ? B : C;
  const W0 = se ? D : C; // 창문 면 (반대쪽)
  const W1 = se ? C : B;

  // 문 (정면 중앙).
  const dw = Math.min(0.44, 1.05 / bw);
  faceQuad(ctx, F0, F1, 0.5 - dw / 2, 0.5 + dw / 2, 0, 31);
  ctx.fillStyle = s.accent;
  ctx.fill();
  faceQuad(ctx, F0, F1, 0.5 - dw / 2 + 0.035, 0.5 + dw / 2 - 0.035, 3, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fill();

  // 문 위 어닝 줄무늬.
  const stripes = 4;
  for (let i = 0; i < stripes; i++) {
    const u0 = 0.5 - dw / 2 - 0.05 + (i * (dw + 0.1)) / stripes;
    const u1 = u0 + (dw + 0.1) / stripes;
    faceQuad(ctx, F0, F1, u0, u1, 33, 41);
    ctx.fillStyle = i % 2 === 0 ? s.roof : VPALETTE.paper;
    ctx.fill();
  }

  // 반대쪽 벽 창문.
  for (let i = 0; i < Math.max(1, bh - 1); i++) {
    const u0 = 0.24 + i * 0.36;
    faceQuad(ctx, W0, W1, u0, u0 + 0.22, 15, 33);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    faceQuad(ctx, W0, W1, u0, u0 + 0.22, 15, 33);
    ctx.strokeStyle = s.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 지붕 슬래브.
  const rx0 = x0 - OVERHANG;
  const ry0 = y0 - OVERHANG;
  const rx1 = x1 + OVERHANG;
  const ry1 = y1 + OVERHANG;
  const RB = toScreen(rx1, ry0);
  const RC = toScreen(rx1, ry1);
  const RD = toScreen(rx0, ry1);
  faceQuad(ctx, RD, RC, 0, 1, WALL_H, WALL_H + ROOF_T);
  ctx.fillStyle = s.roofShade;
  ctx.fill();
  faceQuad(ctx, RC, RB, 0, 1, WALL_H, WALL_H + ROOF_T);
  ctx.fillStyle = s.roofShade;
  ctx.fill();
  vFootprintPath(ctx, rx0, ry0, rx1, ry1, WALL_H + ROOF_T);
  ctx.fillStyle = s.roof;
  ctx.fill();
  const mid0 = toScreen((rx0 + rx1) / 2, ry0);
  const mid1 = toScreen((rx0 + rx1) / 2, ry1);
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mid0.sx, mid0.sy - WALL_H - ROOF_T);
  ctx.lineTo(mid1.sx, mid1.sy - WALL_H - ROOF_T);
  ctx.stroke();

  // ── 카테고리별 외장 디테일 (지도 정보보기 일러스트 톤과 맞춤) ──
  const t = opts.time ?? 0;
  if (opts.cat === '국밥') {
    // 굴뚝 + 모락모락 김.
    const ch = toScreen(x0 + 0.4, y0 + 0.4);
    const chTop = ch.sy - WALL_H - ROOF_T - 13;
    ctx.fillStyle = s.wallShade;
    ctx.fillRect(ch.sx - 5, chTop, 10, 14);
    ctx.fillStyle = s.accent;
    ctx.fillRect(ch.sx - 6.5, chTop - 3, 13, 4);
    for (let i = 0; i < 3; i++) {
      const rise = (t * 13 + i * 12) % 34;
      ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - rise / 34)})`;
      ellipse(ctx, ch.sx + Math.sin(t * 2 + i * 1.7) * 3.5, chTop - 6 - rise, 4 + i * 1.4, 3.4 + i);
      ctx.fill();
    }
    // 문 옆 나무 메뉴판.
    faceQuad(ctx, F0, F1, 0.07, 0.3, 10, 31);
    ctx.fillStyle = VPALETTE.paper;
    ctx.fill();
    faceQuad(ctx, F0, F1, 0.07, 0.3, 28.5, 31);
    ctx.fillStyle = s.accent;
    ctx.fill();
    for (const v of [24, 20, 16]) {
      faceQuad(ctx, F0, F1, 0.1, 0.27, v, v + 1.6);
      ctx.fillStyle = 'rgba(74,59,50,0.4)';
      ctx.fill();
    }
  } else if (opts.cat === '한식') {
    // 처마 기와 (전면 상단 물결).
    faceQuad(ctx, F0, F1, 0, 1, 42, 45.5);
    ctx.fillStyle = s.roofShade;
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const p = facePoint(F0, F1, 0.09 + i * 0.165, 42);
      ctx.fillStyle = s.roof;
      ellipse(ctx, p.x, p.y, 4.4, 3);
      ctx.fill();
    }
    // 창문 나무 격자.
    ctx.fillStyle = s.accent;
    for (let i = 0; i < Math.max(1, bh - 1); i++) {
      const u0 = 0.24 + i * 0.36;
      faceQuad(ctx, W0, W1, u0 + 0.095, u0 + 0.125, 15, 33);
      ctx.fill();
      faceQuad(ctx, W0, W1, u0, u0 + 0.22, 23, 24.6);
      ctx.fill();
    }
    // 장독대 (전면 모서리 옆 항아리 2개).
    const jar = toScreen(x0 + 0.22, y1 + 0.3);
    for (const [dx2, sc] of [
      [-7, 1],
      [6, 0.78],
    ] as const) {
      ctx.fillStyle = '#8a6b52';
      ellipse(ctx, jar.sx + dx2, jar.sy - 7 * sc, 6.4 * sc, 7.4 * sc);
      ctx.fill();
      ctx.fillStyle = '#6e523c';
      ellipse(ctx, jar.sx + dx2, jar.sy - 13.4 * sc, 4.2 * sc, 1.9 * sc);
      ctx.fill();
    }
  } else if (opts.cat === '면') {
    // 노렌(포렴) — 문 위에 드리운 천 3폭.
    for (let k = 0; k < 3; k++) {
      const u0 = 0.5 - dw / 2 - 0.015 + k * ((dw + 0.03) / 3);
      faceQuad(ctx, F0, F1, u0 + 0.008, u0 + (dw + 0.03) / 3 - 0.008, 25 - (k % 2) * 1.6, 32.6);
      ctx.fillStyle = k === 1 ? VPALETTE.paper : s.accent;
      ctx.fill();
    }
    // 창가에서 새는 김.
    const wv = facePoint(W0, W1, 0.35, 33);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      const rise = (t * 11 + i * 14) % 26;
      ctx.globalAlpha = 0.7 * (1 - rise / 26);
      ctx.beginPath();
      ctx.moveTo(wv.x + i * 9, wv.y - rise);
      ctx.quadraticCurveTo(wv.x + i * 9 + 4, wv.y - rise - 5, wv.x + i * 9 + 1, wv.y - rise - 10);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (opts.cat === '카페') {
    // 대형 유리 쇼윈도 (문 오른쪽) + 반사광.
    faceQuad(ctx, F0, F1, 0.71, 0.95, 4, 30);
    ctx.fillStyle = '#cfe9f0';
    ctx.fill();
    faceQuad(ctx, F0, F1, 0.76, 0.815, 4, 30);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
    faceQuad(ctx, F0, F1, 0.71, 0.95, 4, 30);
    ctx.strokeStyle = s.accent;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // 행잉 플랜트.
    const hp = facePoint(F0, F1, 0.1, 38);
    ctx.strokeStyle = 'rgba(74,59,50,0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(hp.x, hp.y - 4);
    ctx.lineTo(hp.x, hp.y + 3);
    ctx.stroke();
    ctx.fillStyle = '#4E9B58';
    ellipse(ctx, hp.x, hp.y + 7, 5.6, 4.6);
    ctx.fill();
    ctx.fillStyle = '#7BC47F';
    ellipse(ctx, hp.x - 2, hp.y + 5.4, 2.6, 2.2);
    ctx.fill();
    // A-보드 (문 앞 입간판).
    const ab = toScreen(x0 + (opts.facing === 'se' ? bw - 0.2 : 0.55), y1 + 0.28);
    ctx.fillStyle = '#4a3b32';
    ctx.beginPath();
    ctx.moveTo(ab.sx - 6, ab.sy);
    ctx.lineTo(ab.sx - 3.4, ab.sy - 13);
    ctx.lineTo(ab.sx + 3.4, ab.sy - 13);
    ctx.lineTo(ab.sx + 6, ab.sy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(ab.sx - 2.6, ab.sy - 9.5);
    ctx.lineTo(ab.sx + 2.6, ab.sy - 9.5);
    ctx.moveTo(ab.sx - 3, ab.sy - 6.5);
    ctx.lineTo(ab.sx + 3, ab.sy - 6.5);
    ctx.stroke();
  } else if (opts.cat === '공연장') {
    // 마퀴 전광판 — 어닝 위를 덮고 전구가 점멸.
    faceQuad(ctx, F0, F1, 0.16, 0.84, 32, 44.5);
    ctx.fillStyle = '#2e2b3f';
    ctx.fill();
    faceQuad(ctx, F0, F1, 0.19, 0.81, 35, 41.5);
    ctx.fillStyle = s.roof;
    ctx.fill();
    for (let i = 0; i < 7; i++) {
      const u = 0.2 + i * 0.1;
      const on = Math.floor(t * 3 + i) % 2 === 0;
      ctx.fillStyle = on ? '#FFD66B' : 'rgba(255,255,255,0.3)';
      const b1 = facePoint(F0, F1, u, 33.4);
      ellipse(ctx, b1.x, b1.y, 1.7, 1.7);
      ctx.fill();
      const b2 = facePoint(F0, F1, u, 43.2);
      ellipse(ctx, b2.x, b2.y, 1.7, 1.7);
      ctx.fill();
    }
    // 포스터 2장 (창문 면).
    const posters: [number, string][] = [
      [0.2, '#f2a7c3'],
      [0.58, '#7ba7d9'],
    ];
    for (const [u0, color] of posters) {
      faceQuad(ctx, W0, W1, u0, u0 + 0.2, 12, 32);
      ctx.fillStyle = VPALETTE.paper;
      ctx.fill();
      faceQuad(ctx, W0, W1, u0 + 0.02, u0 + 0.18, 19, 30);
      ctx.fillStyle = color;
      ctx.fill();
      faceQuad(ctx, W0, W1, u0 + 0.03, u0 + 0.17, 14.5, 16.5);
      ctx.fillStyle = 'rgba(74,59,50,0.55)';
      ctx.fill();
    }
  }

  // 문 옆 이모지 간판.
  const signAnchor = facePoint(F0, F1, 0.5 + dw / 2 + 0.13, 27);
  ctx.strokeStyle = s.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(signAnchor.x, signAnchor.y - 6);
  ctx.lineTo(signAnchor.x, signAnchor.y - 13);
  ctx.stroke();
  ctx.fillStyle = VPALETTE.paper;
  roundRect(ctx, signAnchor.x - 10, signAnchor.y - 6, 20, 19, 5);
  ctx.fill();
  ctx.strokeStyle = s.accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = `11px ${UI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(opts.emoji, signAnchor.x, signAnchor.y + 4);
}

/** 템플릿 건물 이름표 — 다른 오브젝트에 가려지지 않게 별도 최상단 패스에서 그린다 */
export function drawVBuildingLabel(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  label: string,
  accent: string,
  focus: number,
  time: number,
): void {
  const top = toScreen(bx + bw / 2, by + bh / 2);
  const plateY = top.sy - WALL_H - ROOF_T - 24 + Math.sin(time * 1.6) * 1.5;
  drawVNameplate(ctx, top.sx, plateY, label, {
    alpha: 0.45 + focus * 0.55,
    accent,
    scale: 1 + focus * 0.08,
  });
}

export function drawVNameplate(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  text: string,
  opts: { alpha: number; accent: string; scale?: number },
): void {
  const scale = opts.scale ?? 1;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(scale, scale);
  ctx.globalAlpha = opts.alpha;
  ctx.font = `700 12px ${UI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 18;
  ctx.fillStyle = 'rgba(255,253,247,0.94)';
  roundRect(ctx, -w / 2, -11, w, 22, 11);
  ctx.fill();
  ctx.strokeStyle = opts.accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, 10);
  ctx.lineTo(4, 10);
  ctx.lineTo(0, 16);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,253,247,0.94)';
  ctx.fill();
  ctx.fillStyle = VPALETTE.ink;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------- 랜드마크

/**
 * 랜드마크 미니어처 — 템플릿을 쓰지 않는 유일한 건물들 (기획 요구).
 * 전부 2×2 풋프린트, 실물의 실루엣만 남긴 미니어처.
 */
export function drawVLandmark(
  ctx: CanvasRenderingContext2D,
  id: string,
  bx: number,
  by: number,
  opts: { time: number; facing?: VBuildingFacing },
): void {
  const x0 = bx;
  const y0 = by;
  const x1 = bx + 2;
  const y1 = by + 2;
  const B = toScreen(x1, y0);
  const C = toScreen(x1, y1);
  const D = toScreen(x0, y1);
  const top = toScreen(bx + 1, by + 1);

  // se 방향 = 풋프린트 중심 기준 좌우 미러 — 다이아몬드 풋프린트는 그대로,
  // 정면 디테일(문·다리 등)만 우측 하단 면으로 옮겨진다.
  ctx.save();
  if (opts.facing === 'se') {
    ctx.translate(top.sx * 2, 0);
    ctx.scale(-1, 1);
  }

  ctx.save();
  ctx.translate(3, 4);
  vFootprintPath(ctx, x0, y0, x1, y1);
  ctx.fillStyle = 'rgba(40,50,35,0.18)';
  ctx.fill();
  ctx.restore();

  if (id === 'cathedral') {
    // 명동성당 — 지도 미니어처(LandmarkSvg)와 같은 붉은 벽돌 + 청회색 지붕 팔레트.
    const BRICK = '#C17A5B';
    const BRICK_SH = '#A56247';
    const BRICK_HI = '#CE8763';
    const ROOF = '#7E8CA3';
    const ROOF_SH = '#5E6B84';
    const CREAM = '#FFF3DC';
    const TRIM = '#8A5A40';
    const DOOR = '#6E4A36';

    // 본당 벽돌 벽.
    faceQuad(ctx, D, C, 0, 1, 0, 38);
    ctx.fillStyle = BRICK;
    ctx.fill();
    faceQuad(ctx, C, B, 0, 1, 0, 38);
    ctx.fillStyle = BRICK_SH;
    ctx.fill();
    // 벽돌 줄눈.
    ctx.strokeStyle = 'rgba(255,244,230,0.28)';
    ctx.lineWidth = 1.1;
    for (const [p0, p1] of [
      [D, C],
      [C, B],
    ] as const) {
      for (const v of [10, 20, 30]) {
        const a = facePoint(p0, p1, 0.03, v);
        const b2 = facePoint(p0, p1, 0.97, v);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.stroke();
      }
    }
    // 아치 창 — 크림색 + 브라운 트림 (정면 2 + 측면 2).
    const archWin = (p0: Pt, p1: Pt, u: number) => {
      faceQuad(ctx, p0, p1, u, u + 0.13, 10, 26);
      ctx.fillStyle = CREAM;
      ctx.fill();
      const topPt = facePoint(p0, p1, u + 0.065, 26);
      const rw = Math.abs(facePoint(p0, p1, u + 0.13, 26).x - facePoint(p0, p1, u, 26).x) / 2;
      ctx.fillStyle = CREAM;
      ellipse(ctx, topPt.x, topPt.y, rw, rw * 0.8);
      ctx.fill();
      faceQuad(ctx, p0, p1, u, u + 0.13, 10, 26);
      ctx.strokeStyle = TRIM;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    };
    archWin(D, C, 0.1);
    archWin(D, C, 0.76);
    archWin(C, B, 0.3);
    archWin(C, B, 0.6);
    // 정면 중앙 아치 대문.
    faceQuad(ctx, D, C, 0.41, 0.59, 0, 16);
    ctx.fillStyle = DOOR;
    ctx.fill();
    const doorTop = facePoint(D, C, 0.5, 16);
    const drw = Math.abs(facePoint(D, C, 0.59, 16).x - facePoint(D, C, 0.41, 16).x) / 2;
    ellipse(ctx, doorTop.x, doorTop.y, drw, drw * 0.85);
    ctx.fill();
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 1.6;
    faceQuad(ctx, D, C, 0.41, 0.59, 0, 16);
    ctx.stroke();
    // 본당 지붕 (청회색 슬레이트) + 용마루 하이라이트.
    vFootprintPath(ctx, x0 - 0.1, y0 - 0.1, x1 + 0.1, y1 + 0.1, 38);
    ctx.fillStyle = ROOF;
    ctx.fill();
    const rg0 = toScreen(x0, (y0 + y1) / 2);
    const rg1 = toScreen(x1, (y0 + y1) / 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(rg0.sx, rg0.sy - 38);
    ctx.lineTo(rg1.sx, rg1.sy - 38);
    ctx.stroke();

    // 종탑 (전면 중앙) — 벽돌 몸체 + 장미창 + 종창.
    ctx.fillStyle = BRICK_HI;
    ctx.fillRect(top.sx - 9, top.sy - 88, 18, 54);
    ctx.fillStyle = BRICK;
    ctx.fillRect(top.sx + 1, top.sy - 88, 8, 54);
    ctx.strokeStyle = TRIM;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(top.sx - 9, top.sy - 88, 18, 54);
    ctx.beginPath();
    ctx.moveTo(top.sx - 9, top.sy - 52);
    ctx.lineTo(top.sx + 9, top.sy - 52);
    ctx.moveTo(top.sx - 9, top.sy - 74);
    ctx.lineTo(top.sx + 9, top.sy - 74);
    ctx.stroke();
    // 장미창.
    ctx.fillStyle = CREAM;
    ellipse(ctx, top.sx, top.sy - 62, 5.6, 5.6);
    ctx.fill();
    ctx.strokeStyle = TRIM;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(top.sx, top.sy - 67.6);
    ctx.lineTo(top.sx, top.sy - 56.4);
    ctx.moveTo(top.sx - 5.6, top.sy - 62);
    ctx.lineTo(top.sx + 5.6, top.sy - 62);
    ctx.stroke();
    // 종창 (상단 슬릿 2개).
    ctx.fillStyle = CREAM;
    ctx.fillRect(top.sx - 5.5, top.sy - 84, 4, 8);
    ctx.fillRect(top.sx + 1.5, top.sy - 84, 4, 8);
    // 첨탑 (청회색) + 코너 피너클 + 십자가.
    ctx.beginPath();
    ctx.moveTo(top.sx - 11, top.sy - 88);
    ctx.lineTo(top.sx, top.sy - 112);
    ctx.lineTo(top.sx + 11, top.sy - 88);
    ctx.closePath();
    ctx.fillStyle = ROOF;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(top.sx, top.sy - 112);
    ctx.lineTo(top.sx + 11, top.sy - 88);
    ctx.lineTo(top.sx + 4, top.sy - 88);
    ctx.closePath();
    ctx.fillStyle = ROOF_SH;
    ctx.fill();
    for (const dx2 of [-11, 11]) {
      ctx.beginPath();
      ctx.moveTo(top.sx + dx2 - 3, top.sy - 87);
      ctx.lineTo(top.sx + dx2, top.sy - 96);
      ctx.lineTo(top.sx + dx2 + 3, top.sy - 87);
      ctx.closePath();
      ctx.fillStyle = ROOF_SH;
      ctx.fill();
    }
    ctx.strokeStyle = '#5B4A3F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(top.sx, top.sy - 112);
    ctx.lineTo(top.sx, top.sy - 122);
    ctx.moveTo(top.sx - 4.5, top.sy - 118);
    ctx.lineTo(top.sx + 4.5, top.sy - 118);
    ctx.stroke();
  } else if (id === 'namsan') {
    // 언덕.
    vFootprintPath(ctx, x0, y0, x1, y1);
    ctx.fillStyle = VPALETTE.leafDark;
    ctx.fill();
    ellipse(ctx, top.sx, top.sy - 10, TW * 0.8, TH * 0.85);
    ctx.fillStyle = VPALETTE.leaf;
    ctx.fill();
    ellipse(ctx, top.sx - 14, top.sy - 4, 12, 7);
    ctx.fillStyle = VPALETTE.leafLight;
    ctx.fill();
    // 타워 기둥 + 전망대.
    ctx.fillStyle = '#e8e4dc';
    ctx.fillRect(top.sx - 3.5, top.sy - 74, 7, 56);
    ctx.fillStyle = '#d2ccc0';
    ctx.fillRect(top.sx - 1, top.sy - 74, 4.5, 56);
    ctx.fillStyle = '#4fb9a8';
    roundRect(ctx, top.sx - 13, top.sy - 88, 26, 15, 7);
    ctx.fill();
    ctx.strokeStyle = '#369486';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(top.sx - 9, top.sy - 84, 18, 4);
    // 안테나.
    ctx.strokeStyle = '#c2503f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(top.sx, top.sy - 88);
    ctx.lineTo(top.sx, top.sy - 102);
    ctx.stroke();
    ctx.fillStyle = '#f2705e';
    ellipse(ctx, top.sx, top.sy - 103, 2.5, 2.5);
    ctx.fill();
  } else if (id === 'cheonggyecheon') {
    // 개울 수면 (낮은 랜드마크).
    vFootprintPath(ctx, x0, y0, x1, y1, 2);
    ctx.fillStyle = '#7ccbe8';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.18, y0 + 0.18, x1 - 0.18, y1 - 0.18, 3);
    ctx.fillStyle = VPALETTE.water;
    ctx.fill();
    // 물결.
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const ph = opts.time * 2 + i * 2.1;
      const ox = Math.sin(ph) * 4;
      ctx.beginPath();
      ctx.moveTo(top.sx - 14 + ox + i * 8, top.sy - 4 + i * 4);
      ctx.quadraticCurveTo(top.sx - 8 + ox + i * 8, top.sy - 7 + i * 4, top.sx - 2 + ox + i * 8, top.sy - 4 + i * 4);
      ctx.stroke();
    }
    // 돌다리.
    const b0 = toScreen(bx + 0.2, by + 1);
    const b1 = toScreen(bx + 1.8, by + 1);
    ctx.strokeStyle = '#c9bda3';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(b0.sx, b0.sy - 8);
    ctx.quadraticCurveTo(top.sx, top.sy - 22, b1.sx, b1.sy - 8);
    ctx.stroke();
    ctx.strokeStyle = '#a99b7d';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(b0.sx, b0.sy - 5);
    ctx.quadraticCurveTo(top.sx, top.sy - 19, b1.sx, b1.sy - 5);
    ctx.stroke();
    // 갈대.
    for (const [ox, oy] of [
      [-26, 4],
      [24, 7],
      [30, -2],
    ] as const) {
      const swy = Math.sin(opts.time * 1.6 + ox) * 1.5;
      ctx.strokeStyle = VPALETTE.grassBlade;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(top.sx + ox, top.sy + oy);
      ctx.lineTo(top.sx + ox + swy, top.sy + oy - 12);
      ctx.stroke();
      ctx.fillStyle = '#c9a86b';
      ellipse(ctx, top.sx + ox + swy, top.sy + oy - 14, 2, 4);
      ctx.fill();
    }
  } else {
    // gwanghwamun — 석축 + 홍예문 + 2단 기와지붕.
    faceQuad(ctx, D, C, 0, 1, 0, 24);
    ctx.fillStyle = '#e8e0d2';
    ctx.fill();
    faceQuad(ctx, C, B, 0, 1, 0, 24);
    ctx.fillStyle = '#d5cbb8';
    ctx.fill();
    // 홍예문 (아치).
    const arch = facePoint(D, C, 0.5, 0);
    ctx.fillStyle = '#6b5d4e';
    ctx.beginPath();
    ctx.ellipse(arch.x, arch.y - 8, 8, 11, 0, Math.PI, 0);
    ctx.rect(arch.x - 8, arch.y - 8, 16, 8);
    ctx.fill();
    // 누각 벽 (붉은 기둥).
    faceQuad(ctx, D, C, 0.12, 0.88, 24, 42);
    ctx.fillStyle = '#b8574a';
    ctx.fill();
    faceQuad(ctx, C, B, 0.12, 0.88, 24, 42);
    ctx.fillStyle = '#9c4438';
    ctx.fill();
    for (const u of [0.2, 0.5, 0.8]) {
      faceQuad(ctx, D, C, u - 0.03, u + 0.03, 24, 42);
      ctx.fillStyle = '#7d3025';
      ctx.fill();
    }
    // 1단 지붕.
    vFootprintPath(ctx, x0 - 0.22, y0 - 0.22, x1 + 0.22, y1 + 0.22, 46);
    ctx.fillStyle = '#4e5a66';
    ctx.fill();
    vFootprintPath(ctx, x0 - 0.05, y0 - 0.05, x1 + 0.05, y1 + 0.05, 50);
    ctx.fillStyle = '#5d6b78';
    ctx.fill();
    // 2단 지붕.
    vFootprintPath(ctx, x0 + 0.28, y0 + 0.28, x1 - 0.28, y1 - 0.28, 62);
    ctx.fillStyle = '#4e5a66';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(top.sx - 14, top.sy - 63);
    ctx.lineTo(top.sx + 14, top.sy - 63);
    ctx.stroke();
  }

  ctx.restore();
}

export const LANDMARK_ACCENTS: Record<string, string> = {
  cathedral: '#9a8f85',
  namsan: '#5f9037',
  cheonggyecheon: '#4489bb',
  gwanghwamun: '#8d4f3f',
};

/** 랜드마크 이름표 — 다른 오브젝트에 가려지지 않게 별도 최상단 패스에서 그린다 */
export function drawVLandmarkLabel(
  ctx: CanvasRenderingContext2D,
  id: string,
  bx: number,
  by: number,
  label: string,
  focus: number,
  time: number,
): void {
  const top = toScreen(bx + 1, by + 1);
  const plateY = top.sy - 96 - 14 + Math.sin(time * 1.6) * 1.5;
  drawVNameplate(ctx, top.sx, id === 'cheonggyecheon' ? top.sy - 46 : plateY, label, {
    alpha: 0.45 + focus * 0.55,
    accent: LANDMARK_ACCENTS[id] ?? '#8a8f98',
    scale: 1 + focus * 0.08,
  });
}

// ---------------------------------------------------------------- 소품

const FLOWER_COLORS = ['#f2698c', '#ffd166', '#ffffff', '#c79bf0', '#ff9a6b'];

/** 고정 소품 + 상점 소품 겸용. decor id 는 DECOR_ITEMS(id)와 일치. */
export interface VDrawableProp {
  type: string;
  x: number;
  y: number;
  v: number;
}

export function drawVProp(ctx: CanvasRenderingContext2D, p: VDrawableProp, time: number): void {
  const { sx, sy } = toScreen(p.x, p.y);
  switch (p.type) {
    case 'tree':
    case 'maple': {
      const maple = p.type === 'maple';
      const scale = 0.85 + p.v * 0.3;
      const sway = Math.sin(time * 1.1 + p.v * 9) * 2;
      shadow(ctx, sx, sy + 2, 15 * scale);
      ctx.fillStyle = VPALETTE.trunkDark;
      ctx.beginPath();
      ctx.moveTo(sx - 4 * scale, sy);
      ctx.lineTo(sx + 4 * scale, sy);
      ctx.lineTo(sx + 2.5 * scale, sy - 26 * scale);
      ctx.lineTo(sx - 2.5 * scale, sy - 26 * scale);
      ctx.closePath();
      ctx.fill();
      const cy = sy - 34 * scale;
      ctx.fillStyle = maple ? '#c2503f' : VPALETTE.leafDark;
      ellipse(ctx, sx + sway, cy + 4 * scale, 20 * scale, 16 * scale);
      ctx.fill();
      ctx.fillStyle = maple ? '#e0684f' : VPALETTE.leaf;
      ellipse(ctx, sx - 7 * scale + sway, cy, 14 * scale, 12 * scale);
      ctx.fill();
      ellipse(ctx, sx + 8 * scale + sway, cy + 1 * scale, 13 * scale, 11 * scale);
      ctx.fill();
      ctx.fillStyle = maple ? '#f0885f' : VPALETTE.leafLight;
      ellipse(ctx, sx - 2 * scale + sway, cy - 8 * scale, 12 * scale, 9 * scale);
      ctx.fill();
      if (!maple && p.v > 0.68) {
        ctx.fillStyle = '#f2685f';
        ellipse(ctx, sx + 11 * scale + sway, cy + 8 * scale, 3.2, 3.2);
        ctx.fill();
        ellipse(ctx, sx - 10 * scale + sway, cy + 5 * scale, 3.2, 3.2);
        ctx.fill();
      }
      return;
    }
    case 'pine': {
      const scale = 0.85 + p.v * 0.35;
      const sway = Math.sin(time * 0.9 + p.v * 7) * 1.4;
      shadow(ctx, sx, sy + 2, 12 * scale);
      ctx.fillStyle = VPALETTE.trunkDark;
      ctx.fillRect(sx - 3 * scale, sy - 14 * scale, 6 * scale, 14 * scale);
      for (let i = 0; i < 3; i++) {
        const w = (20 - i * 4.5) * scale;
        const yb = sy - 12 * scale - i * 13 * scale;
        ctx.fillStyle = i === 2 ? VPALETTE.pine : VPALETTE.pineDark;
        ctx.beginPath();
        ctx.moveTo(sx + sway * (i * 0.4), yb - 20 * scale);
        ctx.lineTo(sx + w, yb);
        ctx.lineTo(sx - w, yb);
        ctx.closePath();
        ctx.fill();
      }
      return;
    }
    case 'bush': {
      const scale = 0.8 + p.v * 0.4;
      shadow(ctx, sx, sy + 1, 12 * scale);
      ctx.fillStyle = VPALETTE.leafDark;
      ellipse(ctx, sx, sy - 5 * scale, 14 * scale, 10 * scale);
      ctx.fill();
      ctx.fillStyle = VPALETTE.leaf;
      ellipse(ctx, sx - 4 * scale, sy - 9 * scale, 9 * scale, 7 * scale);
      ctx.fill();
      ellipse(ctx, sx + 5 * scale, sy - 8 * scale, 8 * scale, 6 * scale);
      ctx.fill();
      return;
    }
    case 'flower': {
      const color = FLOWER_COLORS[Math.floor(p.v * FLOWER_COLORS.length) % FLOWER_COLORS.length];
      const n = 1 + Math.floor(p.v * 3);
      for (let i = 0; i < n; i++) {
        const ox = (i - (n - 1) / 2) * 11;
        const oy = ((i % 2) - 0.5) * 6;
        const bob = Math.sin(time * 2 + p.v * 8 + i) * 0.8;
        ctx.strokeStyle = VPALETTE.grassBlade;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sx + ox, sy + oy);
        ctx.lineTo(sx + ox + bob, sy + oy - 8);
        ctx.stroke();
        ctx.fillStyle = color;
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          ellipse(ctx, sx + ox + bob + Math.cos(a) * 3, sy + oy - 9 + Math.sin(a) * 3, 2.6, 2.6);
          ctx.fill();
        }
        ctx.fillStyle = '#ffe680';
        ellipse(ctx, sx + ox + bob, sy + oy - 9, 1.8, 1.8);
        ctx.fill();
      }
      return;
    }
    case 'rock': {
      const scale = 0.8 + p.v * 0.5;
      shadow(ctx, sx, sy + 1, 11 * scale);
      ctx.fillStyle = VPALETTE.rockDark;
      ctx.beginPath();
      ctx.moveTo(sx - 12 * scale, sy);
      ctx.lineTo(sx - 7 * scale, sy - 11 * scale);
      ctx.lineTo(sx + 4 * scale, sy - 13 * scale);
      ctx.lineTo(sx + 12 * scale, sy - 3 * scale);
      ctx.lineTo(sx + 6 * scale, sy + 2 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = VPALETTE.rock;
      ctx.beginPath();
      ctx.moveTo(sx - 7 * scale, sy - 11 * scale);
      ctx.lineTo(sx + 4 * scale, sy - 13 * scale);
      ctx.lineTo(sx + 2 * scale, sy - 6 * scale);
      ctx.lineTo(sx - 5 * scale, sy - 5 * scale);
      ctx.closePath();
      ctx.fill();
      return;
    }
    case 'lamp': {
      shadow(ctx, sx, sy, 8);
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(sx - 2.5, sy - 46, 5, 46);
      ctx.fillStyle = '#4b5563';
      ellipse(ctx, sx, sy, 8, 3.5);
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      roundRect(ctx, sx - 8, sy - 58, 16, 14, 5);
      ctx.fill();
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }
    case 'bench': {
      // 공원 벤치 — 가로등/우체통과 같은 정면 빌보드 스타일.
      shadow(ctx, sx, sy + 1, 16, 0.15);
      // 다리.
      ctx.fillStyle = VPALETTE.trunkDark;
      ctx.fillRect(sx - 13, sy - 12, 3.5, 12);
      ctx.fillRect(sx + 9.5, sy - 12, 3.5, 12);
      // 등받이 기둥.
      ctx.fillRect(sx - 13, sy - 31, 3.5, 19);
      ctx.fillRect(sx + 9.5, sy - 31, 3.5, 19);
      // 등받이 가로판 2장.
      ctx.fillStyle = VPALETTE.trunk;
      roundRect(ctx, sx - 17, sy - 32, 34, 5, 2.5);
      ctx.fill();
      roundRect(ctx, sx - 17, sy - 25, 34, 5, 2.5);
      ctx.fill();
      // 좌판 + 밑면 두께.
      roundRect(ctx, sx - 18, sy - 15, 36, 6.5, 3);
      ctx.fill();
      ctx.fillStyle = VPALETTE.trunkDark;
      roundRect(ctx, sx - 18, sy - 9.5, 36, 3, 1.5);
      ctx.fill();
      // 좌판 나뭇결 슬랫 라인.
      ctx.strokeStyle = 'rgba(139,90,55,0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx - 14, sy - 11.8);
      ctx.lineTo(sx + 14, sy - 11.8);
      ctx.stroke();
      return;
    }
    case 'fountain': {
      shadow(ctx, sx, sy + 2, 22, 0.14);
      vTilePath(ctx, p.x, p.y, 2);
      ctx.fillStyle = '#e3dac6';
      ctx.fill();
      ctx.strokeStyle = '#cbbfa5';
      ctx.lineWidth = 3;
      ctx.stroke();
      vTilePath(ctx, p.x, p.y, -6);
      ctx.fillStyle = VPALETTE.water;
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      const r = 4 + Math.sin(time * 3) * 1.5;
      ellipse(ctx, sx, sy - 3, r * 2, r * 0.9);
      ctx.fill();
      ctx.fillStyle = '#cbbfa5';
      ctx.fillRect(sx - 2.5, sy - 26, 5, 20);
      ctx.fillStyle = '#e3dac6';
      ellipse(ctx, sx, sy - 26, 9, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + time * 0.6;
        const t = (Math.sin(time * 3 + i) + 1) / 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy - 29);
        ctx.quadraticCurveTo(
          sx + Math.cos(a) * 8,
          sy - 36 - t * 3,
          sx + Math.cos(a) * 15,
          sy - 12 + Math.abs(Math.sin(a)) * 4,
        );
        ctx.stroke();
      }
      return;
    }
    case 'mailbox': {
      shadow(ctx, sx, sy, 8);
      ctx.fillStyle = '#8b5a37';
      ctx.fillRect(sx - 2.5, sy - 22, 5, 22);
      ctx.fillStyle = '#e2554a';
      roundRect(ctx, sx - 9, sy - 42, 18, 22, 7);
      ctx.fill();
      ctx.fillStyle = '#c23f36';
      roundRect(ctx, sx - 9, sy - 42, 18, 8, 7);
      ctx.fill();
      ctx.fillStyle = VPALETTE.paper;
      roundRect(ctx, sx - 5, sy - 34, 10, 3.5, 1.5);
      ctx.fill();
      return;
    }
    case 'concert-lightstick': {
      // 이벤트 한정 — 콘서트 응원봉. 밤에는 보라 광원(villageGame 밤 패스)으로 빛난다.
      shadow(ctx, sx, sy, 8);
      ctx.fillStyle = '#4a3b32';
      ctx.fillRect(sx - 2.5, sy - 27, 5, 27);
      ctx.fillStyle = '#6b5a4c';
      ctx.fillRect(sx - 4.5, sy - 31, 9, 5);
      const pulse = 0.5 + Math.sin(time * 2.4) * 0.12;
      ctx.fillStyle = `rgba(180,140,255,${0.3 + pulse * 0.16})`;
      ctx.beginPath();
      ctx.arc(sx, sy - 41, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b48cff';
      ctx.beginPath();
      ctx.arc(sx, sy - 41, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(sx - 3.5, sy - 44.5, 3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    case 'wood-table': {
      // 원형 나무 테이블 — 벤치와 같은 정면 빌보드 스타일.
      shadow(ctx, sx, sy + 1, 15, 0.15);
      ctx.fillStyle = VPALETTE.trunkDark;
      ctx.fillRect(sx - 2.75, sy - 20, 5.5, 20);
      ctx.fillRect(sx - 12, sy - 3, 24, 3);
      ctx.fillStyle = VPALETTE.trunkDark;
      ellipse(ctx, sx, sy - 18, 17, 7.5);
      ctx.fill();
      ctx.fillStyle = VPALETTE.trunk;
      ellipse(ctx, sx, sy - 20, 17, 7.5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(139,90,55,0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 20, 11, 4.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ellipse(ctx, sx - 5, sy - 22, 6, 2.2);
      ctx.fill();
      return;
    }
    case 'leather-sofa': {
      // 가죽 2인 소파 — 앉기 가능(벤치와 동일 좌면 높이).
      shadow(ctx, sx, sy + 1, 17, 0.16);
      const LEATHER = '#A9713F';
      const LEATHER_SH = '#8B5A32';
      // 등받이.
      ctx.fillStyle = LEATHER;
      roundRect(ctx, sx - 16, sy - 33, 32, 16, 6);
      ctx.fill();
      // 단추 터프팅.
      ctx.fillStyle = 'rgba(90,55,25,0.45)';
      ellipse(ctx, sx - 7, sy - 26, 1.5, 1.5);
      ctx.fill();
      ellipse(ctx, sx + 7, sy - 26, 1.5, 1.5);
      ctx.fill();
      // 좌면 쿠션 2개.
      ctx.fillStyle = LEATHER;
      roundRect(ctx, sx - 15, sy - 18, 14.5, 8.5, 4);
      ctx.fill();
      roundRect(ctx, sx + 0.5, sy - 18, 14.5, 8.5, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      roundRect(ctx, sx - 14, sy - 17.2, 12.5, 3, 1.5);
      ctx.fill();
      roundRect(ctx, sx + 1.5, sy - 17.2, 12.5, 3, 1.5);
      ctx.fill();
      // 팔걸이.
      ctx.fillStyle = LEATHER_SH;
      roundRect(ctx, sx - 21, sy - 24, 6.5, 15, 3);
      ctx.fill();
      roundRect(ctx, sx + 14.5, sy - 24, 6.5, 15, 3);
      ctx.fill();
      // 베이스 + 발.
      ctx.fillStyle = LEATHER_SH;
      roundRect(ctx, sx - 17, sy - 10, 34, 4.5, 2);
      ctx.fill();
      ctx.fillStyle = VPALETTE.trunkDark;
      ctx.fillRect(sx - 15, sy - 5.5, 3.5, 5.5);
      ctx.fillRect(sx + 11.5, sy - 5.5, 3.5, 5.5);
      return;
    }
    case 'cherry-tree': {
      // 벚꽃나무 — 단풍나무와 같은 구조, 분홍 수관 + 흩날리는 꽃잎.
      const scale = 0.9 + p.v * 0.3;
      const sway = Math.sin(time * 1.1 + p.v * 9) * 2;
      shadow(ctx, sx, sy + 2, 15 * scale);
      ctx.fillStyle = VPALETTE.trunkDark;
      ctx.beginPath();
      ctx.moveTo(sx - 4 * scale, sy);
      ctx.quadraticCurveTo(sx - 2 * scale, sy - 18 * scale, sx - 1 * scale, sy - 26 * scale);
      ctx.lineTo(sx + 2.5 * scale, sy - 26 * scale);
      ctx.quadraticCurveTo(sx + 3.5 * scale, sy - 14 * scale, sx + 5 * scale, sy);
      ctx.closePath();
      ctx.fill();
      const cy = sy - 34 * scale;
      ctx.fillStyle = '#E89BB8';
      ellipse(ctx, sx + sway, cy + 4 * scale, 20 * scale, 16 * scale);
      ctx.fill();
      ctx.fillStyle = '#F4B8CE';
      ellipse(ctx, sx - 7 * scale + sway, cy, 14 * scale, 12 * scale);
      ctx.fill();
      ellipse(ctx, sx + 8 * scale + sway, cy + 1 * scale, 13 * scale, 11 * scale);
      ctx.fill();
      ctx.fillStyle = '#FBD3E2';
      ellipse(ctx, sx - 2 * scale + sway, cy - 8 * scale, 12 * scale, 9 * scale);
      ctx.fill();
      // 흩날리는 꽃잎 2장.
      ctx.fillStyle = '#F7A8C4';
      const drift = (time * 9 + p.v * 40) % 30;
      ellipse(ctx, sx + 14 * scale + sway - drift * 0.4, cy + 10 + drift * 0.7, 2, 1.4);
      ctx.fill();
      ellipse(ctx, sx - 10 * scale + sway - drift * 0.3, cy + 2 + drift * 0.9, 1.8, 1.3);
      ctx.fill();
      return;
    }
    case 'statue': {
      // 캐릭터 동상 — 석재 받침 + 청동 까치 (까미 오마주).
      shadow(ctx, sx, sy + 1, 16, 0.16);
      const STONE = '#C7C0B0';
      const STONE_SH = '#A8A090';
      const BRONZE = '#8C7A52';
      const BRONZE_SH = '#6E5F3E';
      // 받침대.
      ctx.fillStyle = STONE_SH;
      roundRect(ctx, sx - 13, sy - 10, 26, 10, 2.5);
      ctx.fill();
      ctx.fillStyle = STONE;
      ellipse(ctx, sx, sy - 10, 13, 5);
      ctx.fill();
      // 명판.
      ctx.fillStyle = '#E8C87F';
      roundRect(ctx, sx - 5, sy - 7.5, 10, 4, 1.5);
      ctx.fill();
      // 청동 까치 — 꼬리·몸·배·날개·부리.
      ctx.fillStyle = BRONZE_SH;
      ctx.save();
      ctx.translate(sx - 9, sy - 22);
      ctx.rotate(0.5);
      roundRect(ctx, -8, -2.5, 14, 5, 2.5);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = BRONZE;
      ellipse(ctx, sx, sy - 26, 10.5, 13);
      ctx.fill();
      ctx.fillStyle = '#A5946B';
      ellipse(ctx, sx, sy - 21, 6, 7);
      ctx.fill();
      ctx.fillStyle = BRONZE_SH;
      ctx.beginPath();
      ctx.ellipse(sx - 8.5, sy - 24, 3.2, 6, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx + 8.5, sy - 24, 3.2, 6, -0.25, 0, Math.PI * 2);
      ctx.fill();
      // 눈·부리 (음각 느낌).
      ctx.fillStyle = BRONZE_SH;
      ellipse(ctx, sx - 3.4, sy - 31, 1.3, 1.5);
      ctx.fill();
      ellipse(ctx, sx + 3.4, sy - 31, 1.3, 1.5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx - 2.5, sy - 28.5);
      ctx.lineTo(sx + 2.5, sy - 28.5);
      ctx.lineTo(sx, sy - 25.5);
      ctx.closePath();
      ctx.fill();
      // 녹청 포인트 + 하이라이트.
      ctx.fillStyle = 'rgba(127,160,140,0.5)';
      ellipse(ctx, sx + 6, sy - 33, 3, 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ellipse(ctx, sx - 4.5, sy - 34, 2.6, 1.8);
      ctx.fill();
      return;
    }
    case 'plaza-tile': {
      // 광장 돌바닥 타일 — 지형 드로어(VT.Path)를 그대로 사용해 타일끼리
      // 이어 깔면 원래 광장과 픽셀 단위로 같은 룩이 된다.
      drawVTile(ctx, Math.floor(p.x), Math.floor(p.y), VT.Path, time);
      return;
    }
    case 'nanta-drum': {
      shadow(ctx, sx, sy + 1, 13);
      // 드럼통 화분.
      ctx.fillStyle = '#c9a227';
      roundRect(ctx, sx - 12, sy - 22, 24, 22, 4);
      ctx.fill();
      ctx.fillStyle = '#a9861f';
      ctx.fillRect(sx - 12, sy - 15, 24, 3);
      ctx.fillRect(sx - 12, sy - 7, 24, 3);
      ellipse(ctx, sx, sy - 22, 12, 5);
      ctx.fillStyle = '#e8d9b0';
      ctx.fill();
      ctx.strokeStyle = '#a9861f';
      ctx.lineWidth = 2;
      ctx.stroke();
      // 드럼스틱 + 꽃.
      ctx.strokeStyle = '#8b5a37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx - 7, sy - 24);
      ctx.lineTo(sx - 14, sy - 36);
      ctx.moveTo(sx + 7, sy - 24);
      ctx.lineTo(sx + 14, sy - 36);
      ctx.stroke();
      const bob = Math.sin(time * 2 + p.v * 5) * 1;
      ctx.fillStyle = '#f2698c';
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        ellipse(ctx, sx + bob + Math.cos(a) * 3.4, sy - 32 + Math.sin(a) * 3.4, 2.6, 2.6);
        ctx.fill();
      }
      ctx.fillStyle = '#ffe680';
      ellipse(ctx, sx + bob, sy - 32, 2, 2);
      ctx.fill();
      return;
    }
  }
}

// ---------------------------------------------------------------- 캐릭터

export type VFacing = 'n' | 's' | 'e' | 'w';

export interface VCharSkin {
  body: string;
  bodyDark: string;
  fur: string;
  furDark: string;
  hair?: string;
  /** 0 단발 · 1 숏컷 · 2 긴머리 · 3 번헤어 (플레이어 전용) */
  hairStyle?: number;
  ear?: 'cat' | 'dog' | 'bear' | 'rabbit' | 'bird' | 'owl' | 'none';
  /** 워드로브(구매 파츠)·기본 의상 치비 표현 — SVG 아바타와 같은 실루엣을 축소 재현 */
  premiumHair?: 'pony' | 'twin' | 'wave' | 'braid';
  /** 무료 의상 종류 (0 티셔츠 · 1 후드 · 2 멜빵바지) — 프리미엄 상의 착용 시 무시 */
  outfitKind?: number;
  topId?: string;
  topAccent?: string;
  bottomId?: string;
  bottomColor?: string;
  bottomAccent?: string;
  shoeColor?: string;
  faceColor?: string;
  faceAccent?: string;
}

export interface VCharOpts {
  facing: VFacing;
  /** 걷기 사이클 누적 라디안 — 정지 시 0 */
  phase: number;
  moving: boolean;
  skin: VCharSkin;
  scale?: number;
  /** 벤치·소파에 앉은 자세 — 다리를 짧게 늘어뜨리고 좌면 높이로 올림 */
  sit?: boolean;
}

export function drawVCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  o: VCharOpts,
): void {
  const { sx, sy } = toScreen(x, y);
  const s = o.scale ?? 1;
  const sit = o.sit ?? false;
  const swing = o.moving && !sit ? Math.sin(o.phase) : 0;
  const bob = o.moving && !sit ? Math.abs(Math.sin(o.phase)) * 2.2 : 0;
  const back = o.facing === 'n';
  const flip = o.facing === 'w' ? -1 : 1;

  shadow(ctx, sx, sy, 13 * s, 0.2);

  ctx.save();
  // 앉기: 좌면 높이만큼 올리고 다리를 짧게 늘어뜨린다.
  ctx.translate(sx, sy - bob - (sit ? 8 : 0));
  ctx.scale(s * flip, s);

  // 다리 — 하의 종류별 색/노출 (SVG 아바타와 같은 규칙).
  const legH = sit ? 9 : 13;
  const bId = o.skin.bottomId;
  const skirt = bId === 'bottom-pleats' || bId === 'bottom-chima';
  const bareLegs = skirt || bId === 'bottom-shorts';
  ctx.fillStyle = bareLegs ? o.skin.fur : o.skin.bottomColor ?? o.skin.bodyDark;
  roundRect(ctx, -8 + swing * 3, -12, 7, legH, 3);
  ctx.fill();
  roundRect(ctx, 1 - swing * 3, -12, 7, legH, 3);
  ctx.fill();
  if (bId === 'bottom-jeans') {
    // 청바지 밑단 롤업.
    ctx.fillStyle = '#8FA6CC';
    roundRect(ctx, -8 + swing * 3, -12 + legH - 2.4, 7, 2.4, 1.2);
    ctx.fill();
    roundRect(ctx, 1 - swing * 3, -12 + legH - 2.4, 7, 2.4, 1.2);
    ctx.fill();
  }

  // 구매 신발 — 다리 끝에 작은 발
  if (o.skin.shoeColor) {
    ctx.fillStyle = o.skin.shoeColor;
    ellipse(ctx, -4.5 + swing * 3, -12 + legH, 4, 2.6);
    ctx.fill();
    ellipse(ctx, 4.5 - swing * 3, -12 + legH, 4, 2.6);
    ctx.fill();
  }

  // 반바지 — 허벅지 덮개 + 밑단.
  if (bId === 'bottom-shorts') {
    ctx.fillStyle = o.skin.bottomColor ?? o.skin.bodyDark;
    roundRect(ctx, -9, -13, 18, 7, 3);
    ctx.fill();
    ctx.fillStyle = o.skin.bottomAccent ?? '#C4A374';
    roundRect(ctx, -9, -7.4, 18, 1.8, 0.9);
    ctx.fill();
  }

  // 치마류 — 상의(몸통)보다 항상 아래 레이어. 허리단은 상의에 가려진다.
  if (skirt) {
    const chima = bId === 'bottom-chima';
    ctx.fillStyle = o.skin.bottomColor ?? o.skin.bodyDark;
    ctx.beginPath();
    if (chima) {
      ctx.moveTo(-9.5, -17);
      ctx.lineTo(9.5, -17);
      ctx.lineTo(13, 0);
      ctx.lineTo(-13, 0);
    } else {
      // 미니 플리츠 — 짧은 A라인 + 지그재그 밑단.
      ctx.moveTo(-9.5, -14);
      ctx.lineTo(9.5, -14);
      ctx.lineTo(11.5, -6.5);
      ctx.lineTo(7.6, -4.8);
      ctx.lineTo(3.8, -6.8);
      ctx.lineTo(0, -4.5);
      ctx.lineTo(-3.8, -6.8);
      ctx.lineTo(-7.6, -4.8);
      ctx.lineTo(-11.5, -6.5);
    }
    ctx.closePath();
    ctx.fill();
    if (o.skin.bottomAccent) {
      ctx.strokeStyle = o.skin.bottomAccent;
      ctx.lineWidth = 1.1;
      const hemY = chima ? -0.5 : -6;
      const topY = chima ? -16 : -13;
      ctx.beginPath();
      ctx.moveTo(-4, topY);
      ctx.lineTo(-5.5, hemY);
      ctx.moveTo(0, topY);
      ctx.lineTo(0, hemY);
      ctx.moveTo(4, topY);
      ctx.lineTo(5.5, hemY);
      ctx.stroke();
    }
    if (chima) {
      ctx.fillStyle = '#F5EFE3';
      roundRect(ctx, -9, -19, 18, 3.2, 1.6);
      ctx.fill();
    }
  }

  // 몸통 — 멜빵바지는 크림 이너 위에 빕을 얹는다.
  const tId = o.skin.topId;
  const overalls = !tId && o.skin.outfitKind === 2;
  ctx.fillStyle = overalls ? '#FFF6E6' : o.skin.body;
  roundRect(ctx, -11, -30, 22, 21, 9);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, -8, -28, 7, 16, 4);
  ctx.fill();



  // 의상 디테일 — 무료 3종(티셔츠 카라·후드·멜빵바지) / 프리미엄 4종.
  const tAcc = o.skin.topAccent ?? '#FFFDF7';
  if (!tId && o.skin.outfitKind === 1) {
    ctx.fillStyle = o.skin.bodyDark;
    roundRect(ctx, -8, -32.5, 16, 5.5, 2.75);
    ctx.fill();
    roundRect(ctx, -6, -15.5, 12, 5.5, 2.75);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,253,247,0.9)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2.5, -27);
    ctx.lineTo(-2.5, -21);
    ctx.moveTo(2.5, -27);
    ctx.lineTo(2.5, -21);
    ctx.stroke();
  } else if (overalls) {
    ctx.fillStyle = o.skin.body;
    roundRect(ctx, -7, -21, 14, 12, 3);
    ctx.fill();
    roundRect(ctx, -7, -29, 3, 9, 1.5);
    ctx.fill();
    roundRect(ctx, 4, -29, 3, 9, 1.5);
    ctx.fill();
    ctx.fillStyle = '#FFD66B';
    ellipse(ctx, -5.5, -19.5, 1.3, 1.3);
    ctx.fill();
    ellipse(ctx, 5.5, -19.5, 1.3, 1.3);
    ctx.fill();
  } else if (!tId) {
    ctx.fillStyle = 'rgba(255,253,247,0.9)';
    ellipse(ctx, 0, -28.6, 3.8, 1.9);
    ctx.fill();
  } else if (tId === 'top-stripe') {
    ctx.fillStyle = tAcc;
    roundRect(ctx, -11, -26, 22, 3.2, 1.6);
    ctx.fill();
    roundRect(ctx, -11, -20, 22, 3.2, 1.6);
    ctx.fill();
    ellipse(ctx, 0, -28.6, 3.6, 1.8);
    ctx.fill();
  } else if (tId === 'top-denim') {
    ctx.fillStyle = '#FFFDF7';
    roundRect(ctx, -3, -30, 6, 21, 2);
    ctx.fill();
    ctx.fillStyle = tAcc;
    ctx.beginPath();
    ctx.moveTo(-8, -30);
    ctx.lineTo(-3, -30);
    ctx.lineTo(-6.5, -25);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -30);
    ctx.lineTo(3, -30);
    ctx.lineTo(6.5, -25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#E8C87F';
    ellipse(ctx, 2, -23, 1, 1);
    ctx.fill();
    ellipse(ctx, 2, -18, 1, 1);
    ctx.fill();
  } else if (tId === 'top-knit') {
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.moveTo(-5.5, -30);
    ctx.lineTo(0, -21.5);
    ctx.lineTo(5.5, -30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = tAcc;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-5.5, -30);
    ctx.lineTo(0, -21.5);
    ctx.lineTo(5.5, -30);
    ctx.stroke();
    ctx.fillStyle = '#8A6B52';
    for (const yy of [-19, -15.5, -12]) {
      ellipse(ctx, 0, yy, 1.2, 1.2);
      ctx.fill();
    }
  } else if (tId === 'top-jeogori') {
    ctx.strokeStyle = '#FFFDF7';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-5, -30);
    ctx.lineTo(2.5, -15);
    ctx.stroke();
    ctx.strokeStyle = tAcc;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-3.6, -29.4);
    ctx.lineTo(3.4, -15.6);
    ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(2.5, -15);
    ctx.lineTo(5.5, -7.5);
    ctx.moveTo(0.8, -14.6);
    ctx.lineTo(3.2, -6.5);
    ctx.stroke();
  }


  // 팔
  ctx.fillStyle = o.skin.fur;
  roundRect(ctx, -15, -28 - swing * 3, 6, 15, 3);
  ctx.fill();
  roundRect(ctx, 9, -28 + swing * 3, 6, 15, 3);
  ctx.fill();
  // 한복 저고리 — 색동 끝동 소매.
  if (tId === 'top-jeogori') {
    const CUFFS = ['#D95A4A', '#FFD66B', '#7BC47F'];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = CUFFS[i];
      ctx.fillRect(-15, -18.6 - swing * 3 + i * 1.8, 6, 1.8);
      ctx.fillRect(9, -18.6 + swing * 3 + i * 1.8, 6, 1.8);
    }
  }

  // 귀 — 머리(중심 -42, 반경 14×13) 위로 나와야 보인다.
  const ear = o.skin.ear ?? 'none';
  ctx.fillStyle = o.skin.furDark;
  if (ear === 'cat') {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 13, -47);
      ctx.lineTo(side * 7, -64);
      ctx.lineTo(side * 1, -45);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(244,150,165,0.6)';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 10.5, -49);
      ctx.lineTo(side * 7, -59);
      ctx.lineTo(side * 4, -48);
      ctx.closePath();
      ctx.fill();
    }
  } else if (ear === 'dog') {
    for (const side of [-1, 1]) {
      ellipse(ctx, side * 14, -45, 5.5, 10.5);
      ctx.fill();
    }
  } else if (ear === 'bear') {
    for (const side of [-1, 1]) {
      ellipse(ctx, side * 10.5, -53, 6.5, 6.5);
      ctx.fill();
    }
  } else if (ear === 'rabbit') {
    for (const side of [-1, 1]) {
      ellipse(ctx, side * 7, -63, 4.5, 13);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(244,150,165,0.55)';
    for (const side of [-1, 1]) {
      ellipse(ctx, side * 7, -64, 2.2, 9);
      ctx.fill();
    }
  } else if (ear === 'bird') {
    ctx.beginPath();
    ctx.moveTo(-4, -52);
    ctx.lineTo(1, -64);
    ctx.lineTo(4, -51);
    ctx.closePath();
    ctx.fill();
  } else if (ear === 'owl') {
    // 부엉이 깃털 뿔 한 쌍.
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 12, -48);
      ctx.lineTo(side * 8, -62);
      ctx.lineTo(side * 3, -47);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 머리
  ctx.fillStyle = o.skin.fur;
  ellipse(ctx, 0, -42, 14, 13);
  ctx.fill();

  // 헤어 (플레이어) — 스타일 4종 변주.
  if (o.skin.hair) {
    const style = o.skin.hairStyle ?? 0;
    ctx.fillStyle = o.skin.hair;
    if (back) {
      // 뒷모습 — 뒷통수 전체를 머리카락으로 덮는다 (맨살 방지).
      ellipse(ctx, 0, -42.3, 14.3, 13.3);
      ctx.fill();
      if (style === 1 && !o.skin.premiumHair) {
        // 숏컷 — 목덜미 라인이 드러나는 짧은 커트.
        ctx.fillStyle = o.skin.fur;
        ellipse(ctx, 0, -30.6, 5, 2.6);
        ctx.fill();
        ctx.fillStyle = o.skin.hair;
      } else if (style === 2 && !o.skin.premiumHair) {
        // 긴머리 — 등 뒤로 흘러내리는 머리채.
        roundRect(ctx, -8.5, -40, 17, 20, 7);
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.ellipse(0, -46, 14, 11, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    if (style !== 1) {
      // 옆머리 (숏컷 제외) — 양쪽 대칭.
      ctx.beginPath();
      ctx.ellipse(-9, -44, 5, 8, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(9, -44, 5, 8, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 숏컷 — 정수리 삐침 2가닥.
      ctx.beginPath();
      ctx.moveTo(-6, -54);
      ctx.lineTo(-3, -61);
      ctx.lineTo(-0.5, -53.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, -55);
      ctx.lineTo(5, -61);
      ctx.lineTo(7, -53.5);
      ctx.closePath();
      ctx.fill();
    }
    if (style === 2) {
      // 긴머리 — 양쪽으로 흘러내림.
      ctx.beginPath();
      ctx.ellipse(-12, -34, 4.5, 11, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(12, -34, 4.5, 11, -0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 3) {
      // 번헤어 — 정수리 동그란 번.
      ellipse(ctx, 0, -58, 6, 5.5);
      ctx.fill();
    }
    // 구매 헤어 — 치비 스케일 형태 힌트.
    const ph = o.skin.premiumHair;
    if (ph === 'pony') {
      // 하이포니 — 정수리 묶음에서 아래로 떨어지는 꼬리.
      if (back) {
        ctx.beginPath();
        ctx.ellipse(0, -33, 5, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF8B7B';
        ellipse(ctx, 0, -47, 2.4, 2.4);
        ctx.fill();
      } else {
        ellipse(ctx, 6, -55.5, 5.5, 3.6);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(11.5, -44, 4.2, 10, -0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF8B7B';
        ellipse(ctx, 9.5, -53, 2.2, 2.2);
        ctx.fill();
      }
    } else if (ph === 'twin') {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * 12, -32, 3.8, 8, side * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FF8B7B';
      ellipse(ctx, -11, -40, 1.9, 1.9);
      ctx.fill();
      ellipse(ctx, 11, -40, 1.9, 1.9);
      ctx.fill();
    } else if (ph === 'wave') {
      for (const [wx, wy, wr] of [
        [-11.5, -36, 4],
        [11.5, -36, 4],
        [-13, -28, 3.4],
        [13, -28, 3.4],
      ]) {
        ellipse(ctx, wx, wy, wr, wr);
        ctx.fill();
      }
    } else if (ph === 'braid') {
      // 꽃 화관 — 머리를 두르는 꽃(핑크/흰)과 잎.
      ctx.fillStyle = '#7BC47F';
      for (const [lx, ly] of [
        [-7.6, -51.6],
        [7.6, -51.6],
      ]) {
        ellipse(ctx, lx, ly, 2, 1.2);
        ctx.fill();
      }
      const petals = ['#F2A7C3', '#FFFDF7', '#F2A7C3', '#FFFDF7', '#F2A7C3'];
      const spots = [
        [-11, -48.5],
        [-5, -52.5],
        [0, -53.5],
        [5, -52.5],
        [11, -48.5],
      ];
      for (let i = 0; i < spots.length; i++) {
        ctx.fillStyle = petals[i];
        ellipse(ctx, spots[i][0], spots[i][1], 2.5, 2.5);
        ctx.fill();
        ctx.fillStyle = '#FFD66B';
        ellipse(ctx, spots[i][0], spots[i][1], 1, 1);
        ctx.fill();
      }
    }
  }

  if (!back) {
    const furry = ear === 'cat' || ear === 'dog' || ear === 'bear';
    if (furry) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ellipse(ctx, 0, -35, 7.5, 5.5);
      ctx.fill();
    }
    // 부엉이 눈가 원반.
    if (ear === 'owl') {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ellipse(ctx, -5.5, -42, 4.6, 4.9);
      ctx.fill();
      ellipse(ctx, 5.5, -42, 4.6, 4.9);
      ctx.fill();
    }

    ctx.fillStyle = VPALETTE.ink;
    ellipse(ctx, -5.5, -42, 2.4, 3);
    ctx.fill();
    ellipse(ctx, 5.5, -42, 2.4, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ellipse(ctx, -6.2, -43.2, 0.9, 1);
    ctx.fill();
    ellipse(ctx, 4.8, -43.2, 0.9, 1);
    ctx.fill();

    ctx.fillStyle = 'rgba(244,140,150,0.5)';
    ellipse(ctx, -10, -37, 3, 2);
    ctx.fill();
    if (!o.skin.faceColor) {
      ellipse(ctx, 10, -37, 3, 2);
      ctx.fill();
    }

    // 페이스페인팅 — 오른뺨 위 작은 마크 (외곽선으로 피부색과 분리).
    if (o.skin.faceColor) {
      ctx.fillStyle = o.skin.faceColor;
      ellipse(ctx, 10, -38, 2.2, 2.2);
      ctx.fill();
      if (o.skin.faceAccent) {
        ctx.strokeStyle = o.skin.faceAccent;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (ear === 'bird' || ear === 'owl') {
      ctx.fillStyle = '#f0b455';
      ctx.beginPath();
      ctx.moveTo(-3.5, -37);
      ctx.lineTo(3.5, -37);
      ctx.lineTo(0, -31);
      ctx.closePath();
      ctx.fill();
    } else {
      if (furry) {
        ctx.fillStyle = VPALETTE.ink;
        ellipse(ctx, 0, -37, 2, 1.5);
        ctx.fill();
      }
      ctx.strokeStyle = VPALETTE.ink;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, furry ? -34.5 : -37, 3.2, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/** NPC 머리 위 말풍선 */
export function drawVBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  time: number,
): void {
  const { sx, sy } = toScreen(x, y);
  const bob = Math.sin(time * 2) * 1.5;
  ctx.save();
  ctx.font = `600 11px ${UI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = Math.min(150, ctx.measureText(text).width + 16);
  const top = sy - 78 + bob;
  ctx.fillStyle = 'rgba(255,253,247,0.96)';
  roundRect(ctx, sx - w / 2, top - 12, w, 24, 12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx - 4, top + 11);
  ctx.lineTo(sx + 5, top + 11);
  ctx.lineTo(sx, top + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = VPALETTE.ink;
  ctx.fillText(text, sx, top, w - 12);
  ctx.restore();
}

/** 배치 커서 — w×h 풋프린트를 초록/빨강으로 표시 */
export function drawVPlacementCursor(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  w: number,
  h: number,
  ok: boolean,
  time: number,
): void {
  const pulse = (Math.sin(time * 5) + 1) / 2;
  ctx.save();
  vFootprintPath(ctx, bx, by, bx + w, by + h);
  ctx.fillStyle = ok
    ? `rgba(120,220,140,${0.3 + pulse * 0.2})`
    : `rgba(240,110,110,${0.3 + pulse * 0.2})`;
  ctx.fill();
  ctx.strokeStyle = ok ? '#3fa85c' : '#d24d4d';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- 생동감

/** 나비 — 꽃밭 사이를 하늘하늘 나는 앰비언트 개체 */
export function drawVButterfly(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hover: number,
  flap: number,
  color: string,
): void {
  const { sx, sy } = toScreen(x, y);
  const cy = sy - 26 - hover;
  const wing = Math.abs(Math.sin(flap));
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.92;
  ellipse(ctx, sx - 3 - wing * 2.5, cy - 1, 3.6, 2.4 + wing * 1.8);
  ctx.fill();
  ellipse(ctx, sx + 3 + wing * 2.5, cy - 1, 3.6, 2.4 + wing * 1.8);
  ctx.fill();
  ctx.fillStyle = VPALETTE.ink;
  ellipse(ctx, sx, cy, 1.2, 3);
  ctx.fill();
  ctx.restore();
}

/** 갈매기 — 바다 위를 도는 흰 새 */
export function drawVGull(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  alt: number,
  flap: number,
): void {
  const { sx, sy } = toScreen(x, y);
  const cy = sy - alt;
  const w = Math.sin(flap) * 4;
  ctx.save();
  // 수면 그림자.
  ctx.fillStyle = 'rgba(30,60,70,0.12)';
  ellipse(ctx, sx, sy, 7, 2.6);
  ctx.fill();
  ctx.strokeStyle = '#fdfdfa';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx - 8, cy - w);
  ctx.quadraticCurveTo(sx - 3, cy + 2, sx, cy);
  ctx.quadraticCurveTo(sx + 3, cy + 2, sx + 8, cy - w);
  ctx.stroke();
  ctx.restore();
}
