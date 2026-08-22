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
  /** 수정 이력 표시용 */
  edited?: boolean;
}

export interface AddPostOpts {
  storeTagId?: number;
  photo?: string;
  photoId?: string;
}

/** 내가 단 댓글 — 시드 글·내 글 모두에 달 수 있다. 수정 불가, 삭제만 가능. */
export interface MyComment {
  id: string;
  /** 시드 글 id('p1'…) 또는 내 글 id('my-…') */
  postId: string;
  text: string;
  ts: number;
}

interface CommunityState {
  myPosts: MyPost[];
  likedIds: string[];
  myComments: MyComment[];
  addPost: (text: string, tags: string[], opts?: AddPostOpts) => void;
  /** 내 글 수정 — 본문·태그·장소·사진을 통째로 교체 */
  updatePost: (id: string, text: string, tags: string[], opts?: AddPostOpts) => void;
  deletePost: (id: string) => void;
  addComment: (postId: string, text: string) => void;
  deleteComment: (commentId: string) => void;
  toggleLike: (postId: string) => void;
}

let postSeq = Date.now() % 1_000_000;

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      myPosts: [],
      likedIds: [],
      myComments: [],
      addPost: (text, tags, opts) =>
        set((s) => ({
          myPosts: [
            { id: `my-${++postSeq}`, text, tags, ts: Date.now(), ...opts },
            ...s.myPosts,
          ],
        })),

      updatePost: (id, text, tags, opts) =>
        set((s) => ({
          myPosts: s.myPosts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  text,
                  tags,
                  storeTagId: opts?.storeTagId,
                  photo: opts?.photo,
                  photoId: opts?.photoId,
                  edited: true,
                }
              : p,
          ),
        })),

      deletePost: (id) =>
        set((s) => ({
          myPosts: s.myPosts.filter((p) => p.id !== id),
          // 글이 지워지면 그 글에 단 내 댓글도 정리.
          myComments: s.myComments.filter((c) => c.postId !== id),
        })),

      addComment: (postId, text) =>
        set((s) => ({
          myComments: [...s.myComments, { id: `mc-${++postSeq}`, postId, text, ts: Date.now() }],
        })),

      deleteComment: (commentId) =>
        set((s) => ({ myComments: s.myComments.filter((c) => c.id !== commentId) })),
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
