// ─── 명동 프로토타입 시드 데이터 (구현 브리프 §4) ─────────────────
// 좌표는 근사값(데모용). 실서비스 전환 시 매장 DB/POI API로 교체.

import type {
  BasicNpc,
  DecorItem,
  Landmark,
  LatLng,
  RegionalNpc,
  Review,
  Store,
  TokkenEconomy,
  TownEvent,
} from '../types';

/** 지도 초기 중심 — 명동 도보권 */
export const MAP_CENTER: LatLng = { lat: 37.5636, lng: 126.985 };
export const MAP_ZOOM = 16;

/** 데모 시작 시 '내 위치' 기본값 — 명동역 6번 출구 */
export const DEFAULT_POSITION: LatLng = { lat: 37.561, lng: 126.9863 };

export const STORES: Store[] = [
  {
    id: 1,
    name: '미성옥',
    category: '국밥',
    subCategory: '설렁탕',
    lat: 37.5641,
    lng: 126.9839,
    hours: '07:00 - 21:00 (일 휴무)',
    benefit: '1,000원 할인',
    desc: '1966년부터 골목을 지켜온 설렁탕 노포. 진짜 한국 밥집.',
    founded: 1966,
    tags: ['노포', '로컬', '아침식사'],
  },
  {
    id: 2,
    name: '부민옥',
    category: '국밥',
    subCategory: '육개장',
    lat: 37.5675,
    lng: 126.9803,
    hours: '11:00 - 21:30 (일 휴무)',
    benefit: '1,000원 할인',
    desc: '1956년 개업. 다동 직장인들이 줄 서는 육개장 노포.',
    founded: 1956,
    tags: ['노포', '로컬', '점심맛집'],
  },
  {
    id: 3,
    name: '인천집',
    category: '한식',
    subCategory: '보쌈·칼국수',
    lat: 37.5678,
    lng: 126.9812,
    hours: '11:30 - 22:00',
    benefit: '음료 1병 무료',
    desc: '좁은 골목 안 히든 스팟. 저녁이면 로컬로 가득 차는 보쌈집.',
    founded: 1970,
    tags: ['노포', '히든', '저녁모임'],
  },
  {
    id: 4,
    name: '백옥 명동',
    category: '국밥',
    subCategory: '돼지곰탕',
    lat: 37.5629,
    lng: 126.984,
    hours: '10:30 - 20:30',
    desc: '골목 안 히든 곰탕집. 찾아가는 재미가 있는 곳.',
    tags: ['히든', '곰탕', '혼밥'],
  },
  {
    id: 5,
    name: '명동교자',
    category: '면',
    subCategory: '칼국수·만두',
    lat: 37.561,
    lng: 126.9861,
    hours: '10:30 - 21:00',
    benefit: '만두 1개 서비스',
    desc: '명동을 대표하는 칼국수. 마늘 가득 김치가 시그니처.',
    founded: 1966,
    tags: ['검증맛집', '칼국수', '웨이팅'],
  },
  {
    id: 6,
    name: '효담칼국수 닭한마리',
    category: '한식',
    subCategory: '닭한마리',
    lat: 37.5642,
    lng: 126.9835,
    hours: '11:00 - 22:00',
    benefit: '1,000원 할인',
    desc: '그룹 방문에 딱 좋은 닭한마리. 외국인 주민들에게도 인기.',
    tags: ['모임', '닭한마리', '단체석'],
  },
  {
    id: 7,
    name: '카페 레빠리지앙',
    category: '카페',
    subCategory: '베이커리',
    lat: 37.563,
    lng: 126.9841,
    hours: '08:00 - 22:00',
    benefit: '아메리카노 500원 할인',
    desc: '갓 구운 빵 냄새가 나는 동네 베이커리 카페. 오래 머물기 좋다.',
    tags: ['카페', '베이커리', '작업하기좋은'],
  },
  {
    id: 8,
    name: '카페 코인',
    category: '카페',
    subCategory: '2층 히든 카페',
    lat: 37.5629,
    lng: 126.9841,
    hours: '11:00 - 23:00',
    desc: '간판 없는 2층 히든 카페. 골목 탐험의 보상 같은 곳.',
    tags: ['히든', '카페', '조용한'],
  },
  {
    id: 9,
    name: '명동난타극장',
    category: '공연장',
    subCategory: '넌버벌 퍼포먼스',
    lat: 37.5636,
    lng: 126.9836,
    hours: '공연 시간표 확인',
    benefit: 'Event Map 혜택 거점',
    desc: '주방 도구로 두드리는 상설 넌버벌 공연. 언어 장벽 없음.',
    tags: ['공연', '이벤트', '외국인인기'],
  },
  {
    id: 10,
    name: '명동예술극장',
    category: '공연장',
    subCategory: '연극·공연',
    lat: 37.5639,
    lng: 126.9843,
    hours: '공연 시간표 확인',
    desc: '1936년 바로크 양식 건물의 시즌 연극 극장. 명동의 랜드마크.',
    founded: 1936,
    tags: ['공연', '건축', '시즌이벤트'],
  },
];

