// ─── 지도 마커 SVG 컴포저 ─────────────────────────────────────────
// Leaflet divIcon 에 renderToStaticMarkup 으로 주입된다.
// (실서비스 전환 시 네이버/카카오 SDK 마커로 교체 예정)

import type { StoreCategory } from '../types';
import { CATEGORY_COLORS } from './buildings';
import { CategoryGlyph } from './misc';
import { shade } from './characterParts';

/** 매장 핀 (말풍선형) */
export function StorePin({
  category,
  saved = false,
  selected = false,
}: {
  category: StoreCategory;
  saved?: boolean;
  selected?: boolean;
}) {
  const color = CATEGORY_COLORS[category];
  const s = selected ? 52 : 40;
  return (
    <svg
      width={s}
      height={(s * 54) / 44}
      viewBox="0 0 44 54"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* 그림자 */}
      <ellipse cx={22} cy={51} rx={9} ry={2.6} fill="rgba(74,59,50,0.25)" />
      {/* 꼬리 */}
      <path d="M15 38 L22 50 L29 38 Z" fill={shade(color, 0.15)} />
      {/* 말풍선 몸통 */}
      <rect x={2} y={2} width={40} height={40} rx={14} fill={color} stroke="#FFFDF7" strokeWidth={3} />
      <g transform="translate(10 10)">
        <CategoryGlyph category={category} size={24} />
      </g>
      {saved && (
        <g>
          <circle cx={38} cy={6} r={8.5} fill="#FFFDF7" />
          <path
            d="M38 10.5 c-3.4 -2.6 -5.4 -4.6 -5.4 -6.7 a2.9 2.9 0 0 1 5.4 -1.4 a2.9 2.9 0 0 1 5.4 1.4 c0 2.1 -2 4.1 -5.4 6.7 Z"
            fill="#F2705E"
          />
        </g>
      )}
    </svg>
  );
}

/** NPC 조우 마커 — 흰 원형 버블 속 NPC 얼굴 + 반짝임 */
export function NpcBubble() {
  return (
    <svg width={52} height={60} viewBox="0 0 52 60" style={{ display: 'block', overflow: 'visible' }}>
      <ellipse cx={26} cy={57} rx={10} ry={2.8} fill="rgba(74,59,50,0.25)" />
      <path d="M19 44 L26 56 L33 44 Z" fill="#FFFDF7" />
      <circle cx={26} cy={24} r={22} fill="#FFFDF7" stroke="#FFD66B" strokeWidth={3} />
      {/* 까치 얼굴 (미니) */}
      <g>
        <ellipse cx={26} cy={26} rx={15} ry={14} fill="#3B4252" />
        <ellipse cx={20} cy={23} rx={5.5} ry={4.8} fill="#FFFDF7" />
        <ellipse cx={32} cy={23} rx={5.5} ry={4.8} fill="#FFFDF7" />
        <circle cx={20} cy={22.5} r={1.8} fill="#2B2B33" />
        <circle cx={32} cy={22.5} r={1.8} fill="#2B2B33" />
        <path d="M23.5 26 L28.5 26 L26 30 Z" fill="#F5B942" />
        <circle cx={16.5} cy={28} r={2.2} fill="#FF9D9D" opacity={0.6} />
        <circle cx={35.5} cy={28} r={2.2} fill="#FF9D9D" opacity={0.6} />
      </g>
      {/* 반짝임 */}
      <path d="M45 6 l1.6 3.8 l3.8 1.6 l-3.8 1.6 l-1.6 3.8 l-1.6 -3.8 l-3.8 -1.6 l3.8 -1.6 Z" fill="#FFD66B" />
      <path d="M6 12 l1.1 2.6 l2.6 1.1 l-2.6 1.1 l-1.1 2.6 l-1.1 -2.6 l-2.6 -1.1 l2.6 -1.1 Z" fill="#F2A7C3" />
    </svg>
  );
}

/** 내 캐릭터 위치 링 (캐릭터 SVG 아래에 겹침) */
export function LocationRing({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size / 2} viewBox="0 0 64 32" style={{ display: 'block' }}>
      <ellipse cx={32} cy={16} rx={26} ry={11} fill="rgba(94,179,204,0.25)" />
      <ellipse cx={32} cy={16} rx={26} ry={11} fill="none" stroke="#5EB3CC" strokeWidth={2.4} />
    </svg>
  );
}
