// ─── 플레이어블 캐릭터 SVG (파츠 조합형) ──────────────────────────
// 인간형 치비 캐릭터. 피부/헤어(스타일·색)/의상(스타일·색) 무료 프리셋에
// 워드로브 구매 파츠(프리미엄 헤어·상의·하의·신발·페이스페인팅)를 겹쳐
// 렌더링한다. 지도 마커·주민증·온보딩·꾸미기 미리보기 공용.

import type { CharacterConfig } from '../types';
import {
  HAIR_COLORS,
  OUTFIT_COLORS,
  SKIN_TONES,
  shade,
} from './characterParts';
import { wardrobeById } from '../data/wardrobe';

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

  const top = wardrobeById(config.top);
  const bottom = wardrobeById(config.bottom);
  const shoes = wardrobeById(config.shoes);
  const paint = wardrobeById(config.facePaint);
  const premiumHair = wardrobeById(config.premiumHair)?.id;

  /** 몸통·팔 기본색 — 프리미엄 상의가 있으면 그 색으로 */
  const torsoFill = top ? top.color : outfit === 2 ? '#FFF6E6' : cloth;

  const facePaint =
    paint &&
    (paint.id === 'face-heart' ? (
      <path
        d="M83 60 c-2 -3.2 -6.2 -1 -4.6 2.2 c1 2 4.6 4.2 4.6 4.2 c0 0 3.6 -2.2 4.6 -4.2 c1.6 -3.2 -2.6 -5.4 -4.6 -2.2 Z"
        fill={paint.color}
      />
    ) : paint.id === 'face-star' ? (
      // 별은 노랑이 피부색에 묻히기 쉬워 크기를 키우고 외곽선·하이라이트를 더한다.
      <g>
        <path
          d="M83 55.6 l1.8 3.75 l4.15 0.55 l-3.05 2.9 l0.8 4.1 l-3.7 -2 l-3.7 2 l0.8 -4.1 l-3.05 -2.9 l4.15 -0.55 Z"
          fill={paint.color}
          stroke={paint.accent}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <circle cx={81} cy={59.6} r={1.05} fill="#FFFDF7" opacity={0.95} />
      </g>
    ) : (
      <g>
        {[0, 72, 144, 216, 288].map((deg) => (
          <circle
            key={deg}
            cx={83 + Math.cos(((deg - 90) * Math.PI) / 180) * 3.2}
            cy={61 + Math.sin(((deg - 90) * Math.PI) / 180) * 3.2}
            r={1.9}
            fill={paint.color}
          />
        ))}
        <circle cx={83} cy={61} r={1.5} fill="#FFD66B" />
      </g>
    ));

  const face = (
    <g>
      {/* 눈 */}
      <circle cx={46} cy={54} r={3.4} fill="#4A3B32" />
      <circle cx={74} cy={54} r={3.4} fill="#4A3B32" />
      <circle cx={47.2} cy={52.8} r={1.1} fill="#fff" />
      <circle cx={75.2} cy={52.8} r={1.1} fill="#fff" />
      {/* 볼터치 — 페이스페인팅 착용 시 오른뺨은 페인팅이 자리를 대신한다 */}
      <circle cx={39} cy={63} r={5} fill="#FF9D9D" opacity={0.45} />
      {!paint && <circle cx={81} cy={63} r={5} fill="#FF9D9D" opacity={0.45} />}
      {/* 입 */}
      <path
        d="M55 64 q5 5 10 0"
        stroke="#4A3B32"
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />
      {facePaint}
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
      {!premiumHair && hairStyle === 0 && (
        <g>
          {/* 단발 사이드 */}
          <rect x={21} y={44} width={12} height={30} rx={6} fill={hair} />
          <rect x={87} y={44} width={12} height={30} rx={6} fill={hair} />
        </g>
      )}
      {!premiumHair && hairStyle === 1 && (
        <g>
          {/* 숏컷 삐침 */}
          <path d="M38 24 l6 -9 l3 10 Z" fill={hair} />
          <path d="M56 18 l5 -10 l5 10 Z" fill={hair} />
          <path d="M76 24 l-5 -9 l-3 10 Z" fill={hair} />
        </g>
      )}
      {!premiumHair && hairStyle === 2 && (
        <g>
          {/* 긴머리 사이드 */}
          <rect x={20} y={44} width={13} height={34} rx={6.5} fill={hair} />
          <rect x={87} y={44} width={13} height={34} rx={6.5} fill={hair} />
        </g>
      )}
      {!premiumHair && hairStyle === 3 && (
        <g>
          {/* 번헤어 */}
          <circle cx={60} cy={13} r={11} fill={hair} />
          <rect x={50} y={20} width={20} height={5} rx={2.5} fill={shade(hair, 0.25)} />
        </g>
      )}
      {premiumHair === 'hair-pony' && (
        <g>
          {/* 하이포니 — 머리를 위로 당겨 묶은 실루엣: 정수리 묶음 + 슈슈 + 잔머리 */}
          <ellipse cx={68} cy={15} rx={8.5} ry={5.5} fill={hair} transform="rotate(18 68 15)" />
          <circle cx={75} cy={19} r={4} fill="#FF8B7B" />
          <circle cx={75} cy={19} r={1.5} fill="#E86A5A" />
          <path d="M25 48 q-3 7 -1 12 M95 48 q3 7 1 12" stroke={hair} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <path d="M40 30 Q56 22 70 20" stroke={shade(hair, 0.2)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </g>
      )}
      {premiumHair === 'hair-twin' && (
        <g>
          {/* 양갈래 — 가르마 + 리본 매듭 */}
          <path d="M60 26 v14" stroke={shade(hair, 0.25)} strokeWidth={2} strokeLinecap="round" />
          <circle cx={26} cy={54} r={3.4} fill="#FF8B7B" />
          <circle cx={94} cy={54} r={3.4} fill="#FF8B7B" />
        </g>
      )}
      {premiumHair === 'hair-wave' && (
        <g>
          {/* 웨이브 펌 — 앞머리 컬 */}
          <circle cx={33} cy={51} r={5.5} fill={hair} />
          <circle cx={87} cy={51} r={5.5} fill={hair} />
          <path d="M40 36 q4 4 0 8 M60 33 q4 4 0 8 M80 36 q-4 4 0 8" stroke={shade(hair, 0.2)} strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      )}
      {premiumHair === 'hair-braid' && (
        <g>
          {/* 꽃 화관 — 헤어라인을 따라 꽃과 잎이 두르는 왕관 */}
          <rect x={21} y={44} width={12} height={28} rx={6} fill={hair} />
          <rect x={87} y={44} width={12} height={28} rx={6} fill={hair} />
          {[
            [33, 41, '#F2A7C3'],
            [44, 31, '#FFFDF7'],
            [57, 26.5, '#F2A7C3'],
            [70, 28.5, '#FFFDF7'],
            [82, 35, '#F2A7C3'],
            [90, 44, '#FFFDF7'],
          ].map(([x, y, c], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <circle
                  key={deg}
                  cx={Number(x) + Math.cos(((deg - 90) * Math.PI) / 180) * 3.1}
                  cy={Number(y) + Math.sin(((deg - 90) * Math.PI) / 180) * 3.1}
                  r={2.1}
                  fill={String(c)}
                />
              ))}
              <circle cx={Number(x)} cy={Number(y)} r={1.8} fill="#FFD66B" />
            </g>
          ))}
          <ellipse cx={38.5} cy={35} rx={3.6} ry={1.9} fill="#7BC47F" transform="rotate(-38 38.5 35)" />
          <ellipse cx={50.5} cy={27.5} rx={3.6} ry={1.9} fill="#7BC47F" transform="rotate(-16 50.5 27.5)" />
          <ellipse cx={63.5} cy={26.5} rx={3.6} ry={1.9} fill="#7BC47F" transform="rotate(10 63.5 26.5)" />
          <ellipse cx={76.5} cy={31} rx={3.6} ry={1.9} fill="#7BC47F" transform="rotate(30 76.5 31)" />
          <ellipse cx={86.5} cy={39} rx={3.6} ry={1.9} fill="#7BC47F" transform="rotate(48 86.5 39)" />
        </g>
      )}
    </g>
  );

  /* 뒷머리 레이어 (몸 뒤) — 긴머리·포니·양갈래·웨이브 */
  const hairBack = (
    <g>
      {!premiumHair && hairStyle === 2 && (
        <g>
          <rect x={26} y={54} width={16} height={52} rx={8} fill={shade(hair, 0.12)} />
          <rect x={78} y={54} width={16} height={52} rx={8} fill={shade(hair, 0.12)} />
        </g>
      )}
      {premiumHair === 'hair-pony' && (
        <g>
          {/* 정수리에서 시작해 어깨 뒤로 떨어지는 하이포니 꼬리 */}
          <path d="M76 16 Q100 24 99 50 Q98 74 86 88 Q92 62 86 44 Q81 28 70 22 Z" fill={shade(hair, 0.1)} />
          <path d="M83 30 Q93 44 90 64" stroke={shade(hair, 0.24)} strokeWidth={2} fill="none" strokeLinecap="round" />
          <ellipse cx={87} cy={86} rx={4.5} ry={6.5} fill={shade(hair, 0.1)} transform="rotate(20 87 86)" />
        </g>
      )}
      {premiumHair === 'hair-twin' && (
        <g>
          <ellipse cx={25} cy={73} rx={7} ry={17} fill={shade(hair, 0.1)} />
          <ellipse cx={95} cy={73} rx={7} ry={17} fill={shade(hair, 0.1)} />
        </g>
      )}
      {premiumHair === 'hair-wave' && (
        <g>
          {[
            [24, 58],
            [20, 72],
            [26, 85],
            [96, 58],
            [100, 72],
            [94, 85],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={7 - (i % 3) * 0.6} fill={shade(hair, 0.08)} />
          ))}
        </g>
      )}
    </g>
  );

  /* 신발 — 프리미엄이 있으면 기본 브라운 슈즈 대체 */
  const feet = shoes ? (
    <g>
      {shoes.id === 'shoes-sandals' && (
        <g>
          <ellipse cx={51.5} cy={138.5} rx={9} ry={4.6} fill={shoes.color} />
          <ellipse cx={68.5} cy={138.5} rx={9} ry={4.6} fill={shoes.color} />
          <ellipse cx={51.5} cy={135.5} rx={6.6} ry={3.2} fill={skin} />
          <ellipse cx={68.5} cy={135.5} rx={6.6} ry={3.2} fill={skin} />
          <path d="M45.5 136 q6 -4.5 12 0 M62.5 136 q6 -4.5 12 0" stroke="#8A6B52" strokeWidth={2} fill="none" />
        </g>
      )}
      {shoes.id === 'shoes-sneakers' && (
        <g>
          <ellipse cx={51.5} cy={137} rx={9.5} ry={6} fill={shoes.color} />
          <ellipse cx={68.5} cy={137} rx={9.5} ry={6} fill={shoes.color} />
          <path d="M42.5 139.5 q9 4 18 0 M59.5 139.5 q9 4 18 0" stroke="#D8D2C4" strokeWidth={2.2} fill="none" />
          <path d="M44 135.5 q5 3.5 13 1.5 M61 135.5 q5 3.5 13 1.5" stroke={shoes.accent} strokeWidth={2} fill="none" />
          <circle cx={51.5} cy={132.6} r={1.1} fill="#D8D2C4" />
          <circle cx={68.5} cy={132.6} r={1.1} fill="#D8D2C4" />
        </g>
      )}
      {shoes.id === 'shoes-boots' && (
        <g>
          <rect x={44} y={122} width={13} height={13} rx={4.5} fill={shoes.color} />
          <rect x={62.5} y={122} width={13} height={13} rx={4.5} fill={shoes.color} />
          <rect x={44} y={122} width={13} height={3.6} rx={1.8} fill={shoes.accent} />
          <rect x={62.5} y={122} width={13} height={3.6} rx={1.8} fill={shoes.accent} />
          <ellipse cx={51.5} cy={137} rx={9.5} ry={5.5} fill={shoes.color} />
          <ellipse cx={68.5} cy={137} rx={9.5} ry={5.5} fill={shoes.color} />
          <path d="M47.5 126.5 v6 M66 126.5 v6" stroke="#FFFDF7" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
        </g>
      )}
      {shoes.id === 'shoes-kkotsin' && (
        <g>
          <ellipse cx={51.5} cy={137} rx={9} ry={5} fill={shoes.color} />
          <ellipse cx={68.5} cy={137} rx={9} ry={5} fill={shoes.color} />
          <path d="M43.5 137 q-2.5 -2 -1.5 -5 M61 137 q-2.5 -2 -1.5 -5" stroke={shoes.color} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M43.5 139.5 q8 3.4 16 0 M60.5 139.5 q8 3.4 16 0" stroke="#FFFDF7" strokeWidth={1.8} fill="none" />
          <circle cx={52.5} cy={135} r={1.7} fill={shoes.accent} />
          <circle cx={69.5} cy={135} r={1.7} fill={shoes.accent} />
        </g>
      )}
    </g>
  ) : (
    <g>
      <ellipse cx={51.5} cy={137} rx={9} ry={5.5} fill="#8A6B52" />
      <ellipse cx={68.5} cy={137} rx={9} ry={5.5} fill="#8A6B52" />
    </g>
  );

  /* 하의 — 몸통 위에 겹쳐 하의 실루엣을 만든다 (멜빵바지 방식) */
  const bottomWear = bottom && (
    <g>
      {bottom.id === 'bottom-shorts' && (
        <g>
          <rect x={44} y={111} width={32} height={13} rx={5.5} fill={bottom.color} />
          <rect x={44} y={119.5} width={13.5} height={4.5} rx={2.2} fill={bottom.accent} />
          <rect x={62.5} y={119.5} width={13.5} height={4.5} rx={2.2} fill={bottom.accent} />
        </g>
      )}
      {bottom.id === 'bottom-jeans' && (
        <g>
          <rect x={44} y={111} width={32} height={9} rx={3.5} fill={bottom.color} />
          <rect x={44.5} y={116} width={13.5} height={18.5} rx={4.5} fill={bottom.color} />
          <rect x={62} y={116} width={13.5} height={18.5} rx={4.5} fill={bottom.color} />
          <rect x={44.5} y={129.5} width={13.5} height={4} rx={2} fill="#8FA6CC" />
          <rect x={62} y={129.5} width={13.5} height={4} rx={2} fill="#8FA6CC" />
          <path d="M60 111 v7 M46.5 115.5 q4 3 7.5 0 M66 115.5 q4 3 7.5 0" stroke={bottom.accent} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </g>
      )}
      {bottom.id === 'bottom-pleats' && (
        <g>
          {/* 트렌디 미니 플리츠 — 짧고 살짝 퍼지는 A라인, 지그재그 플리츠 밑단 */}
          <path d="M43 110 L77 110 L81 122.5 L74.5 126 L68 122.8 L60 126.5 L52 122.8 L45.5 126 L39 122.5 Z" fill={bottom.color} />
          <path d="M52 111 L52 123 M60 111 L60 126.5 M68 111 L68 123" stroke={bottom.accent} strokeWidth={1.5} opacity={0.75} />
          <rect x={42} y={107.5} width={36} height={4.5} rx={2.2} fill={bottom.accent} />
        </g>
      )}
      {bottom.id === 'bottom-chima' && (
        <g>
          {/* 한복 치마 — 가슴선 말기 + 종 모양 폭 */}
          <path d="M42 103 L78 103 Q90 139 83 141 L37 141 Q30 139 42 103 Z" fill={bottom.color} />
          <path d="M50 107 L45 138 M60 105 V140 M70 107 L75 138" stroke={bottom.accent} strokeWidth={1.6} opacity={0.55} />
          <path d="M32.5 137.5 Q60 145 87.5 137.5" stroke={bottom.accent} strokeWidth={3.4} fill="none" />
          <rect x={42} y={99} width={36} height={7} rx={3.5} fill="#F5EFE3" />
        </g>
      )}
    </g>
  );

  /* 상의 디테일 — 프리미엄 상의가 기본 의상 디테일을 대체 */
  const topWear = top ? (
    <g>
      {top.id === 'top-stripe' && (
        <g>
          <rect x={38} y={91} width={44} height={5.5} rx={2.7} fill={top.accent} />
          <rect x={38} y={101} width={44} height={5.5} rx={2.7} fill={top.accent} />
          <rect x={39} y={111} width={42} height={5.5} rx={2.7} fill={top.accent} />
          <path d="M52 84 q8 8 16 0 l-3 6 q-5 4 -10 0 Z" fill={top.accent} />
        </g>
      )}
      {top.id === 'top-denim' && (
        <g>
          <rect x={52} y={84} width={16} height={36} fill="#FFFDF7" />
          <rect x={36} y={84} width={17} height={36} rx={8} fill={top.color} />
          <rect x={67} y={84} width={17} height={36} rx={8} fill={top.color} />
          <path d="M44 85 l9 9 l-11 4 Z M76 85 l-9 9 l11 4 Z" fill={top.accent} />
          <rect x={39.5} y={104} width={9.5} height={7} rx={2} fill="none" stroke={top.accent} strokeWidth={1.8} />
          <rect x={71} y={104} width={9.5} height={7} rx={2} fill="none" stroke={top.accent} strokeWidth={1.8} />
          <circle cx={45} cy={99.5} r={1.8} fill="#E8C87F" />
          <circle cx={75} cy={99.5} r={1.8} fill="#E8C87F" />
        </g>
      )}
      {top.id === 'top-knit' && (
        <g>
          <path d="M48 84 L60 100 L72 84 L66 84 L60 92.5 L54 84 Z" fill="#FFFDF7" />
          <path d="M48 84 L60 100 M72 84 L60 100" stroke={top.accent} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={60} cy={105} r={1.9} fill="#8A6B52" />
          <circle cx={60} cy={111.5} r={1.9} fill="#8A6B52" />
          <circle cx={60} cy={118} r={1.9} fill="#8A6B52" />
          <path d="M44 113 v6 M51 115 v5 M69 115 v5 M76 113 v6" stroke={top.accent} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      )}
      {top.id === 'top-jeogori' && (
        <g>
          {/* 교차 깃(동정) + 고름 */}
          <path d="M45 84 L64 108 L69.5 103.5 L52 84 Z" fill="#FFFDF7" />
          <path d="M45 84 L64 108" stroke={top.accent} strokeWidth={2.2} />
          <path d="M62 105 l3.5 -2.5 l3.5 15 l-4.5 1.2 Z" fill={top.accent} />
          <path d="M65 103.5 l4.5 -1 l1.2 13.5 l-3.5 1 Z" fill="#E86A5A" />
          {/* 색동 소매 끝동 */}
          {['#D95A4A', '#FFD66B', '#7BC47F'].map((c, i) => (
            <g key={c}>
              <rect x={24} y={93 + i * 3.6} width={5.5} height={3.6} fill={c} />
              <rect x={90.5} y={93 + i * 3.6} width={5.5} height={3.6} fill={c} />
            </g>
          ))}
        </g>
      )}
    </g>
  ) : (
    <g>
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

  const body = (
    <g>
      {/* 다리 */}
      <rect x={46} y={108} width={11} height={26} rx={5.5} fill={skin} />
      <rect x={63} y={108} width={11} height={26} rx={5.5} fill={skin} />
      {feet}
      {/* 하의 — 상의(몸통 전체)보다 항상 아래 레이어. 허리단은 상의
          밑단에 가려지고 다리 쪽 실루엣만 밖으로 드러난다 */}
      {bottomWear}
      {/* 팔 */}
      <circle cx={31} cy={99} r={7.5} fill={torsoFill} />
      <circle cx={89} cy={99} r={7.5} fill={torsoFill} />
      <circle cx={30} cy={105} r={4.2} fill={skin} />
      <circle cx={90} cy={105} r={4.2} fill={skin} />
      {/* 몸통(상의 베이스) + 상의 디테일 */}
      <rect x={36} y={84} width={48} height={36} rx={15} fill={torsoFill} />
      {topWear}
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
        <rect x={34} y={86} width={52} height={22} rx={11} fill={torsoFill} />
        {!top && outfit === 2 && (
          <g>
            <rect x={44} y={86} width={7} height={16} rx={3.5} fill={cloth} />
            <rect x={69} y={86} width={7} height={16} rx={3.5} fill={cloth} />
          </g>
        )}
        {top?.id === 'top-jeogori' && (
          <path d="M45 86 L60 104 L65 100 L52 86 Z" fill="#FFFDF7" stroke={top.accent} strokeWidth={1.6} />
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
