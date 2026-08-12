// ─── 가상 위치 목업 ────────────────────────────────────────────────
// 실제 Geolocation API는 사용 금지(브리프 §2). '내 위치'는 데모 컨트롤
// 패널에서 순간이동시키는 가상 값이다. 실서비스 전환 시 이 모듈만
// navigator.geolocation 기반 구현으로 교체하면 된다.

import { create } from 'zustand';
import type { LatLng } from '../types';
import { DEFAULT_POSITION } from '../data/seed';

export interface VirtualLocationApi {
  /** 현재 가상 위치 */
  position: LatLng;
  /** 마지막 순간이동 시각(ms) — 이동속도 검증 시연용(M2) */
  movedAt: number;
  /** 직전 위치 — 이동속도 검증 시연용(M2) */
  prevPosition: LatLng | null;
  teleport: (to: LatLng) => void;
}

export const useVirtualLocation = create<VirtualLocationApi>((set, get) => ({
  position: DEFAULT_POSITION,
  movedAt: 0,
  prevPosition: null,
  teleport: (to) =>
    set({ position: to, prevPosition: get().position, movedAt: Date.now() }),
}));

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