export const REVIEWS: Review[] = [
  // 1 미성옥
  {
    id: 'r1-1',
    storeId: 1,
    author: '수진',
    flag: '🇰🇷',
    lang: 'ko',
    text: '아침 7시에 와서 설렁탕 한 그릇. 국물이 진하고 깍두기가 미쳤어요. 30년 단골 아버지 따라왔다가 저도 단골 됐습니다.',
    translated:
      'Came at 7am for seolleongtang. The broth is rich and the radish kimchi is insane. Followed my dad who has been a regular for 30 years — now I am one too.',
    rating: 5,
    certified: true,
    date: '2026-08-09',
  },
  {
    id: 'r1-2',
    storeId: 1,
    author: 'Emma',
    flag: '🇬🇧',
    lang: 'en',
    text: 'Hidden in a small alley. No tourist menu, just locals slurping soup at 8am. This is the Korea I wanted to see. Point at the first menu item and trust it.',
    translated:
      '작은 골목 안에 숨어 있어요. 관광객 메뉴 없이 아침 8시부터 국을 드시는 현지인들뿐. 제가 보고 싶었던 한국이에요. 메뉴 첫 줄을 가리키고 믿으세요.',
    rating: 5,
    certified: true,
    date: '2026-08-05',
  },
  {
    id: 'r1-3',
    storeId: 1,
    author: '민호',
    flag: '🇰🇷',
    lang: 'ko',
    text: '수육 추가는 선택이 아니라 필수. 점심시간엔 웨이팅 있으니 살짝 비켜서 가세요.',
    translated:
      'Adding suyuk (boiled beef slices) is not optional — it is a must. There is a queue at lunch, so go slightly off-peak.',
    rating: 4,
    certified: false,
    date: '2026-07-28',
  },
  {
    id: 'r1-4',
    storeId: 1,
    author: 'Yuki',
    flag: '🇯🇵',
    lang: 'en',
    text: 'The soup was so clean and comforting. Staff kindly showed me how to season it with salt and green onions.',
    translated:
      '국물이 정말 깔끔하고 속이 편안해져요. 직원분이 소금과 파로 간하는 법을 친절하게 알려주셨어요.',
    rating: 5,
    certified: false,
    date: '2026-07-20',
  },
  // 2 부민옥
  {
    id: 'r2-1',
    storeId: 2,
    author: '재원',
    flag: '🇰🇷',
    lang: 'ko',
    text: '다동 직장인 점심 성지. 육개장에 밥 말아서 5분 컷 하고 나오는 맛. 양지 듬뿍이라 든든합니다.',
    translated:
      'A lunch mecca for Da-dong office workers. Yukgaejang with rice, done in five minutes flat. Loaded with brisket, very filling.',
    rating: 5,
    certified: true,
    date: '2026-08-08',
  },
  {
    id: 'r2-2',
    storeId: 2,
    author: 'Marco',
    flag: '🇮🇹',
    lang: 'en',
    text: 'Spicy beef soup that warms your soul. I was the only foreigner there — felt like a secret. Cash-free payment worked perfectly.',
    translated:
      '영혼까지 데워주는 얼큰한 소고기국. 제가 유일한 외국인이었어요 — 비밀 장소 같았죠. 현금 없이 결제도 완벽했습니다.',
    rating: 5,
    certified: false,
    date: '2026-08-01',
  },
  {
    id: 'r2-3',
    storeId: 2,
    author: '하늘',
    flag: '🇰🇷',
    lang: 'ko',
    text: '70년 노포의 위엄. 육개장도 좋지만 숨은 메뉴 양무침이 진짜입니다.',
    translated:
      'The dignity of a 70-year-old institution. The yukgaejang is great, but the hidden gem is the yang-muchim (seasoned beef tripe).',
    rating: 4,
    certified: true,
    date: '2026-07-25',
  },
  // 3 인천집
  {
    id: 'r3-1',
    storeId: 3,
    author: '동현',
    flag: '🇰🇷',
    lang: 'ko',
    text: '퇴근하고 동료들이랑 보쌈에 소주 한잔. 좁은 골목에 이런 곳이 있다는 게 명동의 반전이죠.',
    translated:
      'Bossam and soju with coworkers after work. The fact that a place like this hides in a narrow alley is Myeongdong’s plot twist.',
    rating: 5,
    certified: true,
    date: '2026-08-07',
  },
  {
    id: 'r3-2',
    storeId: 3,
    author: 'Chloe',
    flag: '🇫🇷',
    lang: 'en',
    text: 'Our Korean friend brought us here. Tender pork, endless side dishes, loud and happy atmosphere. Zero English menu — bring this app.',
    translated:
      '한국인 친구가 데려와 줬어요. 부드러운 수육, 끝없는 반찬, 시끌벅적 행복한 분위기. 영어 메뉴는 없으니 이 앱을 챙기세요.',
    rating: 5,
    certified: false,
    date: '2026-07-30',
  },
  {
    id: 'r3-3',
    storeId: 3,
    author: '지우',
    flag: '🇰🇷',
    lang: 'ko',
    text: '보쌈 시키면 칼국수는 자동으로 따라와야 합니다. 국물이 예술.',
    translated:
      'If you order bossam, the kalguksu must follow automatically. The broth is a work of art.',
    rating: 4,
    certified: false,
    date: '2026-07-18',
  },
  // 4 백옥 명동
  {
    id: 'r4-1',
    storeId: 4,
    author: '서연',
    flag: '🇰🇷',
    lang: 'ko',
    text: '돼지곰탕이라 부담 없이 맑고 고소해요. 혼밥 하기 좋은 바 좌석 있음.',
    translated:
      'Pork gomtang — light, clean, and nutty. There are bar seats, great for eating alone.',
    rating: 5,
    certified: true,
    date: '2026-08-10',
  },
  {
    id: 'r4-2',
    storeId: 4,
    author: 'Daniel',
    flag: '🇺🇸',
    lang: 'en',
    text: 'Took me 10 minutes to find the entrance and it was worth every step. Milky pork broth with rice — simple perfection.',
    translated:
      '입구 찾는 데 10분 걸렸지만 한 걸음 한 걸음이 아깝지 않았어요. 뽀얀 돼지 국물에 밥 — 단순함의 완성.',
    rating: 5,
    certified: false,
    date: '2026-08-03',
  },
  {
    id: 'r4-3',
    storeId: 4,
    author: '태양',
    flag: '🇰🇷',
    lang: 'ko',
    text: '새우젓 반 스푼이 국룰. 부추무침 추가하면 더 완벽.',
    translated:
      'Half a spoon of salted shrimp is the golden rule. Add the chive salad for perfection.',
    rating: 4,
    certified: false,
    date: '2026-07-22',
  },
  // 5 명동교자
  {
    id: 'r5-1',
    storeId: 5,
    author: 'Aisha',
    flag: '🇸🇬',
    lang: 'en',
    text: 'Yes it is famous, yes there is a line, and yes it is still worth it. The garlic kimchi changed my life. Order the mandu too.',
    translated:
      '네 유명하고, 네 줄도 서고, 그래도 네, 여전히 가치 있어요. 마늘 김치가 제 인생을 바꿨습니다. 만두도 꼭 시키세요.',
    rating: 5,
    certified: true,
    date: '2026-08-06',
  },
  {
    id: 'r5-2',
    storeId: 5,
    author: '준서',
    flag: '🇰🇷',
    lang: 'ko',
    text: '회전율이 빨라서 줄이 길어도 금방 들어갑니다. 칼국수 국물은 진리.',
    translated:
      'The turnover is fast, so even a long line moves quickly. The kalguksu broth is the truth.',
    rating: 4,
    certified: false,
    date: '2026-07-31',
  },
  {
    id: 'r5-3',
    storeId: 5,
    author: 'Linh',
    flag: '🇻🇳',
    lang: 'en',
    text: 'Thick handmade noodles in rich chicken broth. The kimchi is very garlicky — in the best way.',
    translated:
      '진한 닭 육수에 도톰한 손칼국수. 김치는 마늘 향이 아주 강한데, 최고로 좋은 의미로요.',
    rating: 5,
    certified: false,
    date: '2026-07-15',
  },
  {
    id: 'r5-4',
    storeId: 5,
    author: '보라',
    flag: '🇰🇷',
    lang: 'ko',
    text: '2인 방문이면 칼국수 2 + 만두 1이 정석 조합입니다.',
    translated:
      'For two people, two kalguksu and one mandu is the classic combo.',
    rating: 4,
    certified: false,
    date: '2026-07-10',
  },
  // 6 효담칼국수 닭한마리
  {
    id: 'r6-1',
    storeId: 6,
    author: 'Tom',
    flag: '🇦🇺',
    lang: 'en',
    text: 'Whole chicken hot pot you cook at the table. Our group of five left completely full and happy. Staff helped us with every step.',
    translated:
      '테이블에서 직접 끓여 먹는 닭한마리 전골. 다섯 명이 배부르고 행복하게 나왔어요. 직원분들이 모든 단계를 도와주셨습니다.',
    rating: 5,
    certified: true,
    date: '2026-08-04',
  },
  {
    id: 'r6-2',
    storeId: 6,
    author: '예린',
    flag: '🇰🇷',
    lang: 'ko',
    text: '닭 다 먹고 마지막에 칼국수 사리 추가는 국룰. 소스 조합(간장+식초+겨자) 꼭 하세요.',
    translated:
      'Adding kalguksu noodles at the end is the golden rule. Do not skip the sauce combo — soy, vinegar, mustard.',
    rating: 5,
    certified: false,
    date: '2026-07-27',
  },
  {
    id: 'r6-3',
    storeId: 6,
    author: '규현',
    flag: '🇰🇷',
    lang: 'ko',
    text: '외국인 친구 데려갔더니 인생 음식이라고. 단체석도 넉넉합니다.',
    translated:
      'Took my foreign friend and they called it the meal of their life. Plenty of group seating too.',
    rating: 4,
    certified: false,
    date: '2026-07-19',
  },
  // 7 카페 레빠리지앙
  {
    id: 'r7-1',
    storeId: 7,
    author: 'Sofia',
    flag: '🇪🇸',
    lang: 'en',
    text: 'Fresh croissants, quiet second floor, plugs at every seat. I wrote postcards here for two hours and nobody rushed me.',
    translated:
      '갓 구운 크루아상, 조용한 2층, 모든 좌석에 콘센트. 두 시간 동안 엽서를 썼는데 아무도 재촉하지 않았어요.',
    rating: 5,
    certified: true,
    date: '2026-08-09',
  },
  {
    id: 'r7-2',
    storeId: 7,
    author: '다은',
    flag: '🇰🇷',
    lang: 'ko',
    text: '아침 8시 오픈이라 명동에서 모닝커피 하기 제일 좋아요. 소금빵 품절 주의.',
    translated:
      'Opens at 8am — the best morning coffee spot in Myeongdong. Watch out, the salt bread sells out.',
    rating: 5,
    certified: false,
    date: '2026-08-02',
  },
  {
    id: 'r7-3',
    storeId: 7,
    author: '현우',
    flag: '🇰🇷',
    lang: 'ko',
    text: '커뮤니티 모임 장소로 딱. 테이블 간격이 넓어서 얘기하기 좋습니다.',
    translated:
      'Perfect for community meetups. Tables are spaced out, easy to talk.',
    rating: 4,
    certified: false,
    date: '2026-07-24',
  },
  // 8 카페 코인
  {
    id: 'r8-1',
    storeId: 8,
    author: '유나',
    flag: '🇰🇷',
    lang: 'ko',
    text: '간판이 없어서 지도 없으면 절대 못 찾음. 2층 창가 자리에서 명동 골목 구경하는 맛.',
    translated:
      'No sign — you will never find it without a map. Watching the Myeongdong alleys from the second-floor window seat is the whole point.',
    rating: 5,
    certified: true,
    date: '2026-08-08',
  },
  {
    id: 'r8-2',
    storeId: 8,
    author: 'Ben',
    flag: '🇨🇦',
    lang: 'en',
    text: 'A speakeasy but for coffee. Found it through this app and felt like I unlocked a secret level of Myeongdong.',
    translated:
      '커피계의 스피크이지 바. 이 앱으로 찾아냈는데 명동의 히든 레벨을 해금한 기분이었어요.',
    rating: 5,
    certified: false,
    date: '2026-07-29',
  },
  {
    id: 'r8-3',
    storeId: 8,
    author: '소민',
    flag: '🇰🇷',
    lang: 'ko',
    text: '핸드드립 라인업이 진심입니다. 조용해서 책 읽기 좋아요.',
    translated:
      'The hand-drip lineup is serious. Quiet enough to read a book.',
    rating: 4,
    certified: false,
    date: '2026-07-21',
  },
  // 9 명동난타극장
  {
    id: 'r9-1',
    storeId: 9,
    author: 'Hana',
    flag: '🇯🇵',
    lang: 'en',
    text: 'No words, all rhythm — my kids laughed the entire time. Perfect first show in Korea. Book the front rows if you dare.',
    translated:
      '대사 없이 리듬만으로 — 아이들이 내내 웃었어요. 한국에서의 첫 공연으로 완벽합니다. 용기가 있다면 앞줄을 예약하세요.',
    rating: 5,
    certified: true,
    date: '2026-08-05',
  },
  {
    id: 'r9-2',
    storeId: 9,
    author: '나래',
    flag: '🇰🇷',
    lang: 'ko',
    text: '외국인 친구 오면 무조건 데려가는 코스. 공연 끝나고 근처 골목 맛집 투어가 국룰.',
    translated:
      'The go-to course when foreign friends visit. After the show, an alley food tour nearby is the golden rule.',
    rating: 4,
    certified: false,
    date: '2026-07-26',
  },
  {
    id: 'r9-3',
    storeId: 9,
    author: 'Igor',
    flag: '🇧🇷',
    lang: 'en',
    text: 'They pulled me on stage! Most fun I have had in Seoul. You do not need any Korean to enjoy this.',
    translated:
      '저를 무대로 끌어올렸어요! 서울에서 가장 즐거웠던 순간. 한국어를 몰라도 충분히 즐길 수 있습니다.',
    rating: 5,
    certified: false,
    date: '2026-07-17',
  },
  // 10 명동예술극장
  {
    id: 'r10-1',
    storeId: 10,
    author: '지현',
    flag: '🇰🇷',
    lang: 'ko',
    text: '1936년 건물 자체가 작품. 공연 안 봐도 야경 보러 올 가치가 있어요.',
    translated:
      'The 1936 building itself is a piece of art. Worth visiting for the night view even without a show.',
    rating: 5,
    certified: true,
    date: '2026-08-07',
  },
  {
    id: 'r10-2',
    storeId: 10,
    author: 'Mia',
    flag: '🇩🇪',
    lang: 'en',
    text: 'Beautiful baroque facade in the middle of the shopping streets. We caught a Korean play with subtitles on Saturdays.',
    translated:
      '쇼핑 거리 한복판의 아름다운 바로크 파사드. 토요일엔 자막이 제공되는 한국 연극을 봤어요.',
    rating: 4,
    certified: false,
    date: '2026-07-23',
  },
  {
    id: 'r10-3',
    storeId: 10,
    author: '건우',
    flag: '🇰🇷',
    lang: 'ko',
    text: '공연 전엔 근처 노포에서 저녁, 공연 후엔 카페. 명동의 밤이 완성됩니다.',
    translated:
      'Dinner at a nearby old-school eatery before the show, cafe after. That completes a Myeongdong night.',
    rating: 5,
    certified: false,
    date: '2026-07-16',
  },
];

