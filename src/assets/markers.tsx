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

/** NPC 조우 마커 — 흰 원형 버블 속 NPC 얼굴 + 반짝임 (npcId 별 얼굴) */
export function NpcBubble({ npcId, drummer = false }: { npcId?: string; drummer?: boolean }) {
  const cat = npcId === 'hongdae-cat';
  const tiger = npcId === 'bukchon-tiger';
  const deer = npcId === 'seongsu-deer';
  return (
    <svg width={52} height={60} viewBox="0 0 52 60" style={{ display: 'block', overflow: 'visible' }}>
      <ellipse cx={26} cy={57} rx={10} ry={2.8} fill="rgba(74,59,50,0.25)" />
      <path d="M19 44 L26 56 L33 44 Z" fill="#FFFDF7" />
      <circle cx={26} cy={24} r={22} fill="#FFFDF7" stroke={drummer ? '#8B79C9' : '#FFD66B'} strokeWidth={3} />
      {tiger ? (
        /* 아기호랑이 호야 얼굴 (미니) — 이마 줄무늬 + 코 */
        <g>
          <path d="M15 17 L11 8 L21 12 Z" fill="#E8944B" />
          <path d="M37 17 L41 8 L31 12 Z" fill="#E8944B" />
          <ellipse cx={26} cy={26} rx={15} ry={14} fill="#F0A055" />
          <path d="M22 15 q1 3 -0.5 4.5 M30 15 q-1 3 0.5 4.5 M26 14 v4.5" stroke="#4A3B32" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M13 24 q3.5 1.5 2.6 5 M39 24 q-3.5 1.5 -2.6 5" stroke="#4A3B32" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <circle cx={20} cy={26} r={1.9} fill="#2B2B33" />
          <circle cx={32} cy={26} r={1.9} fill="#2B2B33" />
          <ellipse cx={26} cy={31} rx={6} ry={4.4} fill="#FFF3DC" />
          <ellipse cx={26} cy={29.5} rx={2} ry={1.6} fill="#C2503F" />
          <path d="M26 31 v1.8 M26 32.8 q-2 2 -4 0.5 M26 32.8 q2 2 4 0.5" stroke="#4A3B32" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          <circle cx={14.5} cy={30} r={2.2} fill="#FF9D9D" opacity={0.6} />
          <circle cx={37.5} cy={30} r={2.2} fill="#FF9D9D" opacity={0.6} />
        </g>
      ) : deer ? (
        /* 꽃사슴 라떼 얼굴 (미니) — 뿔 + 점무늬 */
        <g>
          <path d="M17 12 q-3 -7 -8 -8 M35 12 q3 -7 8 -8" stroke="#8A6B52" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <circle cx={8.5} cy={4} r={1.6} fill="#A98467" />
          <circle cx={43.5} cy={4} r={1.6} fill="#A98467" />
          <path d="M14 18 L8 12 L19 14 Z" fill="#C89B66" />
          <path d="M38 18 L44 12 L33 14 Z" fill="#C89B66" />
          <ellipse cx={26} cy={26} rx={15} ry={14} fill="#C89B66" />
          <circle cx={16} cy={20} r={1.4} fill="#FFF3DC" />
          <circle cx={36} cy={20} r={1.4} fill="#FFF3DC" />
          <circle cx={13.5} cy={25} r={1.2} fill="#FFF3DC" />
          <circle cx={38.5} cy={25} r={1.2} fill="#FFF3DC" />
          <circle cx={20} cy={25} r={1.9} fill="#2B2B33" />
          <circle cx={32} cy={25} r={1.9} fill="#2B2B33" />
          <ellipse cx={26} cy={31} rx={6} ry={4.6} fill="#EFD3B8" />
          <ellipse cx={26} cy={29.5} rx={2} ry={1.6} fill="#5B4A3F" />
          <path d="M26 31 v1.8 M26 32.8 q-2 2 -4 0.5 M26 32.8 q2 2 4 0.5" stroke="#5B4A3F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          <circle cx={14.5} cy={30} r={2.2} fill="#FF9D9D" opacity={0.6} />
          <circle cx={37.5} cy={30} r={2.2} fill="#FF9D9D" opacity={0.6} />
        </g>
      ) : cat ? (
        /* 인디 고양이 기냥 얼굴 (미니) — 비니 + ω 입 */
        <g>
          <path d="M15 18 L11 7 L21 13 Z" fill="#5B5566" />
          <path d="M37 18 L41 7 L31 13 Z" fill="#5B5566" />
          <ellipse cx={26} cy={26} rx={15} ry={14} fill="#6B6377" />
          <path d="M13.5 20 a13 9 0 0 1 25 0 Z" fill="#3B4252" />
          <rect x={12.5} y={18.2} width={27} height={4.2} rx={2.1} fill="#2B2F3E" />
          <circle cx={20} cy={27} r={1.9} fill="#2B2B33" />
          <circle cx={32} cy={27} r={1.9} fill="#2B2B33" />
          <path d="M24.6 29.5 h2.8 l-1.4 2 Z" fill="#E8899B" />
          <path d="M23 33 q1.6 1.8 3 0 q1.6 1.8 3 0" stroke="#2B2B33" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <circle cx={15.5} cy={31} r={2.2} fill="#FF9D9D" opacity={0.6} />
          <circle cx={36.5} cy={31} r={2.2} fill="#FF9D9D" opacity={0.6} />
        </g>
      ) : (
        /* 까치 얼굴 (미니) */
        <g>
          <ellipse cx={26} cy={26} rx={15} ry={14} fill="#3B4252" />
          <ellipse cx={20} cy={23} rx={5.5} ry={4.8} fill="#FFFDF7" />
          <ellipse cx={32} cy={23} rx={5.5} ry={4.8} fill="#FFFDF7" />
          <circle cx={20} cy={22.5} r={1.8} fill="#2B2B33" />
          <circle cx={32} cy={22.5} r={1.8} fill="#2B2B33" />
          <path d="M23.5 26 L28.5 26 L26 30 Z" fill="#F5B942" />
          <circle cx={16.5} cy={28} r={2.2} fill="#FF9D9D" opacity={0.6} />
          <circle cx={35.5} cy={28} r={2.2} fill="#FF9D9D" opacity={0.6} />
          {drummer && (
            <path d="M12 17 q14 -7 28 0 l-0.8 3.6 q-13 -6 -26.4 0 Z" fill="#8A5CF6" />
          )}
        </g>
      )}
      {/* 반짝임 */}
      {drummer ? (
        <path d="M44 5 l1.5 3.6 l3.6 1.5 l-3.6 1.5 l-1.5 3.6 l-1.5 -3.6 l-3.6 -1.5 l3.6 -1.5 Z" fill="#B48CFF" />
      ) : (
        <path d="M45 6 l1.6 3.8 l3.8 1.6 l-3.8 1.6 l-1.6 3.8 l-1.6 -3.8 l-3.8 -1.6 l3.8 -1.6 Z" fill="#FFD66B" />
      )}
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
