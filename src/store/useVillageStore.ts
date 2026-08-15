// ─── 내 마을 스토어: 배치 + 소품 보유 ─────────────────────────────
// 원칙(기획 §4): "현실에서 얻고, 마을에 쌓인다" — 획득은 자동(방문/조우/
// 발견/구매), 배치는 수동. M4 개편: 마을이 걷는 월드가 되면서 배치가
// 타일 풋프린트(bx,by,w,h)를 갖는다. 배치 가능 여부 판정은 월드를 아는
// 엔진(villageGame)이 하고, 스토어는 기록만 담당한다.
// 광장 돌바닥 21칸·가로등 4개는 기본 지급 배치물로 시드된다 — 배치
// 모드에서 회수(보관함)했다가 다시 놓을 수 있다.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LAMP_SPOTS, DEFAULT_PLAZA_TILES, STONE_TILE } from '../lib/villageWorld';

export type PlacementKind = 'store' | 'npc' | 'landmark' | 'decor';

/** kind 별 풋프린트 크기 — 건물류는 2×2(기획 요구: 최소 2×2) */
export function footprintOf(kind: PlacementKind): { w: number; h: number } {
  if (kind === 'store' || kind === 'landmark') return { w: 2, h: 2 };
  return { w: 1, h: 1 };
}

export interface Placement {
  id: number;
  kind: PlacementKind;
  /** storeId(number)·npcId·landmarkId·decorId 문자열 표현 */
  refId: string;
  /** 풋프린트 좌상단 타일 */
  bx: number;
  by: number;
  w: number;
  h: number;
}

interface VillageState {
  placements: Placement[];
  /** 상점에서 구매하거나 기본 지급된 소품 수량 */
  decorOwned: Record<string, number>;

  place: (kind: PlacementKind, refId: string, bx: number, by: number) => void;
  move: (placementId: number, bx: number, by: number) => void;
  remove: (placementId: number) => void;
  buyDecor: (decorId: string) => void;
}

let placementSeq = Date.now() % 1_000_000;

/** 기본 지급 배치 — 광장 돌바닥 타일 21칸 + 가로등 4개 */
function defaultPlacements(): Placement[] {
  const out: Placement[] = [];
  for (const { tx, ty } of DEFAULT_PLAZA_TILES) {
    out.push({ id: ++placementSeq, kind: 'decor', refId: STONE_TILE, bx: tx, by: ty, w: 1, h: 1 });
  }
  for (const { tx, ty } of DEFAULT_LAMP_SPOTS) {
    out.push({ id: ++placementSeq, kind: 'decor', refId: 'lamp', bx: tx, by: ty, w: 1, h: 1 });
  }
  return out;
}

/** 기본 지급 보유량 — 회수 시 보관함(인벤토리 = 보유 − 배치)에 남도록 배치 수만큼 지급 */
function defaultDecorOwned(): Record<string, number> {
  return { [STONE_TILE]: DEFAULT_PLAZA_TILES.length, lamp: DEFAULT_LAMP_SPOTS.length };
}

export const useVillageStore = create<VillageState>()(
  persist(
    (set) => ({
      placements: defaultPlacements(),
      decorOwned: defaultDecorOwned(),

      place: (kind, refId, bx, by) => {
        const { w, h } = footprintOf(kind);
        set((s) => ({
          placements: [...s.placements, { id: ++placementSeq, kind, refId, bx, by, w, h }],
        }));
      },

      move: (placementId, bx, by) =>
        set((s) => ({
          placements: s.placements.map((p) => (p.id === placementId ? { ...p, bx, by } : p)),
        })),

      remove: (placementId) =>
        set((s) => ({ placements: s.placements.filter((p) => p.id !== placementId) })),

      buyDecor: (decorId) =>
        set((s) => ({
          decorOwned: { ...s.decorOwned, [decorId]: (s.decorOwned[decorId] ?? 0) + 1 },
        })),
    }),
    {
      name: 'toktown:village',
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        let state = persisted as VillageState;
        // v1(8×8 아이소 그리드 row/col) → v2(26×26 월드 풋프린트):
        // 좌표계가 달라 배치는 초기화한다. 획득물은 방문/수집/소품 스토어에서
        // 파생되므로 아무것도 잃지 않고 보관함으로 돌아간다.
        if (version < 2) state = { ...state, placements: [] };
        // v2 → v3: 고정 지형이던 광장 돌바닥·가로등을 회수 가능한 기본
        // 배치물로 전환 — 기존 마을에 시드 배치와 보유량을 더해 준다.
        if (version < 3) {
          for (const p of state.placements) placementSeq = Math.max(placementSeq, p.id);
          const decorOwned = { ...state.decorOwned };
          for (const [id, n] of Object.entries(defaultDecorOwned())) {
            decorOwned[id] = (decorOwned[id] ?? 0) + n;
          }
          state = {
            ...state,
            placements: [...state.placements, ...defaultPlacements()],
            decorOwned,
          };
        }
        return state;
      },
    },
  ),
);
