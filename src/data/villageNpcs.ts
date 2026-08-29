// ─── 내 마을 주민 NPC 정의 ────────────────────────────────────────
// 기본 NPC(동숲풍 동물 친구들)는 마을 풍성도(배치물+도감+랜드마크)에
// 따라 순서대로 입주한다. 지도에서 조우해 배치한 특수 NPC(까미 등)는
// 배치 지점을 앵커로 함께 배회한다.

import { BASIC_NPCS } from './seed';
import type { VCharSkin } from '../lib/villageDraw';
import type { VillageZoneId } from '../lib/villageWorld';

export interface VillageNpcDef {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  species: string;
  speciesEn: string;
  skin: VCharSkin;
  /** 지나칠 때 말풍선에 뜨는 짧은 혼잣말 */
  chatter: string[];
  chatterEn: string[];
  /** 말 걸기 대화 (한 줄씩 진행) */
  dialogue: string[];
  dialogueEn: string[];
  /** 입주에 필요한 마을 풍성도 */
  unlockAt: number;
  /** 광장 기준 배회 앵커 오프셋 */
  anchorOffset: { x: number; y: number };
}

const byRole = Object.fromEntries(BASIC_NPCS.map((n) => [n.role, n]));

export const VILLAGE_NPCS: VillageNpcDef[] = [
  {
    id: 'owl-mayor',
    name: byRole.mayor.name, // 부엉
    nameEn: byRole.mayor.nameEn ?? byRole.mayor.name,
    title: byRole.mayor.title,
    titleEn: byRole.mayor.titleEn ?? byRole.mayor.title,
    species: byRole.mayor.species,
    speciesEn: byRole.mayor.speciesEn ?? byRole.mayor.species,
    skin: {
      body: '#8a6f52',
      bodyDark: '#6d563e',
      fur: '#c9a97e',
      furDark: '#8a6f52',
      ear: 'owl',
    },
    chatter: ['오늘도 평화롭구먼, 부엉.', '마을이 자라는 게 보이는가?', '현실의 하루가 여기 쌓인다네.'],
    chatterEn: ['Peaceful as ever. Hoo.', 'Can you see the village growing?', 'Your real days pile up here.'],
    dialogue: byRole.mayor.lines,
    dialogueEn: byRole.mayor.linesEn ?? byRole.mayor.lines,
    unlockAt: 0,
    anchorOffset: { x: 0, y: -2 },
  },
  {
    id: 'pigeon-postman',
    name: byRole.postman.name, // 구구
    nameEn: byRole.postman.nameEn ?? byRole.postman.name,
    title: byRole.postman.title,
    titleEn: byRole.postman.titleEn ?? byRole.postman.title,
    species: byRole.postman.species,
    speciesEn: byRole.postman.speciesEn ?? byRole.postman.species,
    skin: {
      body: '#63aee0',
      bodyDark: '#4489bb',
      fur: '#c3cbd6',
      furDark: '#8e99a8',
      ear: 'bird',
    },
    chatter: ['구구! 오늘의 소식이에요.', '편지 배달 가는 길~', '바람이 좋네요, 구구.'],
    chatterEn: ["Coo! Today's news is in.", 'Off to deliver letters~', 'Lovely breeze today. Coo.'],
    dialogue: byRole.postman.lines,
    dialogueEn: byRole.postman.linesEn ?? byRole.postman.lines,
    unlockAt: 2,
    anchorOffset: { x: 3, y: 1 },
  },
  {
    id: 'otter-shopkeeper',
    name: byRole.shopkeeper.name, // 달수
    nameEn: byRole.shopkeeper.nameEn ?? byRole.shopkeeper.name,
    title: byRole.shopkeeper.title,
    titleEn: byRole.shopkeeper.titleEn ?? byRole.shopkeeper.title,
    species: byRole.shopkeeper.species,
    speciesEn: byRole.shopkeeper.speciesEn ?? byRole.shopkeeper.species,
    skin: {
      body: '#f0b455',
      bodyDark: '#cf9137',
      fur: '#a5713f',
      furDark: '#7d5028',
      ear: 'bear',
    },
    chatter: ['신상 소품 들어왔어요~', '톡큰은 곧 소품이죠.', '오늘 장사도 즐겁게!'],
    chatterEn: ['New decor just arrived~', 'Tokken means decor, you know.', 'Another happy day of business!'],
    dialogue: byRole.shopkeeper.lines,
    dialogueEn: byRole.shopkeeper.linesEn ?? byRole.shopkeeper.lines,
    unlockAt: 5,
    anchorOffset: { x: -3, y: 2 },
  },
  {
    id: 'fox-gourmet',
    name: byRole.gourmet.name, // 여울
    nameEn: byRole.gourmet.nameEn ?? byRole.gourmet.name,
    title: byRole.gourmet.title,
    titleEn: byRole.gourmet.titleEn ?? byRole.gourmet.title,
    species: byRole.gourmet.species,
    speciesEn: byRole.gourmet.speciesEn ?? byRole.gourmet.species,
    skin: {
      body: '#e87c9b',
      bodyDark: '#c65a79',
      fur: '#f0955f',
      furDark: '#c86f3d',
      ear: 'cat',
    },
    chatter: ['킁킁… 맛있는 냄새.', '오늘의 핫플, 알려드릴까요?', '맛집은 발로 찾는 거예요.'],
    chatterEn: ['Sniff sniff… something delicious.', "Want today's hot place?", 'You find good food with your feet.'],
    dialogue: byRole.gourmet.lines,
    dialogueEn: byRole.gourmet.linesEn ?? byRole.gourmet.lines,
    unlockAt: 8,
    anchorOffset: { x: 2, y: 4 },
  },
  {
    id: 'rabbit-kid',
    name: '도담',
    nameEn: 'Dodam',
    title: '꼬마 주민',
    titleEn: 'Little Resident',
    species: '토끼',
    speciesEn: 'Rabbit',
    skin: {
      body: '#7fd1c0',
      bodyDark: '#59aa9a',
      fur: '#fdfaf3',
      furDark: '#d3c7ac',
      ear: 'rabbit',
    },
    chatter: ['같이 놀자! 폴짝!', '바닷가에 게 있대!', '나 달리기 진짜 빨라!'],
    chatterEn: ['Play with me! Hop hop!', 'They say there are crabs on the beach!', 'I am super fast, you know!'],
    dialogue: [
      '안녕! 나는 도담이야. 이 마을이 북적북적해져서 이사 왔어!',
      '마을에 건물이 많아질수록 친구들이 더 온대. 신나지?',
      '너 진짜 대단하다. 이 마을, 네가 다 다녀와서 만든 거라며?',
    ],
    dialogueEn: [
      'Hi! I am Dodam. I moved in because this village got so lively!',
      'The more buildings, the more friends move in. Exciting, right?',
      'You are amazing. They say you built this whole village by actually going places!',
    ],
    unlockAt: 12,
    anchorOffset: { x: -2, y: 5 },
  },
];

