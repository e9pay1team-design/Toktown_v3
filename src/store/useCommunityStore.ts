// ─── 커뮤니티 스토어: 내가 쓴 글 + 좋아요 ─────────────────────────
// 통합 커뮤니티 개편: 글은 분류 태그(POST_TAGS id)를 함께 저장한다.
// 사진 첨부: 앨범 업로드는 다운스케일된 dataURL(photo), 데모 사진은
// 코드 SVG id(photoId) — 렌더는 photo 우선.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { POST_TAGS } from '../data/communitySeed';

export interface MyPost {
  id: string;
  text: string;
  /** 분류 태그 id 목록 */
  tags: string[];
  /** 첨부 사진 — 업로드(dataURL) */
  photo?: string;
  /** 첨부 사진 — 데모 사진 id (assets/postPhotos) */
  photoId?: string;
  storeTagId?: number;
  ts: number;
}

export interface AddPostOpts {
  storeTagId?: number;
  photo?: string;
  photoId?: string;
}

interface CommunityState {
  myPosts: MyPost[];
  likedIds: string[];
  addPost: (text: string, tags: string[], opts?: AddPostOpts) => void;
  toggleLike: (postId: string) => void;
}

let postSeq = Date.now() % 1_000_000;

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      myPosts: [],
      likedIds: [],
      addPost: (text, tags, opts) =>
        set((s) => ({
          myPosts: [
            { id: `my-${++postSeq}`, text, tags, ts: Date.now(), ...opts },
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
      version: 3,
      migrate: (persisted: unknown) => {
        // v1 → v2: 기존 내 글에 tags 필드 보강.
        // v2 → v3: 태그 축소(#SOS #info #맛집) — 폐지된 태그 id 는 걷어낸다.
        const valid = new Set(POST_TAGS.map((t) => t.id));
        const state = persisted as CommunityState;
        return {
          ...state,
          myPosts: (state.myPosts ?? []).map((p) => ({
            ...p,
            tags: (p.tags ?? []).filter((id) => valid.has(id)),
          })),
        };
      },
    },
  ),
);
