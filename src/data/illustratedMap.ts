// ─── 일러스트 타운맵 통합 데이터 ──────────────────────────────────
// 개방된 모든 지역의 지오메트리를 하나로 합쳐 타일 렌더러(MapView)에
// 공급한다. 지역이 늘면 여기서 배열만 이어 붙이면 된다 — 렌더러는
// 캔버스 클리핑 덕에 화면 밖 지역을 그려도 비용이 거의 없다.

import {
  PARKS as MD_PARKS,
  PARK_TREES as MD_PARK_TREES,
  PLAZAS as MD_PLAZAS,
  ROADS as MD_ROADS,
  STREET_TREES as MD_STREET_TREES,
  URBAN as MD_URBAN,
  WATER as MD_WATER,
} from './myeongdongMap';
import {
  HONGDAE_PARKS,
  HONGDAE_PARK_TREES,
  HONGDAE_PLAZAS,
  HONGDAE_ROADS,
  HONGDAE_STREET_TREES,
  HONGDAE_URBAN,
  HONGDAE_WATER,
} from './hongdaeMap';

export { ROAD_MIN_ZOOM, ROAD_WIDTH_M, type MapWay, type RoadClass } from './myeongdongMap';

export const ROADS = [...MD_ROADS, ...HONGDAE_ROADS];
export const URBAN = [...MD_URBAN, ...HONGDAE_URBAN];
export const PLAZAS = [...MD_PLAZAS, ...HONGDAE_PLAZAS];
export const PARKS = [...MD_PARKS, ...HONGDAE_PARKS];
export const WATER = [...MD_WATER, ...HONGDAE_WATER];
export const PARK_TREES = [...MD_PARK_TREES, ...HONGDAE_PARK_TREES];
export const STREET_TREES = [...MD_STREET_TREES, ...HONGDAE_STREET_TREES];
