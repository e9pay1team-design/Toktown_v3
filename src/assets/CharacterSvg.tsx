// ─── 플레이어블 캐릭터 SVG (파츠 조합형) ──────────────────────────
// 인간형 치비 캐릭터. 피부/헤어(스타일·색)/의상(스타일·색)을
// CharacterConfig 인덱스로 조합해 렌더링한다. 지도 마커·주민증·
// 온보딩 미리보기에서 동일 컴포넌트를 재사용한다.

import type { CharacterConfig } from '../types';
import {
  HAIR_COLORS,
  OUTFIT_COLORS,
  SKIN_TONES,
  shade,
} from './characterParts';

interface Props {
  config: CharacterConfig;
  /** 렌더 높이(px). 폭은 비율에 맞춰 자동 */
  size?: number;
  /** 흉상만 (주민증 사진용) */
  bust?: boolean;
  /** 바닥 그림자 */
  shadow?: boolean;
}

export function CharacterSvg({ config, size = 120, bust = false, shadow = true }: Props) {
  const skin = SKIN_TONES[config.skin % SKIN_TONES.length];
  const hair = HAIR_COLORS[config.hairColor % HAIR_COLORS.length];
  const cloth = OUTFIT_COLORS[config.outfitColor % OUTFIT_COLORS.length];
  const clothDark = shade(cloth, 0.18);
  const hairStyle = config.hairStyle % 4;
  const outfit = config.outfit % 3;

  const face = (
    <g>
      {/* 눈 */}
      <circle cx={46} cy={54} r={3.4} fill="#4A3B32" />
      <circle cx={74} cy={54} r={3.4} fill="#4A3B32" />
      <circle cx={47.2} cy={52.8} r={1.1} fill="#fff" />
      <circle cx={75.2} cy={52.8} r={1.1} fill="#fff" />
      {/* 볼터치 */}
      <circle cx={39} cy={63} r={5} fill="#FF9D9D" opacity={0.45} />
      <circle cx={81} cy={63} r={5} fill="#FF9D9D" opacity={0.45} />
      {/* 입 */}
      <path
        d="M55 64 q5 5 10 0"
        stroke="#4A3B32"
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );

  /* 헤어: 공통 앞머리 돔 + 스타일별 추가 파츠 */
  const hairDome = (
    <path
      d={
        'M24 52 A36 36 0 0 1 96 52 L96 55 ' +
        'Q88 47 80 52 Q72 42 60 44 Q48 42 40 52 Q32 47 24 55 Z'
      }
      fill={hair}
    />
  );

  const hairFront = (
    <g>
      {hairDome}
      {hairStyle === 0 && (
        <g>
          {/* 단발 사이드 */}
          <rect x={21} y={44} width={12} height={30} rx={6} fill={hair} />
          <rect x={87} y={44} width={12} height={30} rx={6} fill={hair} />
        </g>
      )}
      {hairStyle === 1 && (
        <g>
          {/* 숏컷 삐침 */}
          <path d="M38 24 l6 -9 l3 10 Z" fill={hair} />
          <path d="M56 18 l5 -10 l5 10 Z" fill={hair} />
          <path d="M76 24 l-5 -9 l-3 10 Z" fill={hair} />
        </g>
      )}
      {hairStyle === 2 && (
        <g>
          {/* 긴머리 사이드 */}
          <rect x={20} y={44} width={13} height={34} rx={6.5} fill={hair} />
          <rect x={87} y={44} width={13} height={34} rx={6.5} fill={hair} />
        </g>
      )}
      {hairStyle === 3 && (
        <g>
          {/* 번헤어 */}
          <circle cx={60} cy={13} r={11} fill={hair} />
          <rect x={50} y={20} width={20} height={5} rx={2.5} fill={shade(hair, 0.25)} />
        </g>
      )}
    </g>
  );

  /* 긴머리는 몸 뒤로 흘러내리는 뒷머리 레이어 */
  const hairBack =
    hairStyle === 2 ? (
      <g>
        <rect x={26} y={54} width={16} height={52} rx={8} fill={shade(hair, 0.12)} />
        <rect x={78} y={54} width={16} height={52} rx={8} fill={shade(hair, 0.12)} />
      </g>
    ) : null;

  const body = (
    <g>
      {/* 다리 */}
      <rect x={46} y={108} width={11} height={26} rx={5.5} fill={skin} />
      <rect x={63} y={108} width={11} height={26} rx={5.5} fill={skin} />
      <ellipse cx={51.5} cy={137} rx={9} ry={5.5} fill="#8A6B52" />
      <ellipse cx={68.5} cy={137} rx={9} ry={5.5} fill="#8A6B52" />
      {/* 팔 */}
      <circle cx={31} cy={99} r={7.5} fill={outfit === 2 ? '#FFF6E6' : cloth} />
      <circle cx={89} cy={99} r={7.5} fill={outfit === 2 ? '#FFF6E6' : cloth} />
      <circle cx={30} cy={105} r={4.2} fill={skin} />
      <circle cx={90} cy={105} r={4.2} fill={skin} />
      {/* 몸통 */}
      <rect
        x={36}
        y={84}
        width={48}
        height={36}
        rx={15}
        fill={outfit === 2 ? '#FFF6E6' : cloth}
      />
      {outfit === 0 && (
        /* 티셔츠 카라 */
        <path d="M52 84 q8 8 16 0 l-3 6 q-5 4 -10 0 Z" fill="#FFFDF7" opacity={0.9} />
      )}
      {outfit === 1 && (
        <g>
          {/* 후드 */}
          <path d="M40 86 q20 15 40 0 l0 7 q-20 13 -40 0 Z" fill={clothDark} />
          <line x1={54} y1={95} x2={54} y2={104} stroke="#FFFDF7" strokeWidth={2.4} strokeLinecap="round" />
          <line x1={66} y1={95} x2={66} y2={104} stroke="#FFFDF7" strokeWidth={2.4} strokeLinecap="round" />
          {/* 주머니 */}
          <rect x={48} y={106} width={24} height={11} rx={5.5} fill={clothDark} />
        </g>
      )}
      {outfit === 2 && (
        <g>
          {/* 멜빵바지 */}
          <rect x={44} y={98} width={32} height={22} rx={8} fill={cloth} />
          <rect x={44} y={84} width={7} height={18} rx={3.5} fill={cloth} />
          <rect x={69} y={84} width={7} height={18} rx={3.5} fill={cloth} />
          <circle cx={47.5} cy={100} r={2.4} fill="#FFD66B" />
          <circle cx={72.5} cy={100} r={2.4} fill="#FFD66B" />
        </g>
      )}
    </g>
  );

  const head = (
    <g>
      <circle cx={60} cy={50} r={36} fill={skin} />
      {face}
      {hairFront}
    </g>
  );

  if (bust) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="8 2 104 104"
        style={{ display: 'block' }}
        aria-label="내 캐릭터"
      >
        <rect
          x={34}
          y={86}
          width={52}
          height={22}
          rx={11}
          fill={outfit === 2 ? '#FFF6E6' : cloth}
        />
        {outfit === 2 && (
          <g>
            <rect x={44} y={86} width={7} height={16} rx={3.5} fill={cloth} />
            <rect x={69} y={86} width={7} height={16} rx={3.5} fill={cloth} />
          </g>
        )}
        {head}
      </svg>
    );
  }

  return (
    <svg
      width={(size * 120) / 150}
      height={size}
      viewBox="0 0 120 150"
      style={{ display: 'block' }}
      aria-label="내 캐릭터"
    >
      {shadow && <ellipse cx={60} cy={142} rx={26} ry={6} fill="rgba(74,59,50,0.14)" />}
      {hairBack}
      {body}
      {head}
    </svg>
  );
}