/** 지역 마스코트 NPC — 명동 까치 '까미' (쇼핑백 든 까치) */
export const REGIONAL_NPCS: RegionalNpc[] = [
  {
    id: 'magpie',
    name: '까미',
    species: '까치',
    region: '명동',
    bio: '서울의 상징새 까치. 명동 골목의 숨은 가게를 전부 꿰고 있는 쇼핑 마스터. 쇼핑백 안에는 오늘의 득템이 들어 있다.',
    lines: [
      '까악! 새로운 주민이다! 명동에 온 걸 환영해!',
      '이 골목 안쪽에 간판 없는 카페가 있다는 거, 알고 있었어?',
      '내 쇼핑백? 후후… 오늘의 득템은 비밀이야.',
      '명동은 관광지라고? 골목으로 한 발짝만 들어와 봐. 진짜가 나오니까.',
    ],
    spots: [
      { id: 'theater', label: '명동예술극장 앞', lat: 37.5639, lng: 126.9843 },
      { id: 'cathedral', label: '명동성당', lat: 37.5634, lng: 126.987 },
      { id: 'exit6', label: '명동역 6번 출구', lat: 37.561, lng: 126.9863 },
      { id: 'cablecar', label: '남산케이블카 승강장', lat: 37.5565, lng: 126.9816 },
    ],
  },
];