// ─── 확장 구역 기본 NPC (R5 섬 확장) ──────────────────────────────
// 확장 구역을 살 때마다 그 구역의 전문가 주민이 1명씩 입주한다.
// unlockAt 은 쓰지 않는다 — 입주 조건이 풍성도가 아니라 구역 소유.

export interface ZoneInfo {
  zone: Exclude<VillageZoneId, 'base'>;
  emoji: string;
  name: string;
  nameEn: string;
}

/** 확장 구역 이름 — 팻말·확장 모달·토스트 공용 */
export const ZONE_INFO: ZoneInfo[] = [
  { zone: 'west', emoji: '🏕️', name: '뒷숲 캠프', nameEn: 'Back-Forest Camp' },
  { zone: 'north', emoji: '🌌', name: '별보기 언덕', nameEn: 'Stargazer Hill' },
  { zone: 'peak', emoji: '⛰️', name: '구름마루', nameEn: 'Cloud Ridge' },
];

export function zoneInfo(zone: VillageZoneId): ZoneInfo | undefined {
  return ZONE_INFO.find((z) => z.zone === zone);
}

/** 구역 앵커(사분면 안 배회 중심) — 26×26 사분면의 중앙 부근 */
const ZONE_ANCHORS: Record<Exclude<VillageZoneId, 'base'>, { x: number; y: number }> = {
  west: { x: 13, y: 39 },
  north: { x: 39, y: 13 },
  peak: { x: 13, y: 13 },
};

