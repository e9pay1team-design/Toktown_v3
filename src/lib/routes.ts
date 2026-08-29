// ─── 길찾기 경로 목업 ─────────────────────────────────────────────
// 실제 라우팅 API 없이 사전 정의 방식의 폴리라인을 코드로 생성한다.
// (브리프 §1: 길찾기 경로는 사전 정의 폴리라인(목업).
//  실서비스 전환 시 대중교통 API/지도 SDK 라우팅으로 교체.)

import type { LatLng } from '../types';
import { distanceM } from '../mock/location';
import { tr } from '../i18n';

export type RouteMode = 'transit' | 'walk';

export interface RouteStep {
  icon: string;
  text: string;
}

export interface RouteCandidate {
  id: string;
  mode: RouteMode;
  vehicle: 'subway' | 'bus' | 'walk';
  label: string;
  line: string;
  minutes: number;
  fare: number;
  transfers: number;
  steps: RouteStep[];
  /** 승차/하차 정류장 라벨 (탑승 연출·하차 알림용) */
  boardAt: string;
  alightAt: string;
  polyline: LatLng[];
}

/** 개방 지역 가상 역/정류장 (경유점 목업) — 수단별 분리, 가까운 것이 선택된다 */
const SUBWAY_STATIONS = [
  // 명동 도보권
  { name: '명동역', nameEn: 'Myeongdong Stn.', line: '4호선', lineEn: 'Line 4', lat: 37.5609, lng: 126.9862 },
  { name: '회현역', nameEn: 'Hoehyeon Stn.', line: '4호선', lineEn: 'Line 4', lat: 37.5586, lng: 126.9784 },
  { name: '을지로입구역', nameEn: 'Euljiro 1-ga Stn.', line: '2호선', lineEn: 'Line 2', lat: 37.566, lng: 126.9827 },
  // 홍대 도보권
  { name: '홍대입구역', nameEn: 'Hongik Univ. Stn.', line: '2호선', lineEn: 'Line 2', lat: 37.557, lng: 126.9238 },
  { name: '상수역', nameEn: 'Sangsu Stn.', line: '6호선', lineEn: 'Line 6', lat: 37.5478, lng: 126.9227 },
  // 북촌·경복궁 도보권
  { name: '안국역', nameEn: 'Anguk Stn.', line: '3호선', lineEn: 'Line 3', lat: 37.5764, lng: 126.9849 },
  { name: '경복궁역', nameEn: 'Gyeongbokgung Stn.', line: '3호선', lineEn: 'Line 3', lat: 37.5757, lng: 126.9737 },
  // 성수·서울숲 도보권
  { name: '성수역', nameEn: 'Seongsu Stn.', line: '2호선', lineEn: 'Line 2', lat: 37.5446, lng: 127.0559 },
  { name: '서울숲역', nameEn: 'Seoul Forest Stn.', line: '수인분당선', lineEn: 'Suin-Bundang Line', lat: 37.5435, lng: 127.0447 },
  // 부산 해운대·광안리 도보권
  { name: '해운대역', nameEn: 'Haeundae Stn.', line: '부산 2호선', lineEn: 'Busan Line 2', lat: 35.1631, lng: 129.1586 },
  { name: '광안역', nameEn: 'Gwangan Stn.', line: '부산 2호선', lineEn: 'Busan Line 2', lat: 35.1553, lng: 129.1114 },
];

