// ─── 커뮤니티 게시글 사진 (코드 생성 SVG) ─────────────────────────
// 시드 글과 작성 시트의 '데모 사진'에 쓰이는 스냅샷 일러스트.
// 외부 이미지 0장 원칙 유지 — 유저 업로드(dataURL)와 달리 이 사진들은
// 전부 코드로 그린다. id 는 communitySeed.photoId / MyPost.photoId 와 일치.

export interface DemoPhoto {
  id: string;
  label: string;
  labelEn: string;
}

/** 작성 시트에서 바로 첨부해 볼 수 있는 데모 사진 목록 */
export const DEMO_PHOTOS: DemoPhoto[] = [
  { id: 'cafe-window', label: '카페 창가', labelEn: 'Cafe window' },
  { id: 'kalguksu', label: '칼국수 한 상', labelEn: 'Noodle table' },
  { id: 'namsan-night', label: '남산 야경', labelEn: 'Namsan night' },
];

export const demoPhotoById = (id: string): DemoPhoto | undefined =>
  DEMO_PHOTOS.find((p) => p.id === id);

/** 게시글 사진 렌더 — 4:2.5 스냅샷 비율, 부모가 라운드/보더를 입힌다 */
export function PostPhotoSvg({ id }: { id: string }) {
  const meta = demoPhotoById(id);
  const common = {
    viewBox: '0 0 400 250',
    role: 'img',
    'aria-label': `사진: ${meta?.label ?? id}`,
    style: { display: 'block', width: '100%', height: 'auto' } as const,
  };

  if (id === 'cafe-window') {
    return (
      <svg {...common}>
        {/* 따뜻한 실내 벽 + 창밖 골목 풍경 */}
        <rect width={400} height={250} fill="#F2E3CC" />
        <rect x={54} y={18} width={292} height={148} rx={10} fill="#8A6B52" />
        <rect x={64} y={28} width={272} height={128} rx={6} fill="#F7E9D3" />
        {/* 창밖: 노을 하늘 + 골목 건물들 */}
        <rect x={64} y={28} width={272} height={128} rx={6} fill="url(#pp-dusk)" />
        <defs>
          <linearGradient id="pp-dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFD9A0" />
            <stop offset="0.55" stopColor="#F2A65E" />
            <stop offset="1" stopColor="#C96F4A" />
          </linearGradient>
        </defs>
        <circle cx={112} cy={62} r={14} fill="#FFF3DC" opacity={0.9} />
        <rect x={80} y={92} width={44} height={64} fill="#7A5A48" />
        <rect x={132} y={78} width={52} height={78} fill="#8F6A52" />
        <rect x={192} y={96} width={40} height={60} fill="#6E5040" />
        <rect x={240} y={84} width={58} height={72} fill="#82604C" />
        <rect x={304} y={100} width={32} height={56} fill="#755644" />
        {[
          [88, 100], [104, 100], [88, 118], [104, 118],
          [140, 88], [158, 88], [140, 106], [158, 106], [140, 124],
          [200, 106], [214, 106], [200, 124],
          [248, 94], [264, 94], [280, 94], [248, 112], [264, 112],
          [310, 110], [322, 110],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={9} height={11} rx={1.5} fill={i % 3 === 0 ? '#FFD66B' : '#FFF0C2'} opacity={0.92} />
        ))}
        {/* 창틀 십자 */}
        <rect x={196} y={28} width={8} height={128} fill="#8A6B52" />
        <rect x={64} y={86} width={272} height={7} fill="#8A6B52" />
        {/* 나무 카운터 */}
        <rect x={0} y={166} width={400} height={84} fill="#B98A5F" />
        <rect x={0} y={166} width={400} height={10} fill="#A67850" />
        {/* 핸드드립: 서버 + 드리퍼 + 김 */}
        <path d="M150 214 q0 18 22 18 q22 0 22 -18 l-3 -16 h-38 Z" fill="#D7EBF2" opacity={0.9} />
        <rect x={146} y={194} width={52} height={6} rx={3} fill="#8A6B52" />
        <path d="M156 178 h32 l-6 16 h-20 Z" fill="#F2F4F8" />
        <path d="M170 226 q4 -3 4 -8" stroke="#7FB0C4" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* 커피잔 + 김 */}
        <ellipse cx={262} cy={216} rx={30} ry={7} fill="#9C6E44" />
        <path d="M236 194 h52 l-5 22 h-42 Z" fill="#FFFDF7" />
        <path d="M288 198 q12 2 0 12" stroke="#FFFDF7" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M252 186 q-4 -8 2 -14 M266 186 q4 -8 -2 -14" stroke="#C9B49A" strokeWidth={3.4} fill="none" strokeLinecap="round" />
        {/* 화분 */}
        <path d="M330 196 q-8 -20 6 -30 q2 16 8 22 q6 -14 16 -16 q-2 18 -10 26 Z" fill="#4E9B58" />
        <path d="M324 196 h44 l-6 22 h-32 Z" fill="#C9694F" />
      </svg>
    );
  }

  if (id === 'kalguksu') {
    return (
      <svg {...common}>
        {/* 나무 테이블 상판 */}
        <rect width={400} height={250} fill="#C89B66" />
        {[0, 62, 124, 186, 248, 310, 372].map((x) => (
          <rect key={x} x={x} y={0} width={3} height={250} fill="#B4854F" opacity={0.6} />
        ))}
        {/* 칼국수 대접 */}
        <ellipse cx={168} cy={158} rx={118} ry={74} fill="#EDEFF4" />
        <ellipse cx={168} cy={150} rx={104} ry={62} fill="#D9DEE8" />
        <ellipse cx={168} cy={150} rx={92} ry={54} fill="#C9973F" />
        {/* 국수 면발 소용돌이 */}
        <path d="M100 148 q34 -26 68 -8 q34 18 66 -6 M108 162 q30 -18 60 -4 q30 14 58 -2 M120 174 q26 -12 48 -2 q26 10 46 -4"
          stroke="#F5E3B8" strokeWidth={7} fill="none" strokeLinecap="round" />
        {/* 만두 2알 + 고명 */}
        <path d="M140 122 q14 -16 28 0 q6 10 -14 12 q-20 -2 -14 -12 Z" fill="#F0E2C8" />
        <path d="M196 118 q14 -16 28 0 q6 10 -14 12 q-20 -2 -14 -12 Z" fill="#EBD9BA" />
        <path d="M148 156 l20 6 M186 158 l18 -6" stroke="#4C762B" strokeWidth={4.4} strokeLinecap="round" />
        <circle cx={216} cy={146} r={5} fill="#E2554A" />
        {/* 김 */}
        <path d="M138 92 q-5 -12 3 -20 M168 88 q-5 -12 3 -20 M198 92 q-5 -12 3 -20"
          stroke="#EAD9BF" strokeWidth={4.2} fill="none" strokeLinecap="round" opacity={0.85} />
        {/* 마늘김치 종지 */}
        <ellipse cx={318} cy={104} rx={52} ry={32} fill="#EDEFF4" />
        <ellipse cx={318} cy={100} rx={42} ry={25} fill="#D9DEE8" />
        <path d="M290 98 q10 -14 24 -8 q16 -10 26 2 q10 4 4 12 q-14 10 -30 6 q-18 2 -24 -12 Z" fill="#D14B38" />
        <path d="M298 96 l12 6 M318 92 l10 8" stroke="#A93526" strokeWidth={3} strokeLinecap="round" />
        {/* 젓가락 + 받침 */}
        <rect x={330} y={158} width={10} height={26} rx={4} fill="#8A6B52" />
        <rect x={312} y={168} width={78} height={7} rx={3.5} fill="#4A3B32" transform="rotate(-64 312 168)" />
        <rect x={330} y={176} width={78} height={7} rx={3.5} fill="#5C4A3E" transform="rotate(-64 330 176)" />
        {/* 놋컵 */}
        <rect x={44} y={44} width={44} height={50} rx={9} fill="#C9A227" />
        <rect x={44} y={44} width={44} height={12} rx={6} fill="#E0BC49" />
      </svg>
    );
  }

  // namsan-night (기본)
  return (
    <svg {...common}>
      {/* 밤하늘 */}
      <rect width={400} height={250} fill="url(#pp-night)" />
      <defs>
        <linearGradient id="pp-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141B3D" />
          <stop offset="0.7" stopColor="#2A3A6E" />
          <stop offset="1" stopColor="#41548F" />
        </linearGradient>
      </defs>
      <circle cx={330} cy={46} r={20} fill="#FFF3DC" />
      <circle cx={322} cy={40} r={20} fill="#141B3D" opacity={0.55} />
      {[
        [36, 30], [88, 54], [140, 24], [206, 44], [252, 20], [296, 66], [372, 34], [58, 84], [178, 76],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.2 : 1.5} fill="#FFF0C2" opacity={0.9} />
      ))}
      {/* 남산 능선 */}
      <path d="M0 210 q70 -52 150 -44 q90 8 148 -18 q60 -24 102 -10 v112 h-400 Z" fill="#101730" />
      {/* N타워: 기둥 + 전망대 + 안테나 */}
      <rect x={192} y={96} width={16} height={64} fill="#232F55" />
      <ellipse cx={200} cy={92} rx={34} ry={13} fill="#FFD66B" />
      <ellipse cx={200} cy={84} rx={30} ry={11} fill="#F2A65E" />
      <rect x={196} y={38} width={8} height={40} fill="#232F55" />
      <circle cx={200} cy={34} r={4.4} fill="#E2554A" />
      {/* 전망대 불빛 반사 */}
      <path d="M176 100 q24 12 48 0" stroke="#FFE9AE" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />
      {/* 도시 불빛 보케 */}
      {[
        [26, 226, 5], [58, 218, 3.4], [92, 232, 4.2], [128, 222, 3], [162, 234, 5], [198, 226, 3.4],
        [232, 218, 4.4], [268, 230, 3], [300, 222, 5], [336, 234, 3.6], [368, 224, 4.4], [386, 236, 3],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 2 === 0 ? '#FFD66B' : '#FF9E7B'} opacity={0.75} />
      ))}
      {/* 케이블카 라인 + 곤돌라 */}
      <path d="M20 140 L200 92" stroke="#3A4C7E" strokeWidth={2.4} />
      <rect x={84} y={120} width={22} height={16} rx={5} fill="#FFD66B" />
      <rect x={93} y={114} width={4} height={8} fill="#3A4C7E" />
    </svg>
  );
}
