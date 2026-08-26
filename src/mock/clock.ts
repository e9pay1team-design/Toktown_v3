// ─── 가상 시계 목업 ───────────────────────────────────────────────
// 데모 패널의 '날짜 +1' 버튼이 dayOffset 을 올려 출석·1일 1회 제한·
// NPC 로테이션·핫플 시간감쇠를 시연한다. 실서비스에선 서버 시각 사용.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DAY_MS = 86_400_000;

type NightMode = 'auto' | 'day' | 'night';

interface VirtualClockState {
  dayOffset: number;
  /** 데모용 낮/밤 강제 — auto 는 실제 시각 기준 (마을 조명 연출) */
  nightMode: NightMode;
  addDay: () => void;
  cycleNightMode: () => NightMode;
}

export const useVirtualClock = create<VirtualClockState>()(
  persist(
    (set, get) => ({
      dayOffset: 0,
      nightMode: 'auto',
      addDay: () => set((s) => ({ dayOffset: s.dayOffset + 1 })),
      cycleNightMode: () => {
        const next: NightMode =
          get().nightMode === 'auto' ? 'day' : get().nightMode === 'day' ? 'night' : 'auto';
        set({ nightMode: next });
        return next;
      },
    }),
    { name: 'toktown:clock' },
  ),
);

/** 가상 현재 시각(ms) */
export const virtualNow = (dayOffset: number) => Date.now() + dayOffset * DAY_MS;

/** 가상 '오늘'의 일련번호 (1일 1회 제한 판정용) */
export const virtualDayIndex = (dayOffset: number) =>
  Math.floor(Date.now() / DAY_MS) + dayOffset;

/** 가상 오늘 날짜 문자열 (YYYY-MM-DD) */
export const virtualToday = (dayOffset: number) =>
  new Date(virtualNow(dayOffset)).toISOString().slice(0, 10);
