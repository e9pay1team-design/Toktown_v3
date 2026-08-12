// ─── 아이소메트릭 그리드 수학 (내 마을) ───────────────────────────
// 클래시 오브 클랜형 2.5D 다이아몬드 그리드. SVG 좌표계 기준.

export const GRID_ROWS = 8;
export const GRID_COLS = 8;
export const TILE_W = 68;
export const TILE_H = 34;

/** SVG viewBox 크기 */
export const ISO_VIEW_W = 620;
export const ISO_VIEW_H = 470;

/** 그리드 원점(0,0 타일의 중심) */
export const ORIGIN_X = ISO_VIEW_W / 2;
export const ORIGIN_Y = 108;

/** 셀 (row, col) → 타일 중심 SVG 좌표 */
export function cellToXY(row: number, col: number): { x: number; y: number } {
  return {
    x: ORIGIN_X + ((col - row) * TILE_W) / 2,
    y: ORIGIN_Y + ((col + row) * TILE_H) / 2,
  };
}

/** SVG 좌표 → 가장 가까운 셀 (그리드 밖이면 null) */
export function xyToCell(x: number, y: number): { row: number; col: number } | null {
  const dx = (x - ORIGIN_X) / (TILE_W / 2);
  const dy = (y - ORIGIN_Y) / (TILE_H / 2);
  const col = Math.round((dy + dx) / 2);
  const row = Math.round((dy - dx) / 2);
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
  return { row, col };
}

/** 타일 다이아몬드 path (중심 기준) */
export function tilePath(cx: number, cy: number, inset = 0): string {
  const hw = TILE_W / 2 - inset;
  const hh = TILE_H / 2 - inset;
  return `M${cx} ${cy - hh} L${cx + hw} ${cy} L${cx} ${cy + hh} L${cx - hw} ${cy} Z`;
}
