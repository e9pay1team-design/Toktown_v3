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
  | 'attendanceBonus'
  | 'npcEncounter'
  | 'rideTag'
  | 'quest'
  | 'questBonus'
  | 'expansion'
  | 'demo';

export const TOKKEN_REASON_LABEL: Record<TokkenReason, string> = {
  payment: '톡페이 결제',
  certifiedReview: '인증 리뷰',
  review: '리뷰 작성',
  checkin: '체크인(발도장)',
  attendance: '출석 체크',
  attendanceBonus: '3일 개근 보너스',
  npcEncounter: 'NPC 조우',
  rideTag: '승차 태그',
  quest: '오늘의 미션',
  questBonus: '미션 올클리어',
  expansion: '마을 확장',
  demo: '데모 지급',
};

export const TOKKEN_REASON_LABEL_EN: Record<TokkenReason, string> = {
  payment: 'TokPay payment',
  certifiedReview: 'Verified review',
  review: 'Review',
  checkin: 'Check-in (paw stamp)',
  attendance: 'Daily attendance',
  attendanceBonus: '3-day perfect bonus',
  npcEncounter: 'NPC encounter',
  rideTag: 'Ride tag',
  quest: 'Daily mission',
  questBonus: 'All missions clear',
  expansion: 'Island expansion',
  demo: 'Demo grant',
};

export const TOKKEN_REASON_EMOJI: Record<TokkenReason, string> = {
  payment: '💳',
  certifiedReview: '📝',
  review: '✏️',
  checkin: '👣',
  attendance: '📅',
  attendanceBonus: '🎁',
  npcEncounter: '🐦',
  rideTag: '🚇',
  quest: '📜',
  questBonus: '🏅',
  expansion: '🏝️',
  demo: '🧪',
};

/** 출석 프로그램 — 첫 3일 점진 보상, 3일 개근 보너스, 이후 매일 기본 지급 */
export const ATTEND_PROGRAM = [10, 20, 40] as const;
export const ATTEND_PROGRAM_BONUS = 50;
export const ATTEND_DAILY = 10;

/** n번째 출석(1-base)의 지급액 */
export function attendRewardAt(count: number): number {
  return count >= 1 && count <= ATTEND_PROGRAM.length ? ATTEND_PROGRAM[count - 1] : ATTEND_DAILY;
}

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
  /** 출석: 마지막 출석 가상일, 연속 일수, 누적 출석 수(3일 프로그램 판정) */
  lastAttendDay: number | null;
  attendStreak: number;
  attendCount: number;

  earnTokken: (reason: TokkenReason, detail?: string) => number;
  /** 임의 금액 지급/차감 기록 — 음수면 사용 내역(마을 확장 등)으로 남는다 */
  grantTokken: (amount: number, reason: TokkenReason, detail?: string) => void;
  /** 톡큰 사용 (상점 구매) — 잔액 부족 시 false */
  spendTokken: (amount: number) => boolean;
  chargeTokpay: (amount: number) => void;
  spendTokpay: (amount: number) => boolean;
  transferToTransit: (amount: number) => boolean;
  spendTransit: (amount: number) => boolean;
  attend: (day: number) => { streak: number; count: number; amount: number; bonus: number } | null;
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
      attendCount: 0,

      grantTokken: (amount, reason, detail) => {
        set((s) => ({
          tokken: s.tokken + amount,
          history: [
            { id: ++entrySeq, amount, reason, detail, ts: Date.now() },
            ...s.history,
          ].slice(0, 60),
        }));
      },

      earnTokken: (reason, detail) => {
        const amount = TOKKEN_ECONOMY[reason as keyof typeof TOKKEN_ECONOMY] ?? 0;
        get().grantTokken(amount, reason, detail);
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

      // 출석 개편(R5): 여행 중 쓰는 앱이라 7일판 대신 '첫 3일 프로그램'.
      // 1·2·3일차 10/20/40 점진 지급, 3일 모두 찍으면 개근 보너스 +50,
      // 이후 출석은 매일 +10 으로 쭉 이어진다. (끊겨도 누적 일수 기준)
      attend: (day) => {
        const { lastAttendDay, attendStreak, attendCount, grantTokken } = get();
        if (lastAttendDay === day) return null;
        const streak = lastAttendDay === day - 1 ? attendStreak + 1 : 1;
        const count = attendCount + 1;
        set({ lastAttendDay: day, attendStreak: streak, attendCount: count });
        const amount = attendRewardAt(count);
        grantTokken(amount, 'attendance', `${count}일차 출석 (${streak}일 연속)`);
        let bonus = 0;
        if (count === ATTEND_PROGRAM.length) {
          bonus = ATTEND_PROGRAM_BONUS;
          grantTokken(bonus, 'attendanceBonus');
        }
        return { streak, count, amount, bonus };
      },
    }),
    {
      name: 'toktown:economy',
      version: 1,
      migrate: (persisted: unknown) => {
        const state = persisted as EconomyState;
        // v1: 출석 3일 프로그램 도입 — 누적 출석 수는 기존 기록에서 근사.
        return {
          ...state,
          attendCount:
            state.attendCount ??
            Math.max(
              state.attendStreak ?? 0,
              (state.history ?? []).filter((h) => h.reason === 'attendance').length,
            ),
        };
      },
    },
  ),
);