export const ZONE_NPCS: Record<Exclude<VillageZoneId, 'base'>, VillageNpcDef> = {
  west: {
    id: 'zone-raccoon-survivalist',
    name: '덕구',
    nameEn: 'Deokgu',
    title: '생존전문가',
    titleEn: 'Survival Expert',
    species: '너구리',
    speciesEn: 'Raccoon',
    skin: {
      body: '#6b7a4e',
      bodyDark: '#54613c',
      fur: '#8a7b6a',
      furDark: '#5e5347',
      hair: '#3f4636',
      ear: 'bear',
    },
    chatter: ['이 숲, 내가 다 파악했어.', '모닥불엔 마른 가지가 최고야.', '비 오기 전엔 흙냄새가 달라져.'],
    chatterEn: ['I know every inch of this forest.', 'Dry twigs make the best campfire.', 'The soil smells different before rain.'],
    dialogue: [
      '오, 새 이웃! 난 생존전문가 덕구야. 뒷숲은 내 앞마당이지.',
      '캠프의 기본은 물, 불, 지붕. 마을의 기본은… 맛집이더라?',
      '길 잃으면 이끼 낀 쪽이 북쪽… 아니, 그냥 광장 종소리를 따라와.',
    ],
    dialogueEn: [
      "New neighbor! I'm Deokgu, survival expert. This back forest is my front yard.",
      'Camping basics: water, fire, shelter. Village basics: good restaurants, apparently.',
      'If you get lost, moss grows on the north side… or just follow the plaza bell.',
    ],
    unlockAt: 0,
    anchorOffset: { x: 0, y: 0 },
  },
  north: {
    id: 'zone-hedgehog-stargazer',
    name: '초롱',
    nameEn: 'Chorong',
    title: '별지기',
    titleEn: 'Stargazer',
    species: '고슴도치',
    speciesEn: 'Hedgehog',
    skin: {
      body: '#3b4a72',
      bodyDark: '#2c3856',
      fur: '#c9a97e',
      furDark: '#8a6f52',
      hair: '#2c3856',
      ear: 'bear',
    },
    chatter: ['오늘 밤은 별이 잘 보이겠어.', '가시는 뾰족, 마음은 몽글.', '유성우 오는 날 알려줄게!'],
    chatterEn: ['The stars will be clear tonight.', 'Spiky quills, soft heart.', "I'll tell you when the meteor shower comes!"],
    dialogue: [
      '안녕! 별지기 초롱이야. 이 언덕은 마을에서 하늘이 제일 넓게 보여.',
      '밤에 가로등을 조금만 꺼두면 은하수도 보인다? 이사 오길 잘했지.',
      '소원은 별똥별에 비는 게 아니라, 내일 갈 맛집을 정하는 거야.',
    ],
    dialogueEn: [
      "Hi! I'm Chorong the stargazer. This hill has the widest sky in the village.",
      'Dim the lamps a little at night and you can even see the Milky Way. Great move, right?',
      "Don't wish on shooting stars — decide tomorrow's restaurant instead.",
    ],
    unlockAt: 0,
    anchorOffset: { x: 0, y: 0 },
  },
  peak: {
    id: 'zone-goat-alpinist',
    name: '바위',
    nameEn: 'Bawi',
    title: '등산대장',
    titleEn: 'Trek Captain',
    species: '산양',
    speciesEn: 'Mountain Goat',
    skin: {
      body: '#c65a4a',
      bodyDark: '#a34537',
      fur: '#e8e2d4',
      furDark: '#b8ae9a',
      hair: '#8c7b6e',
      ear: 'cat',
    },
    chatter: ['정상 공기는 다르다니까!', '오르막이 있어야 내리막이 달지.', '구름이 발 밑이야, 하핫.'],
    chatterEn: ['Summit air hits different!', 'You need the climb to enjoy the descent.', 'Clouds under my hooves, haha.'],
    dialogue: [
      '왔구나! 등산대장 바위다. 여기가 이 섬의 꼭대기, 구름마루야.',
      '양옆 구역을 다 이어 붙이다니, 자네 개척 정신이 대단해.',
      '정상에서 보면 다 보여 — 광장, 바다, 그리고 자네가 만든 마을 전부.',
    ],
    dialogueEn: [
      "You made it! I'm Bawi, trek captain. This is Cloud Ridge, the island's peak.",
      'Linking both side zones to get here — that pioneer spirit of yours is something.',
      'From the top you can see it all — the plaza, the sea, and everything you built.',
    ],
    unlockAt: 0,
    anchorOffset: { x: 0, y: 0 },
  },
};

