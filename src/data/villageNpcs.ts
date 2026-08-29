// ─── 내 마을 주민 NPC 정의 ────────────────────────────────────────
// 기본 NPC(동숲풍 동물 친구들)는 마을 풍성도(배치물+도감+랜드마크)에
// 따라 순서대로 입주한다. 지도에서 조우해 배치한 특수 NPC(까미 등)는
// 배치 지점을 앵커로 함께 배회한다.

import { BASIC_NPCS } from './seed';
import type { VCharSkin } from '../lib/villageDraw';

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
