// ─── 타운맵 지역(존) 정의 — 전국 확장 R1 ─────────────────────────
// 지역 = 일러스트 지도 + 매장/랜드마크 + 마스코트 NPC 를 묶는 콘텐츠 팩.
// R1: 명동(기존) + 홍대 오픈. 이후 라운드에서 지역 팩을 하나씩 추가한다.
// 매장/랜드마크의 지역 소속은 별도 필드 없이 "가장 가까운 지역 중심"으로
// 판정한다(지역 간 거리 ≫ 존 반경이라 안전).

import type { LatLng } from '../types';

export interface Region {
  id: string;
  name: string;
  nameEn: string;
  /** 시·도 구분 (지역 선택 UI 그룹) */
  sido: string;
  sidoEn: string;
  /** 지도 카메라 초기 중심/줌 */
  center: LatLng;
  zoom: number;
  /** 카메라 이동 한계 [[남,서],[북,동]] */
  bounds: [[number, number], [number, number]];
  /** 지역 진입 시 내 위치 스폰 지점 */
  spawn: LatLng & { label: string; labelEn: string };
  /** 지역 마스코트 NPC id (REGIONAL_NPCS) */
  mascotId: string;
}

export const REGIONS: Region[] = [
  {
    id: 'myeongdong',
    name: '명동',
    nameEn: 'Myeongdong',
    sido: '서울',
    sidoEn: 'Seoul',
    center: { lat: 37.5636, lng: 126.985 },
    zoom: 15,
    // 카메라 한계는 최저 줌(13) 화면(~13km)보다 넉넉해야 어느 줌에서도
    // 팬이 자유롭다 — 콘텐츠보다 훨씬 넓게 (바깥은 종이 질감 배경).
    bounds: [
      [37.468, 126.865],
      [37.658, 127.105],
    ],
    spawn: { lat: 37.561, lng: 126.9863, label: '명동역 6번 출구', labelEn: 'Myeongdong Stn. Exit 6' },
    mascotId: 'magpie',
  },
  {
    id: 'hongdae',
    name: '홍대',
    nameEn: 'Hongdae',
    sido: '서울',
    sidoEn: 'Seoul',
    center: { lat: 37.5548, lng: 126.9235 },
    zoom: 15,
    bounds: [
      [37.46, 126.803],
      [37.65, 127.043],
    ],
    spawn: { lat: 37.5568, lng: 126.9237, label: '홍대입구역 9번 출구', labelEn: 'Hongik Univ. Stn. Exit 9' },
    mascotId: 'hongdae-cat',
  },
  {
    id: 'bukchon',
    name: '북촌·경복궁',
    nameEn: 'Bukchon',
    sido: '서울',
    sidoEn: 'Seoul',
    center: { lat: 37.579, lng: 126.982 },
    zoom: 15,
    bounds: [
      [37.484, 126.862],
      [37.674, 127.102],
    ],
    spawn: { lat: 37.5762, lng: 126.9852, label: '안국역 1번 출구', labelEn: 'Anguk Stn. Exit 1' },
    mascotId: 'bukchon-tiger',
  },
  {
    id: 'seongsu',
    name: '성수·서울숲',
    nameEn: 'Seongsu',
    sido: '서울',
    sidoEn: 'Seoul',
    center: { lat: 37.5445, lng: 127.048 },
    zoom: 15,
    bounds: [
      [37.45, 126.928],
      [37.64, 127.168],
    ],
    spawn: { lat: 37.5444, lng: 127.056, label: '성수역 2번 출구', labelEn: 'Seongsu Stn. Exit 2' },
    mascotId: 'seongsu-deer',
  },
];

/** 다음 라운드 예고 — 지역 선택 UI 에 '준비 중'으로 노출 */
export const UPCOMING_REGIONS: { name: string; nameEn: string; sido: string; sidoEn: string }[] = [
  { name: '해운대·광안리', nameEn: 'Haeundae', sido: '부산', sidoEn: 'Busan' },
  { name: '제주', nameEn: 'Jeju', sido: '제주', sidoEn: 'Jeju' },
];

export const DEFAULT_REGION_ID = 'myeongdong';

export const regionById = (id: string | null | undefined): Region =>
  REGIONS.find((r) => r.id === id) ?? REGIONS[0];

/** 좌표의 소속 지역 — 가장 가까운 지역 중심 (매장/랜드마크 분류용) */
export function regionOfPoint(p: LatLng): Region {
  let best = REGIONS[0];
  let bestD = Infinity;
  for (const r of REGIONS) {
    const d = (r.center.lat - p.lat) ** 2 + (r.center.lng - p.lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  return best;
}
