// ─── 핫플 랭킹: 최근 7일 이벤트 가중합 + 시간 감쇠 ────────────────
// 가중치(초기값, 기획 §3.1): 인증 리뷰 3 / 일반 리뷰 2 / 체크인 1 / 저장 1.
// 감쇠: 반감기 3일 지수 감쇠, 7일 초과 이벤트 제외.
// 시드 리뷰는 앵커 날짜(2026-08-12) 기준 나이로 계산해 실행 시점과
// 무관하게 결정적인 기본 랭킹을 만들고, '날짜 +1' 시 함께 감쇠한다.

import { REVIEWS, STORES } from '../data/seed';
import type { Store } from '../types';
import type { VisitEvent } from '../store/useVisitStore';

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 7;
const HALF_LIFE_DAYS = 3;

/** 시드 리뷰 날짜의 기준 '오늘' */
const SEED_ANCHOR = Date.parse('2026-08-12T12:00:00Z');

export const RANK_WEIGHTS = { certReview: 3, review: 2, checkin: 1, save: 1 } as const;

const decay = (ageDays: number) =>
  ageDays > WINDOW_DAYS ? 0 : Math.pow(0.5, ageDays / HALF_LIFE_DAYS);

export interface HotRankEntry {
  store: Store;
  score: number;
  /** 최근 7일 이벤트 수 (시드 + 내 활동) */
  counts: { reviews: number; checkins: number; saves: number };
  /** 오늘(가상일) 내 활동이 있는 매장 */
  minedToday: boolean;
}

export function computeHotRanking(
  userEvents: VisitEvent[],
  dayOffset: number,
  today: number,
): HotRankEntry[] {
  const entries = STORES.map((store) => {
    let score = 0;
    const counts = { reviews: 0, checkins: 0, saves: 0 };

    // 시드 리뷰 (기본 랭킹 베이스라인)
    for (const r of REVIEWS) {
      if (r.storeId !== store.id) continue;
      const ageDays = (SEED_ANCHOR - Date.parse(r.date)) / DAY_MS + dayOffset;
      const d = decay(ageDays);
      if (d <= 0) continue;
      score += (r.certified ? RANK_WEIGHTS.certReview : RANK_WEIGHTS.review) * d;
      counts.reviews += 1;
    }

    // 내 활동 이벤트
    let minedToday = false;
    const now = Date.now();
    for (const e of userEvents) {
      if (e.storeId !== store.id) continue;
      // 가상 나이 = 실제 경과 + (기록 이후 '날짜 +1'로 늘어난 가상일 수)
      const realDayDiff = Math.floor(now / DAY_MS) - Math.floor(e.ts / DAY_MS);
      const offsetDelta = today - e.day - realDayDiff;
      const ageDays = (now - e.ts) / DAY_MS + offsetDelta;
      const d = decay(ageDays);
      if (d <= 0) continue;
      if (e.type === 'certReview') {
        score += RANK_WEIGHTS.certReview * d;
        counts.reviews += 1;
      } else if (e.type === 'review') {
        score += RANK_WEIGHTS.review * d;
        counts.reviews += 1;
      } else if (e.type === 'checkin') {
        score += RANK_WEIGHTS.checkin * d;
        counts.checkins += 1;
      } else {
        score += RANK_WEIGHTS.save * d;
        counts.saves += 1;
      }
      if (e.day === today) minedToday = true;
    }

    return { store, score: Math.round(score * 10) / 10, counts, minedToday };
  });

  return entries.sort((a, b) => b.score - a.score);
}
