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
      return (
        <svg width={size} height={size * 0.65} viewBox="0 0 80 52" style={{ display: 'block' }} aria-label="꽃밭">
          <ellipse cx={40} cy={40} rx={34} ry={12} fill="#8FCB77" />
          <ellipse cx={40} cy={37} rx={34} ry={12} fill="#A8D98A" />
          {[
            [18, 32, '#FF8B7B'],
            [32, 26, '#FFD66B'],
            [48, 30, '#F2A7C3'],
            [60, 35, '#C7B9F2'],
            [40, 40, '#FF8B7B'],
          ].map(([x, y, c], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse
                  key={deg}
                  cx={Number(x)}
                  cy={Number(y) - 5}
                  rx={2.6}
                  ry={4}
                  fill={String(c)}
                  transform={`rotate(${deg} ${x} ${y})`}
                />
              ))}
              <circle cx={Number(x)} cy={Number(y)} r={2.6} fill="#FFF3DC" />
            </g>
          ))}
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
        <svg width={size} height={size * 0.62} viewBox="0 0 80 50" style={{ display: 'block' }} aria-label="광장 돌바닥 타일">
          <ellipse cx={40} cy={44} rx={27} ry={4} fill="rgba(74,59,50,0.10)" />
          <path d="M40 5 L75 24 L40 43 L5 24 Z" fill="#F0E7D6" />
          <path d="M40 5 L75 24 L40 43 L5 24 Z" fill="none" stroke="#E6DBC5" strokeWidth={2.5} />
          <path d="M40 10 L66 24 L40 38 L14 24 Z" fill="none" stroke="#D8CBB1" strokeWidth={1.6} />
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
