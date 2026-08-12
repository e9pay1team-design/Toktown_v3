import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LatLng } from '../types';

export type TabId = 'map' | 'community' | 'village' | 'wallet';

/** 지도 카테고리 칩 (기획 §6 화면1: 맛집/카페/저장/이벤트) */
export type CategoryChip = 'food' | 'cafe' | 'saved' | 'event';

interface UiState {
  activeTab: TabId;
  setTab: (tab: TabId) => void;

  /** 지도에서 선택된 매장 (상세 시트) */
  selectedStoreId: number | null;
  selectStore: (id: number | null) => void;

  categoryFilter: CategoryChip | null;
  setCategoryFilter: (chip: CategoryChip | null) => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  savedListOpen: boolean;
  setSavedListOpen: (open: boolean) => void;

  /** 길찾기 설정 시트 대상 매장 (M2) */
  routeSheetFor: number | null;
  setRouteSheetFor: (id: number | null) => void;

  /** 핫플 랭킹 시트 펼침 (M2) */
  hotSheetOpen: boolean;
  setHotSheetOpen: (open: boolean) => void;

  /** 지도 카메라 이동 요청 (MapView가 소비) */
  flyTo: (LatLng & { zoom?: number; seq: number }) | null;
  requestFlyTo: (to: LatLng & { zoom?: number }) => void;
}

let flySeq = 0;

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'map',
  setTab: (tab) => set({ activeTab: tab }),

  selectedStoreId: null,
  selectStore: (id) => set({ selectedStoreId: id }),

  categoryFilter: null,
  setCategoryFilter: (chip) => set({ categoryFilter: chip }),

  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  savedListOpen: false,
  setSavedListOpen: (open) => set({ savedListOpen: open }),

  routeSheetFor: null,
  setRouteSheetFor: (id) => set({ routeSheetFor: id }),

  hotSheetOpen: false,
  setHotSheetOpen: (open) => set({ hotSheetOpen: open }),

  flyTo: null,
  requestFlyTo: (to) => set({ flyTo: { ...to, seq: ++flySeq } }),
}));

interface SearchHistoryState {
  recent: string[];
  push: (q: string) => void;
  clear: () => void;
}

export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set) => ({
      recent: [],
      push: (q) =>
        set((s) => ({
          recent: [q, ...s.recent.filter((r) => r !== q)].slice(0, 8),
        })),
      clear: () => set({ recent: [] }),
    }),
    { name: 'toktown:search-history' },
  ),
);
