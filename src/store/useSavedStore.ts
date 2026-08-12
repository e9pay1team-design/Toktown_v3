import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedState {
  /** 저장한 매장 id 목록 (최신순) */
  savedIds: number[];
  toggle: (storeId: number) => void;
  isSaved: (storeId: number) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      toggle: (storeId) =>
        set((s) => ({
          savedIds: s.savedIds.includes(storeId)
            ? s.savedIds.filter((id) => id !== storeId)
            : [storeId, ...s.savedIds],
        })),
      isSaved: (storeId) => get().savedIds.includes(storeId),
    }),
    { name: 'toktown:saved' },
  ),
);
