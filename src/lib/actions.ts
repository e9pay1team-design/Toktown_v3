// ─── 방문 루프 공용 액션 ──────────────────────────────────────────
// 상세 시트와 데모 패널 양쪽에서 호출된다. 검증 순서:
// 이동속도(비현실적 점프) → 반경 100m → 1일 1회 → 지급.

import { STORES, storeById } from '../data/seed';
import type { Store } from '../types';
import {
  CHECKIN_RADIUS_M,
  distanceM,
  formatDistance,
  isSuspicious,
  useVirtualLocation,
} from '../mock/location';
import { mockTokpay } from '../mock/payment';
import { TRANSIT_FARE } from '../mock/transit';
import { useVirtualClock, virtualDayIndex } from '../mock/clock';
import { useEconomyStore } from '../store/useEconomyStore';
import { useVisitStore } from '../store/useVisitStore';
import { useToastStore } from '../store/useToastStore';
import { useJourneyStore } from '../store/useJourneyStore';

const toast = (msg: string, kind?: 'info' | 'success' | 'tokken' | 'error') =>
  useToastStore.getState().show(msg, kind);

export const today = () => virtualDayIndex(useVirtualClock.getState().dayOffset);

/** 매장까지 거리(m) */
export const distToStore = (store: Store) =>
  distanceM(useVirtualLocation.getState().position, store);

export const withinRadius = (store: Store) => distToStore(store) <= CHECKIN_RADIUS_M;

/** 체크인(발도장) 시도 */
export function tryCheckin(storeId: number): boolean {
  const store = storeById(storeId);
  if (!store) return false;
  const loc = useVirtualLocation.getState();

  if (isSuspicious(loc)) {
    toast('🚨 비현실적인 위치 점프가 감지되어 체크인이 거부됐어요', 'error');
    return false;
  }
  const dist = distToStore(store);
  if (dist > CHECKIN_RADIUS_M) {
    toast(`매장 ${CHECKIN_RADIUS_M}m 이내에서만 체크인할 수 있어요 (현재 ${formatDistance(dist)})`, 'error');
    return false;
  }
  const day = today();
  const visits = useVisitStore.getState();
  if (visits.hasCheckedIn(storeId, day)) {
    toast('오늘은 이미 이곳에 발도장을 찍었어요 (1일 1회)', 'info');
    return false;
  }

  visits.recordCheckin(storeId, day);
  const amount = useEconomyStore.getState().earnTokken('checkin', store.name);
  toast(`${store.name} 발도장 완료! 톡큰 +${amount}`, 'tokken');
  return true;
}

/** 리뷰 등록 (작성 시트에서 호출) — certified 는 현장 반경 + 정상 이동일 때 */
export function submitReview(storeId: number, rating: 1 | 2 | 3 | 4 | 5, text: string): boolean {
  const store = storeById(storeId);
  if (!store) return false;
  const day = today();
  const visits = useVisitStore.getState();
  if (visits.hasReviewed(storeId, day)) {
    toast('이 장소 리뷰는 1일 1회만 쓸 수 있어요', 'info');
    return false;
  }
  const loc = useVirtualLocation.getState();
  const certified = withinRadius(store) && !isSuspicious(loc);

  visits.recordReview({ storeId, rating, text, certified, day });
  const amount = useEconomyStore
    .getState()
    .earnTokken(certified ? 'certifiedReview' : 'review', store.name);
  toast(
    certified
      ? `방문 인증 리뷰 등록! 톡큰 +${amount}`
      : `리뷰 등록 완료! 톡큰 +${amount}`,
    'tokken',
  );
  return true;
}

/** 결제 시뮬레이션 — 반경 내 매장에서 톡페이 결제 → Tokken */
export function tryPayment(store: Store): boolean {
  const dist = distToStore(store);
  if (dist > CHECKIN_RADIUS_M) {
    toast(`매장 앞에서만 결제할 수 있어요 (현재 ${formatDistance(dist)})`, 'error');
    return false;
  }
  const eco = useEconomyStore.getState();
  const result = mockTokpay.payAtStore(store, eco.tokpayBalance);
  if (!result.ok) {
    toast(result.message, 'error');
    return false;
  }
  eco.spendTokpay(result.amount);
  toast(`💳 ${result.message}`, 'success');
  const amount = eco.earnTokken('payment', store.name);
  setTimeout(() => toast(`결제 보상 톡큰 +${amount}`, 'tokken'), 550);
  return true;
}

/** 현재 위치 반경 내 매장 찾기 (데모 패널 결제 버튼용) */
export function nearestStoreInRadius(): Store | null {
  const pos = useVirtualLocation.getState().position;
  const sorted = [...STORES].sort((a, b) => distanceM(pos, a) - distanceM(pos, b));
  const first = sorted[0];
  return first && distanceM(pos, first) <= CHECKIN_RADIUS_M ? first : null;
}

/** 승차 태그 (데모 패널·대기 화면 버튼) — 교통 잔액 차감 + 탑승 시작 */
export function tryRideTag(): boolean {
  const journey = useJourneyStore.getState();
  if (journey.phase !== 'waitTag') {
    toast('길찾기에서 대중교통 경로로 "이동 시작"을 누른 뒤 태그하세요', 'info');
    return false;
  }
  const eco = useEconomyStore.getState();
  if (!eco.spendTransit(TRANSIT_FARE)) {
    toast('교통 잔액이 부족해요! 지갑에서 톡페이 → 교통 잔액을 충전하세요', 'error');
    return false;
  }
  const amount = eco.earnTokken('rideTag', journey.route?.line);
  toast(`승차 태그 완료 (${TRANSIT_FARE.toLocaleString()}원) · 톡큰 +${amount}`, 'tokken');
  journey.board();
  return true;
}
