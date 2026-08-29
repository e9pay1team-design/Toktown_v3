// ─── Leaflet 지도 뷰 ──────────────────────────────────────────────
// 배경은 코드 내장 일러스트 벡터 지도(data/myeongdongMap)를 캔버스
// 타일로 직접 그린다 — 외부 타일 서버 의존이 없어 웹 공유 샌드박스·
// 오프라인·사내 프록시 어디서나 동일하게 보이고, 톡타운 아트스타일과도
// 맞는다. 매장 POI 아이콘 없음 — 매장 표시는 톡타운 자체 마커가 전담.
// 실서비스 전환 시 네이버/카카오 지도 SDK 로 교체 예정.

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import type { EventBooth, Landmark, LatLng, NpcSpot, Store } from '../../types';
import { regionalNpcById } from '../../data/seed';
import { REGIONS, UPCOMING_REGIONS, type Region } from '../../data/regions';
import { KOREA_BOUNDS, KOREA_LAND } from '../../data/koreaOutline';
import {
  PARKS,
  PARK_TREES,
  PLAZAS,
  ROADS,
  ROAD_MIN_ZOOM,
  ROAD_WIDTH_M,
  SANDS,
  SEAS,
  STREET_TREES,
  URBAN,
  WATER,
  type RoadClass,
} from '../../data/illustratedMap';
import { StorePin, NpcBubble } from '../../assets/markers';
import { LandmarkSvg } from '../../assets/landmarks';
import { CharacterSvg } from '../../assets/CharacterSvg';
import type { CharacterConfig } from '../../types';
import { lmName, sName, tr, useLang } from '../../i18n';

interface MapViewProps {
  /** 활성 지역 — 초기 카메라 중심/줌 (이동 한계는 전국 공통) */
  region: Region;
  /** 지역 배지 탭 — 시·도 배지는 확대, 존 배지는 지역 이동, 잠금은 예고 */
  onZonePick: (pick: {
    kind: 'sido' | 'zone';
    regionId?: string;
    name: string;
    nameEn: string;
    locked: boolean;
    center: LatLng;
  }) => void;
  stores: Store[];
  savedIds: number[];
  selectedStoreId: number | null;
  npcSpots: NpcSpot[];
  landmarks: Landmark[];
  myPosition: LatLng;
  character: CharacterConfig;
  flyTo: (LatLng & { zoom?: number; seq: number }) | null;
  /** 이동 중 경로 폴리라인 (M2) */
  routeLine: LatLng[] | null;
  /** 이동 중 카메라가 내 캐릭터를 따라감 (M2) */
  follow: boolean;
  /** Event Map 활성 시 혜택 반경 오버레이 (M3) */
  eventCircle: (LatLng & { radiusM: number }) | null;
  /** Event Map 활성 시 부스·게이트 마커 */
  eventBooths: EventBooth[] | null;
  onBoothClick: (booth: EventBooth) => void;
  onStoreClick: (id: number) => void;
  onNpcClick: (spot: NpcSpot) => void;
  onLandmarkClick: (lm: Landmark) => void;
  onMapClick: (latlng: LatLng) => void;
}

/** 매장 핀 divIcon */
function storeIcon(store: Store, saved: boolean, selected: boolean): L.DivIcon {
  const w = selected ? 52 : 40;
  const h = (w * 54) / 44;
  return L.divIcon({
    className: 'toktown-marker mk-store',
    html: renderToStaticMarkup(
      <StorePin category={store.category} saved={saved} selected={selected} />,
    ),
    iconSize: [w, h],
    iconAnchor: [w / 2, h * 0.93],
  });
}

const npcIcon = (npcId: string | undefined, drummer: boolean) =>
  L.divIcon({
    className: 'toktown-marker mk-npc',
    html: `<div class="npc-bounce">${renderToStaticMarkup(<NpcBubble npcId={npcId} drummer={drummer} />)}</div>`,
    iconSize: [52, 60],
    iconAnchor: [26, 57],
  });

