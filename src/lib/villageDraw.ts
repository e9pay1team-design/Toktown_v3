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
/** 두 스크린 코너 사이 수직 벽면 경로 — 부분 풋프린트 볼륨(한옥 등)용 */
function vWallPath(
  ctx: CanvasRenderingContext2D,
  p: { sx: number; sy: number },
  q: { sx: number; sy: number },
  h0: number,
  h1: number,
): void {
  ctx.beginPath();
  ctx.moveTo(p.sx, p.sy - h0);
  ctx.lineTo(q.sx, q.sy - h0);
  ctx.lineTo(q.sx, q.sy - h1);
  ctx.lineTo(p.sx, p.sy - h1);
  ctx.closePath();
}

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
  } else if (id === 'gyeongui-line') {
    // 경의선숲길 — 입체 둔덕 + 자갈 철길 + 산책 데크 + 가로수·역명판 (낮은 랜드마크).
    vFootprintPath(ctx, x0, y0, x1, y1, 2);
    ctx.fillStyle = '#8fbf6d';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.1, y0 + 0.1, x1 - 0.1, y1 - 0.1, 4);
    ctx.fillStyle = '#a5d588';
    ctx.fill();
    // 자갈 노반 띠 (철길 아래).
    ctx.beginPath();
    const g0 = toScreen(bx + 0.12, by + 0.6);
    const g1 = toScreen(bx + 1.88, by + 0.6);
    const g2 = toScreen(bx + 1.88, by + 1.26);
    const g3 = toScreen(bx + 0.12, by + 1.26);
    ctx.moveTo(g0.sx, g0.sy - 4);
    ctx.lineTo(g1.sx, g1.sy - 4);
    ctx.lineTo(g2.sx, g2.sy - 4);
    ctx.lineTo(g3.sx, g3.sy - 4);
    ctx.closePath();
    ctx.fillStyle = '#cfc6b0';
    ctx.fill();
    ctx.fillStyle = 'rgba(120,105,92,0.55)';
    for (let u = 0.18; u < 1.84; u += 0.11) {
      const gp = toScreen(bx + u, by + 0.68 + ((u * 7) % 1) * 0.5);
      ellipse(ctx, gp.sx, gp.sy - 4, 1.2, 0.85);
      ctx.fill();
    }
    // 침목 + 레일 2줄 (짙은 강철 + 윗면 하이라이트).
    ctx.strokeStyle = '#9c7c56';
    ctx.lineWidth = 3.6;
    for (let u = 0.26; u <= 1.78; u += 0.18) {
      const t0 = toScreen(bx + u, by + 0.68);
      const t1 = toScreen(bx + u, by + 1.18);
      ctx.beginPath();
      ctx.moveTo(t0.sx, t0.sy - 4);
      ctx.lineTo(t1.sx, t1.sy - 4);
      ctx.stroke();
    }
    for (const v of [0.78, 1.08]) {
      const r0 = toScreen(bx + 0.14, by + v);
      const r1 = toScreen(bx + 1.86, by + v);
      ctx.strokeStyle = '#5f5648';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(r0.sx, r0.sy - 4);
      ctx.lineTo(r1.sx, r1.sy - 4);
      ctx.stroke();
      ctx.strokeStyle = '#d8ccb4';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(r0.sx, r0.sy - 5.5);
      ctx.lineTo(r1.sx, r1.sy - 5.5);
      ctx.stroke();
    }
    // 산책 데크 (좌하단 면 앞) + 벤치 2.
    faceQuad(ctx, D, C, 0.52, 0.96, 0, 6);
    ctx.fillStyle = '#c9885a';
    ctx.fill();
    ctx.strokeStyle = '#b37845';
    ctx.lineWidth = 1;
    for (const u of [0.6, 0.68, 0.76, 0.84, 0.92]) {
      const dp0 = facePoint(D, C, u, 0);
      const dp1 = facePoint(D, C, u, 6);
      ctx.beginPath();
      ctx.moveTo(dp0.x, dp0.y);
      ctx.lineTo(dp1.x, dp1.y);
      ctx.stroke();
    }
    for (const bu of [0.64, 0.86]) {
      const bp = facePoint(D, C, bu, 6);
      ctx.fillStyle = '#8a6b52';
      ctx.fillRect(bp.x - 7, bp.y - 8, 14, 3);
      ctx.fillRect(bp.x - 6, bp.y - 5, 2.4, 5);
      ctx.fillRect(bp.x + 3.6, bp.y - 5, 2.4, 5);
    }
    // 가로수 4그루 — 층진 수관 + 바람 스웨이 (숲길의 주인공).
    for (const [tx, ty, r] of [
      [0.4, 0.32, 17],
      [1.5, 0.26, 14],
      [1.74, 1.5, 15],
      [0.3, 1.56, 12],
    ] as const) {
      const p = toScreen(bx + tx, by + ty);
      const th = 16 + r * 0.7;
      const sw = Math.sin(opts.time * 1.4 + tx * 7) * 1.5;
      ctx.fillStyle = 'rgba(40,50,35,0.16)';
      ellipse(ctx, p.sx, p.sy - 1, r * 0.95, r * 0.34);
      ctx.fill();
      ctx.fillStyle = '#8a6b52';
      ctx.fillRect(p.sx - 2.6, p.sy - th, 5.2, th - 2);
      ctx.fillStyle = '#5e9147';
      ellipse(ctx, p.sx + sw, p.sy - th - r * 0.75, r, r * 0.95);
      ctx.fill();
      ctx.fillStyle = '#6ba254';
      ellipse(ctx, p.sx + sw - r * 0.32, p.sy - th - r * 0.95, r * 0.66, r * 0.6);
      ctx.fill();
      ctx.fillStyle = '#8cc073';
      ellipse(ctx, p.sx + sw + r * 0.3, p.sy - th - r * 0.5, r * 0.5, r * 0.44);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ellipse(ctx, p.sx + sw - r * 0.4, p.sy - th - r * 1.05, r * 0.3, r * 0.26);
      ctx.fill();
    }
    // 산책 가로등 — 헤드 하우징 + 은은한 온광.
    const lampP = toScreen(bx + 1.08, by + 1.62);
    ctx.strokeStyle = '#4b4038';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(lampP.sx, lampP.sy);
    ctx.lineTo(lampP.sx, lampP.sy - 30);
    ctx.stroke();
    ctx.fillStyle = '#4b4038';
    ctx.fillRect(lampP.sx - 4.4, lampP.sy - 33, 8.8, 3.4);
    ctx.fillStyle = 'rgba(255,214,107,0.16)';
    ellipse(ctx, lampP.sx, lampP.sy - 29, 6.5, 6.5);
    ctx.fill();
    ctx.fillStyle = '#ffd66b';
    ellipse(ctx, lampP.sx, lampP.sy - 29.2, 2.6, 2.6);
    ctx.fill();
    // 역명판 팻말 — 경의선 옛 역 표지.
    const sgn = toScreen(bx + 1.6, by + 1.68);
    ctx.fillStyle = '#8a6b52';
    ctx.fillRect(sgn.sx - 9, sgn.sy - 17, 2.6, 17);
    ctx.fillRect(sgn.sx + 6.4, sgn.sy - 17, 2.6, 17);
    ctx.fillStyle = '#a3835f';
    ctx.fillRect(sgn.sx - 12, sgn.sy - 24, 24, 9);
    ctx.fillStyle = '#f1ead5';
    ctx.fillRect(sgn.sx - 10.4, sgn.sy - 22.6, 20.8, 6.2);
    ctx.strokeStyle = '#5b4a3f';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(sgn.sx - 7, sgn.sy - 20.6);
    ctx.lineTo(sgn.sx + 7, sgn.sy - 20.6);
    ctx.moveTo(sgn.sx - 5, sgn.sy - 18.2);
    ctx.lineTo(sgn.sx + 5, sgn.sy - 18.2);
    ctx.stroke();
    // 들꽃 + 풀포기.
    for (const [fx, fy, c] of [
      [-34, 12, '#f2a7c3'],
      [-20, 18, '#fffdf7'],
      [24, 16, '#ffd66b'],
      [40, 8, '#f2a7c3'],
    ] as const) {
      ctx.fillStyle = c;
      ellipse(ctx, top.sx + fx, top.sy + fy, 2.2, 2.2);
      ctx.fill();
      ctx.fillStyle = '#e8a63c';
      ellipse(ctx, top.sx + fx, top.sy + fy, 0.8, 0.8);
      ctx.fill();
    }
    ctx.strokeStyle = VPALETTE.grassBlade;
    ctx.lineWidth = 1.4;
    for (const [gx2, gy2] of [
      [-46, 6],
      [42, 10],
      [6, 24],
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(top.sx + gx2, top.sy + gy2);
      ctx.lineTo(top.sx + gx2 - 2, top.sy + gy2 - 6);
      ctx.moveTo(top.sx + gx2 + 3, top.sy + gy2);
      ctx.lineTo(top.sx + gx2 + 5, top.sy + gy2 - 5);
      ctx.stroke();
    }
  } else if (id === 'busking-stage') {
    // 홍대 버스킹 무대 — 목재 데크 + 스피커·앰프·마이크·기타 + 알전구·가랜드.
    faceQuad(ctx, D, C, 0, 1, 0, 11);
    ctx.fillStyle = '#a06a44';
    ctx.fill();
    faceQuad(ctx, C, B, 0, 1, 0, 11);
    ctx.fillStyle = '#8f5c3a';
    ctx.fill();
    // 데크 스커트 판자선.
    ctx.strokeStyle = 'rgba(74,52,34,0.5)';
    ctx.lineWidth = 1;
    for (const u of [0.2, 0.4, 0.6, 0.8]) {
      const s0 = facePoint(D, C, u, 0);
      const s1 = facePoint(D, C, u, 11);
      ctx.beginPath();
      ctx.moveTo(s0.x, s0.y);
      ctx.lineTo(s1.x, s1.y);
      ctx.stroke();
      const s2 = facePoint(C, B, u, 0);
      const s3 = facePoint(C, B, u, 11);
      ctx.beginPath();
      ctx.moveTo(s2.x, s2.y);
      ctx.lineTo(s3.x, s3.y);
      ctx.stroke();
    }
    vFootprintPath(ctx, x0, y0, x1, y1, 11);
    ctx.fillStyle = '#c9885a';
    ctx.fill();
    ctx.strokeStyle = '#b37845';
    ctx.lineWidth = 1.4;
    for (const v of [0.45, 0.8, 1.15, 1.5]) {
      const p0 = toScreen(bx + 0.12, by + v);
      const p1 = toScreen(bx + 1.88, by + v);
      ctx.beginPath();
      ctx.moveTo(p0.sx, p0.sy - 11);
      ctx.lineTo(p1.sx, p1.sy - 11);
      ctx.stroke();
    }
    // 스피커 스택 2 (앞 코너).
    for (const [ux, uy] of [
      [0.32, 1.55],
      [1.62, 0.35],
    ] as const) {
      const sp = toScreen(bx + ux, by + uy);
      ctx.fillStyle = '#2b2f3e';
      ctx.fillRect(sp.sx - 7, sp.sy - 34, 14, 23);
      ctx.strokeStyle = '#5b6377';
      ctx.lineWidth = 1.3;
      ctx.strokeRect(sp.sx - 7, sp.sy - 34, 14, 23);
      ctx.fillStyle = '#1d212c';
      ellipse(ctx, sp.sx, sp.sy - 27.5, 4.4, 4.4);
      ctx.fill();
      ellipse(ctx, sp.sx, sp.sy - 16.5, 3.2, 3.2);
      ctx.fill();
      ctx.strokeStyle = '#5b6377';
      ctx.beginPath();
      ctx.arc(sp.sx, sp.sy - 27.5, 4.4, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 앰프 + 스티커.
    const amp = toScreen(bx + 0.6, by + 0.62);
    ctx.fillStyle = '#3b4252';
    ctx.fillRect(amp.sx - 9, amp.sy - 31, 18, 20);
    ctx.strokeStyle = '#5b6377';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(amp.sx - 9, amp.sy - 31, 18, 20);
    ctx.fillStyle = '#2b2f3e';
    ellipse(ctx, amp.sx, amp.sy - 18.5, 5, 5);
    ctx.fill();
    ctx.fillStyle = '#f2705e';
    ctx.fillRect(amp.sx - 6.5, amp.sy - 29, 5, 3.4);
    ctx.fillStyle = '#7bc47f';
    ctx.fillRect(amp.sx + 2, amp.sy - 28, 4, 4);
    // 마이크 스탠드 + 케이블.
    const mic = toScreen(bx + 1.12, by + 1.02);
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(mic.sx, mic.sy - 11);
    ctx.lineTo(mic.sx, mic.sy - 34);
    ctx.lineTo(mic.sx + 6, mic.sy - 39);
    ctx.stroke();
    ctx.fillStyle = '#5b5566';
    ellipse(ctx, mic.sx + 7.5, mic.sy - 40, 3.4, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(43,43,51,0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(mic.sx, mic.sy - 11);
    ctx.quadraticCurveTo(mic.sx - 10, mic.sy - 6, amp.sx + 4, amp.sy - 10);
    ctx.stroke();
    // 통기타 (스탠드).
    ctx.save();
    const gt = toScreen(bx + 1.52, by + 1.28);
    ctx.translate(gt.sx, gt.sy);
    ctx.rotate(0.16);
    ctx.fillStyle = '#d89a6a';
    ellipse(ctx, 0, -16, 8, 6.6);
    ctx.fill();
    ellipse(ctx, 0, -23, 5.8, 4.6);
    ctx.fill();
    ctx.strokeStyle = '#b37845';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -16, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#5b4a3f';
    ellipse(ctx, 0, -19.5, 2.4, 2.4);
    ctx.fill();
    ctx.fillRect(-1.5, -44, 3, 22);
    ctx.fillStyle = '#3d3129';
    ctx.fillRect(-2.6, -48, 5.2, 5);
    ctx.strokeStyle = '#fff3dc';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-1, -43);
    ctx.lineTo(-1, -10);
    ctx.moveTo(1, -43);
    ctx.lineTo(1, -10);
    ctx.stroke();
    ctx.restore();
    // 폴대 2 + 가랜드(삼각 깃발) + 알전구.
    ctx.strokeStyle = '#5b4a3f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(D.sx + 6, D.sy - 4);
    ctx.lineTo(D.sx + 6, D.sy - 52);
    ctx.moveTo(B.sx - 6, B.sy - 4);
    ctx.lineTo(B.sx - 6, B.sy - 52);
    ctx.stroke();
    ctx.fillStyle = '#5b4a3f';
    ctx.fillRect(D.sx + 2.5, D.sy - 6, 7, 4);
    ctx.fillRect(B.sx - 9.5, B.sy - 6, 7, 4);
    const bunt = (t: number) => {
      const bxp = (1 - t) * (1 - t) * (D.sx + 6) + 2 * (1 - t) * t * top.sx + t * t * (B.sx - 6);
      const byp = (1 - t) * (1 - t) * (D.sy - 50) + 2 * (1 - t) * t * (top.sy - 30) + t * t * (B.sy - 50);
      return { x: bxp, y: byp };
    };
    ctx.strokeStyle = '#8c7b6e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(D.sx + 6, D.sy - 50);
    ctx.quadraticCurveTo(top.sx, top.sy - 30, B.sx - 6, B.sy - 50);
    ctx.stroke();
    const flagC = ['#f2705e', '#ffd66b', '#7bc47f', '#8b79c9', '#5eb3cc'];
    for (let i = 0; i < 5; i++) {
      const t = 0.14 + i * 0.18;
      const p0 = bunt(t);
      const p1 = bunt(t + 0.07);
      ctx.fillStyle = flagC[i];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2 + 8);
      ctx.closePath();
      ctx.fill();
    }
    for (let i = 0; i <= 6; i++) {
      const p = bunt(i / 6);
      const tw = 0.75 + Math.sin(opts.time * 3 + i * 1.7) * 0.25;
      ctx.fillStyle = i % 2 ? `rgba(255,214,107,${tw})` : `rgba(242,167,195,${tw})`;
      ellipse(ctx, p.x, p.y - 3, 2.2, 2.2);
      ctx.fill();
    }
  } else if (id === 'geunjeongjeon') {
    // 근정전 — 2단 월대·계단 + 붉은 기둥·단청 + 처마 살린 2단 팔작지붕.
    faceQuad(ctx, D, C, 0, 1, 0, 12);
    ctx.fillStyle = '#e8e0d2';
    ctx.fill();
    faceQuad(ctx, C, B, 0, 1, 0, 12);
    ctx.fillStyle = '#d5cbb8';
    ctx.fill();
    vFootprintPath(ctx, x0, y0, x1, y1, 12);
    ctx.fillStyle = '#efeae0';
    ctx.fill();
    faceQuad(ctx, D, C, 0.12, 0.88, 12, 22);
    ctx.fillStyle = '#e0d7c6';
    ctx.fill();
    faceQuad(ctx, C, B, 0.12, 0.88, 12, 22);
    ctx.fillStyle = '#cdc2ac';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.12, y0 + 0.12, x1 - 0.12, y1 - 0.12, 22);
    ctx.fillStyle = '#e9e3d6';
    ctx.fill();
    // 월대 난간 기둥 점 + 정면 계단.
    ctx.fillStyle = '#c3b8a0';
    for (const u of [0.15, 0.35, 0.55, 0.75, 0.92]) {
      const n0 = facePoint(D, C, u, 12);
      const n1 = facePoint(C, B, u, 12);
      ctx.fillRect(n0.x - 1.2, n0.y - 5, 2.4, 5);
      ctx.fillRect(n1.x - 1.2, n1.y - 5, 2.4, 5);
    }
    const stair = facePoint(D, C, 0.5, 0);
    ctx.fillStyle = '#d9d0bd';
    ctx.fillRect(stair.x - 9, stair.y - 22, 18, 22);
    ctx.strokeStyle = '#b3a88f';
    ctx.lineWidth = 1.2;
    for (let sy2 = 4; sy2 <= 20; sy2 += 4) {
      ctx.beginPath();
      ctx.moveTo(stair.x - 9, stair.y - sy2);
      ctx.lineTo(stair.x + 9, stair.y - sy2);
      ctx.stroke();
    }
    // 본전 벽 — 붉은 기둥 + 창방 + 창호.
    faceQuad(ctx, D, C, 0.2, 0.8, 22, 46);
    ctx.fillStyle = '#b8574a';
    ctx.fill();
    faceQuad(ctx, C, B, 0.2, 0.8, 22, 46);
    ctx.fillStyle = '#9c4438';
    ctx.fill();
    for (const u of [0.24, 0.415, 0.585, 0.76]) {
      faceQuad(ctx, D, C, u - 0.018, u + 0.018, 22, 46);
      ctx.fillStyle = '#7d3025';
      ctx.fill();
      faceQuad(ctx, C, B, u - 0.018, u + 0.018, 22, 46);
      ctx.fillStyle = '#6b281f';
      ctx.fill();
    }
    for (const uu of [0.32, 0.5, 0.68]) {
      const w0 = facePoint(D, C, uu, 30);
      ctx.fillStyle = '#f5efdc';
      ctx.fillRect(w0.x - 4.5, w0.y - 10, 9, 10);
      ctx.strokeStyle = '#8a5a40';
      ctx.lineWidth = 0.9;
      ctx.strokeRect(w0.x - 4.5, w0.y - 10, 9, 10);
      ctx.beginPath();
      ctx.moveTo(w0.x, w0.y - 10);
      ctx.lineTo(w0.x, w0.y);
      ctx.moveTo(w0.x - 4.5, w0.y - 5);
      ctx.lineTo(w0.x + 4.5, w0.y - 5);
      ctx.stroke();
    }
    // 단청 띠 (지붕 밑 초록).
    faceQuad(ctx, D, C, 0.18, 0.82, 46, 50);
    ctx.fillStyle = '#3f6d4e';
    ctx.fill();
    faceQuad(ctx, C, B, 0.18, 0.82, 46, 50);
    ctx.fillStyle = '#345c41';
    ctx.fill();
    // 1단 지붕 — 처마 겹.
    vFootprintPath(ctx, x0 - 0.16, y0 - 0.16, x1 + 0.16, y1 + 0.16, 54);
    ctx.fillStyle = '#3f4a55';
    ctx.fill();
    vFootprintPath(ctx, x0 - 0.02, y0 - 0.02, x1 + 0.02, y1 + 0.02, 58);
    ctx.fillStyle = '#4e5a66';
    ctx.fill();
    // 2단 지붕.
    faceQuad(ctx, D, C, 0.32, 0.68, 58, 68);
    ctx.fillStyle = '#a34e42';
    ctx.fill();
    faceQuad(ctx, C, B, 0.32, 0.68, 58, 68);
    ctx.fillStyle = '#8d4237';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.24, y0 + 0.24, x1 - 0.24, y1 - 0.24, 72);
    ctx.fillStyle = '#3f4a55';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.32, y0 + 0.32, x1 - 0.32, y1 - 0.32, 76);
    ctx.fillStyle = '#5d6b78';
    ctx.fill();
    // 용마루 + 취두 + 잡상.
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(top.sx - 11, top.sy - 77);
    ctx.lineTo(top.sx + 11, top.sy - 77);
    ctx.stroke();
    ctx.fillStyle = '#2f3841';
    ctx.fillRect(top.sx - 14, top.sy - 80, 4.5, 6);
    ctx.fillRect(top.sx + 9.5, top.sy - 80, 4.5, 6);
    for (const [jx, jy] of [
      [-30, -62],
      [-22, -66],
      [30, -62],
      [22, -66],
    ] as const) {
      ellipse(ctx, top.sx + jx, top.sy + jy, 1.6, 2);
      ctx.fill();
    }
  } else if (id === 'bukchon-hanok') {
    // 북촌 한옥마을 — 마당 + 본채·별채(회벽·목구조·기와) + 감나무·돌담·장독대.
    vFootprintPath(ctx, x0, y0, x1, y1, 2);
    ctx.fillStyle = '#e5decb';
    ctx.fill();
    ctx.fillStyle = 'rgba(180,166,140,0.4)';
    for (let u = 0.25; u < 1.8; u += 0.3) {
      const yd = toScreen(bx + u, by + 1.55 + ((u * 5) % 1) * 0.3);
      ellipse(ctx, yd.sx, yd.sy - 2, 1.6, 1);
      ctx.fill();
    }
    // 본채 (뒤쪽 크게) — 회벽 + 목구조 + 창호.
    const a0x = bx + 0.1;
    const a0y = by + 0.1;
    const a1x = bx + 1.44;
    const a1y = by + 1.1;
    const aD = toScreen(a0x, a1y);
    const aC = toScreen(a1x, a1y);
    const aB = toScreen(a1x, a0y);
    vWallPath(ctx, aD, aC, 2, 30);
    ctx.fillStyle = '#f5efdc';
    ctx.fill();
    vWallPath(ctx, aC, aB, 2, 30);
    ctx.fillStyle = '#e6ddc9';
    ctx.fill();
    // 기단선.
    vWallPath(ctx, aD, aC, 2, 5);
    ctx.fillStyle = '#d9d2c2';
    ctx.fill();
    vWallPath(ctx, aC, aB, 2, 5);
    ctx.fill();
    // 기둥·인방 (목구조).
    ctx.fillStyle = '#7a5c42';
    for (const t of [0, 0.33, 0.66, 1]) {
      const px2 = aD.sx + (aC.sx - aD.sx) * t;
      const py2 = aD.sy + (aC.sy - aD.sy) * t;
      ctx.fillRect(px2 - 1.5, py2 - 30, 3, 28);
    }
    for (const t of [0.5, 1]) {
      const qx2 = aC.sx + (aB.sx - aC.sx) * t;
      const qy2 = aC.sy + (aB.sy - aC.sy) * t;
      ctx.fillRect(qx2 - 1.5, qy2 - 30, 3, 28);
    }
    vWallPath(ctx, aD, aC, 27.5, 30);
    ctx.fill();
    vWallPath(ctx, aC, aB, 27.5, 30);
    ctx.fill();
    // 창호 (좌면 문살 2짝) + 대청 마루문 + 우면 창.
    for (const t of [0.17, 0.5] as const) {
      const wx = aD.sx + (aC.sx - aD.sx) * t;
      const wy = aD.sy + (aC.sy - aD.sy) * t;
      ctx.fillStyle = '#fbf3df';
      ctx.fillRect(wx - 6, wy - 24, 12, 16);
      ctx.strokeStyle = '#8a6b52';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx - 6, wy - 24, 12, 16);
      ctx.beginPath();
      ctx.moveTo(wx, wy - 24);
      ctx.lineTo(wx, wy - 8);
      ctx.moveTo(wx - 6, wy - 16);
      ctx.lineTo(wx + 6, wy - 16);
      ctx.stroke();
    }
    {
      const mx = aD.sx + (aC.sx - aD.sx) * 0.83;
      const my = aD.sy + (aC.sy - aD.sy) * 0.83;
      ctx.fillStyle = '#8a6b52';
      ctx.fillRect(mx - 5.5, my - 24, 11, 19);
      ctx.strokeStyle = '#5b4433';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx, my - 24);
      ctx.lineTo(mx, my - 5);
      ctx.stroke();
      const rx2 = aC.sx + (aB.sx - aC.sx) * 0.28;
      const ry2 = aC.sy + (aB.sy - aC.sy) * 0.28;
      ctx.fillStyle = '#fbf3df';
      ctx.fillRect(rx2 - 5, ry2 - 23, 10, 14);
      ctx.strokeStyle = '#8a6b52';
      ctx.strokeRect(rx2 - 5, ry2 - 23, 10, 14);
      ctx.beginPath();
      ctx.moveTo(rx2, ry2 - 23);
      ctx.lineTo(rx2, ry2 - 9);
      ctx.stroke();
    }
    // 본채 기와지붕 — 3겹 + 용마루 + 수막새.
    vFootprintPath(ctx, a0x - 0.18, a0y - 0.18, a1x + 0.18, a1y + 0.18, 34);
    ctx.fillStyle = '#5b6470';
    ctx.fill();
    vFootprintPath(ctx, a0x - 0.06, a0y - 0.06, a1x + 0.06, a1y + 0.06, 38);
    ctx.fillStyle = '#6b7280';
    ctx.fill();
    vFootprintPath(ctx, a0x + 0.3, a0y + 0.3, a1x - 0.3, a1y - 0.3, 46);
    ctx.fillStyle = '#7a8290';
    ctx.fill();
    const aTop = toScreen((a0x + a1x) / 2, (a0y + a1y) / 2);
    ctx.strokeStyle = '#4a515e';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(aTop.sx - 11, aTop.sy - 47);
    ctx.lineTo(aTop.sx + 11, aTop.sy - 47);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(aTop.sx - 11, aTop.sy - 45.4);
    ctx.lineTo(aTop.sx + 11, aTop.sy - 45.4);
    ctx.stroke();
    ctx.fillStyle = '#4a515e';
    for (const t of [0.1, 0.28, 0.46, 0.64, 0.82, 0.97]) {
      const e0x = aD.sx + (aC.sx - aD.sx) * t;
      const e0y = aD.sy + (aC.sy - aD.sy) * t;
      ellipse(ctx, e0x - 3.5, e0y - 32.5, 2, 2);
      ctx.fill();
      const e1x = aC.sx + (aB.sx - aC.sx) * t;
      const e1y = aC.sy + (aB.sy - aC.sy) * t;
      ellipse(ctx, e1x + 3.5, e1y - 32.5, 2, 2);
      ctx.fill();
    }
    // 별채 (앞쪽 우측) + 대문.
    const b0x = bx + 1.14;
    const b0y = by + 1.04;
    const b1x = bx + 1.94;
    const b1y = by + 1.78;
    const bD = toScreen(b0x, b1y);
    const bC = toScreen(b1x, b1y);
    const bB = toScreen(b1x, b0y);
    vWallPath(ctx, bD, bC, 2, 19);
    ctx.fillStyle = '#f1ead5';
    ctx.fill();
    vWallPath(ctx, bC, bB, 2, 19);
    ctx.fillStyle = '#e2d8c2';
    ctx.fill();
    ctx.fillStyle = '#7a5c42';
    for (const t of [0.04, 0.96]) {
      const px2 = bD.sx + (bC.sx - bD.sx) * t;
      const py2 = bD.sy + (bC.sy - bD.sy) * t;
      ctx.fillRect(px2 - 1.4, py2 - 19, 2.8, 17);
    }
    const bwx = (bD.sx + bC.sx) / 2;
    const bwy = (bD.sy + bC.sy) / 2;
    ctx.fillStyle = '#7a5c42';
    ctx.fillRect(bwx - 5.5, bwy - 16, 11, 14);
    ctx.strokeStyle = '#5b4433';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bwx, bwy - 16);
    ctx.lineTo(bwx, bwy - 2);
    ctx.stroke();
    ctx.fillStyle = '#d9b45f';
    ellipse(ctx, bwx - 2.4, bwy - 9, 1.1, 1.1);
    ctx.fill();
    ellipse(ctx, bwx + 2.4, bwy - 9, 1.1, 1.1);
    ctx.fill();
    vFootprintPath(ctx, b0x - 0.14, b0y - 0.14, b1x + 0.14, b1y + 0.14, 24);
    ctx.fillStyle = '#525a66';
    ctx.fill();
    vFootprintPath(ctx, b0x - 0.04, b0y - 0.04, b1x + 0.04, b1y + 0.04, 27);
    ctx.fillStyle = '#646c7a';
    ctx.fill();
    vFootprintPath(ctx, b0x + 0.26, b0y + 0.26, b1x - 0.26, b1y - 0.26, 33);
    ctx.fillStyle = '#747c8a';
    ctx.fill();
    const bTop = toScreen((b0x + b1x) / 2, (b0y + b1y) / 2);
    ctx.strokeStyle = '#4a515e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bTop.sx - 6, bTop.sy - 34);
    ctx.lineTo(bTop.sx + 6, bTop.sy - 34);
    ctx.stroke();
    // 감나무 (마당 세로 포인트).
    {
      const tp = toScreen(bx + 0.34, by + 1.34);
      ctx.fillStyle = 'rgba(40,50,35,0.16)';
      ellipse(ctx, tp.sx, tp.sy - 1, 10, 3.6);
      ctx.fill();
      ctx.fillStyle = '#7a5c42';
      ctx.fillRect(tp.sx - 2.2, tp.sy - 19, 4.4, 17);
      ctx.fillStyle = '#6ba254';
      ellipse(ctx, tp.sx, tp.sy - 26, 11.5, 10);
      ctx.fill();
      ctx.fillStyle = '#79ae60';
      ellipse(ctx, tp.sx - 4, tp.sy - 30, 6.5, 5.5);
      ctx.fill();
      ctx.fillStyle = '#f2914e';
      for (const [ox2, oy2] of [
        [-6, -23],
        [2, -20],
        [6, -27],
        [-1, -31],
      ] as const) {
        ellipse(ctx, tp.sx + ox2, tp.sy + oy2, 1.7, 1.7);
        ctx.fill();
      }
    }
    // 돌담 (좌하단 면 앞) + 기와 캡.
    faceQuad(ctx, D, C, 0.02, 0.42, 0, 10);
    ctx.fillStyle = '#d9d2c2';
    ctx.fill();
    ctx.fillStyle = 'rgba(150,140,118,0.6)';
    for (const [wu, wh] of [
      [0.07, 3],
      [0.15, 6.5],
      [0.24, 2.8],
      [0.32, 6],
      [0.39, 3.6],
    ] as const) {
      const wp = facePoint(D, C, wu, wh);
      ellipse(ctx, wp.x, wp.y, 2.3, 1.7);
      ctx.fill();
    }
    const cap0 = facePoint(D, C, 0.0, 10);
    const cap1 = facePoint(D, C, 0.44, 10);
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cap0.x, cap0.y - 1);
    ctx.lineTo(cap1.x, cap1.y - 1);
    ctx.stroke();
    // 장독대 (앞마당) — 항아리 3.
    for (const [jx, jy, jr] of [
      [0.38, 1.62, 4.6],
      [0.58, 1.74, 3.8],
      [0.26, 1.78, 3.2],
    ] as const) {
      const jp = toScreen(bx + jx, by + jy);
      ctx.fillStyle = '#6e4a33';
      ellipse(ctx, jp.sx, jp.sy - jr, jr, jr * 1.05);
      ctx.fill();
      ctx.fillStyle = '#82593d';
      ellipse(ctx, jp.sx - jr * 0.3, jp.sy - jr * 1.25, jr * 0.42, jr * 0.5);
      ctx.fill();
      ctx.fillStyle = '#54382a';
      ellipse(ctx, jp.sx, jp.sy - jr * 2, jr * 0.62, jr * 0.24);
      ctx.fill();
    }
  } else if (id === 'seoul-forest') {
    // 서울숲 — 굽은 산책로 + 수종 다른 나무들 + 꽃사슴 + 팻말 (낮은 랜드마크).
    vFootprintPath(ctx, x0, y0, x1, y1, 2);
    ctx.fillStyle = '#8fbf6d';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.1, y0 + 0.1, x1 - 0.1, y1 - 0.1, 4);
    ctx.fillStyle = '#a5d588';
    ctx.fill();
    // 굽은 자갈 산책로.
    const pw0 = toScreen(bx + 0.28, by + 1.85);
    const pw1 = toScreen(bx + 1.0, by + 1.0);
    const pw2 = toScreen(bx + 1.85, by + 0.6);
    ctx.strokeStyle = '#ded2b6';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pw0.sx, pw0.sy - 4);
    ctx.quadraticCurveTo(pw1.sx - 12, pw1.sy - 4, pw1.sx, pw1.sy - 4);
    ctx.quadraticCurveTo(pw1.sx + 16, pw1.sy - 6, pw2.sx, pw2.sy - 4);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(160,145,116,0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pw0.sx, pw0.sy - 4);
    ctx.quadraticCurveTo(pw1.sx - 12, pw1.sy - 4, pw1.sx, pw1.sy - 4);
    ctx.quadraticCurveTo(pw1.sx + 16, pw1.sy - 6, pw2.sx, pw2.sy - 4);
    ctx.stroke();
    // 나무들 — 큰 참나무 + 은행나무(노랑) + 소나무 느낌.
    const tree = (tx: number, ty: number, r: number, c1: string, c2: string, c3: string) => {
      const p = toScreen(bx + tx, by + ty);
      const sw = Math.sin(opts.time * 1.3 + tx * 6) * 1.3;
      ctx.fillStyle = 'rgba(40,50,35,0.16)';
      ellipse(ctx, p.sx, p.sy - 1, r * 0.95, r * 0.32);
      ctx.fill();
      ctx.fillStyle = '#8a6b52';
      ctx.fillRect(p.sx - 2.6, p.sy - 22, 5.2, 20);
      ctx.fillStyle = c1;
      ellipse(ctx, p.sx + sw, p.sy - 30 - r * 0.3, r, r * 0.92);
      ctx.fill();
      ctx.fillStyle = c2;
      ellipse(ctx, p.sx + sw - r * 0.36, p.sy - 34 - r * 0.3, r * 0.58, r * 0.52);
      ctx.fill();
      ctx.fillStyle = c3;
      ellipse(ctx, p.sx + sw + r * 0.32, p.sy - 27 - r * 0.3, r * 0.42, r * 0.38);
      ctx.fill();
    };
    tree(0.55, 0.55, 17, '#6ba254', '#82bb68', '#8cc073');
    tree(1.55, 1.5, 13, '#6ba254', '#79ae60', '#8cc073');
    tree(1.62, 0.38, 12, '#d9b84a', '#e8ca5f', '#c9a838'); // 은행나무
    tree(0.3, 1.25, 10, '#54885c', '#68a06e', '#7bb281');
    // 꽃사슴 — 서 있는 옆모습.
    const deer = toScreen(bx + 1.06, by + 1.32);
    ctx.fillStyle = 'rgba(40,50,35,0.15)';
    ellipse(ctx, deer.sx, deer.sy - 1, 11, 3.4);
    ctx.fill();
    ctx.fillStyle = '#a9855c';
    ellipse(ctx, deer.sx, deer.sy - 12, 9.5, 6);
    ctx.fill();
    for (const lx of [-6.5, -2.5, 2.5, 6.5]) {
      ctx.fillRect(deer.sx + lx - 1, deer.sy - 9, 2, 9);
    }
    ctx.beginPath();
    ctx.moveTo(deer.sx + 7.5, deer.sy - 14);
    ctx.quadraticCurveTo(deer.sx + 11, deer.sy - 18, deer.sx + 11.5, deer.sy - 22);
    ctx.lineTo(deer.sx + 14.5, deer.sy - 21);
    ctx.quadraticCurveTo(deer.sx + 13, deer.sy - 15, deer.sx + 9, deer.sy - 11);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, deer.sx + 14, deer.sy - 23.5, 4, 3.4);
    ctx.fill();
    ellipse(ctx, deer.sx + 17.5, deer.sy - 22.3, 2.2, 1.7);
    ctx.fill();
    ctx.fillStyle = '#8a6b52';
    ellipse(ctx, deer.sx + 12, deer.sy - 26.5, 1.8, 1);
    ctx.fill();
    ctx.strokeStyle = '#8a6b52';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(deer.sx + 13, deer.sy - 26.5);
    ctx.quadraticCurveTo(deer.sx + 11.5, deer.sy - 31, deer.sx + 8.5, deer.sy - 32);
    ctx.moveTo(deer.sx + 15, deer.sy - 26.5);
    ctx.quadraticCurveTo(deer.sx + 16.5, deer.sy - 31, deer.sx + 19, deer.sy - 31.5);
    ctx.stroke();
    ctx.fillStyle = '#2b2b33';
    ellipse(ctx, deer.sx + 15.2, deer.sy - 23.8, 0.9, 0.9);
    ctx.fill();
    ctx.fillStyle = '#fff3dc';
    for (const [sx2, sy2] of [
      [-4, -14],
      [0, -12],
      [3.5, -14.5],
      [-6, -11],
    ] as const) {
      ellipse(ctx, deer.sx + sx2, deer.sy + sy2, 1, 1);
      ctx.fill();
    }
    ellipse(ctx, deer.sx - 9, deer.sy - 13, 1.6, 2.4);
    ctx.fill();
    // 팻말 + 들꽃 + 나비.
    const sign = toScreen(bx + 0.62, by + 1.72);
    ctx.fillStyle = '#8a6b52';
    ctx.fillRect(sign.sx - 1.6, sign.sy - 16, 3.2, 14);
    ctx.fillStyle = '#c9885a';
    ctx.fillRect(sign.sx - 8, sign.sy - 23, 16, 8);
    ctx.strokeStyle = '#a06a44';
    ctx.lineWidth = 1;
    ctx.strokeRect(sign.sx - 8, sign.sy - 23, 16, 8);
    ctx.strokeStyle = '#7a5c42';
    ctx.beginPath();
    ctx.moveTo(sign.sx - 5, sign.sy - 20.5);
    ctx.lineTo(sign.sx + 5, sign.sy - 20.5);
    ctx.moveTo(sign.sx - 5, sign.sy - 17.5);
    ctx.lineTo(sign.sx + 2, sign.sy - 17.5);
    ctx.stroke();
    for (const [fx, fy, c] of [
      [-40, 8, '#f2a7c3'],
      [30, 16, '#ffd66b'],
      [44, 4, '#fffdf7'],
    ] as const) {
      ctx.fillStyle = c;
      ellipse(ctx, top.sx + fx, top.sy + fy, 2.2, 2.2);
      ctx.fill();
    }
    const bf = Math.sin(opts.time * 2.6) * 4;
    ctx.fillStyle = '#f2a7c3';
    ellipse(ctx, top.sx + 14 + bf, top.sy - 34, 2.2, 1.4);
    ctx.fill();
    ellipse(ctx, top.sx + 17 + bf, top.sy - 35, 2.2, 1.4);
    ctx.fill();
  } else if (id === 'red-brick') {
    // 붉은벽돌 카페 — 벽돌결·아치창 + 천창 2기 + 어닝 입구 + 굴뚝 연기.
    faceQuad(ctx, D, C, 0.04, 0.96, 0, 34);
    ctx.fillStyle = '#b95d50';
    ctx.fill();
    faceQuad(ctx, C, B, 0.04, 0.96, 0, 34);
    ctx.fillStyle = '#a34f42';
    ctx.fill();
    // 벽돌 결 — 가로 모르타르 + 엇갈린 세로 점.
    ctx.strokeStyle = 'rgba(139,64,56,0.8)';
    ctx.lineWidth = 1;
    for (let h = 6; h <= 30; h += 6) {
      const l0 = facePoint(D, C, 0.05, h);
      const l1 = facePoint(D, C, 0.95, h);
      ctx.beginPath();
      ctx.moveTo(l0.x, l0.y);
      ctx.lineTo(l1.x, l1.y);
      ctx.stroke();
      const r0 = facePoint(C, B, 0.05, h);
      const r1 = facePoint(C, B, 0.95, h);
      ctx.beginPath();
      ctx.moveTo(r0.x, r0.y);
      ctx.lineTo(r1.x, r1.y);
      ctx.stroke();
    }
    for (let h = 3; h <= 33; h += 6) {
      for (let u = 0.1 + ((h / 6) % 2) * 0.05; u < 0.95; u += 0.1) {
        const dp = facePoint(D, C, u, h);
        ctx.beginPath();
        ctx.moveTo(dp.x, dp.y - 2.2);
        ctx.lineTo(dp.x, dp.y + 2.2);
        ctx.stroke();
      }
    }
    // 아치창 2 (좌면) + 헌팅 트로피? 대신 벽 램프.
    for (const u of [0.24, 0.52]) {
      const wpt = facePoint(D, C, u, 20);
      ctx.fillStyle = '#ffefc9';
      ctx.beginPath();
      ctx.ellipse(wpt.x, wpt.y - 2, 4.6, 5.6, 0, Math.PI, 0);
      ctx.rect(wpt.x - 4.6, wpt.y - 2, 9.2, 9);
      ctx.fill();
      ctx.strokeStyle = '#8b4038';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(wpt.x, wpt.y - 2, 4.6, 5.6, 0, Math.PI, 0);
      ctx.moveTo(wpt.x - 4.6, wpt.y - 2);
      ctx.lineTo(wpt.x - 4.6, wpt.y + 7);
      ctx.moveTo(wpt.x + 4.6, wpt.y - 2);
      ctx.lineTo(wpt.x + 4.6, wpt.y + 7);
      ctx.moveTo(wpt.x, wpt.y - 7.6);
      ctx.lineTo(wpt.x, wpt.y + 7);
      ctx.stroke();
    }
    // 카페 입구 (좌면 앞쪽) — 문 + 줄무늬 어닝 + 화분.
    const door = facePoint(D, C, 0.8, 0);
    ctx.fillStyle = '#3f4550';
    ctx.fillRect(door.x - 6, door.y - 16, 12, 16);
    ctx.fillStyle = '#ffefc9';
    ctx.fillRect(door.x - 4, door.y - 13.5, 8, 7);
    ctx.fillStyle = '#d9b45f';
    ellipse(ctx, door.x + 3.4, door.y - 6.5, 0.9, 0.9);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? '#fffdf7' : '#f2705e';
      ctx.beginPath();
      ctx.moveTo(door.x - 9 + i * 3.8, door.y - 19);
      ctx.lineTo(door.x - 5.2 + i * 3.8, door.y - 19);
      ctx.lineTo(door.x - 5.2 + i * 3.8, door.y - 16.2);
      ctx.quadraticCurveTo(door.x - 7.1 + i * 3.8, door.y - 14.6, door.x - 9 + i * 3.8, door.y - 16.2);
      ctx.closePath();
      ctx.fill();
    }
    const pot = facePoint(D, C, 0.62, 0);
    ctx.fillStyle = '#a06a44';
    ctx.fillRect(pot.x - 2.6, pot.y - 4.5, 5.2, 4.5);
    ctx.fillStyle = '#6ba254';
    ellipse(ctx, pot.x, pot.y - 7, 3.6, 3.2);
    ctx.fill();
    // 지붕 + 천창(톱니) 2기.
    vFootprintPath(ctx, x0, y0, x1, y1, 34);
    ctx.fillStyle = '#8b4038';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.07, y0 + 0.07, x1 - 0.07, y1 - 0.07, 36);
    ctx.fillStyle = '#9c473d';
    ctx.fill();
    for (const off of [0.22, 1.06]) {
      const s0 = toScreen(bx + 0.3, by + off + 0.62);
      const s1 = toScreen(bx + 1.7 - off * 0.0, by + off + 0.14);
      // 천창 볼륨 — 남쪽 벽(벽돌) + 북쪽 유리 경사.
      const k0 = toScreen(bx + 0.35 + off * 0.35, by + 0.2 + off);
      const k1 = toScreen(bx + 1.62 - off * 0.0 + 0, by + 0.2 + off);
      void s0;
      void s1;
      vWallPath(ctx, k0, k1, 36, 46);
      ctx.fillStyle = '#8b4038';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(k0.sx, k0.sy - 46);
      ctx.lineTo(k1.sx, k1.sy - 46);
      ctx.lineTo(k1.sx - 9, k1.sy - 36 - 4);
      ctx.lineTo(k0.sx - 9, k0.sy - 36 - 4);
      ctx.closePath();
      ctx.fillStyle = '#cfe0e8';
      ctx.fill();
      ctx.strokeStyle = '#9db4be';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((k0.sx + k1.sx) / 2 - 4.5, (k0.sy + k1.sy) / 2 - 44);
      ctx.lineTo((k0.sx + k1.sx) / 2 - 13.5, (k0.sy + k1.sy) / 2 - 38);
      ctx.stroke();
    }
    // 굴뚝 + 연기.
    const chim = toScreen(bx + 1.6, by + 0.42);
    ctx.fillStyle = '#a34f42';
    ctx.fillRect(chim.sx - 5, chim.sy - 66, 10, 32);
    ctx.strokeStyle = '#8b4038';
    ctx.lineWidth = 1.1;
    for (const hh of [56, 48, 40]) {
      ctx.beginPath();
      ctx.moveTo(chim.sx - 5, chim.sy - hh);
      ctx.lineTo(chim.sx + 5, chim.sy - hh);
      ctx.stroke();
    }
    ctx.fillStyle = '#8b4038';
    ctx.fillRect(chim.sx - 6.5, chim.sy - 70, 13, 5);
    for (let i = 0; i < 2; i++) {
      const puff = (opts.time * 8 + i * 10) % 20;
      ctx.fillStyle = `rgba(228,220,208,${0.65 - puff * 0.028})`;
      ellipse(ctx, chim.sx + puff * 0.35, chim.sy - 74 - puff, 3.6 + puff * 0.2, 3 + puff * 0.16);
      ctx.fill();
    }
    // 커피잔 간판 (우면).
    const sign2 = facePoint(C, B, 0.5, 24);
    ctx.fillStyle = '#fffdf7';
    ellipse(ctx, sign2.x, sign2.y, 7, 7);
    ctx.fill();
    ctx.strokeStyle = '#8b4038';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(sign2.x, sign2.y, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#9c6b43';
    ctx.beginPath();
    ctx.moveTo(sign2.x - 3.2, sign2.y - 2);
    ctx.lineTo(sign2.x + 2.8, sign2.y - 2);
    ctx.lineTo(sign2.x + 2.2, sign2.y + 3.4);
    ctx.lineTo(sign2.x - 2.6, sign2.y + 3.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9c6b43';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sign2.x - 1.4, sign2.y - 3.6);
    ctx.quadraticCurveTo(sign2.x - 0.6, sign2.y - 5.2, sign2.x - 1.4, sign2.y - 6.4);
    ctx.moveTo(sign2.x + 1.4, sign2.y - 3.6);
    ctx.quadraticCurveTo(sign2.x + 2.2, sign2.y - 5.2, sign2.x + 1.4, sign2.y - 6.4);
    ctx.stroke();
    // 담쟁이.
    ctx.strokeStyle = '#6ba254';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const ivy = facePoint(C, B, 0.12, 0);
    ctx.moveTo(ivy.x, ivy.y);
    ctx.quadraticCurveTo(ivy.x + 4, ivy.y - 12, ivy.x - 2, ivy.y - 20);
    ctx.stroke();
    ctx.fillStyle = '#79ae60';
    for (const [vx2, vy2] of [
      [1, -7],
      [3, -13],
      [-1, -18],
    ] as const) {
      ellipse(ctx, ivy.x + vx2, ivy.y + vy2, 2.2, 1.8);
      ctx.fill();
    }
  } else if (id === 'gwangan-bridge') {
    // 광안대교 — 2층 상판 슬래브 + 현수 주케이블·행어 + 주탑·조명·돛단배.
    vFootprintPath(ctx, x0, y0, x1, y1, 2);
    ctx.fillStyle = '#8fc0d6';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.13, y0 + 0.13, x1 - 0.13, y1 - 0.13, 3);
    ctx.fillStyle = '#a8d4e4';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 4; i++) {
      const ph = opts.time * 1.8 + i * 1.9;
      const wx = Math.sin(ph) * 4;
      ctx.beginPath();
      ctx.moveTo(top.sx - 34 + wx + i * 17, top.sy + 8 + (i % 2) * 9);
      ctx.quadraticCurveTo(top.sx - 28 + wx + i * 17, top.sy + 5 + (i % 2) * 9, top.sx - 22 + wx + i * 17, top.sy + 8 + (i % 2) * 9);
      ctx.stroke();
    }
    const DK = 24; // 상판 윗면 높이
    const cab = (u: number, h: number) => {
      const p = toScreen(bx + u, by + 1);
      return { x: p.sx, y: p.sy - h };
    };
    // 교각 2 + 수면 반사.
    for (const pu of [0.3, 1.7]) {
      const pb = toScreen(bx + pu, by + 1.1);
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(pb.sx - 3.4, pb.sy - 16, 6.8, 13.5);
      ctx.fillStyle = 'rgba(107,114,128,0.35)';
      ellipse(ctx, pb.sx, pb.sy - 1, 4.6, 1.7);
      ctx.fill();
    }
    // 상판 슬래브 — 윗면 + 전면 파사드(2층 개구 슬롯) + 우측 단면.
    const sA = toScreen(bx + 0.1, by + 0.9);
    const sB2 = toScreen(bx + 1.9, by + 0.9);
    const sC2 = toScreen(bx + 1.9, by + 1.1);
    const sD2 = toScreen(bx + 0.1, by + 1.1);
    ctx.beginPath();
    ctx.moveTo(sA.sx, sA.sy - DK);
    ctx.lineTo(sB2.sx, sB2.sy - DK);
    ctx.lineTo(sC2.sx, sC2.sy - DK);
    ctx.lineTo(sD2.sx, sD2.sy - DK);
    ctx.closePath();
    ctx.fillStyle = '#7a8290';
    ctx.fill();
    vWallPath(ctx, sD2, sC2, 15, DK);
    ctx.fillStyle = '#4d5560';
    ctx.fill();
    vWallPath(ctx, sD2, sC2, 18.4, 20.4);
    ctx.fillStyle = '#2f353d';
    ctx.fill();
    vWallPath(ctx, sC2, sB2, 15, DK);
    ctx.fillStyle = '#3f454f';
    ctx.fill();
    // 차선 (윗면 중앙 점선).
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.1;
    for (let u = 0.22; u < 1.8; u += 0.16) {
      const l0 = cab(u, DK);
      const l1 = cab(u + 0.07, DK);
      ctx.beginPath();
      ctx.moveTo(l0.x, l0.y);
      ctx.lineTo(l1.x, l1.y);
      ctx.stroke();
    }
    // 주탑 2기 (상판 위 A형) + 크로스빔.
    for (const tu of [0.62, 1.38]) {
      const tb = cab(tu, DK);
      ctx.strokeStyle = '#d95a73';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tb.x - 6, tb.y + 3);
      ctx.lineTo(tb.x - 1.6, tb.y - 36);
      ctx.moveTo(tb.x + 6, tb.y + 3);
      ctx.lineTo(tb.x + 1.6, tb.y - 36);
      ctx.stroke();
      ctx.strokeStyle = '#b8455c';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(tb.x - 4.6, tb.y - 12);
      ctx.lineTo(tb.x + 4.6, tb.y - 12);
      ctx.moveTo(tb.x - 3, tb.y - 26);
      ctx.lineTo(tb.x + 3, tb.y - 26);
      ctx.moveTo(tb.x - 2.4, tb.y - 35);
      ctx.lineTo(tb.x + 2.4, tb.y - 35);
      ctx.stroke();
    }
    // 현수 주케이블 (중앙 스팬 새그 + 측경간) + 행어.
    const TWH = DK + 36;
    const cableH = (u: number): number => {
      if (u < 0.62) {
        const t = (0.62 - u) / 0.52;
        return TWH - (TWH - DK - 2.5) * t * t;
      }
      if (u > 1.38) {
        const t = (u - 1.38) / 0.52;
        return TWH - (TWH - DK - 2.5) * t * t;
      }
      const t = (u - 0.62) / 0.76;
      return TWH - 19 * Math.sin(Math.PI * t);
    };
    ctx.strokeStyle = '#c07285';
    ctx.lineWidth = 2;
    ctx.beginPath();
    {
      const c0 = cab(0.1, cableH(0.1));
      ctx.moveTo(c0.x, c0.y);
    }
    for (let u = 0.16; u <= 1.9; u += 0.06) {
      const cp = cab(u, cableH(u));
      ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();
    ctx.strokeStyle = '#c9a6ae';
    ctx.lineWidth = 1;
    for (let u = 0.7; u <= 1.31; u += 0.085) {
      const h0 = cab(u, cableH(u));
      const h1 = cab(u, DK);
      ctx.beginPath();
      ctx.moveTo(h0.x, h0.y);
      ctx.lineTo(h1.x, h1.y);
      ctx.stroke();
    }
    // 조명 (케이블 라인 금/보라 트윙클) + 수면 반짝.
    for (let i = 0; i <= 10; i++) {
      const u = 0.15 + (i / 10) * 1.7;
      const tw = 0.7 + Math.sin(opts.time * 3.2 + i * 1.35) * 0.3;
      ctx.fillStyle = i % 2 ? `rgba(255,214,107,${tw})` : `rgba(180,140,255,${tw})`;
      const lp = cab(u, cableH(u) + 2);
      ellipse(ctx, lp.x, lp.y, 1.8, 1.8);
      ctx.fill();
      if (i % 3 === 0) {
        const rp = toScreen(bx + u, by + 1.32);
        ctx.fillStyle = `rgba(255,214,107,${tw * 0.3})`;
        ellipse(ctx, rp.sx, rp.sy - 2, 2.6, 0.9);
        ctx.fill();
      }
    }
    // 돛단배 (앞바다, 봅질).
    const bob = Math.sin(opts.time * 1.6) * 1.6;
    const boat = toScreen(bx + 0.5, by + 1.6);
    ctx.fillStyle = '#fffdf7';
    ctx.beginPath();
    ctx.moveTo(boat.sx - 7, boat.sy - 4 + bob);
    ctx.lineTo(boat.sx + 7, boat.sy - 4 + bob);
    ctx.lineTo(boat.sx + 4.5, boat.sy + bob);
    ctx.lineTo(boat.sx - 4.5, boat.sy + bob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f2705e';
    ctx.beginPath();
    ctx.moveTo(boat.sx, boat.sy - 5 + bob);
    ctx.lineTo(boat.sx, boat.sy - 16 + bob);
    ctx.lineTo(boat.sx + 7, boat.sy - 6.5 + bob);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'nurimaru') {
    // 누리마루 — 동백섬 + 석재 기단 + 유리홀(창살·온광) + 리브 지붕 + 동백.
    vFootprintPath(ctx, x0, y0, x1, y1, 2);
    ctx.fillStyle = '#8fbf6d';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.1, y0 + 0.1, x1 - 0.1, y1 - 0.1, 4);
    ctx.fillStyle = '#a5d588';
    ctx.fill();
    // 해안 바위 모서리 + 파도.
    const rk = toScreen(bx + 1.82, by + 1.62);
    ctx.fillStyle = '#7c8794';
    ellipse(ctx, rk.sx, rk.sy - 3, 7, 4.5);
    ctx.fill();
    ellipse(ctx, rk.sx + 6, rk.sy - 1, 4.5, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(168,212,228,0.9)';
    ctx.lineWidth = 2;
    const wv = Math.sin(opts.time * 2.4) * 1.5;
    ctx.beginPath();
    ctx.moveTo(rk.sx - 6 + wv, rk.sy + 4);
    ctx.quadraticCurveTo(rk.sx + wv, rk.sy + 1.6, rk.sx + 6 + wv, rk.sy + 4);
    ctx.stroke();
    // 산책로 링.
    ctx.strokeStyle = '#ded2b6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(top.sx, top.sy - 2, 44, 17, 0, 0, Math.PI * 2);
    ctx.stroke();
    // 석재 기단 (원형).
    ctx.fillStyle = '#c9c2b4';
    ellipse(ctx, top.sx, top.sy - 8, 30, 11.5);
    ctx.fill();
    ctx.fillStyle = '#d9d2c2';
    ellipse(ctx, top.sx, top.sy - 11, 30, 11);
    ctx.fill();
    // 유리홀 — 온광 + 창살.
    ctx.fillStyle = '#f5e6c0';
    ctx.beginPath();
    ctx.moveTo(top.sx - 22, top.sy - 13);
    ctx.lineTo(top.sx - 22, top.sy - 30);
    ctx.lineTo(top.sx + 22, top.sy - 30);
    ctx.lineTo(top.sx + 22, top.sy - 13);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, top.sx, top.sy - 13, 22, 8.5);
    ctx.fill();
    ctx.fillStyle = '#dce8ec';
    ellipse(ctx, top.sx, top.sy - 30, 22, 8.5);
    ctx.fill();
    ctx.strokeStyle = '#a5bcc6';
    ctx.lineWidth = 1.2;
    for (const ox2 of [-22, -14.5, -7, 0, 7, 14.5, 22]) {
      ctx.beginPath();
      ctx.moveTo(top.sx + ox2, top.sy - 13 + (Math.abs(ox2) > 15 ? -1 : 3.5) * 0);
      ctx.lineTo(top.sx + ox2, top.sy - 30);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(top.sx, top.sy - 13, 22, 8.5, 0, 0, Math.PI);
    ctx.stroke();
    // 리브 지붕 디스크.
    ctx.fillStyle = '#8fa6b2';
    ellipse(ctx, top.sx, top.sy - 34, 28, 10);
    ctx.fill();
    ctx.fillStyle = '#aec3cd';
    ellipse(ctx, top.sx, top.sy - 37, 28, 9.5);
    ctx.fill();
    ctx.strokeStyle = '#8fa6b2';
    ctx.lineWidth = 1.2;
    for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) {
      ctx.beginPath();
      ctx.moveTo(top.sx + Math.sin(a) * 4, top.sy - 44);
      ctx.lineTo(top.sx + Math.sin(a) * 27, top.sy - 37 + Math.cos(a) * 6);
      ctx.stroke();
    }
    ctx.fillStyle = '#8fa6b2';
    ellipse(ctx, top.sx, top.sy - 44, 8, 3);
    ctx.fill();
    ctx.fillStyle = '#aec3cd';
    ellipse(ctx, top.sx, top.sy - 45.5, 8, 2.8);
    ctx.fill();
    ctx.strokeStyle = '#6e8794';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(top.sx, top.sy - 46);
    ctx.lineTo(top.sx, top.sy - 52);
    ctx.stroke();
    ctx.fillStyle = '#d9485e';
    ellipse(ctx, top.sx, top.sy - 53.5, 1.8, 1.8);
    ctx.fill();
    // 동백 덤불 3 + 낙화.
    for (const [ux, uy, br] of [
      [0.34, 1.5, 9],
      [1.66, 0.42, 8],
      [0.4, 0.5, 7],
    ] as const) {
      const p = toScreen(bx + ux, by + uy);
      ctx.fillStyle = '#5e8c61';
      ellipse(ctx, p.sx, p.sy - 7, br, br * 0.82);
      ctx.fill();
      ctx.fillStyle = '#6da370';
      ellipse(ctx, p.sx - br * 0.35, p.sy - 9.5, br * 0.5, br * 0.42);
      ctx.fill();
      for (const [dx2, dy2] of [
        [-br * 0.4, -br * 0.9],
        [br * 0.35, -br * 0.55],
        [-br * 0.05, -br * 1.15],
      ] as const) {
        ctx.fillStyle = '#d9485e';
        ellipse(ctx, p.sx + dx2, p.sy - 5 + dy2, 2.2, 2.2);
        ctx.fill();
        ctx.fillStyle = '#ffd66b';
        ellipse(ctx, p.sx + dx2, p.sy - 5 + dy2, 0.8, 0.8);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(217,72,94,0.75)';
      ellipse(ctx, p.sx + br * 0.7, p.sy + 1, 1.6, 1.1);
      ctx.fill();
    }
  } else if (id === 'yongduam') {
    // 용두암 — 바다 + 현무암 용머리(뿔·금빛 눈·벌린 입) + 바위 결·포말.
    vFootprintPath(ctx, x0, y0, x1, y1, 2);
    ctx.fillStyle = '#8fc0d6';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.13, y0 + 0.13, x1 - 0.13, y1 - 0.13, 3);
    ctx.fillStyle = '#a8d4e4';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      const ph = opts.time * 1.8 + i * 2.1;
      const wx = Math.sin(ph) * 4;
      ctx.beginPath();
      ctx.moveTo(top.sx - 38 + wx + i * 15, top.sy + 8 + i * 5);
      ctx.quadraticCurveTo(top.sx - 32 + wx + i * 15, top.sy + 5 + i * 5, top.sx - 26 + wx + i * 15, top.sy + 8 + i * 5);
      ctx.stroke();
    }
    // 동반 바위 (기암 둔덕).
    ctx.fillStyle = '#4a515e';
    ellipse(ctx, top.sx - 30, top.sy - 2, 9.5, 5.6);
    ctx.fill();
    ctx.fillStyle = '#3f4550';
    ellipse(ctx, top.sx - 34, top.sy - 4.5, 5.6, 3.8);
    ctx.fill();
    ctx.fillStyle = '#5b6377';
    ellipse(ctx, top.sx - 27, top.sy - 5.5, 3, 1.8);
    ctx.fill();
    // 용머리 본체 — 굵은 목 S커브 + 이마·주둥이 + 벌린 입.
    ctx.fillStyle = '#3f4550';
    ctx.beginPath();
    ctx.moveTo(top.sx - 22, top.sy + 5);
    ctx.quadraticCurveTo(top.sx - 19, top.sy - 20, top.sx - 6, top.sy - 34);
    ctx.quadraticCurveTo(top.sx + 1, top.sy - 44, top.sx + 8, top.sy - 52);
    ctx.quadraticCurveTo(top.sx + 13, top.sy - 58, top.sx + 22, top.sy - 57.5);
    ctx.quadraticCurveTo(top.sx + 32, top.sy - 57, top.sx + 35, top.sy - 50);
    ctx.lineTo(top.sx + 38, top.sy - 46);
    ctx.lineTo(top.sx + 24, top.sy - 46.5);
    // 벌린 입 (아래턱).
    ctx.quadraticCurveTo(top.sx + 33, top.sy - 41, top.sx + 29, top.sy - 36);
    ctx.quadraticCurveTo(top.sx + 23, top.sy - 32, top.sx + 17, top.sy - 35);
    ctx.quadraticCurveTo(top.sx + 19, top.sy - 28, top.sx + 12, top.sy - 23);
    ctx.quadraticCurveTo(top.sx + 3, top.sy - 16, top.sx - 3, top.sy - 15);
    ctx.quadraticCurveTo(top.sx - 8, top.sy - 6, top.sx - 5, top.sy + 5);
    ctx.closePath();
    ctx.fill();
    // 입 안 그림자.
    ctx.fillStyle = '#242a33';
    ctx.beginPath();
    ctx.moveTo(top.sx + 24, top.sy - 46);
    ctx.quadraticCurveTo(top.sx + 32, top.sy - 41.5, top.sx + 28, top.sy - 37.5);
    ctx.quadraticCurveTo(top.sx + 22, top.sy - 34, top.sx + 18, top.sy - 37);
    ctx.closePath();
    ctx.fill();
    // 오른쪽 볕면 파셋 + 왼쪽 음영 크레바스 (현무암 각).
    ctx.fillStyle = '#4a515e';
    ctx.beginPath();
    ctx.moveTo(top.sx - 1, top.sy - 17);
    ctx.lineTo(top.sx + 8, top.sy - 27);
    ctx.lineTo(top.sx + 12, top.sy - 40);
    ctx.lineTo(top.sx + 5, top.sy - 34);
    ctx.lineTo(top.sx - 3, top.sy - 23);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#343a44';
    ctx.beginPath();
    ctx.moveTo(top.sx - 14, top.sy - 4);
    ctx.lineTo(top.sx - 9, top.sy - 14);
    ctx.lineTo(top.sx - 12, top.sy - 15);
    ctx.lineTo(top.sx - 16, top.sy - 6);
    ctx.closePath();
    ctx.fill();
    // 등줄기 하이라이트.
    ctx.strokeStyle = '#5f6880';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(top.sx - 17, top.sy - 8);
    ctx.quadraticCurveTo(top.sx - 14, top.sy - 24, top.sx - 3, top.sy - 34);
    ctx.stroke();
    // 뿔 2 (굵은 바위 뿔) + 수염.
    ctx.strokeStyle = '#4a515e';
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(top.sx + 14, top.sy - 56);
    ctx.quadraticCurveTo(top.sx + 11, top.sy - 64, top.sx + 5, top.sy - 67);
    ctx.moveTo(top.sx + 21, top.sy - 58);
    ctx.quadraticCurveTo(top.sx + 20, top.sy - 66, top.sx + 15, top.sy - 70);
    ctx.stroke();
    ctx.strokeStyle = '#3f4550';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(top.sx + 36, top.sy - 47);
    ctx.quadraticCurveTo(top.sx + 42, top.sy - 44, top.sx + 43, top.sy - 37);
    ctx.stroke();
    // 지층결 (용암 결).
    ctx.strokeStyle = '#6a7388';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(top.sx - 15, top.sy - 6);
    ctx.quadraticCurveTo(top.sx - 11, top.sy - 22, top.sx - 2, top.sy - 30);
    ctx.moveTo(top.sx - 9, top.sy - 2);
    ctx.quadraticCurveTo(top.sx - 4, top.sy - 14, top.sx + 4, top.sy - 21);
    ctx.moveTo(top.sx + 1, top.sy - 36);
    ctx.quadraticCurveTo(top.sx + 6, top.sy - 44, top.sx + 13, top.sy - 49);
    ctx.moveTo(top.sx - 19, top.sy - 12);
    ctx.quadraticCurveTo(top.sx - 16, top.sy - 22, top.sx - 10, top.sy - 28);
    ctx.stroke();
    // 눈 (금빛 + 링) + 콧구멍.
    ctx.fillStyle = '#ffd66b';
    ellipse(ctx, top.sx + 20, top.sy - 51.5, 2.7, 2.7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,214,107,0.45)';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(top.sx + 20, top.sy - 51.5, 4.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#2b2b33';
    ellipse(ctx, top.sx + 20.7, top.sy - 51.5, 1.1, 1.1);
    ctx.fill();
    ctx.fillStyle = '#2b323c';
    ellipse(ctx, top.sx + 33, top.sy - 53, 1.2, 0.9);
    ctx.fill();
    // 포말 링 + 물보라.
    ctx.strokeStyle = 'rgba(255,253,247,0.8)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(top.sx - 12, top.sy + 4, 16, 5.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    const spray = Math.abs(Math.sin(opts.time * 2.2));
    ctx.fillStyle = `rgba(255,253,247,${0.5 + spray * 0.4})`;
    ellipse(ctx, top.sx - 26, top.sy - 4 - spray * 5, 3, 3);
    ctx.fill();
    ellipse(ctx, top.sx + 3, top.sy - 1 - spray * 3.5, 2.3, 2.3);
    ctx.fill();
    ellipse(ctx, top.sx - 18, top.sy - 10 - spray * 6, 1.7, 1.7);
    ctx.fill();
    // 갈매기 2.
    ctx.strokeStyle = '#8c7b6e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(top.sx - 36, top.sy - 48);
    ctx.quadraticCurveTo(top.sx - 33.5, top.sy - 51, top.sx - 31, top.sy - 48);
    ctx.quadraticCurveTo(top.sx - 28.5, top.sy - 51, top.sx - 26, top.sy - 48);
    ctx.moveTo(top.sx + 40, top.sy - 62);
    ctx.quadraticCurveTo(top.sx + 42.5, top.sy - 65, top.sx + 45, top.sy - 62);
    ctx.quadraticCurveTo(top.sx + 47.5, top.sy - 65, top.sx + 50, top.sy - 62);
    ctx.stroke();
  } else if (id === 'dol-hareubang') {
    // 돌하르방 — 현무암 질감·벙거지·왕방울 눈 한 쌍 + 받침돌·귤나무·유채.
    vFootprintPath(ctx, x0, y0, x1, y1, 2);
    ctx.fillStyle = '#a5d588';
    ctx.fill();
    vFootprintPath(ctx, x0 + 0.1, y0 + 0.1, x1 - 0.1, y1 - 0.1, 3);
    ctx.fillStyle = '#cde3ae';
    ctx.fill();
    // 뒤 돌담.
    faceQuad(ctx, D, C, 0.02, 0.35, 0, 8);
    ctx.fillStyle = '#c3bca9';
    ctx.fill();
    const grandpa = (px2: number, py2: number, s2: number, tone: string, toneHi: string) => {
      const p = toScreen(bx + px2, by + py2);
      // 받침돌.
      ctx.fillStyle = '#b7b0a0';
      ellipse(ctx, p.sx, p.sy - 2 * s2, 11 * s2, 4 * s2);
      ctx.fill();
      ctx.fillStyle = '#c9c2b2';
      ellipse(ctx, p.sx, p.sy - 3.5 * s2, 11 * s2, 3.6 * s2);
      ctx.fill();
      // 몸돌.
      ctx.fillStyle = tone;
      ellipse(ctx, p.sx, p.sy - 16 * s2, 9 * s2, 13 * s2);
      ctx.fill();
      // 팔 — 배 위에 위/아래.
      ctx.strokeStyle = '#6e7886';
      ctx.lineWidth = 3 * s2;
      ctx.beginPath();
      ctx.moveTo(p.sx - 8 * s2, p.sy - 19 * s2);
      ctx.quadraticCurveTo(p.sx - 2 * s2, p.sy - 14.5 * s2, p.sx + 5 * s2, p.sy - 16 * s2);
      ctx.moveTo(p.sx + 8 * s2, p.sy - 15 * s2);
      ctx.quadraticCurveTo(p.sx + 2 * s2, p.sy - 10.5 * s2, p.sx - 5 * s2, p.sy - 12 * s2);
      ctx.stroke();
      ctx.fillStyle = toneHi;
      ellipse(ctx, p.sx + 5.5 * s2, p.sy - 16 * s2, 2 * s2, 2 * s2);
      ctx.fill();
      ellipse(ctx, p.sx - 5.5 * s2, p.sy - 12 * s2, 2 * s2, 2 * s2);
      ctx.fill();
      // 머리.
      ctx.fillStyle = toneHi;
      ellipse(ctx, p.sx, p.sy - 30 * s2, 7 * s2, 6.4 * s2);
      ctx.fill();
      // 귀.
      ctx.fillStyle = tone;
      ellipse(ctx, p.sx - 6.8 * s2, p.sy - 29 * s2, 1.6 * s2, 2.6 * s2);
      ctx.fill();
      ellipse(ctx, p.sx + 6.8 * s2, p.sy - 29 * s2, 1.6 * s2, 2.6 * s2);
      ctx.fill();
      // 벙거지 2단.
      ctx.fillStyle = '#7a8492';
      ellipse(ctx, p.sx, p.sy - 34.5 * s2, 7.8 * s2, 2.8 * s2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p.sx, p.sy - 36 * s2, 5.2 * s2, 3.4 * s2, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#87919f';
      ellipse(ctx, p.sx, p.sy - 38.6 * s2, 3.4 * s2, 1.4 * s2);
      ctx.fill();
      // 눈썹 능선 + 왕방울 눈 + 주먹코 + 다문 입.
      ctx.strokeStyle = '#5b6470';
      ctx.lineWidth = 1.6 * s2;
      ctx.beginPath();
      ctx.moveTo(p.sx - 4.6 * s2, p.sy - 33 * s2);
      ctx.quadraticCurveTo(p.sx, p.sy - 34.4 * s2, p.sx + 4.6 * s2, p.sy - 33 * s2);
      ctx.stroke();
      ctx.fillStyle = '#5b6470';
      ellipse(ctx, p.sx - 2.8 * s2, p.sy - 31 * s2, 2.1 * s2, 2.3 * s2);
      ctx.fill();
      ellipse(ctx, p.sx + 2.8 * s2, p.sy - 31 * s2, 2.1 * s2, 2.3 * s2);
      ctx.fill();
      ctx.fillStyle = tone;
      ellipse(ctx, p.sx - 2.8 * s2, p.sy - 30.6 * s2, 0.9 * s2, 1 * s2);
      ctx.fill();
      ellipse(ctx, p.sx + 2.8 * s2, p.sy - 30.6 * s2, 0.9 * s2, 1 * s2);
      ctx.fill();
      ctx.fillStyle = '#67707e';
      ellipse(ctx, p.sx, p.sy - 27.6 * s2, 1.9 * s2, 2.6 * s2);
      ctx.fill();
      ctx.strokeStyle = '#5b6470';
      ctx.lineWidth = 1.2 * s2;
      ctx.beginPath();
      ctx.moveTo(p.sx - 2.4 * s2, p.sy - 24.6 * s2);
      ctx.quadraticCurveTo(p.sx, p.sy - 23.6 * s2, p.sx + 2.4 * s2, p.sy - 24.6 * s2);
      ctx.stroke();
      // 현무암 기공.
      ctx.fillStyle = 'rgba(91,100,112,0.55)';
      for (const [qx2, qy2] of [
        [-4, -20],
        [3, -17],
        [-1.5, -13],
        [5.5, -22],
        [-6, -25],
        [2, -33.5],
        [-3.5, -35.5],
      ] as const) {
        ellipse(ctx, p.sx + qx2 * s2, p.sy + qy2 * s2, 0.9 * s2, 0.9 * s2);
        ctx.fill();
      }
    };
    grandpa(0.72, 1.18, 1.25, '#8f9aa8', '#9aa5b2');
    grandpa(1.52, 0.68, 1.0, '#9aa5b2', '#a6b0bc');
    // 감귤나무 + 유채꽃.
    const tree2 = toScreen(bx + 0.34, by + 1.76);
    ctx.fillStyle = '#8a6b52';
    ctx.fillRect(tree2.sx - 2, tree2.sy - 16, 4, 14);
    ctx.fillStyle = '#5e8c61';
    ellipse(ctx, tree2.sx, tree2.sy - 21, 9.5, 8);
    ctx.fill();
    ctx.fillStyle = '#6da370';
    ellipse(ctx, tree2.sx - 3.5, tree2.sy - 24, 5, 4.2);
    ctx.fill();
    for (const [ox2, oy2] of [
      [-4, -19],
      [3.5, -22.5],
      [0.5, -17],
    ] as const) {
      ctx.fillStyle = '#f5a03c';
      ellipse(ctx, tree2.sx + ox2, tree2.sy + oy2, 2, 2);
      ctx.fill();
    }
    for (const [yx, yy] of [
      [30, 12],
      [36, 7],
      [42, 13],
    ] as const) {
      ctx.strokeStyle = '#7ba85c';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(top.sx + yx, top.sy + yy);
      ctx.lineTo(top.sx + yx, top.sy + yy - 6);
      ctx.stroke();
      ctx.fillStyle = '#ffd66b';
      ellipse(ctx, top.sx + yx, top.sy + yy - 7.5, 2.2, 2.2);
      ctx.fill();
      ctx.fillStyle = '#e8a63c';
      ellipse(ctx, top.sx + yx, top.sy + yy - 7.5, 0.8, 0.8);
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
  'gyeongui-line': '#5f9037',
  'busking-stage': '#8a5cf6',
  geunjeongjeon: '#8d4f3f',
  'bukchon-hanok': '#6b7280',
  'seoul-forest': '#5f9037',
  'red-brick': '#a34f42',
  'gwangan-bridge': '#d95a73',
  nurimaru: '#8fa6b2',
  yongduam: '#3f4550',
  'dol-hareubang': '#8f9aa8',
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
    case 'flowerbed': {
      // 상점 '꽃 화단' — 나무 플랜터 박스 + 흙 + 꽃송이.
      // 색은 배치 시 굴린 variant(p.v)로 3팔레트(핑크/노랑/보라) 중 결정.
      const pal = [
        { petal: '#F2A7C3', deep: '#E87C9B' },
        { petal: '#FFD66B', deep: '#F5A03C' },
        { petal: '#C7B9F2', deep: '#9F86E8' },
      ][Math.min(2, Math.floor(p.v * 3))];
      shadow(ctx, sx, sy + 3, 24);
      // 플랜터 박스 — 낮은 아이소 박스 (높이 8).
      const H = 8;
      const hw = 23;
      const hh = 11.5;
      // 좌하단 면.
      ctx.beginPath();
      ctx.moveTo(sx - hw, sy - H);
      ctx.lineTo(sx, sy + hh - H);
      ctx.lineTo(sx, sy + hh);
      ctx.lineTo(sx - hw, sy);
      ctx.closePath();
      ctx.fillStyle = '#B98A5C';
      ctx.fill();
      // 우하단 면.
      ctx.beginPath();
      ctx.moveTo(sx, sy + hh - H);
      ctx.lineTo(sx + hw, sy - H);
      ctx.lineTo(sx + hw, sy);
      ctx.lineTo(sx, sy + hh);
      ctx.closePath();
      ctx.fillStyle = '#9C714C';
      ctx.fill();
      // 판재 결.
      ctx.strokeStyle = 'rgba(122,92,66,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - hw + 2, sy - H + 4.5);
      ctx.lineTo(sx - 1, sy + hh - H + 4.5);
      ctx.moveTo(sx + 1, sy + hh - H + 4.5);
      ctx.lineTo(sx + hw - 2, sy - H + 4.5);
      ctx.stroke();
      // 윗테 (림) + 흙.
      ctx.beginPath();
      ctx.moveTo(sx, sy - hh - H);
      ctx.lineTo(sx + hw, sy - H);
      ctx.lineTo(sx, sy + hh - H);
      ctx.lineTo(sx - hw, sy - H);
      ctx.closePath();
      ctx.fillStyle = '#CE9F6C';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx, sy - hh - H + 3.6);
      ctx.lineTo(sx + hw - 7, sy - H);
      ctx.lineTo(sx, sy + hh - H - 3.6);
      ctx.lineTo(sx - hw + 7, sy - H);
      ctx.closePath();
      ctx.fillStyle = '#6E4A33';
      ctx.fill();
      ctx.fillStyle = 'rgba(84,56,42,0.7)';
      for (const [dx, dy] of [
        [-9, -1],
        [7, 2],
        [-2, 4],
        [10, -3],
      ] as const) {
        ellipse(ctx, sx + dx, sy - H + dy * 0.6, 1.3, 0.9);
        ctx.fill();
      }
      // 잎 + 꽃송이 5 (본색·짙은색 교차) + 흰 들꽃 포인트.
      ctx.fillStyle = '#79AE60';
      for (const [lx, ly] of [
        [-13, -2],
        [5, 3],
        [12, -4],
        [-4, -6],
      ] as const) {
        ellipse(ctx, sx + lx, sy - H + ly * 0.7 - 3, 3.2, 2.2);
        ctx.fill();
      }
      const spots = [
        [-12, -3, 1],
        [-4, 2.5, 0.9],
        [4, -4.5, 1],
        [12, 0, 0.9],
        [1, -0.5, 1.15],
      ] as const;
      spots.forEach(([fx, fyRaw, s], i) => {
        const fy = sy - H + fyRaw * 0.75;
        const bob = Math.sin(time * 2 + p.v * 8 + i * 1.7) * 0.8;
        ctx.strokeStyle = VPALETTE.grassBlade;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx + fx, fy);
        ctx.lineTo(sx + fx + bob, fy - 7 * s);
        ctx.stroke();
        ctx.fillStyle = i % 2 ? pal.deep : pal.petal;
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2 + i;
          ellipse(ctx, sx + fx + bob + Math.cos(a) * 3 * s, fy - 8 * s + Math.sin(a) * 3 * s, 2.4 * s, 2.4 * s);
          ctx.fill();
        }
        ctx.fillStyle = '#FFE680';
        ellipse(ctx, sx + fx + bob, fy - 8 * s, 1.7 * s, 1.7 * s);
        ctx.fill();
      });
      ctx.fillStyle = '#FFFDF7';
      ellipse(ctx, sx - 8, sy - H - 6, 1.6, 1.6);
      ctx.fill();
      ellipse(ctx, sx + 9, sy - H - 7.5, 1.4, 1.4);
      ctx.fill();
      return;
    }
    case 'darktree': {
      // 뒷숲 캠프 — 짙은 활엽수 (어두운 숲 변주).
      const scale = 0.85 + p.v * 0.3;
      const sway = Math.sin(time * 1.1 + p.v * 9) * 2;
      shadow(ctx, sx, sy + 2, 15 * scale, 0.2);
      ctx.fillStyle = '#3d3227';
      ctx.beginPath();
      ctx.moveTo(sx - 4 * scale, sy);
      ctx.lineTo(sx + 4 * scale, sy);
      ctx.lineTo(sx + 2.5 * scale, sy - 26 * scale);
      ctx.lineTo(sx - 2.5 * scale, sy - 26 * scale);
      ctx.closePath();
      ctx.fill();
      const cy = sy - 34 * scale;
      ctx.fillStyle = '#274634';
      ellipse(ctx, sx + sway, cy + 4 * scale, 20 * scale, 16 * scale);
      ctx.fill();
      ctx.fillStyle = '#325a42';
      ellipse(ctx, sx - 7 * scale + sway, cy, 14 * scale, 12 * scale);
      ctx.fill();
      ellipse(ctx, sx + 8 * scale + sway, cy + 1 * scale, 13 * scale, 11 * scale);
      ctx.fill();
      ctx.fillStyle = '#3f6b4f';
      ellipse(ctx, sx - 2 * scale + sway, cy - 8 * scale, 12 * scale, 9 * scale);
      ctx.fill();
      return;
    }
    case 'darkpine': {
      // 뒷숲 캠프 — 짙은 침엽수.
      const scale = 0.9 + p.v * 0.4;
      const sway = Math.sin(time * 0.9 + p.v * 7) * 1.4;
      shadow(ctx, sx, sy + 2, 12 * scale, 0.2);
      ctx.fillStyle = '#3d3227';
      ctx.fillRect(sx - 3 * scale, sy - 14 * scale, 6 * scale, 14 * scale);
      for (let i = 0; i < 3; i++) {
        const w = (20 - i * 4.5) * scale;
        const yb = sy - 12 * scale - i * 13 * scale;
        ctx.fillStyle = i === 2 ? '#2c5743' : '#1f4433';
        ctx.beginPath();
        ctx.moveTo(sx + sway * (i * 0.4), yb - 20 * scale);
        ctx.lineTo(sx + w, yb);
        ctx.lineTo(sx - w, yb);
        ctx.closePath();
        ctx.fill();
      }
      return;
    }
    case 'tent': {
      // 뒷숲 캠프 — A형 주황 텐트.
      shadow(ctx, sx, sy + 2, 22);
      // 우측(그늘) 면.
      ctx.beginPath();
      ctx.moveTo(sx, sy - 34);
      ctx.lineTo(sx + 22, sy - 24);
      ctx.lineTo(sx + 22, sy - 2);
      ctx.lineTo(sx, sy + 6);
      ctx.closePath();
      ctx.fillStyle = '#c9723a';
      ctx.fill();
      // 정면(입구) 면.
      ctx.beginPath();
      ctx.moveTo(sx, sy - 34);
      ctx.lineTo(sx - 20, sy - 20);
      ctx.lineTo(sx - 20, sy + 2);
      ctx.lineTo(sx, sy + 6);
      ctx.closePath();
      ctx.fillStyle = '#e8944b';
      ctx.fill();
      // 입구 (지퍼 열린 삼각).
      ctx.beginPath();
      ctx.moveTo(sx - 10, sy - 18);
      ctx.lineTo(sx - 16, sy - 1);
      ctx.lineTo(sx - 4, sy + 1);
      ctx.closePath();
      ctx.fillStyle = '#4a3b32';
      ctx.fill();
      // 능선 폴대 + 고정줄.
      ctx.strokeStyle = '#8a6b52';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 34);
      ctx.lineTo(sx, sy - 38);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,253,247,0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx + 22, sy - 24);
      ctx.lineTo(sx + 30, sy - 14);
      ctx.moveTo(sx - 20, sy - 20);
      ctx.lineTo(sx - 27, sy - 10);
      ctx.stroke();
      // 작은 깃발.
      ctx.fillStyle = '#ffd66b';
      ctx.beginPath();
      ctx.moveTo(sx, sy - 38);
      ctx.lineTo(sx + 8, sy - 35.5);
      ctx.lineTo(sx, sy - 33);
      ctx.closePath();
      ctx.fill();
      return;
    }
    case 'campfire': {
      // 뒷숲 캠프 — 돌 화덕 + 장작 + 일렁이는 불꽃 (밤엔 광원).
      shadow(ctx, sx, sy + 1, 13);
      // 돌 링.
      ctx.fillStyle = '#8c8377';
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2;
        ellipse(ctx, sx + Math.cos(a) * 11, sy + Math.sin(a) * 5.2, 3, 2.2);
        ctx.fill();
      }
      // 장작 2개 교차.
      ctx.strokeStyle = '#6e4a33';
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(sx - 7, sy + 1);
      ctx.lineTo(sx + 7, sy - 4);
      ctx.moveTo(sx - 7, sy - 4);
      ctx.lineTo(sx + 7, sy + 1);
      ctx.stroke();
      // 불꽃 — 2겹 일렁임.
      const fl = Math.sin(time * 7 + p.v * 5) * 1.8;
      const fl2 = Math.sin(time * 9.3 + 2) * 1.2;
      ctx.fillStyle = '#f58a3c';
      ctx.beginPath();
      ctx.moveTo(sx - 6, sy - 3);
      ctx.quadraticCurveTo(sx - 7 + fl, sy - 12, sx + fl, sy - 18 - Math.abs(fl));
      ctx.quadraticCurveTo(sx + 7 + fl, sy - 12, sx + 6, sy - 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd66b';
      ctx.beginPath();
      ctx.moveTo(sx - 3, sy - 3.5);
      ctx.quadraticCurveTo(sx - 3 + fl2, sy - 8, sx + fl2 * 0.6, sy - 11 - Math.abs(fl2));
      ctx.quadraticCurveTo(sx + 3 + fl2, sy - 8, sx + 3, sy - 3.5);
      ctx.closePath();
      ctx.fill();
      // 불티.
      const em = (time * 22 + p.v * 30) % 16;
      ctx.fillStyle = `rgba(255,180,90,${Math.max(0, 1 - em / 16)})`;
      ellipse(ctx, sx + Math.sin(time * 3) * 4, sy - 12 - em, 1.2, 1.2);
      ctx.fill();
      return;
    }
    case 'woodswing': {
      // 뒷숲 캠프 — 나무 그네 (살랑 흔들림).
      shadow(ctx, sx, sy + 2, 18);
      ctx.strokeStyle = '#7a5c42';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(sx - 16, sy + 2);
      ctx.lineTo(sx - 9, sy - 30);
      ctx.moveTo(sx + 16, sy + 2);
      ctx.lineTo(sx + 9, sy - 30);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sx - 12, sy - 30);
      ctx.lineTo(sx + 12, sy - 30);
      ctx.stroke();
      const sw = Math.sin(time * 1.7 + p.v * 4) * 3;
      ctx.strokeStyle = '#c9b18c';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sx - 5, sy - 29);
      ctx.lineTo(sx - 5 + sw, sy - 8);
      ctx.moveTo(sx + 5, sy - 29);
      ctx.lineTo(sx + 5 + sw, sy - 8);
      ctx.stroke();
      ctx.fillStyle = '#a3835f';
      ctx.fillRect(sx - 7.5 + sw, sy - 8, 15, 3.4);
      return;
    }
    case 'stump': {
      // 그루터기 — 나이테 윗면.
      const scale = 0.9 + p.v * 0.3;
      shadow(ctx, sx, sy + 1, 10 * scale);
      ctx.fillStyle = '#7a5c42';
      ctx.beginPath();
      ctx.ellipse(sx, sy - 2 * scale, 9 * scale, 5 * scale, 0, 0, Math.PI);
      ctx.lineTo(sx - 9 * scale, sy - 8 * scale);
      ctx.ellipse(sx, sy - 8 * scale, 9 * scale, 5 * scale, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c9b18c';
      ellipse(ctx, sx, sy - 8 * scale, 9 * scale, 5 * scale);
      ctx.fill();
      ctx.strokeStyle = '#a3835f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 8 * scale, 5.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(sx, sy - 8 * scale, 2.4 * scale, 1.3 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    case 'telescope': {
      // 별보기 언덕 — 백사장 망원경.
      shadow(ctx, sx, sy + 1, 10);
      ctx.strokeStyle = '#4a3b32';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 12);
      ctx.lineTo(sx - 7, sy + 2);
      ctx.moveTo(sx, sy - 12);
      ctx.lineTo(sx + 7, sy + 2);
      ctx.moveTo(sx, sy - 12);
      ctx.lineTo(sx, sy + 3);
      ctx.stroke();
      ctx.save();
      ctx.translate(sx, sy - 14);
      ctx.rotate(-0.62);
      ctx.fillStyle = '#3b4a72';
      ctx.fillRect(-4, -3.4, 17, 6.8);
      ctx.fillStyle = '#5a6b94';
      ctx.fillRect(9, -4.2, 5, 8.4);
      ctx.restore();
      const tw = Math.abs(Math.sin(time * 2.6));
      ctx.fillStyle = `rgba(255,253,247,${0.35 + tw * 0.5})`;
      ellipse(ctx, sx + 14, sy - 26, 1.5, 1.5);
      ctx.fill();
      return;
    }
    case 'falls-mountain': {
      // 구름마루 — 무지개 폭포 산 (최종 콘텐츠 랜드마크).
      const W2 = 176;
      shadow(ctx, sx, sy + 8, W2 * 0.52, 0.18);
      // 산 본체 3겹.
      ctx.fillStyle = '#6f675c';
      ctx.beginPath();
      ctx.moveTo(sx - W2 * 0.55, sy + 6);
      ctx.lineTo(sx - W2 * 0.2, sy - 96);
      ctx.lineTo(sx + W2 * 0.06, sy - 118);
      ctx.lineTo(sx + W2 * 0.34, sy - 84);
      ctx.lineTo(sx + W2 * 0.55, sy + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8c8377';
      ctx.beginPath();
      ctx.moveTo(sx - W2 * 0.42, sy + 6);
      ctx.lineTo(sx - W2 * 0.12, sy - 88);
      ctx.lineTo(sx + W2 * 0.06, sy - 112);
      ctx.lineTo(sx + W2 * 0.2, sy - 70);
      ctx.lineTo(sx + W2 * 0.3, sy + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#a39a8c';
      ctx.beginPath();
      ctx.moveTo(sx - W2 * 0.2, sy + 6);
      ctx.lineTo(sx - W2 * 0.02, sy - 74);
      ctx.lineTo(sx + W2 * 0.1, sy - 40);
      ctx.lineTo(sx + W2 * 0.16, sy + 6);
      ctx.closePath();
      ctx.fill();
      // 설선(눈 덮인 꼭대기).
      ctx.fillStyle = '#f4f1ea';
      ctx.beginPath();
      ctx.moveTo(sx - W2 * 0.05, sy - 103);
      ctx.lineTo(sx + W2 * 0.06, sy - 118);
      ctx.lineTo(sx + W2 * 0.17, sy - 100);
      ctx.lineTo(sx + W2 * 0.1, sy - 94);
      ctx.lineTo(sx + W2 * 0.02, sy - 100);
      ctx.closePath();
      ctx.fill();
      // 폭포 — 절벽을 타고 내리는 2줄 물줄기 (흐름 애니메이션).
      const fall = (fx: number, topY: number, botY: number, w: number) => {
        ctx.fillStyle = '#b3d9e8';
        ctx.fillRect(sx + fx - w / 2, sy + topY, w, botY - topY);
        ctx.fillStyle = '#dceef5';
        const seg = 9;
        const off = (time * 34) % seg;
        for (let yy = sy + topY - seg + off; yy < sy + botY; yy += seg) {
          const h = Math.min(4.5, sy + botY - yy);
          if (yy + h > sy + topY) ctx.fillRect(sx + fx - w / 2 + 1, Math.max(yy, sy + topY), w - 2, h);
        }
      };
      fall(2, -66, 2, 13);
      fall(-14, -44, 2, 7);
      // 물안개 + 소(웅덩이) + 포말.
      ctx.fillStyle = '#9fd0e0';
      ellipse(ctx, sx - 2, sy + 8, 34, 12);
      ctx.fill();
      ctx.fillStyle = '#c3e2ec';
      ellipse(ctx, sx - 2, sy + 6.5, 26, 8.5);
      ctx.fill();
      const foam = Math.sin(time * 2.4) * 2;
      ctx.strokeStyle = 'rgba(255,253,247,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx + 1, sy + 5, 12 + foam, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ellipse(ctx, sx - 5, sy - 2 - Math.abs(foam), 5, 3);
      ctx.fill();
      ellipse(ctx, sx + 9, sy - 1 - Math.abs(foam) * 0.6, 4, 2.6);
      ctx.fill();
      // 무지개 (은은한 호).
      const arc = (r: number, c: string) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(sx + 20, sy - 6, r, Math.PI * 1.06, Math.PI * 1.66);
        ctx.stroke();
      };
      arc(34, 'rgba(242,112,94,0.5)');
      arc(31, 'rgba(255,214,107,0.5)');
      arc(28, 'rgba(126,192,124,0.5)');
      arc(25, 'rgba(126,166,242,0.45)');
      // 기슭 침엽수 2.
      for (const [ox, oy, sc] of [
        [-W2 * 0.38, 2, 0.8],
        [W2 * 0.4, 0, 0.7],
      ] as const) {
        ctx.fillStyle = '#3d3227';
        ctx.fillRect(sx + ox - 2 * sc, sy + oy - 10 * sc, 4 * sc, 10 * sc);
        for (let i = 0; i < 2; i++) {
          ctx.fillStyle = i === 1 ? '#2c5743' : '#1f4433';
          ctx.beginPath();
          ctx.moveTo(sx + ox, sy + oy - (22 + i * 10) * sc);
          ctx.lineTo(sx + ox + (14 - i * 4) * sc, sy + oy - (8 + i * 10) * sc);
          ctx.lineTo(sx + ox - (14 - i * 4) * sc, sy + oy - (8 + i * 10) * sc);
          ctx.closePath();
          ctx.fill();
        }
      }
      return;
    }
    case 'shipwreck': {
      // 별보기 언덕 백사장 — 부서진 난파선 (복구 전).
      shadow(ctx, sx, sy + 6, 44, 0.2);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.1);
      // 선체 (기울어 반쯤 묻힘).
      ctx.fillStyle = '#5b4433';
      ctx.beginPath();
      ctx.moveTo(-42, -6);
      ctx.quadraticCurveTo(-30, 12, 0, 14);
      ctx.quadraticCurveTo(30, 12, 44, -10);
      ctx.lineTo(38, -20);
      ctx.quadraticCurveTo(12, -10, -34, -16);
      ctx.closePath();
      ctx.fill();
      // 판재 결 + 부서진 구멍.
      ctx.strokeStyle = '#4a3527';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-36, -8);
      ctx.quadraticCurveTo(0, 6, 40, -12);
      ctx.moveTo(-30, -1);
      ctx.quadraticCurveTo(0, 11, 36, -5);
      ctx.stroke();
      ctx.fillStyle = '#2b2018';
      ctx.beginPath();
      ctx.moveTo(6, -4);
      ctx.lineTo(18, -7);
      ctx.lineTo(16, 4);
      ctx.lineTo(4, 6);
      ctx.closePath();
      ctx.fill();
      // 부러진 돛대 + 늘어진 밧줄.
      ctx.fillStyle = '#4a3527';
      ctx.save();
      ctx.rotate(0.34);
      ctx.fillRect(-14, -46, 5, 34);
      ctx.restore();
      ctx.strokeStyle = 'rgba(201,177,140,0.8)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-24, -40);
      ctx.quadraticCurveTo(-10, -22, 6, -16);
      ctx.stroke();
      ctx.restore();
      // 해초·불가사리.
      ctx.fillStyle = '#4e8f5c';
      ellipse(ctx, sx - 34, sy + 10, 5, 2.6);
      ctx.fill();
      ellipse(ctx, sx + 30, sy + 9, 4, 2.2);
      ctx.fill();
      ctx.fillStyle = '#f2915e';
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 - 0.3;
        ellipse(ctx, sx + 40 + Math.cos(a) * 3.4, sy + 13 + Math.sin(a) * 2.2, 1.6, 1.2);
        ctx.fill();
      }
      return;
    }
    case 'shipwreck-fixed': {
      // 복구된 범선 — 돛·깃발이 살아나고 매일 표류물이 도착한다.
      shadow(ctx, sx, sy + 6, 44, 0.2);
      const flap = Math.sin(time * 2.6) * 2.4;
      // 선체.
      ctx.fillStyle = '#8a6b52';
      ctx.beginPath();
      ctx.moveTo(-42 + sx, sy - 8);
      ctx.quadraticCurveTo(sx - 28, sy + 12, sx, sy + 14);
      ctx.quadraticCurveTo(sx + 30, sy + 12, sx + 44, sy - 12);
      ctx.lineTo(sx + 38, sy - 20);
      ctx.quadraticCurveTo(sx + 10, sy - 10, sx - 34, sy - 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#6e4a33';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sx - 36, sy - 10);
      ctx.quadraticCurveTo(sx, sy + 6, sx + 40, sy - 14);
      ctx.stroke();
      // 뱃전 테.
      ctx.strokeStyle = '#ce9f6c';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(sx - 35, sy - 15);
      ctx.quadraticCurveTo(sx + 8, sy - 7, sx + 39, sy - 19);
      ctx.stroke();
      // 돛대 + 가로활대 + 흰 돛.
      ctx.fillStyle = '#5b4433';
      ctx.fillRect(sx - 2.4, sy - 64, 4.8, 52);
      ctx.strokeStyle = '#5b4433';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx - 22, sy - 56);
      ctx.lineTo(sx + 22, sy - 56);
      ctx.stroke();
      ctx.fillStyle = '#fffdf7';
      ctx.beginPath();
      ctx.moveTo(sx - 20, sy - 54);
      ctx.quadraticCurveTo(sx - 14 + flap, sy - 34, sx - 18, sy - 18);
      ctx.lineTo(sx + 18, sy - 18);
      ctx.quadraticCurveTo(sx + 15 + flap, sy - 36, sx + 20, sy - 54);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(74,59,50,0.25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx - 16, sy - 42);
      ctx.quadraticCurveTo(sx + flap * 0.6, sy - 38, sx + 16, sy - 42);
      ctx.stroke();
      // 깃발 (감귤빛) + 랜턴.
      ctx.fillStyle = '#f5a03c';
      ctx.beginPath();
      ctx.moveTo(sx - 1, sy - 64);
      ctx.lineTo(sx + 11 + flap, sy - 60.5);
      ctx.lineTo(sx - 1, sy - 57);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd66b';
      ellipse(ctx, sx + 40, sy - 22, 2.6, 2.6);
      ctx.fill();
      // 뱃머리 화물 상자.
      ctx.fillStyle = '#b98a5c';
      ctx.fillRect(sx - 34, sy - 14, 11, 9);
      ctx.strokeStyle = '#8a6b52';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(sx - 34, sy - 14, 11, 9);
      ctx.beginPath();
      ctx.moveTo(sx - 34, sy - 9.5);
      ctx.lineTo(sx - 23, sy - 9.5);
      ctx.stroke();
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
      // 하이포니 — 말꼬리처럼 끝이 뾰족한 S-커브 꼬리.
      if (back) {
        ctx.beginPath();
        ctx.moveTo(-4, -52);
        ctx.quadraticCurveTo(6, -46, 3.5, -31);
        ctx.quadraticCurveTo(2.5, -25, -1, -22);
        ctx.quadraticCurveTo(-1.5, -35, -4.5, -44);
        ctx.quadraticCurveTo(-6, -49, -4, -52);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FF8B7B';
        ellipse(ctx, -1, -50.5, 2.3, 2.3);
        ctx.fill();
      } else {
        ellipse(ctx, 4, -56, 5, 3.2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(5, -55);
        ctx.quadraticCurveTo(17, -50, 14, -34);
        ctx.quadraticCurveTo(12.5, -27, 9, -23);
        ctx.quadraticCurveTo(12, -34, 9.5, -44);
        ctx.quadraticCurveTo(7.5, -51, 2, -54);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FF8B7B';
        ellipse(ctx, 7.5, -53.5, 2.2, 2.2);
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

/** 오늘의 네잎클로버 — 반짝임 링과 함께 살랑이는 수집 대상 (일일 미션) */
export function drawVClover(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
): void {
  const { sx, sy } = toScreen(x, y);
  const bob = Math.sin(time * 2.4) * 1.6;
  const cy = sy - 10 + bob;
  ctx.save();
  // 발밑 그림자 + 반짝임 링.
  ctx.fillStyle = 'rgba(40,50,35,0.16)';
  ellipse(ctx, sx, sy - 1, 7, 2.6);
  ctx.fill();
  const pulse = 0.5 + Math.sin(time * 3.1) * 0.3;
  ctx.strokeStyle = `rgba(255,253,247,${pulse * 0.75})`;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(sx, sy - 1, 10 + pulse * 3, 4 + pulse * 1.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  // 줄기.
  ctx.strokeStyle = '#3d7a46';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 2);
  ctx.quadraticCurveTo(sx + 1.5, cy + 5, sx, cy + 2);
  ctx.stroke();
  // 잎 4장 — 하트형 잎을 십자로.
  const sway = Math.sin(time * 2.4 + 1) * 0.08;
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i + Math.PI / 4 + sway;
    const lx = sx + Math.cos(a) * 4.6;
    const ly = cy + Math.sin(a) * 4.6 * 0.78;
    ctx.fillStyle = i % 2 ? '#4E9B58' : '#5fae69';
    ellipse(ctx, lx, ly, 3.6, 3);
    ctx.fill();
  }
  ctx.fillStyle = '#8cc073';
  ellipse(ctx, sx, cy, 1.6, 1.4);
  ctx.fill();
  // 반짝이 별 2.
  const tw = Math.abs(Math.sin(time * 3.6));
  ctx.fillStyle = `rgba(255,214,107,${0.4 + tw * 0.6})`;
  ellipse(ctx, sx + 8, cy - 6, 1.4 + tw, 1.4 + tw);
  ctx.fill();
  ctx.fillStyle = `rgba(255,253,247,${0.9 - tw * 0.5})`;
  ellipse(ctx, sx - 8, cy - 2, 1.2, 1.2);
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