const BUS_STOPS = [
  // 명동 도보권
  { name: '명동성당 정류장', nameEn: 'Myeongdong Cathedral stop', lat: 37.5633, lng: 126.9873 },
  { name: '롯데백화점 정류장', nameEn: 'Lotte Dept. Store stop', lat: 37.5648, lng: 126.9817 },
  { name: '남대문시장 정류장', nameEn: 'Namdaemun Market stop', lat: 37.5594, lng: 126.9772 },
  // 홍대 도보권
  { name: '홍대입구역 정류장', nameEn: 'Hongik Univ. Stn. stop', lat: 37.5561, lng: 126.9227 },
  { name: '홍익대 정문 정류장', nameEn: 'Hongik Univ. Gate stop', lat: 37.552, lng: 126.9247 },
  // 북촌·경복궁 도보권
  { name: '북촌한옥마을 정류장', nameEn: 'Bukchon Hanok Village stop', lat: 37.581, lng: 126.9848 },
  { name: '경복궁 정류장', nameEn: 'Gyeongbokgung stop', lat: 37.576, lng: 126.9752 },
  // 성수·서울숲 도보권
  { name: '연무장길 정류장', nameEn: 'Yeonmujang-gil stop', lat: 37.543, lng: 127.0524 },
  { name: '서울숲 정류장', nameEn: 'Seoul Forest stop', lat: 37.544, lng: 127.0392 },
  // 부산 해운대·광안리 도보권
  { name: '해운대해수욕장 정류장', nameEn: 'Haeundae Beach stop', lat: 35.1595, lng: 129.159 },
  { name: '광안리해변 정류장', nameEn: 'Gwangalli Beach stop', lat: 35.1535, lng: 129.119 },
  // 제주 원도심 도보권 (제주는 지하철 없음 — 버스만)
  { name: '동문시장 정류장', nameEn: 'Dongmun Market stop', lat: 33.5124, lng: 126.5278 },
  { name: '탑동광장 정류장', nameEn: 'Tapdong Plaza stop', lat: 33.518, lng: 126.5218 },
  { name: '용두암 정류장', nameEn: 'Yongduam stop', lat: 33.5163, lng: 126.5125 },
];

const nearestOf = <T extends LatLng>(list: T[], p: LatLng): T =>
  [...list].sort((a, b) => distanceM(p, a) - distanceM(p, b))[0];

/** 2차 베지어 보간으로 부드러운 폴리라인 생성 */
function curve(from: LatLng, to: LatLng, bend = 0.25, n = 28): LatLng[] {
  const mx = (from.lat + to.lat) / 2;
  const my = (from.lng + to.lng) / 2;
  // 진행 방향의 수직으로 제어점을 살짝 밀어 곡선을 만든다
  const ctrl = {
    lat: mx + (to.lng - from.lng) * bend,
    lng: my - (to.lat - from.lat) * bend,
  };
  const pts: LatLng[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    pts.push({
      lat: a * from.lat + b * ctrl.lat + c * to.lat,
      lng: a * from.lng + b * ctrl.lng + c * to.lng,
    });
  }
  return pts;
}

/** 경유점을 지나는 폴리라인 */
function throughVia(from: LatLng, via: LatLng, to: LatLng): LatLng[] {
  return [...curve(from, via, 0.15, 14), ...curve(via, to, 0.15, 14).slice(1)];
}

const walkMinutes = (m: number) => Math.max(2, Math.round(m / 67));

