// ─── 실시간 웨이팅(혼잡도) 목업 ───────────────────────────────────
// 캐치테이블·테이블링 같은 매장 대기 서비스 연동을 시뮬레이션한다.
// 실서비스 전환 시 이 모듈만 파트너 API 클라이언트로 교체하면 된다.
// 값은 (매장 id, 5분 슬롯) 결정적 — 새로고침해도 튀지 않고, 점심·저녁
// 피크 곡선을 따라 분 단위로 천천히 변해 '실시간' 느낌을 낸다.

import type { Store } from '../types';

export interface WaitingInfo {
  /** 현재 대기 팀 수 */
  teams: number;
  /** 예상 대기 시간(분) */
  estMinutes: number;
  /** 0 여유 · 1 보통 · 2 혼잡 */
  level: 0 | 1 | 2;
}

/** 정수 → 0..1 결정적 해시 */
function hash01(n: number): number {
  let h = (n * 374761393) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** 시간대별 혼잡 곡선 0..1 — 점심(12:30)·저녁(19:00) 가우시안 피크 */
function hourCurve(h: number): number {
  const lunch = Math.exp(-((h - 12.5) ** 2) / (2 * 1.6 ** 2));
  const dinner = 0.9 * Math.exp(-((h - 19) ** 2) / (2 * 1.9 ** 2));
  return Math.min(1, 0.08 + lunch + dinner);
}

/** 연동 파트너가 없는 매장은 null (상세에 혼잡도 미노출) */
export function waitingInfo(store: Store, at: Date = new Date()): WaitingInfo | null {
  if (!store.waitingPartner) return null;
  const h = at.getHours() + at.getMinutes() / 60;
  const slot = Math.floor(at.getTime() / 300_000); // 5분마다 지터 갱신
  const popularity = 0.55 + hash01(store.id * 7) * 0.45;
  const jitter = (hash01(store.id * 131 + slot) - 0.5) * 0.25;
  const load = Math.max(0, Math.min(1, hourCurve(h) * popularity + jitter));
  const maxTeams = 12 + Math.round(hash01(store.id * 17) * 8);
  const teams = Math.round(load * maxTeams);
  const perTeamMin = 4 + Math.round(hash01(store.id * 29) * 3);
  const level: 0 | 1 | 2 = teams <= 2 ? 0 : teams <= 7 ? 1 : 2;
  return { teams, estMinutes: teams * perTeamMin, level };
}