/** 기본 NPC 4종 (전국 공통, 기능 담당) */
export const BASIC_NPCS: BasicNpc[] = [
  {
    role: 'mayor',
    name: '부엉',
    species: '올빼미',
    title: '촌장',
    lines: [
      '어서 오게, 새 주민! 나는 톡타운의 촌장 부엉이라네.',
      '톡타운은 자네의 현실 하루하루가 마을에 쌓이는 곳이지.',
      '지도에서 발견하고, 다녀오면 마을이 자라난다네. 신기하지?',
      '궁금한 게 있으면 언제든 나를 찾아오게나. 부엉.',
    ],
  },
  {
    role: 'postman',
    name: '구구',
    species: '비둘기',
    title: '우체부',
    lines: [
      '구구! 편지 왔습니다~ 새 소식은 제가 제일 빨라요.',
      '이벤트 소식, 혜택 소식, 전부 제 가방 안에 있죠.',
      '명동 하늘은 제 담당 구역이에요. 구구구.',
    ],
  },
  {
    role: 'shopkeeper',
    name: '달수',
    species: '수달',
    title: '상점 주인',
    lines: [
      '어서 오세요! 톡큰만 있으면 뭐든 살 수 있는 달수 상점입니다.',
      '오늘 들어온 신상 소품, 구경만 해도 공짜예요.',
      '톡큰이 부족하다고요? 마을 밖에서 부지런히 다녀오세요~',
      '이 조개 의자, 제가 직접 강에서 주워온 겁니다. 진짜로요.',
    ],
  },
  {
    role: 'gourmet',
    name: '여울',
    species: '여우',
    title: '소식통',
    lines: [
      '흠… 오늘의 핫플? 그건 바로 제 코가 알고 있죠.',
      '지금 명동에서 제일 뜨거운 곳을 알려드릴까요?',
      '맛집은 혀가 아니라 발로 찾는 거예요. 제 발바닥은 못 속입니다.',
      '어제 다녀온 국밥집… 국물이 아직도 꿈에 나와요.',
    ],
  },
];