/** 랜드마크별 렌더 크기 — LandmarkSvg 내부 비율(id별 상이)과 일치해야 함 */
const LANDMARK_SIZE: Record<string, [number, number]> = {
  cathedral: [58, 61],
  namsan: [46, 74],
  cheonggyecheon: [64, 45],
  gwanghwamun: [61, 58],
  'gyeongui-line': [64, 44],
  'busking-stage': [60, 50],
  geunjeongjeon: [61, 58],
  'bukchon-hanok': [67, 50],
  'seoul-forest': [65, 49],
  'red-brick': [58, 58],
  'gwangan-bridge': [72, 42],
  nurimaru: [58, 55],
};

function landmarkIcon(lm: Landmark): L.DivIcon {
  const [w, h] = LANDMARK_SIZE[lm.id] ?? [56, 56];
  return L.divIcon({
    className: 'toktown-marker mk-landmark',
    html: renderToStaticMarkup(<LandmarkSvg id={lm.id} size={lm.id === 'namsan' ? 64 : 58} />),
    iconSize: [w, h],
    iconAnchor: [w / 2, h - 3],
  });
}

// ── 일러스트 벡터 지도 타일 렌더 ──────────────────────────────────
const TILE_D = 256;
const lngToPx = (lng: number, z: number) => ((lng + 180) / 360) * TILE_D * 2 ** z;
const latToPx = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * TILE_D * 2 ** z;
};

