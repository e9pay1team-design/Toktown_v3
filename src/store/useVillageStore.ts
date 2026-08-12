// ─── 내 마을 스토어: 배치 + 소품 보유 ─────────────────────────────
// 원칙(기획 §4): "현실에서 얻고, 마을에 쌓인다" — 획득은 자동(방문/조우/
// 발견/구매), 배치는 수동(그리드 스냅). 배치 목록과 소품 보유 수량만
// 여기서 관리하고, 건물/NPC/랜드마크 보유 여부는 방문·수집 스토어에서
// 파생된다.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlacementKind = 'store' | 'npc' | 'landmark' | 'decor';

export interface Placement {
  id: number;
  kind: PlacementKind;
  /** storeId(number)·npcId·landmarkId·decorId 문자열 표현 */
  refId: string;
  row: number;
  col: number;
}

interface VillageState {
  placements: Placement[];
  /** 상점에서 구매한 소품 수량 */
  decorOwned: Record<string, number>;

  isOccupied: (row: number, col: number) => boolean;
  place: (kind: PlacementKind, refId: string, row: number, col: number) => boolean;
  move: (placementId: number, row: number, col: number) => boolean;
  remove: (placementId: number) => void;
  buyDecor: (decorId: string) => void;
}

let placementSeq = Date.now() % 1_000_000;

export const useVillageStore = create<VillageState>()(
  persist(
    (set, get) => ({
      placements: [],
      decorOwned: {},

      isOccupied: (row, col) =>
        get().placements.some((p) => p.row === row && p.col === col),

      place: (kind, refId, row, col) => {
        if (get().isOccupied(row, col)) return false;
        set((s) => ({
          placements: [...s.placements, { id: ++placementSeq, kind, refId, row, col }],
        }));
        return true;
      },

      move: (placementId, row, col) => {
        const occupied = get().placements.some(
          (p) => p.id !== placementId && p.row === row && p.col === col,
        );
        if (occupied) return false;
        set((s) => ({
          placements: s.placements.map((p) =>
            p.id === placementId ? { ...p, row, col } : p,
          ),
        }));
        return true;
      },

      remove: (placementId) =>
        set((s) => ({ placements: s.placements.filter((p) => p.id !== placementId) })),

      buyDecor: (decorId) =>
        set((s) => ({
          decorOwned: { ...s.decorOwned, [decorId]: (s.decorOwned[decorId] ?? 0) + 1 },
        })),
    }),
    { name: 'toktown:village' },
  ),
);
