// ─── 캐릭터 커스터마이징 파츠 프리셋 ──────────────────────────────
// CharacterConfig 의 각 인덱스가 아래 배열을 참조한다.

export const SKIN_TONES = ['#FFE3C8', '#F6C79F', '#D9A067', '#9C6B43'];

export const HAIR_COLORS = [
  '#4A3B32', // 다크브라운
  '#2B2B33', // 블랙
  '#B0713A', // 브라운
  '#E8B84B', // 블론드
  '#D96C6C', // 로즈
  '#7BA7D9', // 블루
];

export const HAIR_STYLES = ['단발', '숏컷', '긴머리', '번헤어'] as const;
export const HAIR_STYLES_EN = ['Bob', 'Short', 'Long', 'Bun'] as const;

export const OUTFITS = ['티셔츠', '후드', '멜빵바지'] as const;
export const OUTFITS_EN = ['T-shirt', 'Hoodie', 'Overalls'] as const;

export const OUTFIT_COLORS = [
  '#FF8B7B', // 코랄
  '#7BC47F', // 리프
  '#8ED1E1', // 스카이
  '#FFD66B', // 썬
  '#C7B9F2', // 라일락
  '#F2A7C3', // 핑크
];

/** hex 색을 amt(0~1)만큼 어둡게 */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - amt));
  const g = Math.round(((n >> 8) & 255) * (1 - amt));
  const b = Math.round((n & 255) * (1 - amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
