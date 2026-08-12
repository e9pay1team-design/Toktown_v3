// ─── 이동(여정) 상태 머신 ─────────────────────────────────────────
// 기획 §6 화면 6: 승차 감지 → 탑승 애니메이션 → 실지도 경로 추적 →
// 하차 알림 → 도착 시 리뷰 유도.
// 대중교통: route → waitTag → boarding → riding → arrived
// 도보:     route → riding → arrived (승차 태그 없음)

import { create } from 'zustand';
import type { RouteCandidate } from '../lib/routes';

export type JourneyPhase = 'idle' | 'waitTag' | 'boarding' | 'riding' | 'arrived';

interface JourneyState {
  phase: JourneyPhase;
  route: RouteCandidate | null;
  destStoreId: number | null;
  /** 경로 진행률 0~1 (riding 중 RAF 로 갱신) */
  progress: number;
  /** 하차 알림 노출 여부 (진행률 85% 이상) */
  alightSoon: boolean;

  startWaitTag: (route: RouteCandidate, destStoreId: number) => void;
  startWalk: (route: RouteCandidate, destStoreId: number) => void;
  board: () => void;
  startRiding: () => void;
  setProgress: (p: number) => void;
  arrive: () => void;
  reset: () => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  phase: 'idle',
  route: null,
  destStoreId: null,
  progress: 0,
  alightSoon: false,

  startWaitTag: (route, destStoreId) =>
    set({ phase: 'waitTag', route, destStoreId, progress: 0, alightSoon: false }),
  startWalk: (route, destStoreId) =>
    set({ phase: 'riding', route, destStoreId, progress: 0, alightSoon: false }),
  board: () => set({ phase: 'boarding' }),
  startRiding: () => set({ phase: 'riding' }),
  setProgress: (p) => set((s) => ({ progress: p, alightSoon: s.route?.mode === 'transit' && p >= 0.85 })),
  arrive: () => set({ phase: 'arrived', progress: 1 }),
  reset: () => set({ phase: 'idle', route: null, destStoreId: null, progress: 0, alightSoon: false }),
}));
