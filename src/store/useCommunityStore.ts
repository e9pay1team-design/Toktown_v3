// ─── 커뮤니티 스토어: 내가 쓴 글 + 좋아요 ─────────────────────────
// 통합 커뮤니티 개편: 글은 분류 태그(POST_TAGS id)를 함께 저장한다.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MyPost {
  id: string;
  text: string;
  /** 분류 태그 id 목록 */
  tags: string[];
  storeTagId?: number;
  ts: number;
}

interface CommunityState {
  myPosts: MyPost[];
  likedIds: string[];
  addPost: (text: string, tags: string[], storeTagId?: number) => void;
  toggleLike: (postId: string) => void;
}

let postSeq = Date.now() % 1_000_000;

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      myPosts: [],
      likedIds: [],
      addPost: (text, tags, storeTagId) =>
        set((s) => ({
          myPosts: [
            { id: `my-${++postSeq}`, text, tags, storeTagId, ts: Date.now() },
            ...s.myPosts,
          ],
        })),
      toggleLike: (postId) =>
        set((s) => ({
          likedIds: s.likedIds.includes(postId)
            ? s.likedIds.filter((id) => id !== postId)
            : [...s.likedIds, postId],
        })),
    }),
    {
      name: 'toktown:community',
      version: 2,
      migrate: (persisted: unknown) => {
        // v1 → v2: 기존 내 글에 tags 필드 보강
        const state = persisted as CommunityState;
        return {
          ...state,
          myPosts: (state.myPosts ?? []).map((p) => ({ ...p, tags: p.tags ?? [] })),
        };
      },
    },
  ),
);
