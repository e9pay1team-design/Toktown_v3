// ─── 수집 스토어: NPC 도감 + 랜드마크 발견 ────────────────────────
// NPC 조우 → 도감 등록(기획 §4), 랜드마크는 지역 최초 방문(반경 도달) 시
// 미니어처 획득. M3 내 마을 배치의 원천 데이터.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CollectionState {
  /** 도감에 등록된 NPC id ('magpie', 'magpie-drummer' …) */
  dex: string[];
  /** 발견한 랜드마크 id */
  landmarks: string[];
  addDex: (npcId: string) => boolean;
  addLandmark: (landmarkId: string) => boolean;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      dex: [],
      landmarks: [],
      addDex: (npcId) => {
        if (get().dex.includes(npcId)) return false;
        set((s) => ({ dex: [...s.dex, npcId] }));
        return true;
      },
      addLandmark: (landmarkId) => {
        if (get().landmarks.includes(landmarkId)) return false;
        set((s) => ({ landmarks: [...s.landmarks, landmarkId] }));
        return true;
      },
    }),
    { name: 'toktown:collection' },
  ),
);