/** 소유 구역의 기본 NPC 목록 (base 제외) */
export function zoneNpcs(zones: readonly VillageZoneId[]): (VillageNpcDef & { anchor: { x: number; y: number } })[] {
  return (Object.keys(ZONE_NPCS) as Array<Exclude<VillageZoneId, 'base'>>)
    .filter((z) => zones.includes(z))
    .map((z) => ({ ...ZONE_NPCS[z], anchor: ZONE_ANCHORS[z] }));
}

/** 마을 풍성도 = 배치물 수 + 도감 등록 수 + 발견 랜드마크 수 */
export function villageRichness(
  placementCount: number,
  dexCount: number,
  landmarkCount: number,
): number {
  return placementCount + dexCount + landmarkCount;
}

/** 현재 풍성도로 입주해 있는 기본 NPC 목록 */
export function residentNpcs(richness: number): VillageNpcDef[] {
  return VILLAGE_NPCS.filter((n) => n.unlockAt <= richness);
}

/** 특수 NPC(까치 까미 계열) 캔버스 스킨 — 까아미는 보라 반다나 */
export function magpieSkin(drummer: boolean): VCharSkin {
  return {
    body: '#343B4A',
    bodyDark: '#232936',
    fur: '#F2F4F8',
    furDark: '#2F3541',
    hair: drummer ? '#8A5CF6' : '#2F3541',
    ear: 'bird',
  };
}

/** 지역 마스코트 캔버스 스킨 — npcId 통일 조회 (마을 배치·배회용) */
export function regionalNpcSkin(npcId: string): VCharSkin {
  if (npcId === 'hongdae-cat') {
    // 홍대 기냥 — 회보라 털 + 남색 비니 톤 상의
    return {
      body: '#3B4252',
      bodyDark: '#2B2F3E',
      fur: '#6B6377',
      furDark: '#524B5E',
      hair: '#2B2F3E',
      ear: 'cat',
    };
  }
  if (npcId === 'bukchon-tiger') {
    // 북촌 호야 — 주황 털 + 색동 배자 톤 상의
    return {
      body: '#F2705E',
      bodyDark: '#D95A4A',
      fur: '#F0A055',
      furDark: '#E8944B',
      hair: '#4A3B32',
      ear: 'cat',
    };
  }
  if (npcId === 'seongsu-deer') {
    // 성수 라떼 — 갈색 털 + 민트(아아 컵) 톤 상의
    return {
      body: '#4FB9A8',
      bodyDark: '#3E9486',
      fur: '#C89B66',
      furDark: '#8A6B52',
      hair: '#8A6B52',
      ear: 'cat',
    };
  }
  if (npcId === 'busan-gull') {
    // 부산 파랑 — 흰 깃털 + 서핑수트 블루 상의
    return {
      body: '#5EB3CC',
      bodyDark: '#4489BB',
      fur: '#F2F4F8',
      furDark: '#C3CBD6',
      hair: '#2B2B33',
      ear: 'bird',
    };
  }
  if (npcId === 'jeju-pony') {
    // 제주 한라 — 갈색 털 + 감귤빛 상의
    return {
      body: '#F5A03C',
      bodyDark: '#E8883C',
      fur: '#8A6B52',
      furDark: '#4A3B32',
      hair: '#4A3B32',
      ear: 'cat',
    };
  }
  return magpieSkin(npcId === 'magpie-kkaami');
}
