// ─── 가상 위치 목업 ────────────────────────────────────────────────
// 실제 Geolocation API는 사용 금지(브리프 §2). '내 위치'는 데모 컨트롤
// 패널에서 순간이동시키는 가상 값이다. 실서비스 전환 시 이 모듈만
// navigator.geolocation 기반 구현으로 교체하면 된다.

import { create } from 'zustand';
import type { LatLng } from '../types';
import { DEFAULT_POSITION } from '../data/seed';

/** 체크인·인증 리뷰·NPC 조우 공통 반경 (기획 §3.1: 약 100m) */
export const CHECKIN_RADIUS_M = 100;

/** 비현실적 점프 감지 후 체크인·인증이 거부되는 시간(ms) */
export const SUSPICIOUS_WINDOW_MS = 20_000;

export interface VirtualLocationApi {
  /** 현재 가상 위치 */
  position: LatLng;
  /** 마지막 순간이동 시각(ms) */
  movedAt: number;
  prevPosition: LatLng | null;
  /** 이동속도 검증: 이 시각까지 체크인·인증 거부 (0 = 정상) */
  suspiciousUntil: number;
  /** 정상 이동 (도보/대중교통 이동으로 간주) — 의심 상태 해제 */
  teleport: (to: LatLng) => void;
  /** 비현실적 위치 점프 재현 — 잠시 체크인·인증 거부 상태가 된다 */
  jump: (to: LatLng) => void;
  /** 여정(경로 추적) 중 프레임 단위 위치 갱신 — 검증 기록 없이 이동 */
  trace: (to: LatLng) => void;
}

export const useVirtualLocation = create<VirtualLocationApi>((set, get) => ({
  position: DEFAULT_POSITION,
  movedAt: 0,
  prevPosition: null,
  suspiciousUntil: 0,
  teleport: (to) =>
    set({
      position: to,
      prevPosition: get().position,
      movedAt: Date.now(),
      suspiciousUntil: 0,
    }),
  jump: (to) =>
    set({
      position: to,
      prevPosition: get().position,
      movedAt: Date.now(),
      suspiciousUntil: Date.now() + SUSPICIOUS_WINDOW_MS,
    }),
  trace: (to) => set({ position: to }),
}));

export const isSuspicious = (s: Pick<VirtualLocationApi, 'suspiciousUntil'>) =>
  s.suspiciousUntil > Date.now();

/** 두 좌표 사이 거리(m) — Haversine */
export function distanceM(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}
