// ─── TokTown 도메인 타입 ───────────────────────────────────────────
// 기획문서 v1.7 + 구현 브리프 기준. 목업 ↔ 실서비스 교체가 쉽도록
// 데이터 인터페이스를 이곳에 모아 정의한다.

export interface LatLng {
  lat: number;
  lng: number;
}

/** 매장 대분류 (마커 색/건물 SVG 결정) */
export type StoreCategory = '국밥' | '한식' | '면' | '카페' | '공연장';

export interface Store {
  id: number;
  name: string;
  category: StoreCategory;
  /** 세부 메뉴 표기 (예: 설렁탕, 육개장) */
  subCategory?: string;
  lat: number;
  lng: number;
  hours: string;
  /** 톡페이 혜택 뱃지 문구 (없으면 미노출) */
  benefit?: string;
  /** 한 줄 소개 */
  desc: string;
  /** 개업 연도 — 노포 연출용 */
  founded?: number;
  tags: string[];
}

export type ReviewLang = 'ko' | 'en';

export interface Review {
  id: string;
  storeId: number;
  author: string;
  /** 작성자 국적 이모지 표기용 */
  flag: string;
  lang: ReviewLang;
  text: string;
  /** 자동 번역 시연용 사전 페어 (M3 '번역 보기') */
  translated: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** 현장 반경 내 작성 = 방문 인증 뱃지 */
  certified: boolean;
  /** ISO 날짜 */
  date: string;
}

/** 지역 마스코트 NPC (도감 대상) */
export interface RegionalNpc {
  id: string;
  name: string;
  species: string;
  region: string;
  /** 도감 소개문 */
  bio: string;
  /** 조우 시 대사 */
  lines: string[];
  /** 출몰 지점 목록 — 하루 2지점 랜덤 활성 */
  spots: NpcSpot[];
}

export interface NpcSpot {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** 이벤트 한정 NPC 변형 (드러머 까미 등) */
  variant?: 'drummer';
}

/** 기본 NPC (전국 공통, 기능 담당) */
export type BasicNpcRole = 'mayor' | 'postman' | 'shopkeeper' | 'gourmet';

export interface BasicNpc {
  role: BasicNpcRole;
  name: string;
  species: string;
  title: string;
  lines: string[];
}

export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  desc: string;
}

/** Event Map 모의 이벤트 */
export interface TownEvent {
  id: string;
  title: string;
  venueStoreId: number;
  /** 반경(m) 내 매장에 혜택 노출 */
  radiusM: number;
  benefit: string;
  limitedNpcName: string;
  limitedItemName: string;
  desc: string;
}

/** Tokken 지급 수치 (초기값, 브리프 §4) */
export interface TokkenEconomy {
  payment: number;
  certifiedReview: number;
  review: number;
  checkin: number;
  attendance: number;
  npcEncounter: number;
  rideTag: number;
}

/** 캐릭터 커스터마이징 파츠 구성 (인덱스 = 프리셋 배열 참조) */
export interface CharacterConfig {
  skin: number;
  hairStyle: number;
  hairColor: number;
  outfit: number;
  outfitColor: number;
}

export interface ResidentProfile {
  nickname: string;
  character: CharacterConfig;
  /** 주민 등록일 (주민증 발급일) — ISO */
  residentSince: string;
}

/** 상점 꾸미기 소품 (Tokken 소비처, M3 사용) */
export interface DecorItem {
  id: string;
  name: string;
  price: number;
  /** 이벤트 한정 여부 */
  eventOnly?: string;
  /** 상점 미판매 — 마을 기본 지급 오브젝트 (예: 광장 돌바닥 타일) */
  shopHidden?: boolean;
}
