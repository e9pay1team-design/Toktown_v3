// ─── 방문 루프 공용 액션 ──────────────────────────────────────────
// 상세 시트와 데모 패널 양쪽에서 호출된다. 검증 순서:
// 이동속도(비현실적 점프) → 반경 100m → 1일 1회 → 지급.

import { DRUMMER_MAGPIE, LANDMARKS, REGIONAL_NPCS, STORES, TOWN_EVENTS, storeById } from '../data/seed';
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
import { useCollectionStore } from '../store/useCollectionStore';
import { useVillageStore } from '../store/useVillageStore';
import { useEventStore } from '../store/useEventStore';

/** 랜드마크 '지역 최초 방문' 발견 반경 (m) */
export const LANDMARK_RADIUS_M = 150;

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

  const firstCertifiedVisit = !visits.hasCertifiedVisit(storeId);
  visits.recordCheckin(storeId, day);
  const amount = useEconomyStore.getState().earnTokken('checkin', store.name);
  toast(`${store.name} 발도장 완료! 톡큰 +${amount}`, 'tokken');
  if (firstCertifiedVisit) {
    setTimeout(
      () => toast(`🏠 ${store.name} 건물 획득! 내 마을에서 배치해 보세요`, 'success'),
      700,
    );
  }
  grantEventCheckinReward(store, firstCertifiedVisit ? 1400 : 700);
  return true;
}

/** Event Map 활성 중 극장 인근 체크인 → 한정 톡큰 + 한정 소품 (1회) */
function grantEventCheckinReward(store: Store, delayMs: number) {
  const { activeEventId, eventRewardClaimed, claimReward } = useEventStore.getState();
  const event = TOWN_EVENTS.find((e) => e.id === activeEventId);
  if (!event) return;
  const venue = storeById(event.venueStoreId);
  if (!venue || distanceM(store, venue) > event.radiusM) return;
  if (eventRewardClaimed[event.id]) return;
  claimReward(event.id);
  const bonus = useEconomyStore.getState().earnTokken('checkin', `${event.title} 한정 보너스`);
  useVillageStore.getState().buyDecor('nanta-drum');
  setTimeout(() => {
    toast(`🎪 ${event.title} 한정 톡큰 +${bonus}!`, 'tokken');
    setTimeout(
      () => toast(`🎁 한정 소품 '${event.limitedItemName}' 획득! 보관함을 확인하세요`, 'success'),
      750,
    );
  }, delayMs);
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

  const firstCertifiedVisit = certified && !visits.hasCertifiedVisit(storeId);
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
  if (firstCertifiedVisit) {
    setTimeout(
      () => toast(`🏠 ${store.name} 건물 획득! 내 마을에서 배치해 보세요`, 'success'),
      700,
    );
  }
  return true;
}

/** NPC 조우 확정 → 도감 등록 + 톡큰 (조우 모달에서 호출) */
export function registerNpcEncounter(npcId: string): void {
  const added = useCollectionStore.getState().addDex(npcId);
  if (!added) return;
  const name = npcId === DRUMMER_MAGPIE.id ? DRUMMER_MAGPIE.name : REGIONAL_NPCS[0].name;
  const amount = useEconomyStore.getState().earnTokken('npcEncounter', name);
  toast(`📖 ${name} 도감 등록! 톡큰 +${amount}`, 'tokken');
  setTimeout(
    () => toast(`🏡 ${name}이(가) 내 마을에 입주할 수 있어요 — 보관함 확인!`, 'success'),
    800,
  );
}

/** 랜드마크 '지역 최초 방문' 판정 — 위치 이동 직후 호출 */
export function checkLandmarkDiscovery(): void {
  const loc = useVirtualLocation.getState();
  if (isSuspicious(loc)) return; // 이동속도 검증 실패 중에는 발견 불가
  const collection = useCollectionStore.getState();
  for (const lm of LANDMARKS) {
    if (collection.landmarks.includes(lm.id)) continue;
    if (distanceM(loc.position, lm) <= LANDMARK_RADIUS_M) {
      collection.addLandmark(lm.id);
      toast(`🏛️ ${lm.name} 최초 방문! 미니어처를 획득했어요`, 'success');
    }
  }
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
