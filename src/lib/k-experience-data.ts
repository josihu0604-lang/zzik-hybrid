
// src/lib/k-experience-data.ts
// K-Experience Complete Data - 25 Experiences (5 per category)

export interface KExperience {
  id: string;
  category: 'kpop' | 'kdrama' | 'kbeauty' | 'kfood' | 'kfashion';
  title: Record<string, string>;
  description: Record<string, string>;
  thumbnail: string;
  images: string[];
  location: {
    name: Record<string, string>;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  pricing: {
    currency: string;
    amount: number;
    originalAmount?: number;
    discountPercent?: number;
  };
  rating: number;
  reviewCount: number;
  tags: string[];
  verified: boolean;
  featured: boolean;
  availableSlots: number;
  duration: Record<string, string>;
  language: string[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Detailed fields
  fullDescription?: Record<string, string>;
  includes?: Record<string, string[]>;
  notIncludes?: Record<string, string[]>;
  schedule?: { time: string; activity: Record<string, string> }[];
  meetingPoint?: Record<string, string>;
  host?: {
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    description: Record<string, string>;
  };
  reviews?: {
    id: string;
    user: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  faqs?: { question: Record<string, string>; answer: Record<string, string> }[];
}

// =============================================
// K-POP EXPERIENCES (5)
// =============================================
const KPOP_EXPERIENCES: KExperience[] = [
  {
    id: 'kpop-001',
    category: 'kpop',
    title: {
      ko: 'BTS 성지순례 프리미엄 투어',
      en: 'BTS Pilgrimage Premium Tour',
      ja: 'BTS聖地巡礼プレミアムツアー',
    },
    description: {
      ko: 'BTS의 뮤직비디오 촬영지와 멤버들의 추천 맛집을 방문하는 프리미엄 투어',
      en: 'Premium tour visiting BTS music video filming locations and member-recommended restaurants',
      ja: 'BTSのミュージックビデオ撮影地とメンバーおすすめの飲食店を訪問するプレミアムツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1619229666372-3c26c399a4cb?w=800',
    images: [
      'https://images.unsplash.com/photo-1619229666372-3c26c399a4cb?w=1200',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
    ],
    location: {
      name: { ko: '서울 용산구', en: 'Yongsan, Seoul', ja: 'ソウル龍山区' },
      address: '서울특별시 용산구 한남대로 42길',
      coordinates: { lat: 37.5326, lng: 127.0047 },
    },
    pricing: { currency: 'KRW', amount: 89000, originalAmount: 120000, discountPercent: 26 },
    rating: 4.9,
    reviewCount: 1234,
    tags: ['BTS', 'ARMY', '성지순례', 'HYBE'],
    verified: true,
    featured: true,
    availableSlots: 12,
    duration: { ko: '4시간', en: '4 hours', ja: '4時間' },
    language: ['ko', 'en', 'ja', 'zh'],
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
    fullDescription: {
      ko: `아미들을 위한 특별한 BTS 성지순례 투어입니다.
전문 가이드와 함께 BTS의 뮤직비디오 촬영지, 데뷔 전 연습실, 멤버들이 자주 찾는 맛집을 방문합니다.

투어 하이라이트:
- '봄날' 뮤직비디오 촬영지 방문
- 하이브 사옥 외관 포토존
- 멤버들의 단골 맛집에서 점심 식사
- 데뷔 전 연습실 터 방문
- 특별 굿즈 증정`,
      en: `Special BTS pilgrimage tour for ARMYs.
Visit BTS music video filming locations, pre-debut practice rooms, and restaurants frequently visited by members with a professional guide.

Tour Highlights:
- Visit 'Spring Day' MV filming location
- HYBE building exterior photo zone
- Lunch at members' favorite restaurant
- Visit pre-debut practice room site
- Special goods gift`,
      ja: `ARMYのための特別なBTS聖地巡礼ツアー。
プロのガイドと一緒に、BTSのミュージックビデオ撮影地、デビュー前の練習室、メンバーがよく訪れる飲食店を訪問します。`
    },
    includes: {
      ko: ['전문 가이드 동행', '교통비 (전용 미니버스)', '점심 식사', '특별 굿즈 패키지', '사진 촬영 서비스'],
      en: ['Professional guide', 'Transportation (Private minibus)', 'Lunch', 'Special goods package', 'Photo service'],
      ja: ['専門ガイド同行', '交通費（専用ミニバス）', '昼食', '特別グッズパッケージ', '写真撮影サービス']
    },
    notIncludes: {
      ko: ['개인 경비', '여행자 보험', '픽업/드롭오프 서비스'],
      en: ['Personal expenses', 'Travel insurance', 'Pickup/Drop-off service'],
      ja: ['個人経費', '旅行保険', 'ピックアップ/ドロップオフサービス']
    },
    schedule: [
      { time: '09:00', activity: { ko: '홍대입구역 2번 출구 집합', en: 'Meet at Hongik Univ. Station Exit 2', ja: '弘大入口駅2番出口集合' } },
      { time: '09:30', activity: { ko: '하이브 사옥 외관 및 포토존', en: 'HYBE Building exterior & Photo zone', ja: 'HYBEビル外観＆フォトゾーン' } },
      { time: '10:30', activity: { ko: "'봄날' MV 촬영지 방문", en: "Visit 'Spring Day' MV location", ja: '「春の日」MV撮影地訪問' } },
      { time: '12:00', activity: { ko: '점심 식사 (멤버 추천 맛집)', en: 'Lunch (Member recommended restaurant)', ja: '昼食（メンバー推薦店）' } },
      { time: '13:30', activity: { ko: '데뷔 전 연습실 터 방문', en: 'Visit pre-debut practice room site', ja: 'デビュー前練習室跡訪問' } },
    ],
    host: {
      name: 'K-Tour Pro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      rating: 4.9,
      reviewCount: 2341,
      verified: true,
      description: {
        ko: '10년 경력의 K-POP 전문 투어 가이드입니다.',
        en: 'Professional K-POP tour guide with 10 years of experience.',
        ja: '10年の経験を持つK-POP専門ツアーガイドです。'
      }
    },
    reviews: [
      { id: 'r1', user: 'Emily★ARMY', avatar: 'https://i.pravatar.cc/150?img=1', rating: 5, comment: 'Best BTS tour ever! The guide was so knowledgeable!', date: '2024-11-15' },
      { id: 'r2', user: '紫色愛アミ', avatar: 'https://i.pravatar.cc/150?img=2', rating: 5, comment: '완벽한 투어였어요! 감동적이었습니다.', date: '2024-11-10' }
    ],
    faqs: [
      { question: { ko: '투어는 어떤 언어로 진행되나요?', en: 'What languages is the tour conducted in?', ja: 'ツアーは何語で行われますか？' }, 
        answer: { ko: '한국어, 영어, 일본어, 중국어 중 선택 가능합니다.', en: 'Available in Korean, English, Japanese, and Chinese.', ja: '韓国語、英語、日本語、中国語から選択可能です。' } }
    ]
  },
  {
    id: 'kpop-002',
    category: 'kpop',
    title: {
      ko: 'BLACKPINK 뮤직비디오 로케이션 투어',
      en: 'BLACKPINK Music Video Location Tour',
      ja: 'BLACKPINK MVロケーションツアー',
    },
    description: {
      ko: 'BLACKPINK의 아이코닉한 뮤직비디오 촬영지를 방문하는 특별 투어',
      en: 'Special tour visiting iconic BLACKPINK music video filming locations',
      ja: 'BLACKPINKの象徴的なMV撮影地を訪問する特別ツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
    ],
    location: {
      name: { ko: '서울 성동구', en: 'Seongdong, Seoul', ja: 'ソウル城東区' },
      address: '서울특별시 성동구 성수동',
      coordinates: { lat: 37.5447, lng: 127.0558 },
    },
    pricing: { currency: 'KRW', amount: 79000, originalAmount: 100000, discountPercent: 21 },
    rating: 4.8,
    reviewCount: 987,
    tags: ['BLACKPINK', 'BLINK', 'MV', 'YG'],
    verified: true,
    featured: true,
    availableSlots: 15,
    duration: { ko: '3시간 30분', en: '3.5 hours', ja: '3時間30分' },
    language: ['ko', 'en', 'ja'],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
    host: {
      name: 'Seoul K-Wave Tours',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      rating: 4.8,
      reviewCount: 1567,
      verified: true,
      description: { ko: 'K-POP 전문 투어 회사', en: 'K-POP Specialized Tour Company', ja: 'K-POP専門ツアー会社' }
    }
  },
  {
    id: 'kpop-003',
    category: 'kpop',
    title: {
      ko: 'K-POP 댄스 클래스 (아이돌 안무)',
      en: 'K-POP Dance Class (Idol Choreography)',
      ja: 'K-POPダンスクラス（アイドル振付）',
    },
    description: {
      ko: '현직 백업 댄서에게 배우는 인기 K-POP 아이돌 안무 클래스',
      en: 'Learn popular K-POP idol choreography from active backup dancers',
      ja: '現役バックダンサーから学ぶ人気K-POPアイドル振付クラス',
    },
    thumbnail: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
    images: [
      'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=1200',
      'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=1200',
    ],
    location: {
      name: { ko: '서울 마포구 홍대', en: 'Hongdae, Mapo, Seoul', ja: 'ソウル麻浦区弘大' },
      address: '서울특별시 마포구 와우산로 94',
      coordinates: { lat: 37.5563, lng: 126.9237 },
    },
    pricing: { currency: 'KRW', amount: 55000 },
    rating: 4.9,
    reviewCount: 2345,
    tags: ['K-POP', '댄스', '안무', '홍대'],
    verified: true,
    featured: true,
    availableSlots: 20,
    duration: { ko: '2시간', en: '2 hours', ja: '2時間' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
    includes: {
      ko: ['전문 안무 강사', '연습복 대여', '영상 촬영', '생수 제공'],
      en: ['Professional choreographer', 'Practice clothes rental', 'Video recording', 'Bottled water'],
      ja: ['専門振付師', '練習着レンタル', '動画撮影', 'ペットボトル水']
    },
    host: {
      name: 'Dance With K',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      rating: 4.9,
      reviewCount: 3210,
      verified: true,
      description: { ko: 'K-POP 전문 댄스 스튜디오', en: 'K-POP Specialized Dance Studio', ja: 'K-POP専門ダンススタジオ' }
    }
  },
  {
    id: 'kpop-004',
    category: 'kpop',
    title: {
      ko: 'SM엔터테인먼트 아티스트 팬투어',
      en: 'SM Entertainment Artist Fan Tour',
      ja: 'SMエンターテインメントアーティストファンツアー',
    },
    description: {
      ko: 'NCT, aespa, EXO 등 SM 아티스트 관련 명소 투어',
      en: 'Tour visiting SM artist related spots including NCT, aespa, EXO locations',
      ja: 'NCT、aespa、EXOなどSMアーティスト関連スポットツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
    ],
    location: {
      name: { ko: '서울 강남구', en: 'Gangnam, Seoul', ja: 'ソウル江南区' },
      address: '서울특별시 강남구 압구정로',
      coordinates: { lat: 37.5270, lng: 127.0276 },
    },
    pricing: { currency: 'KRW', amount: 75000, originalAmount: 95000, discountPercent: 21 },
    rating: 4.7,
    reviewCount: 876,
    tags: ['SM', 'NCT', 'aespa', 'EXO', '강남'],
    verified: true,
    featured: false,
    availableSlots: 16,
    duration: { ko: '4시간', en: '4 hours', ja: '4時間' },
    language: ['ko', 'en', 'ja'],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kpop-005',
    category: 'kpop',
    title: {
      ko: 'K-POP 레코딩 스튜디오 체험',
      en: 'K-POP Recording Studio Experience',
      ja: 'K-POPレコーディングスタジオ体験',
    },
    description: {
      ko: '실제 K-POP 아티스트들이 녹음하는 스튜디오에서 나만의 노래 녹음',
      en: 'Record your own song in a studio where actual K-POP artists record',
      ja: '実際のK-POPアーティストが録音するスタジオで自分の歌を録音',
    },
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200',
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=1200',
    ],
    location: {
      name: { ko: '서울 마포구', en: 'Mapo, Seoul', ja: 'ソウル麻浦区' },
      address: '서울특별시 마포구 양화로',
      coordinates: { lat: 37.5536, lng: 126.9215 },
    },
    pricing: { currency: 'KRW', amount: 120000, originalAmount: 150000, discountPercent: 20 },
    rating: 4.8,
    reviewCount: 543,
    tags: ['K-POP', '레코딩', '스튜디오', '녹음'],
    verified: true,
    featured: false,
    availableSlots: 4,
    duration: { ko: '1시간 30분', en: '1.5 hours', ja: '1時間30分' },
    language: ['ko', 'en'],
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
];

// =============================================
// K-DRAMA EXPERIENCES (5)
// =============================================
const KDRAMA_EXPERIENCES: KExperience[] = [
  {
    id: 'kdrama-001',
    category: 'kdrama',
    title: {
      ko: '도깨비 촬영지 강릉 투어',
      en: 'Goblin Filming Location Gangneung Tour',
      ja: 'トッケビ撮影地江陵ツアー',
    },
    description: {
      ko: '드라마 도깨비의 로맨틱한 촬영 장소를 방문하는 감성 투어',
      en: 'Emotional tour visiting romantic filming locations from drama Goblin',
      ja: 'ドラマ「トッケビ」のロマンチックな撮影地を訪問する感性ツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1596276020587-8044fe049813?w=800',
    images: [
      'https://images.unsplash.com/photo-1596276020587-8044fe049813?w=1200',
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200',
    ],
    location: {
      name: { ko: '강원도 강릉', en: 'Gangneung, Gangwon', ja: '江原道江陵' },
      address: '강원특별자치도 강릉시 주문진읍',
      coordinates: { lat: 37.8228, lng: 128.8986 },
    },
    pricing: { currency: 'KRW', amount: 95000, originalAmount: 130000, discountPercent: 27 },
    rating: 4.9,
    reviewCount: 1856,
    tags: ['도깨비', 'Goblin', '강릉', '로맨스'],
    verified: true,
    featured: true,
    availableSlots: 20,
    duration: { ko: '8시간', en: '8 hours', ja: '8時間' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
    fullDescription: {
      ko: `도깨비 팬들을 위한 특별한 강릉 투어!
주문진 방파제, 도깨비 해변, 커피숍 등 드라마 속 감동적인 장면이 촬영된 곳을 방문합니다.`,
      en: `Special Gangneung tour for Goblin fans!
Visit the pier, beach, and coffee shop where touching drama scenes were filmed.`,
      ja: `トッケビファンのための特別な江陵ツアー！
防波堤、ビーチ、コーヒーショップなど感動的なシーンが撮影された場所を訪問します。`
    },
    includes: {
      ko: ['서울-강릉 왕복 교통', '전문 가이드', '점심 식사', '커피 1잔'],
      en: ['Seoul-Gangneung round trip', 'Professional guide', 'Lunch', '1 Coffee'],
      ja: ['ソウル-江陵往復交通', '専門ガイド', '昼食', 'コーヒー1杯']
    },
    host: {
      name: 'Drama Location Tours',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      rating: 4.9,
      reviewCount: 2890,
      verified: true,
      description: { ko: 'K-드라마 촬영지 전문 투어', en: 'K-Drama Location Specialist', ja: 'K-ドラマロケ地専門' }
    }
  },
  {
    id: 'kdrama-002',
    category: 'kdrama',
    title: {
      ko: '사랑의 불시착 DMZ 투어',
      en: 'Crash Landing on You DMZ Tour',
      ja: '愛の不時着DMZツアー',
    },
    description: {
      ko: '드라마 속 남북 국경 지역 촬영지를 방문하는 특별 투어',
      en: 'Special tour visiting the inter-Korean border filming locations from the drama',
      ja: 'ドラマの南北国境地域撮影地を訪問する特別ツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800',
    images: [
      'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200',
    ],
    location: {
      name: { ko: '경기도 파주 DMZ', en: 'DMZ, Paju, Gyeonggi', ja: '京畿道坡州DMZ' },
      address: '경기도 파주시 임진각로',
      coordinates: { lat: 37.8889, lng: 126.7378 },
    },
    pricing: { currency: 'KRW', amount: 85000 },
    rating: 4.8,
    reviewCount: 1234,
    tags: ['사랑의불시착', 'CLOY', 'DMZ', '현빈', '손예진'],
    verified: true,
    featured: true,
    availableSlots: 25,
    duration: { ko: '6시간', en: '6 hours', ja: '6時間' },
    language: ['ko', 'en', 'ja'],
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kdrama-003',
    category: 'kdrama',
    title: {
      ko: '이태원 클라쓰 성수동 투어',
      en: 'Itaewon Class Seongsu-dong Tour',
      ja: '梨泰院クラス聖水洞ツアー',
    },
    description: {
      ko: '드라마 이태원 클라쓰 촬영지와 성수동 힙플레이스 투어',
      en: 'Tour of Itaewon Class filming locations and Seongsu-dong hip places',
      ja: '梨泰院クラス撮影地と聖水洞のヒップスポットツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    ],
    location: {
      name: { ko: '서울 성동구 성수동', en: 'Seongsu-dong, Seoul', ja: 'ソウル聖水洞' },
      address: '서울특별시 성동구 성수동2가',
      coordinates: { lat: 37.5447, lng: 127.0558 },
    },
    pricing: { currency: 'KRW', amount: 45000 },
    rating: 4.6,
    reviewCount: 678,
    tags: ['이태원클라쓰', '성수동', '박서준', '카페'],
    verified: true,
    featured: false,
    availableSlots: 15,
    duration: { ko: '3시간', en: '3 hours', ja: '3時間' },
    language: ['ko', 'en'],
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kdrama-004',
    category: 'kdrama',
    title: {
      ko: '더 글로리 촬영지 투어',
      en: 'The Glory Filming Location Tour',
      ja: 'ザ・グローリー撮影地ツアー',
    },
    description: {
      ko: 'Netflix 화제작 더 글로리의 주요 촬영지를 방문하는 투어',
      en: 'Tour visiting major filming locations of Netflix hit The Glory',
      ja: 'Netflixヒット作「ザ・グローリー」の主要撮影地を訪問するツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800',
    images: [
      'https://images.unsplash.com/photo-1568667256549-094345857637?w=1200',
    ],
    location: {
      name: { ko: '서울 송파구', en: 'Songpa, Seoul', ja: 'ソウル松坡区' },
      address: '서울특별시 송파구',
      coordinates: { lat: 37.5145, lng: 127.1066 },
    },
    pricing: { currency: 'KRW', amount: 55000, originalAmount: 70000, discountPercent: 21 },
    rating: 4.7,
    reviewCount: 432,
    tags: ['더글로리', 'TheGlory', 'Netflix', '송혜교'],
    verified: true,
    featured: false,
    availableSlots: 12,
    duration: { ko: '4시간', en: '4 hours', ja: '4時間' },
    language: ['ko', 'en', 'ja'],
    createdAt: '2024-04-20T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kdrama-005',
    category: 'kdrama',
    title: {
      ko: '눈물의 여왕 제주도 투어',
      en: 'Queen of Tears Jeju Island Tour',
      ja: '涙の女王済州島ツアー',
    },
    description: {
      ko: '2024 최고 화제작 눈물의 여왕 제주도 촬영지 투어',
      en: '2024 hit drama Queen of Tears Jeju Island filming location tour',
      ja: '2024年最高の話題作「涙の女王」済州島撮影地ツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
    images: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200',
    ],
    location: {
      name: { ko: '제주특별자치도', en: 'Jeju Island', ja: '済州島' },
      address: '제주특별자치도 서귀포시',
      coordinates: { lat: 33.2541, lng: 126.5601 },
    },
    pricing: { currency: 'KRW', amount: 150000, originalAmount: 200000, discountPercent: 25 },
    rating: 4.9,
    reviewCount: 567,
    tags: ['눈물의여왕', 'QueenOfTears', '제주도', '김수현', '김지원'],
    verified: true,
    featured: true,
    availableSlots: 10,
    duration: { ko: '10시간', en: '10 hours', ja: '10時間' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
];

// =============================================
// K-BEAUTY EXPERIENCES (5)
// =============================================
const KBEAUTY_EXPERIENCES: KExperience[] = [
  {
    id: 'kbeauty-001',
    category: 'kbeauty',
    title: {
      ko: '강남 K-뷰티 메이크업 마스터클래스',
      en: 'Gangnam K-Beauty Makeup Masterclass',
      ja: '江南K-ビューティーメイクアップマスタークラス',
    },
    description: {
      ko: '전문 메이크업 아티스트에게 배우는 K-뷰티 메이크업의 모든 것',
      en: 'Learn everything about K-Beauty makeup from professional makeup artists',
      ja: 'プロのメイクアップアーティストからK-ビューティーメイクの全てを学ぶ',
    },
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200',
    ],
    location: {
      name: { ko: '서울 강남구 신사동', en: 'Sinsa-dong, Gangnam, Seoul', ja: 'ソウル江南区新沙洞' },
      address: '서울특별시 강남구 압구정로 10길',
      coordinates: { lat: 37.5219, lng: 127.0235 },
    },
    pricing: { currency: 'KRW', amount: 150000, originalAmount: 200000, discountPercent: 25 },
    rating: 4.9,
    reviewCount: 1423,
    tags: ['K-뷰티', '메이크업', '강남', '마스터클래스'],
    verified: true,
    featured: true,
    availableSlots: 8,
    duration: { ko: '3시간', en: '3 hours', ja: '3時間' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
    includes: {
      ko: ['전문 메이크업 강사', '풀 메이크업 제품 제공', '개인별 컨설팅', 'K-뷰티 제품 선물'],
      en: ['Professional makeup instructor', 'Full makeup products provided', 'Personal consultation', 'K-Beauty product gift'],
      ja: ['専門メイク講師', 'フルメイク用品提供', '個別カウンセリング', 'K-ビューティー製品プレゼント']
    },
    host: {
      name: 'Glam Seoul Academy',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
      rating: 4.9,
      reviewCount: 1876,
      verified: true,
      description: { ko: '강남 최고의 K-뷰티 아카데미', en: "Gangnam's Best K-Beauty Academy", ja: '江南最高のK-ビューティーアカデミー' }
    }
  },
  {
    id: 'kbeauty-002',
    category: 'kbeauty',
    title: {
      ko: '명동 K-뷰티 쇼핑 & 스킨케어 투어',
      en: 'Myeongdong K-Beauty Shopping & Skincare Tour',
      ja: '明洞K-ビューティーショッピング＆スキンケアツアー',
    },
    description: {
      ko: 'K-뷰티 전문가와 함께하는 명동 화장품 쇼핑 가이드 투어',
      en: 'Myeongdong cosmetics shopping guide tour with K-Beauty expert',
      ja: 'K-ビューティー専門家と一緒の明洞コスメショッピングガイドツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800',
    images: [
      'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=1200',
    ],
    location: {
      name: { ko: '서울 중구 명동', en: 'Myeongdong, Jung-gu, Seoul', ja: 'ソウル中区明洞' },
      address: '서울특별시 중구 명동길',
      coordinates: { lat: 37.5636, lng: 126.9869 },
    },
    pricing: { currency: 'KRW', amount: 45000 },
    rating: 4.7,
    reviewCount: 2134,
    tags: ['K-뷰티', '명동', '쇼핑', '스킨케어'],
    verified: true,
    featured: false,
    availableSlots: 12,
    duration: { ko: '2시간 30분', en: '2.5 hours', ja: '2時間30分' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kbeauty-003',
    category: 'kbeauty',
    title: {
      ko: '한방 스파 & 피부 관리 체험',
      en: 'Korean Herbal Spa & Skincare Experience',
      ja: '韓方スパ＆スキンケア体験',
    },
    description: {
      ko: '전통 한방 재료를 사용한 프리미엄 스파 & 피부 관리',
      en: 'Premium spa & skincare using traditional Korean herbal ingredients',
      ja: '伝統韓方材料を使用したプレミアムスパ＆スキンケア',
    },
    thumbnail: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    images: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200',
    ],
    location: {
      name: { ko: '서울 종로구 북촌', en: 'Bukchon, Jongno, Seoul', ja: 'ソウル鍾路区北村' },
      address: '서울특별시 종로구 북촌로',
      coordinates: { lat: 37.5826, lng: 126.9850 },
    },
    pricing: { currency: 'KRW', amount: 180000, originalAmount: 250000, discountPercent: 28 },
    rating: 4.9,
    reviewCount: 876,
    tags: ['한방', '스파', '피부관리', '북촌'],
    verified: true,
    featured: true,
    availableSlots: 6,
    duration: { ko: '2시간', en: '2 hours', ja: '2時間' },
    language: ['ko', 'en', 'ja'],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kbeauty-004',
    category: 'kbeauty',
    title: {
      ko: '올리브영 VIP 쇼핑 체험',
      en: 'Olive Young VIP Shopping Experience',
      ja: 'オリーブヤングVIPショッピング体験',
    },
    description: {
      ko: '올리브영 뷰티 전문가와 함께하는 맞춤형 쇼핑 체험',
      en: 'Customized shopping experience with Olive Young beauty expert',
      ja: 'オリーブヤングビューティー専門家とのカスタマイズショッピング体験',
    },
    thumbnail: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1200',
    ],
    location: {
      name: { ko: '서울 강남구', en: 'Gangnam, Seoul', ja: 'ソウル江南区' },
      address: '서울특별시 강남구 강남대로',
      coordinates: { lat: 37.4979, lng: 127.0276 },
    },
    pricing: { currency: 'KRW', amount: 35000 },
    rating: 4.6,
    reviewCount: 1567,
    tags: ['올리브영', 'K-뷰티', '쇼핑', '강남'],
    verified: true,
    featured: false,
    availableSlots: 10,
    duration: { ko: '1시간 30분', en: '1.5 hours', ja: '1時間30分' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-04-10T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kbeauty-005',
    category: 'kbeauty',
    title: {
      ko: 'K-뷰티 브랜드 공장 견학',
      en: 'K-Beauty Brand Factory Tour',
      ja: 'K-ビューティーブランド工場見学',
    },
    description: {
      ko: '유명 K-뷰티 브랜드의 생산 공장을 직접 견학하는 특별 투어',
      en: 'Special tour visiting production facilities of famous K-Beauty brands',
      ja: '有名K-ビューティーブランドの生産工場を直接見学する特別ツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800',
    images: [
      'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=1200',
    ],
    location: {
      name: { ko: '경기도 오산', en: 'Osan, Gyeonggi', ja: '京畿道烏山' },
      address: '경기도 오산시',
      coordinates: { lat: 37.1498, lng: 127.0693 },
    },
    pricing: { currency: 'KRW', amount: 65000, originalAmount: 80000, discountPercent: 19 },
    rating: 4.7,
    reviewCount: 234,
    tags: ['K-뷰티', '공장견학', '화장품'],
    verified: true,
    featured: false,
    availableSlots: 20,
    duration: { ko: '4시간', en: '4 hours', ja: '4時間' },
    language: ['ko', 'en'],
    createdAt: '2024-05-15T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
];

// =============================================
// K-FOOD EXPERIENCES (5)
// =============================================
const KFOOD_EXPERIENCES: KExperience[] = [
  {
    id: 'kfood-001',
    category: 'kfood',
    title: {
      ko: '전통 한식 쿠킹클래스 (비빔밥 & 김치)',
      en: 'Traditional Korean Cooking Class (Bibimbap & Kimchi)',
      ja: '伝統韓国料理クッキングクラス（ビビンバ＆キムチ）',
    },
    description: {
      ko: '비빔밥, 김치 등 정통 한식을 배우는 프리미엄 요리 클래스',
      en: 'Premium cooking class to learn authentic Korean dishes like bibimbap and kimchi',
      ja: 'ビビンバ、キムチなど本格韓国料理を学ぶプレミアムクッキングクラス',
    },
    thumbnail: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    images: [
      'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1200',
      'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200',
    ],
    location: {
      name: { ko: '서울 종로구 인사동', en: 'Insadong, Jongno, Seoul', ja: 'ソウル鍾路区仁寺洞' },
      address: '서울특별시 종로구 인사동길',
      coordinates: { lat: 37.5741, lng: 126.9868 },
    },
    pricing: { currency: 'KRW', amount: 75000 },
    rating: 4.9,
    reviewCount: 3456,
    tags: ['한식', '쿠킹클래스', '비빔밥', '김치', '인사동'],
    verified: true,
    featured: true,
    availableSlots: 12,
    duration: { ko: '2시간 30분', en: '2.5 hours', ja: '2時間30分' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
    fullDescription: {
      ko: `한식의 정수를 배우는 프리미엄 쿠킹클래스!
전문 한식 셰프와 함께 비빔밥과 김치를 직접 만들어보세요.`,
      en: `Premium cooking class to learn the essence of Korean cuisine!
Make bibimbap and kimchi yourself with a professional Korean chef.`,
      ja: `韓国料理の真髄を学ぶプレミアムクッキングクラス！
プロの韓国料理シェフと一緒にビビンバとキムチを直接作ってみましょう。`
    },
    includes: {
      ko: ['모든 재료 및 조리도구', '레시피북', '직접 만든 요리 시식', '앞치마 및 헤어캡'],
      en: ['All ingredients and utensils', 'Recipe book', 'Tasting your own dishes', 'Apron and hair cap'],
      ja: ['全ての材料と調理器具', 'レシピブック', '自分で作った料理の試食', 'エプロンとヘアキャップ']
    },
    host: {
      name: 'Seoul Cooking School',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200',
      rating: 4.9,
      reviewCount: 4521,
      verified: true,
      description: { ko: '서울 최고의 한식 쿠킹클래스', en: "Seoul's Best Korean Cooking Class", ja: 'ソウル最高の韓国料理クッキングクラス' }
    }
  },
  {
    id: 'kfood-002',
    category: 'kfood',
    title: {
      ko: '광장시장 먹거리 투어',
      en: 'Gwangjang Market Food Tour',
      ja: '広蔵市場グルメツアー',
    },
    description: {
      ko: '서울 최고의 전통 시장에서 다양한 길거리 음식을 맛보는 투어',
      en: 'Tour tasting various street foods at Seoul\'s best traditional market',
      ja: 'ソウル最高の伝統市場で様々な屋台料理を味わうツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1583224994076-0de5e5de7cb8?w=800',
    images: [
      'https://images.unsplash.com/photo-1583224994076-0de5e5de7cb8?w=1200',
    ],
    location: {
      name: { ko: '서울 종로구 광장시장', en: 'Gwangjang Market, Jongno, Seoul', ja: 'ソウル鍾路区広蔵市場' },
      address: '서울특별시 종로구 종로 88',
      coordinates: { lat: 37.5700, lng: 126.9995 },
    },
    pricing: { currency: 'KRW', amount: 55000 },
    rating: 4.8,
    reviewCount: 2876,
    tags: ['광장시장', '먹거리투어', '빈대떡', '마약김밥'],
    verified: true,
    featured: true,
    availableSlots: 15,
    duration: { ko: '2시간', en: '2 hours', ja: '2時間' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kfood-003',
    category: 'kfood',
    title: {
      ko: '전주 비빔밥 & 한옥마을 투어',
      en: 'Jeonju Bibimbap & Hanok Village Tour',
      ja: '全州ビビンバ＆韓屋村ツアー',
    },
    description: {
      ko: '비빔밥의 본고장 전주에서 즐기는 미식 여행',
      en: 'Culinary trip enjoying authentic bibimbap in Jeonju, the home of bibimbap',
      ja: 'ビビンバの本場全州で楽しむグルメ旅行',
    },
    thumbnail: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800',
    images: [
      'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=1200',
      'https://images.unsplash.com/photo-1583224994076-0de5e5de7cb8?w=1200',
    ],
    location: {
      name: { ko: '전라북도 전주', en: 'Jeonju, Jeonbuk', ja: '全羅北道全州' },
      address: '전라북도 전주시 완산구 한옥마을',
      coordinates: { lat: 35.8151, lng: 127.1530 },
    },
    pricing: { currency: 'KRW', amount: 120000, originalAmount: 150000, discountPercent: 20 },
    rating: 4.9,
    reviewCount: 1234,
    tags: ['전주', '비빔밥', '한옥마을', '맛집'],
    verified: true,
    featured: false,
    availableSlots: 20,
    duration: { ko: '10시간', en: '10 hours', ja: '10時間' },
    language: ['ko', 'en', 'ja'],
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kfood-004',
    category: 'kfood',
    title: {
      ko: '막걸리 양조장 투어 & 시음',
      en: 'Makgeolli Brewery Tour & Tasting',
      ja: 'マッコリ醸造所ツアー＆試飲',
    },
    description: {
      ko: '전통 막걸리 양조 과정을 배우고 다양한 막걸리를 시음하는 체험',
      en: 'Experience learning traditional makgeolli brewing and tasting various makgeolli',
      ja: '伝統マッコリ醸造過程を学び、様々なマッコリを試飲する体験',
    },
    thumbnail: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200',
    ],
    location: {
      name: { ko: '경기도 포천', en: 'Pocheon, Gyeonggi', ja: '京畿道抱川' },
      address: '경기도 포천시 이동면',
      coordinates: { lat: 38.0923, lng: 127.2006 },
    },
    pricing: { currency: 'KRW', amount: 65000 },
    rating: 4.7,
    reviewCount: 567,
    tags: ['막걸리', '양조장', '전통주', '시음'],
    verified: true,
    featured: false,
    availableSlots: 25,
    duration: { ko: '4시간', en: '4 hours', ja: '4時間' },
    language: ['ko', 'en'],
    createdAt: '2024-04-05T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kfood-005',
    category: 'kfood',
    title: {
      ko: '이태원 글로벌 퓨전 한식 투어',
      en: 'Itaewon Global Fusion Korean Food Tour',
      ja: '梨泰院グローバルフュージョン韓食ツアー',
    },
    description: {
      ko: '이태원의 트렌디한 퓨전 한식 레스토랑을 탐방하는 미식 투어',
      en: 'Culinary tour exploring trendy fusion Korean restaurants in Itaewon',
      ja: '梨泰院のトレンディなフュージョン韓食レストランを探訪するグルメツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800',
    images: [
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1200',
    ],
    location: {
      name: { ko: '서울 용산구 이태원', en: 'Itaewon, Yongsan, Seoul', ja: 'ソウル龍山区梨泰院' },
      address: '서울특별시 용산구 이태원로',
      coordinates: { lat: 37.5345, lng: 126.9945 },
    },
    pricing: { currency: 'KRW', amount: 85000, originalAmount: 100000, discountPercent: 15 },
    rating: 4.6,
    reviewCount: 432,
    tags: ['이태원', '퓨전한식', '미식투어', '트렌디'],
    verified: true,
    featured: false,
    availableSlots: 10,
    duration: { ko: '3시간', en: '3 hours', ja: '3時間' },
    language: ['ko', 'en', 'ja'],
    createdAt: '2024-05-20T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
];

// =============================================
// K-FASHION EXPERIENCES (5)
// =============================================
const KFASHION_EXPERIENCES: KExperience[] = [
  {
    id: 'kfashion-001',
    category: 'kfashion',
    title: {
      ko: '프리미엄 한복 체험 & 경복궁 투어',
      en: 'Premium Hanbok Experience & Gyeongbokgung Tour',
      ja: 'プレミアム韓服体験＆景福宮ツアー',
    },
    description: {
      ko: '최고급 한복을 입고 경복궁을 자유롭게 관람하는 프리미엄 체험',
      en: 'Premium experience wearing finest hanbok while freely touring Gyeongbokgung Palace',
      ja: '最高級韓服を着て景福宮を自由に見学するプレミアム体験',
    },
    thumbnail: 'https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=800',
    images: [
      'https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=1200',
      'https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=1200',
    ],
    location: {
      name: { ko: '서울 종로구 경복궁', en: 'Gyeongbokgung, Jongno, Seoul', ja: 'ソウル鍾路区景福宮' },
      address: '서울특별시 종로구 사직로 161',
      coordinates: { lat: 37.5796, lng: 126.9770 },
    },
    pricing: { currency: 'KRW', amount: 65000, originalAmount: 85000, discountPercent: 24 },
    rating: 4.8,
    reviewCount: 4567,
    tags: ['한복', '경복궁', '전통', '포토존'],
    verified: true,
    featured: true,
    availableSlots: 50,
    duration: { ko: '4시간', en: '4 hours', ja: '4時間' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
    fullDescription: {
      ko: `한국 전통의 아름다움을 경험하세요!
프리미엄 한복 대여와 함께 경복궁의 웅장한 아름다움을 즐기세요.
한복 착용 시 경복궁 무료 입장!`,
      en: `Experience the beauty of Korean tradition!
Enjoy the magnificent beauty of Gyeongbokgung with premium hanbok rental.
Free admission to Gyeongbokgung when wearing hanbok!`,
      ja: `韓国伝統の美しさを体験してください！
プレミアム韓服レンタルと一緒に景福宮の壮大な美しさをお楽しみください。
韓服着用時、景福宮入場無料！`
    },
    includes: {
      ko: ['프리미엄 한복 대여 (4시간)', '머리 스타일링', '액세서리 세트', '사물함 이용', '전문 사진 5장'],
      en: ['Premium hanbok rental (4 hours)', 'Hair styling', 'Accessory set', 'Locker use', '5 Professional photos'],
      ja: ['プレミアム韓服レンタル（4時間）', 'ヘアスタイリング', 'アクセサリーセット', 'ロッカー利用', 'プロ写真5枚']
    },
    host: {
      name: 'Royal Hanbok Studio',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
      rating: 4.8,
      reviewCount: 5678,
      verified: true,
      description: { ko: '경복궁 최고의 한복 대여점', en: "Gyeongbokgung's Best Hanbok Rental", ja: '景福宮最高の韓服レンタル店' }
    }
  },
  {
    id: 'kfashion-002',
    category: 'kfashion',
    title: {
      ko: '동대문 K-패션 쇼핑 투어',
      en: 'Dongdaemun K-Fashion Shopping Tour',
      ja: '東大門K-ファッションショッピングツアー',
    },
    description: {
      ko: '패션 전문가와 함께하는 동대문 쇼핑몰 심층 투어',
      en: 'In-depth Dongdaemun shopping mall tour with fashion expert',
      ja: 'ファッション専門家と一緒の東大門ショッピングモール深層ツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    images: [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
    ],
    location: {
      name: { ko: '서울 중구 동대문', en: 'Dongdaemun, Jung-gu, Seoul', ja: 'ソウル中区東大門' },
      address: '서울특별시 중구 을지로6가',
      coordinates: { lat: 37.5662, lng: 127.0097 },
    },
    pricing: { currency: 'KRW', amount: 45000 },
    rating: 4.6,
    reviewCount: 1234,
    tags: ['동대문', 'K-패션', '쇼핑', '야시장'],
    verified: true,
    featured: false,
    availableSlots: 12,
    duration: { ko: '3시간', en: '3 hours', ja: '3時間' },
    language: ['ko', 'en', 'ja', 'zh'],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kfashion-003',
    category: 'kfashion',
    title: {
      ko: '홍대 스트릿 패션 포토 투어',
      en: 'Hongdae Street Fashion Photo Tour',
      ja: '弘大ストリートファッションフォトツアー',
    },
    description: {
      ko: '홍대의 트렌디한 거리에서 K-패션 스타일 사진 촬영',
      en: 'K-fashion style photoshoot on trendy streets of Hongdae',
      ja: '弘大のトレンディな街でK-ファッションスタイル写真撮影',
    },
    thumbnail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800',
    images: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200',
    ],
    location: {
      name: { ko: '서울 마포구 홍대', en: 'Hongdae, Mapo, Seoul', ja: 'ソウル麻浦区弘大' },
      address: '서울특별시 마포구 홍대입구',
      coordinates: { lat: 37.5563, lng: 126.9237 },
    },
    pricing: { currency: 'KRW', amount: 120000, originalAmount: 150000, discountPercent: 20 },
    rating: 4.8,
    reviewCount: 876,
    tags: ['홍대', '패션', '포토', '스트릿'],
    verified: true,
    featured: true,
    availableSlots: 8,
    duration: { ko: '2시간', en: '2 hours', ja: '2時間' },
    language: ['ko', 'en', 'ja'],
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kfashion-004',
    category: 'kfashion',
    title: {
      ko: '압구정 로데오 K-브랜드 투어',
      en: 'Apgujeong Rodeo K-Brand Tour',
      ja: '狎鷗亭ロデオK-ブランドツアー',
    },
    description: {
      ko: '한국 디자이너 브랜드와 럭셔리 K-패션의 중심지 투어',
      en: 'Tour of Korean designer brands and luxury K-fashion hub',
      ja: '韓国デザイナーブランドとラグジュアリーK-ファッションの中心地ツアー',
    },
    thumbnail: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    images: [
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
    ],
    location: {
      name: { ko: '서울 강남구 압구정', en: 'Apgujeong, Gangnam, Seoul', ja: 'ソウル江南区狎鷗亭' },
      address: '서울특별시 강남구 압구정로',
      coordinates: { lat: 37.5270, lng: 127.0276 },
    },
    pricing: { currency: 'KRW', amount: 55000 },
    rating: 4.5,
    reviewCount: 345,
    tags: ['압구정', 'K-브랜드', '럭셔리', '디자이너'],
    verified: true,
    featured: false,
    availableSlots: 10,
    duration: { ko: '2시간 30분', en: '2.5 hours', ja: '2時間30分' },
    language: ['ko', 'en'],
    createdAt: '2024-04-20T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
  {
    id: 'kfashion-005',
    category: 'kfashion',
    title: {
      ko: '성수동 힙스터 패션 & 카페 투어',
      en: 'Seongsu-dong Hipster Fashion & Cafe Tour',
      ja: '聖水洞ヒップスターファッション＆カフェツアー',
    },
    description: {
      ko: '서울의 브루클린, 성수동의 트렌디한 패션과 카페 문화 체험',
      en: "Experience trendy fashion and cafe culture in Seoul's Brooklyn, Seongsu-dong",
      ja: 'ソウルのブルックリン、聖水洞のトレンディなファッションとカフェ文化体験',
    },
    thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200',
    ],
    location: {
      name: { ko: '서울 성동구 성수동', en: 'Seongsu-dong, Seongdong, Seoul', ja: 'ソウル城東区聖水洞' },
      address: '서울특별시 성동구 성수동2가',
      coordinates: { lat: 37.5447, lng: 127.0558 },
    },
    pricing: { currency: 'KRW', amount: 48000 },
    rating: 4.7,
    reviewCount: 567,
    tags: ['성수동', '힙스터', '카페', '패션'],
    verified: true,
    featured: false,
    availableSlots: 12,
    duration: { ko: '3시간', en: '3 hours', ja: '3時間' },
    language: ['ko', 'en', 'ja'],
    createdAt: '2024-05-10T00:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
  },
];

// =============================================
// COMBINED EXPORT
// =============================================
export const MOCK_EXPERIENCES: KExperience[] = [
  ...KPOP_EXPERIENCES,
  ...KDRAMA_EXPERIENCES,
  ...KBEAUTY_EXPERIENCES,
  ...KFOOD_EXPERIENCES,
  ...KFASHION_EXPERIENCES,
];

// Export individual category arrays for specific use cases
export {
  KPOP_EXPERIENCES,
  KDRAMA_EXPERIENCES,
  KBEAUTY_EXPERIENCES,
  KFOOD_EXPERIENCES,
  KFASHION_EXPERIENCES,
};
