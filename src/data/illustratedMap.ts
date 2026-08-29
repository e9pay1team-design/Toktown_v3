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
import {
  BUKCHON_PARKS,
  BUKCHON_PARK_TREES,
  BUKCHON_PLAZAS,
  BUKCHON_ROADS,
  BUKCHON_STREET_TREES,
  BUKCHON_URBAN,
  BUKCHON_WATER,
} from './bukchonMap';
import {
  SEONGSU_PARKS,
  SEONGSU_PARK_TREES,
  SEONGSU_PLAZAS,
  SEONGSU_ROADS,
  SEONGSU_STREET_TREES,
  SEONGSU_URBAN,
  SEONGSU_WATER,
} from './seongsuMap';
import {
  BUSAN_PARKS,
  BUSAN_PARK_TREES,
  BUSAN_PLAZAS,
  BUSAN_ROADS,
  BUSAN_SANDS,
  BUSAN_SEAS,
  BUSAN_STREET_TREES,
  BUSAN_URBAN,
  BUSAN_WATER,
} from './busanMap';
import {
  JEJU_PARKS,
  JEJU_PARK_TREES,
  JEJU_PLAZAS,
  JEJU_ROADS,
  JEJU_SEAS,
  JEJU_STREET_TREES,
  JEJU_URBAN,
  JEJU_WATER,
} from './jejuMap';

export { ROAD_MIN_ZOOM, ROAD_WIDTH_M, type MapWay, type RoadClass } from './myeongdongMap';

export const ROADS = [...MD_ROADS, ...HONGDAE_ROADS, ...BUKCHON_ROADS, ...SEONGSU_ROADS, ...BUSAN_ROADS, ...JEJU_ROADS];
export const URBAN = [...MD_URBAN, ...HONGDAE_URBAN, ...BUKCHON_URBAN, ...SEONGSU_URBAN, ...BUSAN_URBAN, ...JEJU_URBAN];
export const PLAZAS = [...MD_PLAZAS, ...HONGDAE_PLAZAS, ...BUKCHON_PLAZAS, ...SEONGSU_PLAZAS, ...BUSAN_PLAZAS, ...JEJU_PLAZAS];
export const PARKS = [...MD_PARKS, ...HONGDAE_PARKS, ...BUKCHON_PARKS, ...SEONGSU_PARKS, ...BUSAN_PARKS, ...JEJU_PARKS];
export const WATER = [...MD_WATER, ...HONGDAE_WATER, ...BUKCHON_WATER, ...SEONGSU_WATER, ...BUSAN_WATER, ...JEJU_WATER];
export const PARK_TREES = [...MD_PARK_TREES, ...HONGDAE_PARK_TREES, ...BUKCHON_PARK_TREES, ...SEONGSU_PARK_TREES, ...BUSAN_PARK_TREES, ...JEJU_PARK_TREES];
export const STREET_TREES = [...MD_STREET_TREES, ...HONGDAE_STREET_TREES, ...BUKCHON_STREET_TREES, ...SEONGSU_STREET_TREES, ...BUSAN_STREET_TREES, ...JEJU_STREET_TREES];

/** 바다·백사장 채움 폴리곤 — 해안 존(부산·제주)에서 사용, 내륙 존은 비어 있다 */
export const SEAS = [...BUSAN_SEAS, ...JEJU_SEAS];
export const SANDS = [...BUSAN_SANDS];
