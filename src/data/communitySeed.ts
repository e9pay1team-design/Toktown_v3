// ─── 커뮤니티 시드 데이터 (명동 채널) ─────────────────────────────
// 자동 번역은 사전 준비된 번역문 페어로 시뮬레이션(브리프 §2).
// 위치 프라이버시(기획 §3.3): 노출되는 위치 정보는 '장소 태그'뿐.

export interface CommunityComment {
  id: string;
  author: string;
  flag: string;
  lang: 'ko' | 'en';
  text: string;
  translated: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  flag: string;
  nationality: string;
  lang: 'ko' | 'en';
  text: string;
  translated: string;
  /** 장소 태그 (매장 id, 없으면 미첨부) */
  storeTagId?: number;
  likes: number;
  /** 표시용 상대 시각 */
  timeAgo: string;
  comments: CommunityComment[];
}

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    author: 'Emma',
    flag: '🇬🇧',
    nationality: '영국',
    lang: 'en',
    text: 'Is there any place near Myeongdong station that serves breakfast before 8am? Flying out tonight and I want one last proper Korean soup!',
    translated:
      '명동역 근처에 아침 8시 전에 조식 되는 곳 있을까요? 오늘 밤 출국이라 마지막으로 제대로 된 한국 국물 요리를 먹고 싶어요!',
    storeTagId: 1,
    likes: 12,
    timeAgo: '10분 전',
    comments: [
      {
        id: 'p1c1',
        author: '수진',
        flag: '🇰🇷',
        lang: 'ko',
        text: '미성옥이 아침 7시에 열어요! 설렁탕에 깍두기 꼭 드세요.',
        translated: 'Miseongok opens at 7am! Make sure to have seolleongtang with radish kimchi.',
      },
      {
        id: 'p1c2',
        author: 'Emma',
        flag: '🇬🇧',
        lang: 'en',
        text: 'You are a lifesaver, thank you!!',
        translated: '당신은 생명의 은인이에요, 고마워요!!',
      },
    ],
  },
  {
    id: 'p2',
    author: '민호',
    flag: '🇰🇷',
    nationality: '한국',
    lang: 'ko',
    text: '오늘 퇴근하고 명동 골목 산책하다가 간판 없는 2층 카페 발견. 핸드드립 시키고 창가에서 골목 구경하는데 여기 진짜 숨은 보석이네요.',
    translated:
      'Found a signless second-floor cafe while strolling the Myeongdong alleys after work. Ordered a hand drip and people-watched from the window seat — this place is a true hidden gem.',
    storeTagId: 8,
    likes: 24,
    timeAgo: '1시간 전',
    comments: [
      {
        id: 'p2c1',
        author: 'Ben',
        flag: '🇨🇦',
        lang: 'en',
        text: 'I found it through this app last week. Felt like unlocking a secret level!',
        translated: '저도 지난주에 이 앱으로 찾았어요. 히든 레벨 해금한 기분이었어요!',
      },
    ],
  },
  {
    id: 'p3',
    author: 'Hana',
    flag: '🇯🇵',
    nationality: '일본',
    lang: 'en',
    text: 'Watched NANTA with my kids tonight — they laughed the whole time even without understanding a single word. Any dessert place nearby that is open late?',
    translated:
      '오늘 밤 아이들과 난타를 봤어요 — 한마디도 못 알아들어도 내내 웃더라고요. 근처에 늦게까지 하는 디저트 가게 있나요?',
    storeTagId: 9,
    likes: 18,
    timeAgo: '2시간 전',
    comments: [
      {
        id: 'p3c1',
        author: '나래',
        flag: '🇰🇷',
        lang: 'ko',
        text: '카페 코인이 11시까지 해요! 공연 끝나고 가기 딱이에요.',
        translated: 'Cafe Coin is open until 11pm! Perfect for after the show.',
      },
      {
        id: 'p3c2',
        author: 'Marco',
        flag: '🇮🇹',
        lang: 'en',
        text: 'NANTA is the best first show in Korea. The drumming still lives in my head.',
        translated: '난타는 한국에서의 첫 공연으로 최고예요. 그 드럼 소리가 아직도 머릿속에 맴돌아요.',
      },
    ],
  },
  {
    id: 'p4',
    author: '다은',
    flag: '🇰🇷',
    nationality: '한국',
    lang: 'ko',
    text: '명동교자 웨이팅 실시간 공유합니다. 지금 15분 정도! 회전 빨라서 금방 들어가요. 마늘김치 리필 무한인 거 다들 아시죠?',
    translated:
      'Live update on the Myeongdong Kyoja queue — about 15 minutes right now! Turnover is fast so it moves quickly. Everyone knows the garlic kimchi refills are unlimited, right?',
    storeTagId: 5,
    likes: 31,
    timeAgo: '3시간 전',
    comments: [
      {
        id: 'p4c1',
        author: 'Aisha',
        flag: '🇸🇬',
        lang: 'en',
        text: 'That kimchi changed my life. Worth every minute of the line.',
        translated: '그 김치가 제 인생을 바꿨어요. 줄 서는 시간이 아깝지 않아요.',
      },
    ],
  },
  {
    id: 'p5',
    author: 'Chloe',
    flag: '🇫🇷',
    nationality: '프랑스',
    lang: 'en',
    text: 'Solo traveler here. Is it weird to eat bossam alone? The alley place looks amazing but everyone seems to be in groups…',
    translated:
      '혼자 여행 중이에요. 보쌈을 혼자 먹으면 이상한가요? 골목의 그 가게 정말 맛있어 보이는데 다들 단체로 온 것 같아서요…',
    storeTagId: 3,
    likes: 15,
    timeAgo: '5시간 전',
    comments: [
      {
        id: 'p5c1',
        author: '동현',
        flag: '🇰🇷',
        lang: 'ko',
        text: '전혀 안 이상해요! 바 자리 있으니 편하게 오세요. 보쌈 소(小)도 팝니다.',
        translated:
          'Not weird at all! There are bar seats, so come on in. They also sell a small-size bossam.',
      },
      {
        id: 'p5c2',
        author: 'Chloe',
        flag: '🇫🇷',
        lang: 'en',
        text: 'Okay I am going tonight. Wish me luck!',
        translated: '좋아요, 오늘 밤에 갈게요. 행운을 빌어주세요!',
      },
    ],
  },
  {
    id: 'p6',
    author: '규현',
    flag: '🇰🇷',
    nationality: '한국',
    lang: 'ko',
    text: '남산 야경 보고 내려오는 길에 케이블카 승강장 근처에서 까치 캐릭터(?)를 만났는데 도감에 등록됐어요. 이 앱 은근 수집욕 자극하네…',
    translated:
      'On my way down from the Namsan night view, I met the magpie character(?) near the cable car station and it got registered in my collection book. This app quietly triggers my collector instincts…',
    likes: 27,
    timeAgo: '어제',
    comments: [
      {
        id: 'p6c1',
        author: 'Sofia',
        flag: '🇪🇸',
        lang: 'en',
        text: 'Wait, there are collectible characters?? Where do they appear?',
        translated: '잠깐, 수집 캐릭터가 있다고요?? 어디에 나타나요?',
      },
      {
        id: 'p6c2',
        author: '규현',
        flag: '🇰🇷',
        lang: 'ko',
        text: '지도에 반짝이는 버블로 떠요. 하루마다 위치가 바뀌는 듯!',
        translated: 'They show up as sparkling bubbles on the map. Seems like the spots rotate daily!',
      },
    ],
  },
  {
    id: 'p7',
    author: 'Daniel',
    flag: '🇺🇸',
    nationality: '미국',
    lang: 'en',
    text: 'Pro tip: pay with the TokPay card at the pork gomtang place and you get Tokken on top of the discount. My village is getting crowded and I am not mad about it.',
    translated:
      '꿀팁: 돼지곰탕집에서 톡페이 카드로 결제하면 할인에 톡큰까지 쌓여요. 제 마을이 점점 북적이는데 전혀 싫지 않네요.',
    storeTagId: 4,
    likes: 22,
    timeAgo: '어제',
    comments: [],
  },
  {
    id: 'p8',
    author: '보라',
    flag: '🇰🇷',
    nationality: '한국',
    lang: 'ko',
    text: '이번 주 토요일 오전에 명동성당 근처에서 커피 마시면서 수다 떨 주민 있나요? 외국인 주민도 환영! 번역 버튼 있으니 언어 걱정 마세요 ☕',
    translated:
      'Any residents up for coffee and a chat near Myeongdong Cathedral this Saturday morning? Foreign residents welcome! Don’t worry about language — we have the translate button ☕',
    storeTagId: 7,
    likes: 19,
    timeAgo: '2일 전',
    comments: [
      {
        id: 'p8c1',
        author: 'Yuki',
        flag: '🇯🇵',
        lang: 'en',
        text: 'I would love to join! What time?',
        translated: '저도 참여하고 싶어요! 몇 시인가요?',
      },
    ],
  },
];
