// ─── 내 마을 스토어: 배치 + 소품 보유 ─────────────────────────────
// 원칙(기획 §4): "현실에서 얻고, 마을에 쌓인다" — 획득은 자동(방문/조우/
// 발견/구매), 배치는 수동. M4 개편: 마을이 걷는 월드가 되면서 배치가
// 타일 풋프린트(bx,by,w,h)를 갖는다. 배치 가능 여부 판정은 월드를 아는
// 엔진(villageGame)이 하고, 스토어는 기록만 담당한다.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  /** 상점에서 구매한 소품 수량 */
  decorOwned: Record<string, number>;

  place: (kind: PlacementKind, refId: string, bx: number, by: number) => void;
  move: (placementId: number, bx: number, by: number) => void;
  remove: (placementId: number) => void;
  buyDecor: (decorId: string) => void;
}

let placementSeq = Date.now() % 1_000_000;

export const useVillageStore = create<VillageState>()(
  persist(
    (set) => ({
      placements: [],
      decorOwned: {},

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
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        // v1(8×8 아이소 그리드 row/col) → v2(26×26 월드 풋프린트):
        // 좌표계가 달라 배치는 초기화한다. 획득물은 방문/수집/소품 스토어에서
        // 파생되므로 아무것도 잃지 않고 보관함으로 돌아간다.
        const state = persisted as VillageState & { placements: unknown[] };
        if (version < 2) return { ...state, placements: [] };
        return state;
      },
    },
  ),
);
