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
  /** 영문 표기 (언어 모드 EN) — 이하 *En 필드 동일 */
  nameEn?: string;
  category: StoreCategory;
  /** 세부 메뉴 표기 (예: 설렁탕, 육개장) */
  subCategory?: string;
  subCategoryEn?: string;
  lat: number;
  lng: number;
  hours: string;
  hoursEn?: string;
  /** 톡페이 혜택 뱃지 문구 (없으면 미노출) */
  benefit?: string;
  benefitEn?: string;
  /** 한 줄 소개 */
  desc: string;
  descEn?: string;
  /** 개업 연도 — 노포 연출용 */
  founded?: number;
  tags: string[];
  tagsEn?: string[];
  /** 웨이팅(대기) 서비스 연동 파트너 — 있으면 상세에 실시간 혼잡도 노출 */
  waitingPartner?: string;
  waitingPartnerEn?: string;
  /** 외국인 주민 방문 팁 (주문 단위·언어 지원·결제 방식 등) */
  tips?: string[];
  tipsEn?: string[];
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
  nameEn?: string;
  species: string;
  speciesEn?: string;
  region: string;
  regionEn?: string;
  /** 도감 소개문 */
  bio: string;
  bioEn?: string;
  /** 조우 시 대사 */
  lines: string[];
  linesEn?: string[];
  /** 출몰 지점 목록 — 하루 2지점 랜덤 활성 */
  spots: NpcSpot[];
}

export interface NpcSpot {
  id: string;
  label: string;
  labelEn?: string;
  lat: number;
  lng: number;
  /** 이벤트 한정 NPC 변형 (까아미 등) */
  variant?: 'drummer';
}

/** 기본 NPC (전국 공통, 기능 담당) */
export type BasicNpcRole = 'mayor' | 'postman' | 'shopkeeper' | 'gourmet';

export interface BasicNpc {
  role: BasicNpcRole;
  name: string;
  nameEn?: string;
  species: string;
  speciesEn?: string;
  title: string;
  titleEn?: string;
  lines: string[];
  linesEn?: string[];
}

export interface Landmark {
  id: string;
  name: string;
  nameEn?: string;
  lat: number;
  lng: number;
  desc: string;
  descEn?: string;
}

/** Event Map 모의 이벤트 */
/** 이벤트 부스·게이트 — 지도 마커 + 상세 시트 목록 + 길찾기 대상 */
export interface EventBooth {
  id: string;
  emoji: string;
  name: string;
  nameEn?: string;
  /** 운영시간 */
  hours: string;
  hoursEn?: string;
  /** 이용정보 한 줄 */
  info: string;
  infoEn?: string;
  lat: number;
  lng: number;
}

export interface TownEvent {
  id: string;
  title: string;
  titleEn?: string;
  /** 행사 거점 — 매장이 아닌 광장/무대일 수 있어 좌표로 직접 지정 */
  venue: { lat: number; lng: number; label: string; labelEn?: string };
  /** 반경(m) 내 매장에 혜택 노출 */
  radiusM: number;
  benefit: string;
  benefitEn?: string;
  limitedNpcName: string;
  limitedNpcNameEn?: string;
  limitedItemName: string;
  limitedItemNameEn?: string;
  /** 한정 소품 decor id — 이벤트 체크인 보상으로 지급 */
  limitedItemId: string;
  desc: string;
  descEn?: string;
  /** 공연·운영 일정 표기 */
  period: string;
  periodEn?: string;
  /** 기본 안내·유의사항 (도로 통제 등) */
  notices: string[];
  noticesEn?: string[];
  booths: EventBooth[];
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

/** 캐릭터 커스터마이징 파츠 구성 (인덱스 = 프리셋 배열 참조).
    구매 전용 슬롯은 워드로브 아이템 id — 미장착이면 undefined/null. */
export interface CharacterConfig {
  skin: number;
  hairStyle: number;
  hairColor: number;
  outfit: number;
  outfitColor: number;
  premiumHair?: string | null;
  top?: string | null;
  bottom?: string | null;
  shoes?: string | null;
  facePaint?: string | null;
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
  nameEn?: string;
  price: number;
  /** 이벤트 한정 여부 */
  eventOnly?: string;
}
