// ─── 꾸미기 소품 SVG (Tokken 상점 판매, 내 마을 배치) ─────────────

export function DecorSvg({ id, size = 56 }: { id: string; size?: number }) {
  switch (id) {
    case 'bench':
      return (
        <svg width={size} height={size * 0.75} viewBox="0 0 80 60" style={{ display: 'block' }} aria-label="나무 벤치">
          <ellipse cx={40} cy={55} rx={30} ry={4.5} fill="rgba(74,59,50,0.14)" />
          <rect x={10} y={22} width={60} height={9} rx={4.5} fill="#B98A5C" />
          <rect x={10} y={8} width={60} height={9} rx={4.5} fill="#CE9F6C" />
          <rect x={13} y={12} width={7} height={42} rx={3.5} fill="#8A6B52" />
          <rect x={60} y={12} width={7} height={42} rx={3.5} fill="#8A6B52" />
          <rect x={10} y={34} width={60} height={9} rx={4.5} fill="#CE9F6C" />
        </svg>
      );
    case 'lamp':
      return (
        <svg width={size * 0.6} height={size * 1.1} viewBox="0 0 48 88" style={{ display: 'block' }} aria-label="가로등">
          <ellipse cx={24} cy={84} rx={16} ry={3.5} fill="rgba(74,59,50,0.14)" />
          <rect x={21} y={22} width={6} height={60} rx={3} fill="#5B4A3F" />
          <rect x={12} y={76} width={24} height={7} rx={3.5} fill="#4A3B32" />
          <path d="M12 22 h24 l-4 -12 h-16 Z" fill="#4A3B32" />
          <rect x={16} y={12} width={16} height={11} rx={3} fill="#FFD66B" />
          <circle cx={24} cy={18} r={3.4} fill="#FFF3DC" />
          <path d="M8 6 l3 3 M40 6 l-3 3" stroke="#FFD66B" strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      );
    case 'flower':
      // 꽃 화단 — 나무 플랜터 박스. 실제 배치 색은 핑크/노랑/보라 중 랜덤이라
      // 썸네일은 세 색을 섞어 보여준다.
      return (
        <svg width={size} height={size * 0.75} viewBox="0 0 80 60" style={{ display: 'block' }} aria-label="꽃 화단">
          <ellipse cx={40} cy={54} rx={30} ry={5} fill="rgba(74,59,50,0.14)" />
          {/* 플랜터 박스 */}
          <path d="M8 34 L40 50 L72 34 L72 44 L40 58 L8 44 Z" fill="#B98A5C" />
          <path d="M40 50 L72 34 L72 44 L40 58 Z" fill="#9C714C" />
          <path d="M8 34 L40 18 L72 34 L40 50 Z" fill="#CE9F6C" />
          <path d="M14 34 L40 21.5 L66 34 L40 46.5 Z" fill="#6E4A33" />
          {/* 잎 */}
          <ellipse cx={24} cy={33} rx={5} ry={3.2} fill="#79AE60" />
          <ellipse cx={52} cy={38} rx={5} ry={3.2} fill="#79AE60" />
          {/* 꽃 3송이 — 세 가지 색 변형 미리보기 */}
          {[
            [26, 24, '#F2A7C3'],
            [40, 30, '#FFD66B'],
            [55, 25, '#C7B9F2'],
          ].map(([x, y, c], i) => (
            <g key={i}>
              <line x1={Number(x)} y1={Number(y) + 9} x2={Number(x)} y2={Number(y) + 2} stroke="#5B8A46" strokeWidth={2} strokeLinecap="round" />
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse
                  key={deg}
                  cx={Number(x)}
                  cy={Number(y) - 4.4}
                  rx={2.8}
                  ry={4.2}
                  fill={String(c)}
                  transform={`rotate(${deg} ${x} ${y})`}
                />
              ))}
              <circle cx={Number(x)} cy={Number(y)} r={2.7} fill="#FFF3DC" />
            </g>
          ))}
          <circle cx={18} cy={22} r={1.6} fill="#FFFDF7" opacity={0.9} />
          <circle cx={63} cy={19} r={1.4} fill="#FFFDF7" opacity={0.9} />
        </svg>
      );
    case 'fountain':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block' }} aria-label="분수대">
          <ellipse cx={40} cy={74} rx={32} ry={5} fill="rgba(74,59,50,0.14)" />
          <ellipse cx={40} cy={64} rx={32} ry={12} fill="#CBC4B4" />
          <ellipse cx={40} cy={60} rx={32} ry={12} fill="#E7E3DA" />
          <ellipse cx={40} cy={60} rx={24} ry={8.5} fill="#8ED1E1" />
          <rect x={35} y={30} width={10} height={26} rx={4} fill="#CBC4B4" />
          <ellipse cx={40} cy={30} rx={13} ry={5} fill="#E7E3DA" />
          <path d="M40 12 q-10 8 -8 16 M40 12 q10 8 8 16 M40 10 v10" stroke="#8ED1E1" strokeWidth={3.4} fill="none" strokeLinecap="round" />
          <circle cx={40} cy={9} r={3.4} fill="#B7E6F0" />
          <circle cx={28} cy={58} r={2} fill="#FFFDF7" opacity={0.8} />
          <circle cx={52} cy={61} r={2} fill="#FFFDF7" opacity={0.8} />
        </svg>
      );
    case 'mailbox':
      return (
        <svg width={size * 0.62} height={size} viewBox="0 0 50 80" style={{ display: 'block' }} aria-label="빨간 우체통">
          <ellipse cx={25} cy={76} rx={15} ry={3.5} fill="rgba(74,59,50,0.14)" />
          <rect x={20} y={44} width={10} height={32} rx={4} fill="#8A6B52" />
          <rect x={7} y={10} width={36} height={38} rx={10} fill="#F2705E" />
          <rect x={7} y={10} width={36} height={12} rx={6} fill="#D95A4A" />
          <rect x={13} y={26} width={24} height={5} rx={2.5} fill="#5E3A34" />
          <rect x={13} y={36} width={16} height={4} rx={2} fill="#FFF3DC" />
          <circle cx={38} cy={38} r={2.4} fill="#FFD66B" />
        </svg>
      );
    case 'tree':
      return (
        <svg width={size} height={size * 1.05} viewBox="0 0 76 80" style={{ display: 'block' }} aria-label="단풍나무">
          <ellipse cx={38} cy={76} rx={22} ry={4} fill="rgba(74,59,50,0.14)" />
          <rect x={33} y={48} width={10} height={28} rx={5} fill="#8A6B52" />
          <path d="M38 52 q-8 -6 -14 -2" stroke="#8A6B52" strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={38} cy={26} r={22} fill="#E8834B" />
          <circle cx={20} cy={36} r={13} fill="#F2A65E" />
          <circle cx={56} cy={36} r={13} fill="#D96C4A" />
          <circle cx={30} cy={18} r={4} fill="#FFD66B" opacity={0.8} />
          <circle cx={48} cy={24} r={3} fill="#FFD66B" opacity={0.7} />
          <path d="M62 56 q4 4 2 9 M14 58 q-3 4 -1 8" stroke="#D96C4A" strokeWidth={3} fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'plaza-tile':
      return (
        <svg width={size} height={size * 0.62} viewBox="0 0 80 50" style={{ display: 'block' }} aria-label="돌바닥 타일">
          <ellipse cx={40} cy={44} rx={27} ry={4} fill="rgba(74,59,50,0.10)" />
          <path d="M40 5 L75 24 L40 43 L5 24 Z" fill="#F0E7D6" />
          <path d="M40 5 L75 24 L40 43 L5 24 Z" fill="none" stroke="#E6DBC5" strokeWidth={2.5} />
          <path d="M40 10 L66 24 L40 38 L14 24 Z" fill="none" stroke="#D8CBB1" strokeWidth={1.6} />
        </svg>
      );
    case 'wood-table':
      return (
        <svg width={size} height={size * 0.8} viewBox="0 0 80 64" style={{ display: 'block' }} aria-label="나무 테이블">
          <ellipse cx={40} cy={59} rx={26} ry={4.5} fill="rgba(74,59,50,0.14)" />
          <rect x={36} y={22} width={8} height={34} rx={4} fill="#8A6B52" />
          <rect x={22} y={52} width={36} height={6} rx={3} fill="#8A6B52" />
          <ellipse cx={40} cy={22} rx={30} ry={12} fill="#B98A5C" />
          <ellipse cx={40} cy={19} rx={30} ry={12} fill="#CE9F6C" />
          <ellipse cx={40} cy={19} rx={19} ry={7} fill="none" stroke="#B98A5C" strokeWidth={2} />
          <ellipse cx={30} cy={15} rx={9} ry={3} fill="#FFF3DC" opacity={0.5} />
        </svg>
      );
    case 'leather-sofa':
      return (
        <svg width={size} height={size * 0.78} viewBox="0 0 84 62" style={{ display: 'block' }} aria-label="가죽소파">
          <ellipse cx={42} cy={57} rx={30} ry={4.5} fill="rgba(74,59,50,0.14)" />
          <rect x={12} y={8} width={60} height={26} rx={9} fill="#A9713F" />
          <circle cx={30} cy={20} r={2.2} fill="rgba(90,55,25,0.5)" />
          <circle cx={54} cy={20} r={2.2} fill="rgba(90,55,25,0.5)" />
          <rect x={4} y={22} width={13} height={26} rx={6} fill="#8B5A32" />
          <rect x={67} y={22} width={13} height={26} rx={6} fill="#8B5A32" />
          <rect x={14} y={32} width={27} height={14} rx={5.5} fill="#B97F4B" />
          <rect x={43} y={32} width={27} height={14} rx={5.5} fill="#B97F4B" />
          <rect x={12} y={45} width={60} height={7} rx={3.5} fill="#8B5A32" />
          <rect x={16} y={52} width={5} height={6} rx={2} fill="#5B4A3F" />
          <rect x={63} y={52} width={5} height={6} rx={2} fill="#5B4A3F" />
        </svg>
      );
    case 'cherry-tree':
      return (
        <svg width={size} height={size * 1.05} viewBox="0 0 76 80" style={{ display: 'block' }} aria-label="벚꽃나무">
          <ellipse cx={38} cy={76} rx={22} ry={4} fill="rgba(74,59,50,0.14)" />
          <rect x={33} y={48} width={10} height={28} rx={5} fill="#8A6B52" />
          <path d="M38 52 q-8 -6 -14 -2" stroke="#8A6B52" strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={38} cy={26} r={22} fill="#F4B8CE" />
          <circle cx={20} cy={36} r={13} fill="#E89BB8" />
          <circle cx={56} cy={36} r={13} fill="#FBD3E2" />
          <circle cx={30} cy={18} r={4} fill="#FFFDF7" opacity={0.85} />
          <circle cx={48} cy={24} r={3} fill="#FFFDF7" opacity={0.75} />
          <path d="M62 54 q4 4 2 9 M14 56 q-3 4 -1 8" stroke="#E89BB8" strokeWidth={3} fill="none" strokeLinecap="round" />
          <ellipse cx={64} cy={68} rx={3} ry={2} fill="#F7A8C4" />
          <ellipse cx={12} cy={70} rx={2.6} ry={1.8} fill="#F7A8C4" />
        </svg>
      );
    case 'statue':
      return (
        <svg width={size * 0.85} height={size} viewBox="0 0 66 80" style={{ display: 'block' }} aria-label="캐릭터 동상">
          <ellipse cx={33} cy={76} rx={22} ry={4} fill="rgba(74,59,50,0.14)" />
          {/* 석재 받침 + 명판 */}
          <rect x={11} y={58} width={44} height={16} rx={3.5} fill="#A8A090" />
          <ellipse cx={33} cy={58} rx={22} ry={6.5} fill="#C7C0B0" />
          <rect x={25} y={63} width={16} height={6.5} rx={2} fill="#E8C87F" />
          {/* 청동 까치 */}
          <g transform="rotate(28 14 46)">
            <rect x={4} y={42} width={20} height={7} rx={3.5} fill="#6E5F3E" />
          </g>
          <ellipse cx={33} cy={36} rx={15} ry={18} fill="#8C7A52" />
          <ellipse cx={33} cy={43} rx={8.5} ry={9.5} fill="#A5946B" />
          <ellipse cx={21} cy={38} rx={4.5} ry={8.5} fill="#6E5F3E" transform="rotate(14 21 38)" />
          <ellipse cx={45} cy={38} rx={4.5} ry={8.5} fill="#6E5F3E" transform="rotate(-14 45 38)" />
          <circle cx={28} cy={29} r={1.9} fill="#6E5F3E" />
          <circle cx={38} cy={29} r={1.9} fill="#6E5F3E" />
          <path d="M29.5 33 h7 l-3.5 4.5 Z" fill="#6E5F3E" />
          {/* 녹청 + 하이라이트 */}
          <ellipse cx={41} cy={24} rx={4} ry={2.6} fill="#7FA08C" opacity={0.55} />
          <ellipse cx={26} cy={23} rx={3.6} ry={2.4} fill="#FFFDF7" opacity={0.4} />
        </svg>
      );
    case 'concert-lightstick':
      return (
        <svg width={size * 0.72} height={size} viewBox="0 0 56 80" style={{ display: 'block' }} aria-label="콘서트 응원봉">
          <ellipse cx={28} cy={76} rx={16} ry={3.6} fill="rgba(74,59,50,0.14)" />
          <rect x={24} y={40} width={8} height={36} rx={4} fill="#4A3B32" />
          <rect x={22} y={36} width={12} height={7} rx={3.5} fill="#6B5A4C" />
          <circle cx={28} cy={24} r={17} fill="#C7B9F2" opacity={0.5} />
          <circle cx={28} cy={24} r={12.5} fill="#B48CFF" />
          <circle cx={23.5} cy={19.5} r={3.4} fill="#fff" opacity={0.85} />
          <path d="M28 17 l2 4.6 l4.6 2 l-4.6 2 l-2 4.6 l-2 -4.6 l-4.6 -2 l4.6 -2 Z" fill="#FFFDF7" opacity={0.9} />
        </svg>
      );
    case 'nanta-drum': // 구버전 세이브 호환용 (판매 종료)
      return (
        <svg width={size * 0.85} height={size} viewBox="0 0 66 80" style={{ display: 'block' }} aria-label="난타 드럼 화분">
          <ellipse cx={33} cy={76} rx={22} ry={4} fill="rgba(74,59,50,0.14)" />
          {/* 드럼 몸통 */}
          <rect x={10} y={38} width={46} height={34} rx={7} fill="#B95D50" />
          <ellipse cx={33} cy={38} rx={23} ry={8} fill="#FFF3DC" />
          <path d="M12 48 l14 16 M26 48 l-14 16 M40 48 l14 16 M54 48 l-14 16" stroke="#FFD66B" strokeWidth={3} strokeLinecap="round" />
          {/* 화분 꽃 + 드럼스틱 */}
          <path d="M33 30 q-2 -12 -10 -16 M33 30 q2 -12 10 -16" stroke="#4E9B58" strokeWidth={3.4} fill="none" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx={33} cy={22} rx={3.4} ry={5.4} fill="#FF8B7B" transform={`rotate(${deg} 33 27)`} />
          ))}
          <circle cx={33} cy={27} r={3.4} fill="#FFD66B" />
          <g transform="rotate(30 52 20)">
            <rect x={50} y={6} width={4.4} height={22} rx={2.2} fill="#CE9F6C" />
            <circle cx={52.2} cy={5} r={4} fill="#8A6B52" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