export const LANDMARKS: Landmark[] = [
  {
    id: 'cathedral',
    name: '명동성당',
    lat: 37.5634,
    lng: 126.987,
    desc: '1898년 준공된 한국 최초의 고딕 양식 대성당.',
  },
  {
    id: 'namsan',
    name: '남산타워',
    lat: 37.5512,
    lng: 126.9882,
    desc: '서울 어디서나 보이는 마을의 등대 같은 타워.',
  },
  {
    id: 'cheonggyecheon',
    name: '청계천',
    lat: 37.569,
    lng: 126.9846,
    desc: '도심 한가운데를 흐르는 산책하기 좋은 하천.',
  },
  {
    id: 'gwanghwamun',
    name: '광화문',
    lat: 37.5759,
    lng: 126.9769,
    desc: '경복궁의 정문. 서울의 심장을 지키는 대문.',
  },
];

/** Event Map 모의 이벤트 (브리프 §4) */
export const TOWN_EVENTS: TownEvent[] = [
  {
    id: 'nanta-week',
    title: '난타 스페셜 위크',
    venueStoreId: 9,
    radiusM: 300,
    benefit: '공연 전 식사 10% · 공연 후 디저트 500원 할인',
    limitedNpcName: '드러머 까미',
    limitedItemName: '난타 드럼 화분',
    desc: '명동난타극장 반경 300m 매장에서 공연 주간 한정 혜택! 체크인하면 한정 톡큰과 한정 소품 획득 기회.',
  },
];

