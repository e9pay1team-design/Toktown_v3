// ─── 캐릭터 워드로브 (구매 전용 파츠) ─────────────────────────────
// 기본 헤어/의상은 무료 프리셋(characterParts) 그대로 두고, 여기 항목은
// 톡큰으로 1회 구매 → 영구 보유 → 꾸미기에서 장착/해제한다.
// 카테고리 안에서 저렴한 순으로 진열하며, 가격 단계 = 디테일 단계.

export type WardrobeCat = 'hair' | 'top' | 'bottom' | 'shoes' | 'face';

export interface WardrobeItem {
  id: string;
  cat: WardrobeCat;
  name: string;
  nameEn: string;
  price: number;
  /** 마을 캔버스(치비) 렌더에 쓰는 대표색 */
  color: string;
  accent?: string;
}

export const WARDROBE_ITEMS: WardrobeItem[] = [
  // 헤어 (20~200) — 색상은 무료 염색 팔레트를 그대로 따른다.
  { id: 'hair-pony', cat: 'hair', name: '포니테일', nameEn: 'Ponytail', price: 20, color: '#FF8B7B' },
  { id: 'hair-twin', cat: 'hair', name: '양갈래', nameEn: 'Twin Tails', price: 60, color: '#FF8B7B' },
  { id: 'hair-wave', cat: 'hair', name: '웨이브 펌', nameEn: 'Wavy Perm', price: 120, color: '#FF8B7B' },
  { id: 'hair-braid', cat: 'hair', name: '꽃 브레이드', nameEn: 'Flower Braid', price: 200, color: '#F2A7C3' },
  // 상의 (30~300)
  { id: 'top-stripe', cat: 'top', name: '스트라이프 티', nameEn: 'Striped Tee', price: 30, color: '#FFFDF7', accent: '#FF8B7B' },
  { id: 'top-denim', cat: 'top', name: '데님 재킷', nameEn: 'Denim Jacket', price: 90, color: '#6E90C2', accent: '#5E7FB1' },
  { id: 'top-knit', cat: 'top', name: '니트 가디건', nameEn: 'Knit Cardigan', price: 180, color: '#E8C87F', accent: '#D9B45F' },
  { id: 'top-jeogori', cat: 'top', name: '한복 저고리', nameEn: 'Hanbok Jeogori', price: 300, color: '#F5EFE3', accent: '#D95A4A' },
  // 하의 (30~300)
  { id: 'bottom-shorts', cat: 'bottom', name: '반바지', nameEn: 'Shorts', price: 30, color: '#D9B98A', accent: '#C4A374' },
  { id: 'bottom-jeans', cat: 'bottom', name: '청바지', nameEn: 'Jeans', price: 90, color: '#5E7FB1', accent: '#4E6C9B' },
  { id: 'bottom-pleats', cat: 'bottom', name: '플리츠 스커트', nameEn: 'Pleated Skirt', price: 180, color: '#E88AA5', accent: '#D5738F' },
  { id: 'bottom-chima', cat: 'bottom', name: '한복 치마', nameEn: 'Hanbok Chima', price: 300, color: '#D95A73', accent: '#C24B62' },
  // 신발 (20~200)
  { id: 'shoes-sandals', cat: 'shoes', name: '샌들', nameEn: 'Sandals', price: 20, color: '#C9885A' },
  { id: 'shoes-sneakers', cat: 'shoes', name: '운동화', nameEn: 'Sneakers', price: 60, color: '#FFFDF7', accent: '#F2705E' },
  { id: 'shoes-boots', cat: 'shoes', name: '노랑 장화', nameEn: 'Rain Boots', price: 120, color: '#FFD66B', accent: '#E8B84B' },
  { id: 'shoes-kkotsin', cat: 'shoes', name: '꽃신', nameEn: 'Flower Shoes', price: 200, color: '#E86A8A', accent: '#FFD66B' },
  // 페이스페인팅 (각 30)
  { id: 'face-heart', cat: 'face', name: '하트 스티커', nameEn: 'Heart Sticker', price: 30, color: '#FF6B8A' },
  { id: 'face-star', cat: 'face', name: '별 페인팅', nameEn: 'Star Paint', price: 30, color: '#FFC93C' },
  { id: 'face-blossom', cat: 'face', name: '벚꽃 페인팅', nameEn: 'Blossom Paint', price: 30, color: '#F7A8C4' },
];

export const wardrobeById = (id?: string | null): WardrobeItem | undefined =>
  id ? WARDROBE_ITEMS.find((w) => w.id === id) : undefined;

export const wardrobeByCat = (cat: WardrobeCat): WardrobeItem[] =>
  WARDROBE_ITEMS.filter((w) => w.cat === cat).sort((a, b) => a.price - b.price);

/** CharacterConfig 의 카테고리별 장착 슬롯 키 */
export const CAT_SLOT = {
  hair: 'premiumHair',
  top: 'top',
  bottom: 'bottom',
  shoes: 'shoes',
  face: 'facePaint',
} as const;
