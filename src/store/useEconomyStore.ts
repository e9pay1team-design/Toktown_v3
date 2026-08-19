// ─── 경제 스토어: 톡페이/교통/Tokken 잔액 + 출석 ─────────────────
// Tokken 은 현금 구매 없음(기획 §4). 획득 즉시 토스트는 호출부에서.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TOKKEN_ECONOMY } from '../data/seed';

export type TokkenReason =
  | 'payment'
  | 'certifiedReview'
  | 'review'
  | 'checkin'
  | 'attendance'
  | 'npcEncounter'
  | 'rideTag';

export const TOKKEN_REASON_LABEL: Record<TokkenReason, string> = {
  payment: '톡페이 결제',
  certifiedReview: '인증 리뷰',
  review: '리뷰 작성',
  checkin: '체크인(발도장)',
  attendance: '출석 체크',
  npcEncounter: 'NPC 조우',
  rideTag: '승차 태그',
};

export const TOKKEN_REASON_LABEL_EN: Record<TokkenReason, string> = {
  payment: 'TokPay payment',
  certifiedReview: 'Verified review',
  review: 'Review',
  checkin: 'Check-in (paw stamp)',
  attendance: 'Daily attendance',
  npcEncounter: 'NPC encounter',
  rideTag: 'Ride tag',
};

export const TOKKEN_REASON_EMOJI: Record<TokkenReason, string> = {
  payment: '💳',
  certifiedReview: '📝',
  review: '✏️',
  checkin: '👣',
  attendance: '📅',
  npcEncounter: '🐦',
  rideTag: '🚇',
};

export interface TokkenEntry {
  id: number;
  amount: number;
  reason: TokkenReason;
  /** 관련 매장/상세 라벨 */
  detail?: string;
  ts: number;
}

interface EconomyState {
  tokpayBalance: number;
  transitBalance: number;
  tokken: number;
  history: TokkenEntry[];
  /** 출석: 마지막 출석 가상일, 연속 일수 */
  lastAttendDay: number | null;
  attendStreak: number;

  earnTokken: (reason: TokkenReason, detail?: string) => number;
  /** 톡큰 사용 (상점 구매) — 잔액 부족 시 false */
  spendTokken: (amount: number) => boolean;
  chargeTokpay: (amount: number) => void;
  spendTokpay: (amount: number) => boolean;
  transferToTransit: (amount: number) => boolean;
  spendTransit: (amount: number) => boolean;
  attend: (day: number) => { streak: number; amount: number } | null;
}

let entrySeq = Date.now() % 1_000_000;

export const useEconomyStore = create<EconomyState>()(
  persist(
    (set, get) => ({
      tokpayBalance: 50000,
      transitBalance: 5500,
      tokken: 0,
      history: [],
      lastAttendDay: null,
      attendStreak: 0,

      earnTokken: (reason, detail) => {
        const amount = TOKKEN_ECONOMY[reason];
        set((s) => ({
          tokken: s.tokken + amount,
          history: [
            { id: ++entrySeq, amount, reason, detail, ts: Date.now() },
            ...s.history,
          ].slice(0, 60),
        }));
        return amount;
      },

      spendTokken: (amount) => {
        if (get().tokken < amount) return false;
        set((s) => ({ tokken: s.tokken - amount }));
        return true;
      },

      chargeTokpay: (amount) => set((s) => ({ tokpayBalance: s.tokpayBalance + amount })),

      spendTokpay: (amount) => {
        if (get().tokpayBalance < amount) return false;
        set((s) => ({ tokpayBalance: s.tokpayBalance - amount }));
        return true;
      },

      transferToTransit: (amount) => {
        if (get().tokpayBalance < amount) return false;
        set((s) => ({
          tokpayBalance: s.tokpayBalance - amount,
          transitBalance: s.transitBalance + amount,
        }));
        return true;
      },

      spendTransit: (amount) => {
        if (get().transitBalance < amount) return false;
        set((s) => ({ transitBalance: s.transitBalance - amount }));
        return true;
      },

      attend: (day) => {
        const { lastAttendDay, attendStreak, earnTokken } = get();
        if (lastAttendDay === day) return null;
        const streak = lastAttendDay === day - 1 ? attendStreak + 1 : 1;
        set({ lastAttendDay: day, attendStreak: streak });
        const amount = earnTokken('attendance', `${streak}일 연속 출석`);
        return { streak, amount };
      },
    }),
    { name: 'toktown:economy' },
  ),
);
