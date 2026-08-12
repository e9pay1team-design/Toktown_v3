// ─── 커뮤니티 스토어: 내가 쓴 글 + 좋아요 ─────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MyPost {
  id: string;
  text: string;
  storeTagId?: number;
  ts: number;
}

interface CommunityState {
  myPosts: MyPost[];
  likedIds: string[];
  addPost: (text: string, storeTagId?: number) => void;
  toggleLike: (postId: string) => void;
}

let postSeq = Date.now() % 1_000_000;

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      myPosts: [],
      likedIds: [],
      addPost: (text, storeTagId) =>
        set((s) => ({
          myPosts: [{ id: `my-${++postSeq}`, text, storeTagId, ts: Date.now() }, ...s.myPosts],
        })),
      toggleLike: (postId) =>
        set((s) => ({
          likedIds: s.likedIds.includes(postId)
            ? s.likedIds.filter((id) => id !== postId)
            : [...s.likedIds, postId],
        })),
    }),
    { name: 'toktown:community' },
  ),
);