/** 레이캐스팅 다각형 내부 판정 (픽셀 좌표) */
function pointInPoly(x: number, y: number, poly: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** 정수 쌍 결정적 해시 0..1 — 건물 점 지터용 */
function hash2(a: number, b: number): number {
  let h = (a * 374761393 + b * 668265263) ^ 1013904223;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const ROAD_CASING: Record<RoadClass, string> = {
  major: '#DFCFB0',
  mid: '#DFCFB0',
  minor: '#E3D6BB',
  ped: '#E6DAC1',
};
const ROAD_FILL: Record<RoadClass, string> = {
  major: '#FFF6E3',
  mid: '#FFFCF3',
  minor: '#FFFCF3',
  ped: '#F7EFDD',
};

function drawIllustratedTile(g: CanvasRenderingContext2D, coords: L.Coords, w: number, h: number): void {
  // 1) 종이 질감 바탕.
  g.fillStyle = '#EFF2E3';
  g.fillRect(0, 0, w, h);
  let s = (coords.x * 73856093) ^ (coords.y * 19349663) ^ (coords.z * 83492791);
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return ((s >>> 8) & 0xffff) / 0x10000;
  };
  if (coords.z >= 12) {
    for (let i = 0; i < 6; i++) {
      const r = 26 + rnd() * 52;
      const cx = r + rnd() * Math.max(1, w - r * 2);
      const cy = r + rnd() * Math.max(1, h - r * 2);
      g.fillStyle = i % 2 ? 'rgba(214,226,190,0.35)' : 'rgba(233,239,216,0.5)';
      g.beginPath();
      g.ellipse(cx, cy, r, r * (0.55 + rnd() * 0.45), rnd() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(148,170,120,0.13)';
    for (let i = 0; i < 36; i++) {
      g.fillRect(4 + rnd() * (w - 8), 4 + rnd() * (h - 8), 2, 2);
    }
  }

  // 2) 벡터 지리 — 타일마다 전체 지오메트리를 그린다(캔버스가 알아서 클립;
  //    경계를 넘는 선분도 이웃 타일과 이어져 보인다). 데이터가 작아 저렴하다.
  const z = coords.z;
  const ox = coords.x * TILE_D;
  const oy = coords.y * TILE_D;
  // 축척(m/px)은 타일 중심 위도로 계산 — 지역이 어느 위도든 도로 폭이 맞는다.
  const tileLat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (coords.y + 0.5)) / 2 ** z))) * 180) / Math.PI;
  const mpp = (156543.03392 * Math.cos((tileLat * Math.PI) / 180)) / 2 ** z;
  const px = (m: number, min = 1) => Math.max(min, m / mpp);
  const tracePath = (pts: [number, number][], close = false) => {
    g.beginPath();
    pts.forEach(([lat, lng], i) => {
      const x = lngToPx(lng, z) - ox;
      const y = latToPx(lat, z) - oy;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    if (close) g.closePath();
  };
  g.lineJoin = 'round';
  g.lineCap = 'round';

  // 0) 전국 뷰 (z≤11) — 바다 + 국토 실루엣만. 상세 지리·질감은 점진 생략.
  if (z <= 11) {
    g.fillStyle = '#CFE2EA';
    g.fillRect(0, 0, w, h);
    for (const poly of KOREA_LAND) {
      tracePath(poly, true);
      g.fillStyle = '#F0F2E1';
      g.fill();
      g.strokeStyle = '#A3C6D4';
      g.lineWidth = Math.max(1.8, px(500, 1.8));
      g.stroke();
    }
    // 국토에 옅은 녹지 결 — 백두대간 느낌의 능선 두 줄.
    g.strokeStyle = 'rgba(148,170,120,0.35)';
    g.lineWidth = Math.max(2.5, px(2200, 2.5));
    tracePath([
      [38.3, 128.3], [37.6, 128.75], [36.9, 128.9], [36.2, 128.6], [35.6, 128.2],
    ]);
    g.stroke();
    tracePath([
      [35.5, 127.6], [34.95, 127.35], [34.7, 126.9],
    ]);
    g.stroke();
    return;
  }

  // 바다·백사장 (해안 존) — 도심·녹지·다리보다 먼저 깔린다.
  for (const poly of SEAS) {
    tracePath(poly, true);
    g.fillStyle = '#A8D4E4';
    g.fill();
    g.strokeStyle = '#8FC0D6';
    g.lineWidth = px(6, 2);
    g.stroke();
  }
  for (const poly of SANDS) {
    tracePath(poly, true);
    g.fillStyle = '#F5E7C2';
    g.fill();
    g.strokeStyle = '#E8D5A4';
    g.lineWidth = px(3, 1.2);
    g.stroke();
  }

  // 도심 블록(건물 밀집 지역) — 옅은 채움 + 확대 시 건물 점 텍스처.
  for (const poly of URBAN) {
    tracePath(poly, true);
    g.fillStyle = '#EBE4D0';
    g.fill();
  }
  if (z >= 15) {
    // 전역 픽셀 그리드에 정렬해 타일 경계에서도 패턴이 이어진다.
    const step = Math.max(11, px(24));
    g.fillStyle = 'rgba(203,189,156,0.6)';
    for (const poly of URBAN) {
      const pts = poly.map(([lat, lng]) => ({ x: lngToPx(lng, z) - ox, y: latToPx(lat, z) - oy }));
      const minX = Math.max(Math.min(...pts.map((p) => p.x)), -16);
      const maxX = Math.min(Math.max(...pts.map((p) => p.x)), w + 16);
      const minY = Math.max(Math.min(...pts.map((p) => p.y)), -16);
      const maxY = Math.min(Math.max(...pts.map((p) => p.y)), h + 16);
      if (maxX < minX || maxY < minY) continue;
      const gx0 = Math.floor((ox + minX) / step);
      const gx1 = Math.ceil((ox + maxX) / step);
      const gy0 = Math.floor((oy + minY) / step);
      const gy1 = Math.ceil((oy + maxY) / step);
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const jx = hash2(gx, gy);
          const jy = hash2(gy, gx);
          const x = gx * step - ox + (jx - 0.5) * step * 0.5;
          const y = gy * step - oy + (jy - 0.5) * step * 0.5;
          if (!pointInPoly(x, y, pts)) continue;
          const bw = Math.max(2.5, px(9 + jx * 8));
          const bh = bw * (0.65 + jy * 0.55);
          g.fillRect(x - bw / 2, y - bh / 2, bw, bh);
        }
      }
    }
  }

  // 공원·녹지.
  for (const poly of PARKS) {
    tracePath(poly, true);
    g.fillStyle = '#CDE3AE';
    g.fill();
    g.strokeStyle = '#B7D398';
    g.lineWidth = px(3, 1);
    g.stroke();
  }

  // 광장·보행 특화 공간 — 밝은 석재 톤.
  for (const poly of PLAZAS) {
    tracePath(poly, true);
    g.fillStyle = '#F2EBDB';
    g.fill();
    g.strokeStyle = '#E0D4BA';
    g.lineWidth = px(2.5, 1);
    g.stroke();
  }

  // 청계천.
  for (const stream of WATER) {
    tracePath(stream);
    g.strokeStyle = '#7FB0C4';
    g.lineWidth = px(20, 3.4);
    g.stroke();
    tracePath(stream);
    g.strokeStyle = '#A5D3E2';
    g.lineWidth = px(15, 2.2);
    g.stroke();
  }

  // 도로 — 케이싱 전체 → 채움 전체 순서로 그려야 교차로가 자연스럽다.
  const visible = ROADS.filter((way) => z >= ROAD_MIN_ZOOM[way.c]);
  for (const way of visible) {
    tracePath(way.p);
    g.strokeStyle = ROAD_CASING[way.c];
    g.lineWidth = px(way.w ?? ROAD_WIDTH_M[way.c]) + px(2.4, 1.4);
    g.stroke();
  }
  for (const way of visible) {
    tracePath(way.p);
    g.strokeStyle = ROAD_FILL[way.c];
    g.lineWidth = px(way.w ?? ROAD_WIDTH_M[way.c]);
    g.stroke();
  }

  // 나무 — 남산 숲(z15+) + 가로수(z16+).
  const drawTree = (lat: number, lng: number, r: number) => {
    const x = lngToPx(lng, z) - ox;
    const y = latToPx(lat, z) - oy;
    if (x < -30 || y < -30 || x > w + 30 || y > h + 30) return;
    g.fillStyle = 'rgba(74,59,50,0.12)';
    g.beginPath();
    g.ellipse(x, y + r * 0.9, r * 0.9, r * 0.32, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#79AE60';
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#8CC073';
    g.beginPath();
    g.arc(x - r * 0.28, y - r * 0.3, r * 0.55, 0, Math.PI * 2);
    g.fill();
  };
  if (z >= 15) {
    const r = Math.max(3, px(9));
    for (const [lat, lng] of PARK_TREES) drawTree(lat, lng, r);
  }
  if (z >= 16) {
    const r = Math.max(2.6, px(5.5));
    for (const [lat, lng] of STREET_TREES) drawTree(lat, lng, r);
  }
}