/** 이벤트 한정 NPC — 드러머 까미 (Event Map 활성 시 난타극장 앞 출몰) */
export const DRUMMER_MAGPIE = {
  id: 'magpie-drummer',
  name: '드러머 까미',
  species: '까치',
  region: '명동 (난타 스페셜 위크 한정)',
  bio: '난타 공연에 심취한 까미의 리듬 버전. 머리띠와 드럼스틱은 공연 주간에만 볼 수 있는 한정 스타일이다.',
  lines: [
    '두구두구두구… 쾅! 지금은 난타 스페셜 위크야!',
    '주방 도구로도 음악이 된다니, 명동은 정말 놀라워. 까악!',
    '이 머리띠? 공연 주간 한정이야. 부럽지?',
  ],
  spot: { id: 'nanta-stage', label: '명동난타극장 앞', lat: 37.5636, lng: 126.9836 },
};

/** Tokken 경제 수치 — 초기값 (운영하며 튜닝 전제) */
export const TOKKEN_ECONOMY: TokkenEconomy = {
  payment: 50,
  certifiedReview: 30,
  review: 15,
  checkin: 10,
  attendance: 10,
  npcEncounter: 20,
  rideTag: 5,
};

/** Tokken 상점 소품 (M3 사용, 가격 50~500) — shopHidden 은 기본 지급품이라 상점 미판매 */
export const DECOR_ITEMS: DecorItem[] = [
  { id: 'bench', name: '나무 벤치', price: 80 },
  { id: 'lamp', name: '가로등', price: 120 },
  { id: 'flower', name: '꽃밭', price: 50 },
  { id: 'fountain', name: '분수대', price: 500 },
  { id: 'mailbox', name: '빨간 우체통', price: 150 },
  { id: 'tree', name: '단풍나무', price: 200 },
  { id: 'nanta-drum', name: '난타 드럼 화분', price: 300, eventOnly: 'nanta-week' },
  { id: 'stone-tile', name: '돌바닥 타일', price: 0, shopHidden: true },
];

export const storeById = (id: number): Store | undefined =>
  STORES.find((s) => s.id === id);

export const reviewsByStore = (storeId: number): Review[] =>
  REVIEWS.filter((r) => r.storeId === storeId);
