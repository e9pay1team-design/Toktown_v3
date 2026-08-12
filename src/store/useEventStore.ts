// ─── Event Map 스토어 ─────────────────────────────────────────────
// 실서비스: 공연 기간 + 지역 기반 자동 활성화(티켓 인증 없음, 기획 §7).
// 데모: 컨트롤 패널 토글로 재현(브리프 §5).

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EventState {
  /** 활성화된 이벤트 id (null = 없음) */
  activeEventId: string | null;
  /** 이벤트 한정 체크인 보상(한정 소품)을 이미 받았는지 */
  eventRewardClaimed: Record<string, boolean>;
  toggleEvent: (eventId: string) => boolean;
  claimReward: (eventId: string) => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      activeEventId: null,
      eventRewardClaimed: {},
      toggleEvent: (eventId) => {
        const next = get().activeEventId === eventId ? null : eventId;
        set({ activeEventId: next });
        return next !== null;
      },
      claimReward: (eventId) =>
        set((s) => ({
          eventRewardClaimed: { ...s.eventRewardClaimed, [eventId]: true },
        })),
    }),
    { name: 'toktown:event' },
  ),
);
