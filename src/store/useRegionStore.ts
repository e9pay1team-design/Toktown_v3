// ─── 활성 지역 스토어 ─────────────────────────────────────────────
// 타운맵의 현재 지역(존). 데모 패널 지역 전환과 타 지역 매장 열람 시
// 갱신된다. 새로고침에도 유지되도록 persist.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_REGION_ID } from '../data/regions';

interface RegionState {
  regionId: string;
  setRegion: (id: string) => void;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      regionId: DEFAULT_REGION_ID,
      setRegion: (id) => set({ regionId: id }),
    }),
    { name: 'toktown:region', version: 0 },
  ),
);
