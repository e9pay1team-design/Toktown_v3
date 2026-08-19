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
    {
      name: 'toktown:collection',
      version: 1,
      migrate: (persisted: unknown) => {
        // v1: 이벤트 NPC id 개편 — '드러머 까미'(magpie-drummer)를 '까아미'
        // (magpie-kkaami)로 통합하고 중복을 제거한다. 도감엔 까미·까아미만 남는다.
        const state = persisted as CollectionState;
        const dex = [
          ...new Set((state.dex ?? []).map((id) => (id === 'magpie-drummer' ? 'magpie-kkaami' : id))),
        ];
        return { ...state, dex };
      },
    },
  ),
);