export function buildRoutes(from: LatLng, to: LatLng): RouteCandidate[] {
  const dist = distanceM(from, to);
  // 승/하차 지점이 같으면 출발지에서 두 번째로 가까운 지점으로 하차를
  // 대체 (데모 연출) — 어느 지역에서도 그 지역 안에서 코스가 만들어진다.
  const secondNearest = <T extends LatLng & { name: string }>(list: T[], p: LatLng, not: T): T =>
    [...list].filter((x) => x.name !== not.name).sort((a, b) => distanceM(p, a) - distanceM(p, b))[0];
  const boardSt = nearestOf(SUBWAY_STATIONS, from);
  let alightSt = nearestOf(SUBWAY_STATIONS, to);
  if (boardSt.name === alightSt.name) {
    alightSt = secondNearest(SUBWAY_STATIONS, from, boardSt);
  }
  // 지하철이 없는 지역(제주 등): 가장 가까운 역이 5km 밖이면 지하철 후보 제외.
  const hasSubway = distanceM(from, boardSt) <= 5000;
  const boardBus = nearestOf(BUS_STOPS, from);
  let alightBus = nearestOf(BUS_STOPS, to);
  if (boardBus.name === alightBus.name) {
    alightBus = secondNearest(BUS_STOPS, from, boardBus);
  }

  const walk: RouteCandidate = {
    id: 'walk',
    mode: 'walk',
    vehicle: 'walk',
    label: tr('도보', 'Walk'),
    line: tr('도보', 'Walk'),
    minutes: walkMinutes(dist),
    fare: 0,
    transfers: 0,
    boardAt: tr('현재 위치', 'Current location'),
    alightAt: tr('도착지', 'Destination'),
    steps: [
      {
        icon: '🚶',
        text: tr(`도보 ${walkMinutes(dist)}분 (${Math.round(dist)}m)`, `Walk ${walkMinutes(dist)} min (${Math.round(dist)}m)`),
      },
      { icon: '🏁', text: tr('목적지 도착', 'Arrive at destination') },
    ],
    polyline: curve(from, to, 0.18),
  };

  // 도보권이라 실제론 걷는 게 빠르지만, 데모용으로 대중교통 후보 상시 제공
  const subway: RouteCandidate = {
    id: 'subway',
    mode: 'transit',
    vehicle: 'subway',
    label: tr('지하철', 'Subway'),
    line: tr(boardSt.line, boardSt.lineEn),
    minutes: Math.max(6, walkMinutes(dist) - 2),
    fare: 1500,
    transfers: 0,
    boardAt: tr(boardSt.name, boardSt.nameEn),
    alightAt: tr(alightSt.name, alightSt.nameEn),
    steps: [
      { icon: '🚶', text: tr(`${boardSt.name}까지 도보 2분`, `Walk 2 min to ${boardSt.nameEn}`) },
      {
        icon: '🚇',
        text: tr(`${boardSt.line} 승차 → ${alightSt.name} 하차`, `Board ${boardSt.lineEn} → alight at ${alightSt.nameEn}`),
      },
      { icon: '🚶', text: tr('출구에서 도착지까지 도보 2분', 'Walk 2 min from the exit') },
      { icon: '🏁', text: tr('목적지 도착', 'Arrive at destination') },
    ],
    polyline: throughVia(from, boardSt, to),
  };

  const bus: RouteCandidate = {
    id: 'bus',
    mode: 'transit',
    vehicle: 'bus',
    label: tr('버스', 'Bus'),
    line: tr('광역 0212', 'Bus 0212'),
    minutes: Math.max(7, walkMinutes(dist) - 1),
    fare: 1500,
    transfers: 0,
    boardAt: tr(boardBus.name, boardBus.nameEn),
    alightAt: tr(alightBus.name, alightBus.nameEn),
    steps: [
      { icon: '🚶', text: tr(`${boardBus.name}까지 도보 3분`, `Walk 3 min to ${boardBus.nameEn}`) },
      {
        icon: '🚌',
        text: tr(`0212번 승차 → ${alightBus.name} 하차`, `Board bus 0212 → alight at ${alightBus.nameEn}`),
      },
      { icon: '🚶', text: tr('정류장에서 도착지까지 도보 2분', 'Walk 2 min from the stop') },
      { icon: '🏁', text: tr('목적지 도착', 'Arrive at destination') },
    ],
    polyline: throughVia(from, boardBus, to),
  };

  return hasSubway ? [subway, bus, walk] : [bus, walk];
}

/** 폴리라인 위 진행률(0~1) 지점 좌표 */
export function pointAlong(polyline: LatLng[], t: number): LatLng {
  if (polyline.length === 0) return { lat: 0, lng: 0 };
  const idx = Math.min(polyline.length - 1, Math.max(0, t * (polyline.length - 1)));
  const i = Math.floor(idx);
  const frac = idx - i;
  const a = polyline[i];
  const b = polyline[Math.min(i + 1, polyline.length - 1)];
  return { lat: a.lat + (b.lat - a.lat) * frac, lng: a.lng + (b.lng - a.lng) * frac };
}
