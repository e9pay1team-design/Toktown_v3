// ─── 승차 태그 이벤트 목업 ────────────────────────────────────────
// 실서비스: 톡페이 선불카드의 승차 태그 이벤트 실시간 수신
// (교통 제휴사 데이터 계약 필요). 데모: 데모 패널 버튼으로 트리거하는
// 폴백 구조(기획 §3.2)를 그대로 재현한다.

/** 교통 요금 목업 (성인 카드 기준) */
export const TRANSIT_FARE = 1500;

export interface RideTagEvent {
  vehicle: 'subway' | 'bus';
  line: string;
  taggedAt: number;
}

export function makeRideTag(vehicle: 'subway' | 'bus', line: string): RideTagEvent {
  return { vehicle, line, taggedAt: Date.now() };
}
