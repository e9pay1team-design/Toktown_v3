// ─── 오늘의 마을 미션 스토어 (R5 리텐션 루프) ─────────────────────
// 매일 3가지 미션: 주민과 인사 2번(greet) · 오브젝트 배치/이동 1번
// (decorate) · 마을 어딘가의 네잎클로버 찾기(clover). 완료 즉시 톡큰
// 지급, 3개 올클리어 시 보너스. 가상 '오늘'(virtualDayIndex)이 바뀌면
// 자동 리셋 — 매일 마을에 들어올 이유를 만든다.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEconomyStore } from './useEconomyStore';
import { useToastStore } from './useToastStore';
import { tr } from '../i18n';

export type QuestId = 'greet' | 'decorate' | 'clover';

export interface QuestMeta {
  id: QuestId;
  emoji: string;
  label: string;
  labelEn: string;
  target: number;
  reward: number;
}

export const DAILY_QUESTS: QuestMeta[] = [
  { id: 'greet', emoji: '💬', label: '주민과 인사 2번', labelEn: 'Greet residents ×2', target: 2, reward: 10 },
  { id: 'decorate', emoji: '🪴', label: '오브젝트 배치·이동 1번', labelEn: 'Place or move an object', target: 1, reward: 10 },
  { id: 'clover', emoji: '🍀', label: '숨은 네잎클로버 찾기', labelEn: 'Find the hidden clover', target: 1, reward: 15 },
];

export const QUEST_ALL_CLEAR_BONUS = 20;

interface QuestState {
  /** 진행 기준 가상 일자 — 바뀌면 리셋 */
  day: number | null;
  progress: Record<QuestId, number>;
  bonusPaid: boolean;

  /** 미션 진행 +1 — 완료 순간 톡큰 지급/토스트, 올클리어 보너스까지 처리 */
  advance: (id: QuestId, day: number) => void;
  /** 렌더 전 오늘 날짜로 동기화 (지난 날 진행이면 리셋) */
  syncDay: (day: number) => void;
}

const emptyProgress = (): Record<QuestId, number> => ({ greet: 0, decorate: 0, clover: 0 });

export function questMeta(id: QuestId): QuestMeta {
  return DAILY_QUESTS.find((q) => q.id === id)!;
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      day: null,
      progress: emptyProgress(),
      bonusPaid: false,

      syncDay: (day) => {
        if (get().day !== day) set({ day, progress: emptyProgress(), bonusPaid: false });
      },

      advance: (id, day) => {
        get().syncDay(day);
        const meta = questMeta(id);
        const cur = get().progress[id];
        if (cur >= meta.target) return;
        const next = cur + 1;
        set((s) => ({ progress: { ...s.progress, [id]: next } }));
        const toast = useToastStore.getState().show;
        const grant = useEconomyStore.getState().grantTokken;
        if (next >= meta.target) {
          grant(meta.reward, 'quest', tr(meta.label, meta.labelEn));
          toast(
            tr(`📜 미션 완료! ${meta.label} +${meta.reward} 톡큰`, `📜 Mission clear! ${meta.labelEn} +${meta.reward} Tokken`),
            'tokken',
          );
          const p = get().progress;
          const allDone = DAILY_QUESTS.every((q) => p[q.id] >= q.target);
          if (allDone && !get().bonusPaid) {
            set({ bonusPaid: true });
            grant(QUEST_ALL_CLEAR_BONUS, 'questBonus');
            toast(
              tr(
                `🏅 오늘의 미션 올클리어! 보너스 +${QUEST_ALL_CLEAR_BONUS} 톡큰`,
                `🏅 All missions clear! Bonus +${QUEST_ALL_CLEAR_BONUS} Tokken`,
              ),
              'tokken',
            );
          }
        }
      },
    }),
    { name: 'toktown:quests' },
  ),
);