const IllustratedTileLayer = L.GridLayer.extend({
  createTile(this: L.GridLayer, coords: L.Coords): HTMLElement {
    const size = this.getTileSize();
    const tile = document.createElement('canvas');
    // 레티나 선명도: 캔버스 해상도 2배, CSS 크기는 Leaflet 이 관리.
    tile.width = size.x * 2;
    tile.height = size.y * 2;
    const g = tile.getContext('2d');
    if (g) {
      g.scale(2, 2);
      drawIllustratedTile(g, coords, size.x, size.y);
    }
    return tile;
  },
}) as unknown as new (options?: L.GridLayerOptions) => L.GridLayer;

/** 이벤트 부스·게이트 마커 — 보라 링 칩 */
const boothIcon = (emoji: string) =>
  L.divIcon({
    className: 'toktown-marker mk-booth',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#FFFDF7;border:2.5px solid #8B79C9;box-shadow:0 2px 6px rgba(74,59,50,.28);font-size:15px">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

/** 지역 배지 — 시·도(전국 뷰)/존(중간 줌) 2단계, 개방(초록)/잠금(회색) */
const zoneIcon = (label: string, locked: boolean, tier: 'sido' | 'zone') =>
  L.divIcon({
    className: `toktown-marker mk-zone mk-zone-${tier === 'sido' ? 'sido' : 'local'}`,
    html: `<div class="zone-wrap"><div class="zone-chip${locked ? ' zone-locked' : ''}">${locked ? '🔒' : tier === 'sido' ? '📍' : '🗺️'} ${label}</div></div>`,
    iconSize: [0, 0],
  });

function myIcon(character: CharacterConfig): L.DivIcon {
  const char = renderToStaticMarkup(<CharacterSvg config={character} size={58} shadow={false} />);
  return L.divIcon({
    className: 'toktown-marker mk-me',
    html:
      `<div style="position:relative;width:64px;height:78px">` +
      `<div class="ring-pulse" style="position:absolute;left:9px;bottom:0;width:46px;height:19px;border-radius:50%;background:rgba(94,179,204,.30);border:2.5px solid #5EB3CC"></div>` +
      `<div class="char-bob" style="position:absolute;left:9px;bottom:7px">${char}</div>` +
      `</div>`,
    iconSize: [64, 78],
    iconAnchor: [32, 72],
  });
}

export function MapView(props: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const storeLayerRef = useRef<L.LayerGroup | null>(null);
  const npcLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarkLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const myMarkerRef = useRef<L.Marker | null>(null);
  // 최신 콜백을 이벤트 핸들러에서 참조하기 위한 ref
  const cbRef = useRef(props);
  cbRef.current = props;
  // 언어 변경 시 마커 툴팁·라벨 재생성
  const lang = useLang();

  /* 지도 초기화 (1회) */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const region = cbRef.current.region;
    const map = L.map(el, {
      center: [region.center.lat, region.center.lng],
      zoom: region.zoom,
      zoomControl: false,
      // 최저 줌 6 = 대한민국 전체가 한 화면 — 한계는 전국 공통 고정.
      minZoom: 6,
      maxZoom: 19,
      maxBounds: L.latLngBounds(KOREA_BOUNDS),
      // 1.0 = 경계에서 탄성 없이 딱 멈춤 (되튕김 없음)
      maxBoundsViscosity: 1.0,
    });

    // 줌 밴드 → CSS 마커 점진 생략 (near ≥14 전체 · mid 12~13 랜드마크만 · far ≤11 지역 배지만)
    const applyBand = () => {
      el.dataset.zoomband = map.getZoom() >= 14 ? 'near' : map.getZoom() >= 12 ? 'mid' : 'far';
    };
    map.on('zoomend', applyBand);
    applyBand();

    // 일러스트 벡터 지도 — 외부 타일 서버 없이 항상 그려진다.
    new IllustratedTileLayer({ zIndex: 1 }).addTo(map);

    map.on('click', (e) => cbRef.current.onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }));

    storeLayerRef.current = L.layerGroup().addTo(map);
    npcLayerRef.current = L.layerGroup().addTo(map);
    landmarkLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* 전국 뷰 지역 배지 — 개방 지역 + 잠금 예고 (탭 시 이동/안내) */
  const zoneLayerRef = useRef<L.LayerGroup | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    zoneLayerRef.current?.remove();
    const layer = L.layerGroup();
    // 시·도 배지 (전국 뷰) — 개방 지역은 시·도별 1개(중심 평균), 잠금은 예고.
    const sidoGroups = new Map<string, { sidoEn: string; lats: number[]; lngs: number[] }>();
    for (const r of REGIONS) {
      const g = sidoGroups.get(r.sido) ?? { sidoEn: r.sidoEn, lats: [], lngs: [] };
      g.lats.push(r.center.lat);
      g.lngs.push(r.center.lng);
      sidoGroups.set(r.sido, g);
    }
    for (const [sido, g] of sidoGroups) {
      const center = {
        lat: g.lats.reduce((a, b) => a + b, 0) / g.lats.length,
        lng: g.lngs.reduce((a, b) => a + b, 0) / g.lngs.length,
      };
      const m = L.marker([center.lat, center.lng], { icon: zoneIcon(tr(sido, g.sidoEn), false, 'sido'), zIndexOffset: 5200 });
      m.on('click', () =>
        cbRef.current.onZonePick({ kind: 'sido', name: sido, nameEn: g.sidoEn, locked: false, center }),
      );
      layer.addLayer(m);
    }
    for (const u of UPCOMING_REGIONS) {
      const m = L.marker([u.center.lat, u.center.lng], { icon: zoneIcon(tr(u.sido, u.sidoEn), true, 'sido'), zIndexOffset: 5100 });
      m.on('click', () =>
        cbRef.current.onZonePick({ kind: 'sido', name: u.sido, nameEn: u.sidoEn, locked: true, center: u.center }),
      );
      layer.addLayer(m);
    }
    // 존 배지 (중간 줌) — 개방 존 이동 + 잠금 존 예고.
    for (const r of REGIONS) {
      const m = L.marker([r.center.lat, r.center.lng], {
        icon: zoneIcon(tr(r.name, r.nameEn), false, 'zone'),
        zIndexOffset: 5000,
      });
      m.on('click', () =>
        cbRef.current.onZonePick({ kind: 'zone', regionId: r.id, name: r.name, nameEn: r.nameEn, locked: false, center: r.center }),
      );
      layer.addLayer(m);
    }
    for (const u of UPCOMING_REGIONS) {
      const m = L.marker([u.center.lat, u.center.lng], {
        icon: zoneIcon(tr(u.name, u.nameEn), true, 'zone'),
        zIndexOffset: 4900,
      });
      m.on('click', () =>
        cbRef.current.onZonePick({ kind: 'zone', name: u.name, nameEn: u.nameEn, locked: true, center: u.center }),
      );
      layer.addLayer(m);
    }
    layer.addTo(map);
    zoneLayerRef.current = layer;
  }, [lang]);

  /* 매장 마커 */
  useEffect(() => {
    const layer = storeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const store of props.stores) {
      const selected = props.selectedStoreId === store.id;
      const marker = L.marker([store.lat, store.lng], {
        icon: storeIcon(store, props.savedIds.includes(store.id), selected),
        zIndexOffset: selected ? 800 : 100,
      });
      marker.bindTooltip(sName(store), {
        direction: 'top',
        offset: [0, -44],
        className: 'toktown-tooltip',
      });
      marker.on('click', () => cbRef.current.onStoreClick(store.id));
      layer.addLayer(marker);
    }
  }, [props.stores, props.savedIds, props.selectedStoreId, lang]);

  /* NPC 마커 (지역 한정 출몰) */
  useEffect(() => {
    const layer = npcLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const spot of props.npcSpots) {
      const drummer = spot.variant === 'drummer';
      const npc = regionalNpcById(spot.npcId ?? (drummer ? 'magpie-kkaami' : 'magpie'));
      const marker = L.marker([spot.lat, spot.lng], {
        icon: npcIcon(spot.npcId, drummer),
        zIndexOffset: drummer ? 600 : 500,
      });
      marker.bindTooltip(
        `${tr(`${npc.species} ${npc.name}`, `${npc.nameEn ?? npc.name} the ${npc.speciesEn ?? npc.species}`)}${drummer ? ' 🎪' : ''} · ${tr(spot.label, spot.labelEn ?? spot.label)}`,
        {
          direction: 'top',
          offset: [0, -56],
          className: 'toktown-tooltip',
        },
      );
      marker.on('click', () => cbRef.current.onNpcClick(spot));
      layer.addLayer(marker);
    }
  }, [props.npcSpots, lang]);

  /* Event Map 부스·게이트 마커 */
  const boothLayerRef = useRef<L.LayerGroup | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    boothLayerRef.current?.remove();
    boothLayerRef.current = null;
    if (!props.eventBooths || props.eventBooths.length === 0) return;
    const layer = L.layerGroup();
    for (const booth of props.eventBooths) {
      const marker = L.marker([booth.lat, booth.lng], { icon: boothIcon(booth.emoji), zIndexOffset: 420 });
      marker.bindTooltip(tr(booth.name, booth.nameEn ?? booth.name), {
        direction: 'top',
        offset: [0, -16],
        className: 'toktown-tooltip',
      });
      marker.on('click', () => cbRef.current.onBoothClick(booth));
      layer.addLayer(marker);
    }
    layer.addTo(map);
    boothLayerRef.current = layer;
  }, [props.eventBooths, lang]);

  /* Event Map 혜택 반경 */
  const eventLayerRef = useRef<L.Circle | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    eventLayerRef.current?.remove();
    eventLayerRef.current = null;
    if (!props.eventCircle) return;
    eventLayerRef.current = L.circle([props.eventCircle.lat, props.eventCircle.lng], {
      radius: props.eventCircle.radiusM,
      color: '#8B79C9',
      weight: 2.5,
      dashArray: '6 8',
      fillColor: '#8B79C9',
      fillOpacity: 0.08,
    }).addTo(map);
  }, [props.eventCircle]);

  /* 랜드마크 오버레이 */
  useEffect(() => {
    const layer = landmarkLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const lm of props.landmarks) {
      const marker = L.marker([lm.lat, lm.lng], { icon: landmarkIcon(lm), zIndexOffset: 50 });
      marker.bindTooltip(lmName(lm), {
        direction: 'bottom',
        offset: [0, 6],
        permanent: true,
        className: 'landmark-label',
      });
      marker.on('click', () => cbRef.current.onLandmarkClick(lm));
      layer.addLayer(marker);
    }
  }, [props.landmarks, lang]);

  /* 내 캐릭터 — 마커는 캐릭터 변경 시에만 재생성, 위치는 setLatLng 로 갱신
     (이동 중 프레임 단위 갱신이 있어 재생성하면 DOM 부하가 큼) */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (myMarkerRef.current) myMarkerRef.current.remove();
    myMarkerRef.current = L.marker([props.myPosition.lat, props.myPosition.lng], {
      icon: myIcon(props.character),
      zIndexOffset: 1000,
      interactive: false,
    }).addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.character]);

  useEffect(() => {
    const map = mapRef.current;
    myMarkerRef.current?.setLatLng([props.myPosition.lat, props.myPosition.lng]);
    if (map && props.follow) {
      map.panTo([props.myPosition.lat, props.myPosition.lng], { animate: false });
    }
  }, [props.myPosition, props.follow]);

  /* 이동 경로 폴리라인 */
  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!props.routeLine || props.routeLine.length < 2) return;
    const pts = props.routeLine.map((p) => [p.lat, p.lng]) as [number, number][];
    layer.addLayer(
      L.polyline(pts, { color: '#FFFDF7', weight: 9, opacity: 0.9, lineCap: 'round' }),
    );
    layer.addLayer(
      L.polyline(pts, {
        color: '#4E9B58',
        weight: 5,
        opacity: 0.95,
        dashArray: '1 10',
        lineCap: 'round',
      }),
    );
    const end = pts[pts.length - 1];
    layer.addLayer(
      L.marker(end, {
        icon: L.divIcon({
          className: 'toktown-marker',
          html: '<div style="font-size:22px;filter:drop-shadow(0 2px 2px rgba(74,59,50,.3))">🏁</div>',
          iconSize: [24, 24],
          iconAnchor: [4, 22],
        }),
        interactive: false,
      }),
    );
  }, [props.routeLine]);

  /* 카메라 이동 요청 */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !props.flyTo) return;
    map.flyTo([props.flyTo.lat, props.flyTo.lng], props.flyTo.zoom ?? map.getZoom(), {
      duration: 0.8,
    });
  }, [props.flyTo]);

  return <div ref={containerRef} className="h-full w-full" />;
}
