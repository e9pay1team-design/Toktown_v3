// ─── 공용 SVG: 로고 / Tokken 코인 / 카테고리 글리프 / 주민증 스탬프 ──

import type { StoreCategory } from '../types';

/** TokTown 로고 마크 — 말풍선 + 지붕(마을) */
export function TownLogoMark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }} aria-label="TokTown 로고">
      {/* 말풍선 몸통 */}
      <path
        d="M14 46 a34 30 0 1 1 44 28 l-12 14 l-2 -15 a34 30 0 0 1 -30 -27 Z"
        fill="#7BC47F"
      />
      {/* 지붕 */}
      <path d="M20 40 L48 18 L76 40 Z" fill="#F2705E" />
      <rect x={62} y={22} width={8} height={12} rx={2.5} fill="#B25B38" />
      {/* 몸통 창 */}
      <rect x={30} y={42} width={36} height={24} rx={6} fill="#FFFDF7" />
      <path d="M48 42 v24 M30 54 h36" stroke="#7BC47F" strokeWidth={3} />
      <circle cx={48} cy={30} r={3.4} fill="#FFD66B" />
    </svg>
  );
}

/** Tokken 코인 */
export function TokkenCoin({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'inline-block', verticalAlign: '-0.2em' }} aria-label="톡큰">
      <circle cx={24} cy={24} r={22} fill="#F5B942" />
      <circle cx={24} cy={24} r={17} fill="#FFD66B" />
      <path d="M15 17 h18 M24 17 v16" stroke="#B8862B" strokeWidth={4.6} strokeLinecap="round" />
      <path d="M10 12 l3 3 M35 33 l3 3" stroke="#FFF3DC" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/** 카테고리 글리프 (지도 핀 내부 아이콘) */
export function CategoryGlyph({ category, size = 20, color = '#FFFDF7' }: { category: StoreCategory; size?: number; color?: string }) {
  switch (category) {
    case '국밥':
    case '한식':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
          {/* 김이 나는 뚝배기 */}
          <path d="M8 20 h24 a12 10 0 0 1 -24 0 Z" fill={color} />
          <rect x={4} y={18} width={32} height={4} rx={2} fill={color} />
          <path d="M15 14 q2 -3 0 -6 M21 14 q2 -3 0 -6 M27 14 q2 -3 0 -6" stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </svg>
      );
    case '면':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
          <path d="M8 22 h24 a12 9 0 0 1 -24 0 Z" fill={color} />
          <path d="M12 20 q0 -7 3 -10 M19 20 q0 -7 0 -10 M26 20 q0 -7 -3 -10" stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <line x1={30} y1={6} x2={22} y2={19} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
        </svg>
      );
    case '카페':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
          <path d="M8 14 h20 v10 a10 10 0 0 1 -20 0 Z" fill={color} />
          <path d="M28 16 a5 5 0 0 1 0 9" stroke={color} strokeWidth={2.8} fill="none" />
          <path d="M14 10 q1.6 -2.6 0 -5 M21 10 q1.6 -2.6 0 -5" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        </svg>
      );
    case '공연장':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
          {/* 무대 커튼 */}
          <path d="M6 8 h28 v6 q-14 -4 -28 0 Z" fill={color} />
          <path d="M8 12 q3 12 1 20 h7 q-3 -12 -1 -20 Z" fill={color} />
          <path d="M32 12 q-3 12 -1 20 h-7 q3 -12 1 -20 Z" fill={color} />
          <circle cx={20} cy={24} r={4} fill={color} />
        </svg>
      );
  }
}

/** 주민증 도장 (주민 인증 스탬프) */
export function ResidentStamp({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block' }} aria-label="주민 인증 도장">
      <g transform="rotate(-14 40 40)" opacity={0.92}>
        <circle cx={40} cy={40} r={34} fill="none" stroke="#F2705E" strokeWidth={4} />
        <circle cx={40} cy={40} r={26} fill="none" stroke="#F2705E" strokeWidth={1.6} />
        <text x={40} y={37} textAnchor="middle" fontSize={13} fontWeight={800} fill="#F2705E">톡타운</text>
        <text x={40} y={52} textAnchor="middle" fontSize={13} fontWeight={800} fill="#F2705E">주민인증</text>
        <path d="M20 22 l4 4 M56 54 l4 4" stroke="#F2705E" strokeWidth={2} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** 방문 인증 뱃지 (리뷰용 미니 도장) */
export function CertifiedBadge({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'inline-block', verticalAlign: '-0.15em' }} aria-label="방문 인증">
      <circle cx={16} cy={16} r={14} fill="#7BC47F" />
      <path d="M9.5 16.5 l4.5 4.5 l8.5 -9" stroke="#FFFDF7" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 톡페이 혜택 뱃지 아이콘 */
export function BenefitIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'inline-block', verticalAlign: '-0.15em' }} aria-label="톡페이 혜택">
      <rect x={3} y={8} width={26} height={18} rx={4} fill="#5EB3CC" />
      <rect x={3} y={12} width={26} height={4} fill="#3E8FA6" />
      <circle cx={23} cy={21} r={2.6} fill="#FFD66B" />
    </svg>
  );
}
