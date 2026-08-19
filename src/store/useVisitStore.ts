// ─── 방문 스토어: 체크인/내 리뷰/랭킹 이벤트 로그 ─────────────────
// 방문 1건 = 리뷰 작성 or GPS 체크인 (기획 §3.1 확정).
// 1인·1장소·1일 1회 제한은 가상일(day) 기준으로 판정한다.
// 이 기록은 M3의 '인증 방문 → 건물 획득'의 원천 데이터가 된다.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VisitEventType = 'checkin' | 'review' | 'certReview' | 'save';

export interface VisitEvent {
  id: number;
  type: VisitEventType;
  storeId: number;
  /** 실제 기록 시각(ms) — 감쇠 계산용 */
  ts: number;
  /** 기록 당시 가상일 번호 — 1일 1회 판정용 */
  day: number;
}

export interface MyReview {
  id: number;
  storeId: number;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  certified: boolean;
  ts: number;
  day: number;
  /** 수정 이력 표시용 */
  edited?: boolean;
}

interface VisitState {
  events: VisitEvent[];
  myReviews: MyReview[];

  hasCheckedIn: (storeId: number, day: number) => boolean;
  hasReviewed: (storeId: number, day: number) => boolean;
  /** 인증 방문(체크인 또는 인증 리뷰) 이력 — M3 건물 획득 조건 */
  hasCertifiedVisit: (storeId: number) => boolean;

  recordCheckin: (storeId: number, day: number) => void;
  recordReview: (review: Omit<MyReview, 'id' | 'ts'>) => void;
  /** 내 리뷰 수정 — 별점·본문만 바꾸고 인증 상태는 작성 당시 그대로 둔다 */
  updateReview: (id: number, rating: MyReview['rating'], text: string) => void;
  /** 내 리뷰 삭제 — 방문 이벤트 기록(랭킹·건물 획득 원천)은 유지한다 */
  deleteReview: (id: number) => void;
  recordSave: (storeId: number, day: number) => void;
}

let seq = Date.now() % 1_000_000;

export const useVisitStore = create<VisitState>()(
  persist(
    (set, get) => ({
      events: [],
      myReviews: [],

      hasCheckedIn: (storeId, day) =>
        get().events.some((e) => e.type === 'checkin' && e.storeId === storeId && e.day === day),

      hasReviewed: (storeId, day) =>
        get().myReviews.some((r) => r.storeId === storeId && r.day === day),

      hasCertifiedVisit: (storeId) =>
        get().events.some(
          (e) => e.storeId === storeId && (e.type === 'checkin' || e.type === 'certReview'),
        ),

      recordCheckin: (storeId, day) =>
        set((s) => ({
          events: [...s.events, { id: ++seq, type: 'checkin', storeId, ts: Date.now(), day }],
        })),

      recordReview: (review) =>
        set((s) => ({
          myReviews: [{ ...review, id: ++seq, ts: Date.now() }, ...s.myReviews],
          events: [
            ...s.events,
            {
              id: ++seq,
              type: review.certified ? 'certReview' : 'review',
              storeId: review.storeId,
              ts: Date.now(),
              day: review.day,
            },
          ],
        })),

      updateReview: (id, rating, text) =>
        set((s) => ({
          myReviews: s.myReviews.map((r) =>
            r.id === id ? { ...r, rating, text, edited: true } : r,
          ),
        })),

      deleteReview: (id) =>
        set((s) => ({ myReviews: s.myReviews.filter((r) => r.id !== id) })),

      recordSave: (storeId, day) =>
        set((s) => ({
          events: [...s.events, { id: ++seq, type: 'save', storeId, ts: Date.now(), day }],
        })),
    }),
    { name: 'toktown:visits' },
  ),
);
