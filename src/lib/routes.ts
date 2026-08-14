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

/** 명동 도보권 가상 역/정류장 (경유점 목업) — 수단별 분리 */
const SUBWAY_STATIONS = [
  { name: '명동역', nameEn: 'Myeongdong Stn.', lat: 37.5609, lng: 126.9862 },
  { name: '회현역', nameEn: 'Hoehyeon Stn.', lat: 37.5586, lng: 126.9784 },
  { name: '을지로입구역', nameEn: 'Euljiro 1-ga Stn.', lat: 37.566, lng: 126.9827 },
];

const BUS_STOPS = [
  { name: '명동성당 정류장', nameEn: 'Myeongdong Cathedral stop', lat: 37.5633, lng: 126.9873 },
  { name: '롯데백화점 정류장', nameEn: 'Lotte Dept. Store stop', lat: 37.5648, lng: 126.9817 },
  { name: '남대문시장 정류장', nameEn: 'Namdaemun Market stop', lat: 37.5594, lng: 126.9772 },
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
  // 지하철: 승/하차역이 같으면 명동역→회현역 코스로 대체 (데모 연출)
  let boardSt = nearestOf(SUBWAY_STATIONS, from);
  let alightSt = nearestOf(SUBWAY_STATIONS, to);
  if (boardSt.name === alightSt.name) {
    boardSt = SUBWAY_STATIONS[0];
    alightSt = SUBWAY_STATIONS[1];
  }
  let boardBus = nearestOf(BUS_STOPS, from);
  let alightBus = nearestOf(BUS_STOPS, to);
  if (boardBus.name === alightBus.name) {
    boardBus = BUS_STOPS[0];
    alightBus = BUS_STOPS[1];
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
    line: tr('4호선', 'Line 4'),
    minutes: Math.max(6, walkMinutes(dist) - 2),
    fare: 1500,
    transfers: 0,
    boardAt: tr(boardSt.name, boardSt.nameEn),
    alightAt: tr(alightSt.name, alightSt.nameEn),
    steps: [
      { icon: '🚶', text: tr(`${boardSt.name}까지 도보 2분`, `Walk 2 min to ${boardSt.nameEn}`) },
      {
        icon: '🚇',
        text: tr(`4호선 승차 → ${alightSt.name} 하차`, `Board Line 4 → alight at ${alightSt.nameEn}`),
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

  return [subway, bus, walk];
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
