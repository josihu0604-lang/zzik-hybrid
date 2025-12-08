-- ==============================================================================
-- K-Experiences Seed Data
-- ZZIK Global Pivot Strategy
-- Date: 2025-12-08
-- ==============================================================================

-- Clear existing data (development only)
-- TRUNCATE public.k_experiences RESTART IDENTITY CASCADE;

-- ==============================================================================
-- K-POP Experiences
-- ==============================================================================

INSERT INTO public.k_experiences (
  category, title, description, 
  location_lat, location_lng, address,
  cover_image, images, tags,
  related_content, rating, review_count, verification_count,
  is_featured, is_verified, is_active
) VALUES
-- 1. HYBE INSIGHT
(
  'kpop',
  '{"ko": "하이브 인사이트", "en": "HYBE INSIGHT", "ja": "ハイブインサイト", "zh-TW": "HYBE INSIGHT", "th": "HYBE INSIGHT"}',
  '{"ko": "BTS, 세븐틴, TXT 등 하이브 아티스트의 역사와 음악을 체험할 수 있는 전시 공간입니다.", "en": "An immersive exhibition space where you can experience the history and music of HYBE artists including BTS, SEVENTEEN, and TXT.", "ja": "BTS、SEVENTEEN、TXTなどHYBEアーティストの歴史と音楽を体験できる展示空間です。", "zh-TW": "可以體驗BTS、SEVENTEEN、TXT等HYBE藝人歷史和音樂的沉浸式展覽空間。", "th": "พื้นที่จัดแสดงที่คุณสามารถสัมผัสประวัติศาสตร์และเพลงของศิลปิน HYBE รวมถึง BTS, SEVENTEEN และ TXT"}',
  37.5282, 127.0051,
  '{"ko": "서울특별시 용산구 한강대로 42길 15", "en": "15 Hangang-daero 42-gil, Yongsan-gu, Seoul", "ja": "ソウル特別市龍山区漢江大路42ギル15", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1619229666372-3c26c399a4cb?w=800',
  ARRAY['https://images.unsplash.com/photo-1619229666372-3c26c399a4cb?w=800', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'],
  ARRAY['BTS', 'SEVENTEEN', 'TXT', 'HYBE', 'museum', 'exhibition'],
  '{"artists": ["BTS", "SEVENTEEN", "TXT", "NewJeans"], "company": "HYBE"}',
  4.8, 1523, 3421,
  TRUE, TRUE, TRUE
),
-- 2. SM Entertainment Town (COEX)
(
  'kpop',
  '{"ko": "SM타운 코엑스아티움", "en": "SM TOWN COEX Artium", "ja": "SMタウン コエックスアーティアム", "zh-TW": "SM TOWN COEX Artium", "th": "SM TOWN COEX Artium"}',
  '{"ko": "EXO, aespa, NCT 등 SM 아티스트들의 굿즈와 전시를 만날 수 있는 복합 문화 공간입니다.", "en": "A cultural complex where you can find merchandise and exhibitions of SM artists including EXO, aespa, and NCT.", "ja": "EXO、aespa、NCTなどSMアーティストのグッズと展示を楽しめる複合文化空間です。", "zh-TW": "可以找到EXO、aespa、NCT等SM藝人周邊商品和展覽的文化複合空間。", "th": "ศูนย์วัฒนธรรมที่คุณสามารถหาสินค้าและนิทรรศการของศิลปิน SM รวมถึง EXO, aespa และ NCT"}',
  37.5116, 127.0594,
  '{"ko": "서울특별시 강남구 영동대로 513 코엑스몰", "en": "513 Yeongdong-daero, Gangnam-gu, Seoul (COEX Mall)", "ja": "ソウル特別市江南区永東大路513 COEXモール", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'],
  ARRAY['EXO', 'aespa', 'NCT', 'SM Entertainment', 'COEX', 'merchandise'],
  '{"artists": ["EXO", "aespa", "NCT", "Red Velvet"], "company": "SM Entertainment"}',
  4.6, 987, 2156,
  TRUE, TRUE, TRUE
),
-- 3. JYP Entertainment Building
(
  'kpop',
  '{"ko": "JYP 엔터테인먼트 사옥", "en": "JYP Entertainment Building", "ja": "JYPエンターテインメント社屋", "zh-TW": "JYP娛樂大樓", "th": "อาคาร JYP Entertainment"}',
  '{"ko": "트와이스, 스트레이키즈 팬들의 성지! JYP 사옥 앞에서 인증샷을 찍어보세요.", "en": "A pilgrimage site for TWICE and Stray Kids fans! Take a verification photo in front of the JYP building.", "ja": "TWICE、Stray Kidsファンの聖地！JYP社屋前で認証写真を撮りましょう。", "zh-TW": "TWICE和Stray Kids粉絲的聖地！在JYP大樓前拍認證照吧。", "th": "สถานที่ศักดิ์สิทธิ์สำหรับแฟน TWICE และ Stray Kids! ถ่ายรูปยืนยันหน้าอาคาร JYP"}',
  37.5244, 127.0477,
  '{"ko": "서울특별시 강남구 압구정로 79길 41", "en": "41 Apgujeong-ro 79-gil, Gangnam-gu, Seoul", "ja": "ソウル特別市江南区狎鷗亭路79ギル41", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
  ARRAY['https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800'],
  ARRAY['TWICE', 'Stray Kids', 'ITZY', 'JYP', 'building', 'landmark'],
  '{"artists": ["TWICE", "Stray Kids", "ITZY", "NMIXX"], "company": "JYP Entertainment"}',
  4.5, 756, 1834,
  FALSE, TRUE, TRUE
),
-- 4. YG Entertainment
(
  'kpop',
  '{"ko": "YG 엔터테인먼트", "en": "YG Entertainment", "ja": "YGエンターテインメント", "zh-TW": "YG娛樂", "th": "YG Entertainment"}',
  '{"ko": "블랙핑크, 빅뱅의 소속사! 합정역 근처 YG 사옥을 방문해보세요.", "en": "Home of BLACKPINK and BIGBANG! Visit the YG building near Hapjeong Station.", "ja": "BLACKPINK、BIGBANGの所属事務所！合井駅近くのYG社屋を訪問してみてください。", "zh-TW": "BLACKPINK和BIGBANG的經紀公司！參觀合井站附近的YG大樓。", "th": "บ้านของ BLACKPINK และ BIGBANG! เยี่ยมชมอาคาร YG ใกล้สถานี Hapjeong"}',
  37.5496, 126.9139,
  '{"ko": "서울특별시 마포구 희우정로 3길 20", "en": "20 Huiujeong-ro 3-gil, Mapo-gu, Seoul", "ja": "ソウル特別市麻浦区希雨亭路3ギル20", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'],
  ARRAY['BLACKPINK', 'BIGBANG', 'YG', 'building', 'Hapjeong'],
  '{"artists": ["BLACKPINK", "BIGBANG", "TREASURE", "BABYMONSTER"], "company": "YG Entertainment"}',
  4.4, 623, 1567,
  FALSE, TRUE, TRUE
),
-- 5. K-Star Road (Gangnam)
(
  'kpop',
  '{"ko": "K-스타 로드", "en": "K-Star Road", "ja": "Kスターロード", "zh-TW": "K-Star Road", "th": "K-Star Road"}',
  '{"ko": "강남역에서 압구정역까지 이어지는 K-POP 아이돌 아트토이 거리입니다.", "en": "A street lined with K-POP idol art toys stretching from Gangnam Station to Apgujeong Station.", "ja": "江南駅から狎鷗亭駅まで続くK-POPアイドルアートトイ通りです。", "zh-TW": "從江南站延伸到狎鷗亭站的K-POP偶像藝術玩具街。", "th": "ถนนที่มีอาร์ตทอยไอดอล K-POP เรียงรายจากสถานี Gangnam ถึงสถานี Apgujeong"}',
  37.5172, 127.0473,
  '{"ko": "서울특별시 강남구 도산대로", "en": "Dosan-daero, Gangnam-gu, Seoul", "ja": "ソウル特別市江南区島山大路", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
  ARRAY['https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'],
  ARRAY['Gangnam', 'art toys', 'street', 'photo spot', 'K-POP'],
  '{"type": "street_art", "artists": "various"}',
  4.3, 445, 2345,
  TRUE, TRUE, TRUE
);

-- ==============================================================================
-- K-Drama Experiences
-- ==============================================================================

INSERT INTO public.k_experiences (
  category, title, description, 
  location_lat, location_lng, address,
  cover_image, images, tags,
  related_content, rating, review_count, verification_count,
  is_featured, is_verified, is_active
) VALUES
-- 1. Goblin Filming Location - Jumunjin Beach
(
  'kdrama',
  '{"ko": "도깨비 촬영지 - 주문진 해변", "en": "Goblin Filming Location - Jumunjin Beach", "ja": "トッケビ撮影地 - 注文津海岸", "zh-TW": "鬼怪拍攝地 - 注文津海邊", "th": "สถานที่ถ่ายทำ Goblin - หาด Jumunjin"}',
  '{"ko": "드라마 도깨비의 명장면이 촬영된 주문진 방파제입니다. 은탁이 도깨비를 부른 그 곳!", "en": "The iconic Jumunjin breakwater where the famous scene from Goblin was filmed. The place where Eun-tak summoned the Goblin!", "ja": "ドラマ「トッケビ」の名場面が撮影された注文津防波堤です。ウンタクがトッケビを呼んだあの場所！", "zh-TW": "電視劇《鬼怪》名場面拍攝地注文津防波堤。恩卓召喚鬼怪的那個地方！", "th": "ท่าเรือ Jumunjin ที่ฉากดังจาก Goblin ถูกถ่ายทำ สถานที่ที่ Eun-tak เรียก Goblin!"}',
  37.8927, 128.8306,
  '{"ko": "강원도 강릉시 주문진읍 해안로 1609", "en": "1609 Haean-ro, Jumunjin-eup, Gangneung-si, Gangwon-do", "ja": "江原道江陵市注文津邑海岸路1609", "country": "KR", "city": "Gangneung"}',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
  ARRAY['Goblin', 'beach', 'breakwater', 'romantic', 'filming location'],
  '{"drama": "Goblin", "year": 2016, "cast": ["Gong Yoo", "Kim Go-eun"]}',
  4.9, 2341, 5678,
  TRUE, TRUE, TRUE
),
-- 2. Crash Landing on You - DMZ/Cheorwon
(
  'kdrama',
  '{"ko": "사랑의 불시착 촬영지 - 철원", "en": "Crash Landing on You Filming Location - Cheorwon", "ja": "愛の不時着撮影地 - 鉄原", "zh-TW": "愛的迫降拍攝地 - 鐵原", "th": "สถานที่ถ่ายทำ Crash Landing on You - Cheorwon"}',
  '{"ko": "세리와 정혁의 로맨스가 시작된 곳! 철원의 아름다운 자연 속에서 드라마 속 장면을 재현해보세요.", "en": "Where Se-ri and Jeong-hyeok''s romance began! Recreate drama scenes in the beautiful nature of Cheorwon.", "ja": "セリとジョンヒョクのロマンスが始まった場所！鉄原の美しい自然の中でドラマの場面を再現してみてください。", "zh-TW": "世理和正赫的浪漫開始的地方！在鐵原美麗的大自然中重現劇中場景。", "th": "ที่ที่ความรักของ Se-ri และ Jeong-hyeok เริ่มต้น! สร้างฉากละครในธรรมชาติอันสวยงามของ Cheorwon"}',
  38.2468, 127.3133,
  '{"ko": "강원도 철원군 갈말읍", "en": "Galmal-eup, Cheorwon-gun, Gangwon-do", "ja": "江原道鉄原郡葛末邑", "country": "KR", "city": "Cheorwon"}',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  ARRAY['Crash Landing on You', 'DMZ', 'nature', 'romance', 'filming location'],
  '{"drama": "Crash Landing on You", "year": 2019, "cast": ["Hyun Bin", "Son Ye-jin"]}',
  4.7, 1876, 3421,
  TRUE, TRUE, TRUE
),
-- 3. Itaewon Class - Itaewon Street
(
  'kdrama',
  '{"ko": "이태원 클라쓰 촬영지", "en": "Itaewon Class Filming Location", "ja": "梨泰院クラス撮影地", "zh-TW": "梨泰院Class拍攝地", "th": "สถานที่ถ่ายทำ Itaewon Class"}',
  '{"ko": "박새로이의 단밤 포차가 있던 이태원 거리입니다. 드라마 속 열정을 느껴보세요!", "en": "The Itaewon street where Park Saeroyi''s DanBam bar was located. Feel the passion from the drama!", "ja": "パク・セロイのタンバムポチャがあった梨泰院通りです。ドラマの情熱を感じてください！", "zh-TW": "朴世路的甜夜酒館所在的梨泰院街道。感受劇中的熱情！", "th": "ถนน Itaewon ที่บาร์ DanBam ของ Park Saeroyi ตั้งอยู่ สัมผัสความหลงใหลจากละคร!"}',
  37.5347, 126.9948,
  '{"ko": "서울특별시 용산구 이태원로", "en": "Itaewon-ro, Yongsan-gu, Seoul", "ja": "ソウル特別市龍山区梨泰院路", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
  ARRAY['Itaewon Class', 'restaurant', 'bar', 'Itaewon', 'filming location'],
  '{"drama": "Itaewon Class", "year": 2020, "cast": ["Park Seo-jun", "Kim Da-mi"]}',
  4.5, 1234, 2876,
  FALSE, TRUE, TRUE
),
-- 4. Descendants of the Sun - Taean Filming Set
(
  'kdrama',
  '{"ko": "태양의 후예 촬영 세트장", "en": "Descendants of the Sun Filming Set", "ja": "太陽の末裔撮影セット", "zh-TW": "太陽的後裔拍攝場景", "th": "ฉากถ่ายทำ Descendants of the Sun"}',
  '{"ko": "유시진 대위와 강모연 박사의 로맨스가 펼쳐진 우르크 캠프 세트장입니다.", "en": "The Uruk camp set where Captain Yoo Si-jin and Dr. Kang Mo-yeon''s romance unfolded.", "ja": "ユ・シジン大尉とカン・モヨン博士のロマンスが繰り広げられたウルク・キャンプのセット場です。", "zh-TW": "柳時鎮大尉和姜暮煙博士浪漫展開的烏魯克營地場景。", "th": "ฉากค่าย Uruk ที่ความรักของกัปตัน Yoo Si-jin และ Dr. Kang Mo-yeon เกิดขึ้น"}',
  36.8085, 126.1642,
  '{"ko": "충청남도 태안군 원북면", "en": "Wonbuk-myeon, Taean-gun, Chungcheongnam-do", "ja": "忠清南道泰安郡元北面", "country": "KR", "city": "Taean"}',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
  ARRAY['Descendants of the Sun', 'military', 'set', 'romance', 'filming location'],
  '{"drama": "Descendants of the Sun", "year": 2016, "cast": ["Song Joong-ki", "Song Hye-kyo"]}',
  4.6, 987, 2134,
  FALSE, TRUE, TRUE
),
-- 5. Reply 1988 - Ssangmun-dong
(
  'kdrama',
  '{"ko": "응답하라 1988 - 쌍문동 골목", "en": "Reply 1988 - Ssangmun-dong Alley", "ja": "応答せよ1988 - 双門洞路地", "zh-TW": "請回答1988 - 雙門洞巷弄", "th": "Reply 1988 - ซอย Ssangmun-dong"}',
  '{"ko": "덕선이네 골목! 추억의 1988년 분위기를 느낄 수 있는 쌍문동 골목입니다.", "en": "Deok-sun''s alley! Feel the nostalgic 1988 atmosphere in Ssangmun-dong.", "ja": "ドクソンの路地！懐かしの1988年の雰囲気を感じられる双門洞路地です。", "zh-TW": "德善的巷弄！感受1988年懷舊氛圍的雙門洞巷弄。", "th": "ซอยของ Deok-sun! สัมผัสบรรยากาศย้อนยุค 1988 ใน Ssangmun-dong"}',
  37.6521, 127.0331,
  '{"ko": "서울특별시 도봉구 쌍문동", "en": "Ssangmun-dong, Dobong-gu, Seoul", "ja": "ソウル特別市道峰区双門洞", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800',
  ARRAY['https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800'],
  ARRAY['Reply 1988', 'alley', 'nostalgic', 'retro', 'filming location'],
  '{"drama": "Reply 1988", "year": 2015, "cast": ["Lee Hyeri", "Park Bo-gum", "Ryu Jun-yeol"]}',
  4.8, 1654, 3012,
  TRUE, TRUE, TRUE
);

-- ==============================================================================
-- K-Beauty Experiences
-- ==============================================================================

INSERT INTO public.k_experiences (
  category, title, description, 
  location_lat, location_lng, address,
  cover_image, images, tags,
  related_content, rating, review_count, verification_count,
  is_featured, is_verified, is_active
) VALUES
-- 1. Olive Young Flagship - Myeongdong
(
  'kbeauty',
  '{"ko": "올리브영 명동 플래그십", "en": "Olive Young Myeongdong Flagship", "ja": "オリーブヤング明洞フラッグシップ", "zh-TW": "Olive Young明洞旗艦店", "th": "Olive Young สาขา Myeongdong"}',
  '{"ko": "한국 최대 규모의 K-뷰티 체험 매장입니다. 다양한 한국 화장품을 직접 테스트해보세요!", "en": "Korea''s largest K-Beauty experience store. Test various Korean cosmetics yourself!", "ja": "韓国最大規模のKビューティー体験ストアです。様々な韓国コスメを直接テストしてみてください！", "zh-TW": "韓國最大的K-Beauty體驗店。親自試用各種韓國化妝品！", "th": "ร้าน K-Beauty ที่ใหญ่ที่สุดของเกาหลี ทดสอบเครื่องสำอางเกาหลีหลากหลายด้วยตัวเอง!"}',
  37.5636, 126.9826,
  '{"ko": "서울특별시 중구 명동길 53", "en": "53 Myeongdong-gil, Jung-gu, Seoul", "ja": "ソウル特別市中区明洞ギル53", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
  ARRAY['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800'],
  ARRAY['Olive Young', 'cosmetics', 'skincare', 'Myeongdong', 'flagship'],
  '{"brands": ["Innisfree", "Etude", "Laneige", "Sulwhasoo"], "type": "flagship_store"}',
  4.7, 2341, 5678,
  TRUE, TRUE, TRUE
),
-- 2. Sulwhasoo Flagship - Gangnam
(
  'kbeauty',
  '{"ko": "설화수 강남 플래그십", "en": "Sulwhasoo Gangnam Flagship", "ja": "雪花秀江南フラッグシップ", "zh-TW": "雪花秀江南旗艦店", "th": "Sulwhasoo สาขา Gangnam"}',
  '{"ko": "아모레퍼시픽 럭셔리 브랜드 설화수의 플래그십 매장입니다. 한방 스파 체험도 가능합니다.", "en": "Flagship store of Amorepacific''s luxury brand Sulwhasoo. Herbal spa experiences available.", "ja": "アモーレパシフィックのラグジュアリーブランド雪花秀のフラッグシップストアです。韓方スパ体験も可能です。", "zh-TW": "愛茉莉太平洋旗下奢華品牌雪花秀旗艦店。可體驗韓方SPA。", "th": "ร้านเรือธงของแบรนด์หรู Sulwhasoo จาก Amorepacific สามารถใช้บริการสปาสมุนไพรได้"}',
  37.5023, 127.0251,
  '{"ko": "서울특별시 강남구 도산대로 45길 7", "en": "7 Dosan-daero 45-gil, Gangnam-gu, Seoul", "ja": "ソウル特別市江南区島山大路45ギル7", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
  ARRAY['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'],
  ARRAY['Sulwhasoo', 'luxury', 'spa', 'herbal', 'Gangnam'],
  '{"brand": "Sulwhasoo", "parent_company": "Amorepacific", "type": "flagship_spa"}',
  4.8, 876, 1543,
  TRUE, TRUE, TRUE
),
-- 3. Innisfree Jeju House
(
  'kbeauty',
  '{"ko": "이니스프리 제주하우스", "en": "Innisfree Jeju House", "ja": "イニスフリー済州ハウス", "zh-TW": "Innisfree濟州小屋", "th": "Innisfree Jeju House"}',
  '{"ko": "제주의 자연을 담은 이니스프리 체험 공간입니다. 제주 화산송이 마스크 만들기 체험을 할 수 있어요!", "en": "An Innisfree experience space filled with Jeju nature. You can make your own Jeju volcanic mask!", "ja": "済州の自然を詰め込んだイニスフリー体験空間です。済州火山送いマスク作り体験ができます！", "zh-TW": "充滿濟州自然的Innisfree體驗空間。可以製作自己的濟州火山面膜！", "th": "พื้นที่ประสบการณ์ Innisfree ที่เต็มไปด้วยธรรมชาติของเกาะเจจู สามารถทำมาสก์ภูเขาไฟเจจูได้!"}',
  33.3939, 126.2392,
  '{"ko": "제주특별자치도 서귀포시 안덕면 신화역사로 23", "en": "23 Sinhwa-yeoksa-ro, Andeok-myeon, Seogwipo-si, Jeju", "ja": "済州特別自治道西帰浦市安徳面神話歴史路23", "country": "KR", "city": "Jeju"}',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
  ARRAY['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800'],
  ARRAY['Innisfree', 'Jeju', 'DIY', 'mask', 'experience'],
  '{"brand": "Innisfree", "activities": ["mask_making", "cafe", "shop"]}',
  4.6, 1234, 2876,
  FALSE, TRUE, TRUE
),
-- 4. Amorepacific Headquarters
(
  'kbeauty',
  '{"ko": "아모레퍼시픽 본사", "en": "Amorepacific Headquarters", "ja": "アモーレパシフィック本社", "zh-TW": "愛茉莉太平洋總部", "th": "สำนักงานใหญ่ Amorepacific"}',
  '{"ko": "세계적인 건축가 데이비드 칩퍼필드가 설계한 아름다운 건물입니다. 1층 매장과 카페에서 K-뷰티를 체험하세요.", "en": "A beautiful building designed by world-renowned architect David Chipperfield. Experience K-Beauty at the ground floor store and cafe.", "ja": "世界的な建築家デイビッド・チッパーフィールドが設計した美しい建物です。1階の店舗とカフェでKビューティーを体験してください。", "zh-TW": "由世界知名建築師David Chipperfield設計的美麗建築。在一樓商店和咖啡廳體驗K-Beauty。", "th": "อาคารสวยงามออกแบบโดยสถาปนิกระดับโลก David Chipperfield สัมผัส K-Beauty ที่ร้านและคาเฟ่ชั้นล่าง"}',
  37.5323, 126.9713,
  '{"ko": "서울특별시 용산구 한강대로 100", "en": "100 Hangang-daero, Yongsan-gu, Seoul", "ja": "ソウル特別市龍山区漢江大路100", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  ARRAY['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
  ARRAY['Amorepacific', 'architecture', 'headquarters', 'design'],
  '{"company": "Amorepacific", "architect": "David Chipperfield"}',
  4.5, 654, 1234,
  FALSE, TRUE, TRUE
);

-- ==============================================================================
-- K-Food Experiences
-- ==============================================================================

INSERT INTO public.k_experiences (
  category, title, description, 
  location_lat, location_lng, address,
  cover_image, images, tags,
  related_content, rating, review_count, verification_count,
  is_featured, is_verified, is_active
) VALUES
-- 1. Gwangjang Market
(
  'kfood',
  '{"ko": "광장시장", "en": "Gwangjang Market", "ja": "広蔵市場", "zh-TW": "廣藏市場", "th": "ตลาด Gwangjang"}',
  '{"ko": "서울에서 가장 오래된 전통 시장! 빈대떡, 육회, 마약김밥 등 다양한 먹거리를 즐겨보세요.", "en": "Seoul''s oldest traditional market! Enjoy various foods like bindaetteok, yukhoe, and mayak gimbap.", "ja": "ソウルで最も古い伝統市場！ピンデトック、ユッケ、麻薬キンパなど様々な食べ物を楽しんでください。", "zh-TW": "首爾最古老的傳統市場！享用各種美食如綠豆煎餅、生牛肉和藥物飯卷。", "th": "ตลาดแบบดั้งเดิมที่เก่าแก่ที่สุดของโซล! เพลิดเพลินกับอาหารต่างๆ เช่น bindaetteok, yukhoe และ mayak gimbap"}',
  37.5701, 126.9998,
  '{"ko": "서울특별시 종로구 창경궁로 88", "en": "88 Changgyeonggung-ro, Jongno-gu, Seoul", "ja": "ソウル特別市鍾路区昌慶宮路88", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
  ARRAY['https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800'],
  ARRAY['market', 'traditional', 'street food', 'bindaetteok', 'yukhoe'],
  '{"type": "traditional_market", "famous_foods": ["bindaetteok", "yukhoe", "mayak_gimbap"]}',
  4.7, 3456, 7890,
  TRUE, TRUE, TRUE
),
-- 2. Myeongdong Kyoja
(
  'kfood',
  '{"ko": "명동교자", "en": "Myeongdong Kyoja", "ja": "明洞餃子", "zh-TW": "明洞餃子", "th": "Myeongdong Kyoja"}',
  '{"ko": "미슐랭 가이드에 소개된 칼국수 맛집입니다. 직접 만든 면과 진한 육수가 일품!", "en": "A kalguksu restaurant featured in the Michelin Guide. Handmade noodles and rich broth are exceptional!", "ja": "ミシュランガイドに掲載されたカルグクスの名店です。手作りの麺と濃厚なスープが絶品！", "zh-TW": "米其林指南推薦的刀削麵餐廳。手工麵條和濃郁湯頭絕品！", "th": "ร้าน kalguksu ที่ได้รับการแนะนำใน Michelin Guide เส้นทำมือและน้ำซุปเข้มข้นยอดเยี่ยม!"}',
  37.5641, 126.9853,
  '{"ko": "서울특별시 중구 명동 10길 29", "en": "29 Myeongdong 10-gil, Jung-gu, Seoul", "ja": "ソウル特別市中区明洞10ギル29", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800',
  ARRAY['https://images.unsplash.com/photo-1552611052-33e04de081de?w=800'],
  ARRAY['kalguksu', 'noodles', 'Michelin', 'Myeongdong', 'restaurant'],
  '{"type": "restaurant", "specialty": "kalguksu", "michelin": true}',
  4.6, 2345, 4567,
  TRUE, TRUE, TRUE
),
-- 3. Noryangjin Fish Market
(
  'kfood',
  '{"ko": "노량진 수산시장", "en": "Noryangjin Fish Market", "ja": "鷺梁津水産市場", "zh-TW": "鷺梁津水產市場", "th": "ตลาดปลา Noryangjin"}',
  '{"ko": "신선한 해산물을 직접 골라 바로 먹을 수 있는 수산시장입니다. 회와 해산물 요리를 저렴하게 즐기세요!", "en": "A fish market where you can pick fresh seafood and eat it right away. Enjoy sashimi and seafood dishes at affordable prices!", "ja": "新鮮な海産物を直接選んですぐに食べられる水産市場です。刺身と海鮮料理をお手頃価格で楽しんでください！", "zh-TW": "可以直接選購新鮮海鮮並立即享用的水產市場。以實惠的價格享用生魚片和海鮮料理！", "th": "ตลาดปลาที่คุณสามารถเลือกอาหารทะเลสดและกินได้ทันที เพลิดเพลินกับซาชิมิและอาหารทะเลในราคาย่อมเยา!"}',
  37.5136, 126.9420,
  '{"ko": "서울특별시 동작구 노량진로 674", "en": "674 Noryangjin-ro, Dongjak-gu, Seoul", "ja": "ソウル特別市銅雀区鷺梁津路674", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=800',
  ARRAY['https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=800'],
  ARRAY['fish market', 'seafood', 'sashimi', 'fresh', 'market'],
  '{"type": "fish_market", "activities": ["shopping", "dining"]}',
  4.5, 1987, 3456,
  FALSE, TRUE, TRUE
),
-- 4. Tongin Market - Dosirak Cafe
(
  'kfood',
  '{"ko": "통인시장 도시락 카페", "en": "Tongin Market Dosirak Cafe", "ja": "通仁市場弁当カフェ", "zh-TW": "通仁市場便當咖啡廳", "th": "ร้าน Dosirak Cafe ตลาด Tongin"}',
  '{"ko": "옛날 동전으로 시장 반찬을 구매해 나만의 도시락을 만드는 이색 체험! 서촌의 인기 명소입니다.", "en": "A unique experience of buying market side dishes with old coins to create your own dosirak! A popular spot in Seochon.", "ja": "昔の硬貨で市場のおかずを購入して自分だけの弁当を作るユニークな体験！西村の人気スポットです。", "zh-TW": "用舊硬幣購買市場小菜製作自己的便當的獨特體驗！西村的熱門景點。", "th": "ประสบการณ์พิเศษในการซื้อเครื่องเคียงตลาดด้วยเหรียญเก่าเพื่อสร้าง dosirak ของคุณเอง! จุดยอดนิยมใน Seochon"}',
  37.5791, 126.9711,
  '{"ko": "서울특별시 종로구 자하문로 15길 18", "en": "18 Jahamun-ro 15-gil, Jongno-gu, Seoul", "ja": "ソウル特別市鍾路区紫霞門路15ギル18", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=800',
  ARRAY['https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=800'],
  ARRAY['dosirak', 'lunch box', 'traditional market', 'Seochon', 'experience'],
  '{"type": "traditional_market", "activity": "dosirak_making"}',
  4.8, 1654, 2987,
  TRUE, TRUE, TRUE
);

-- ==============================================================================
-- K-Fashion Experiences
-- ==============================================================================

INSERT INTO public.k_experiences (
  category, title, description, 
  location_lat, location_lng, address,
  cover_image, images, tags,
  related_content, rating, review_count, verification_count,
  is_featured, is_verified, is_active
) VALUES
-- 1. Dongdaemun Design Plaza (DDP)
(
  'kfashion',
  '{"ko": "동대문 디자인 플라자 (DDP)", "en": "Dongdaemun Design Plaza (DDP)", "ja": "東大門デザインプラザ（DDP）", "zh-TW": "東大門設計廣場（DDP）", "th": "Dongdaemun Design Plaza (DDP)"}',
  '{"ko": "자하 하디드가 설계한 미래형 건축물! 패션쇼, 전시회, K-패션 브랜드 팝업이 열리는 핫플레이스입니다.", "en": "A futuristic building designed by Zaha Hadid! A hot spot for fashion shows, exhibitions, and K-fashion brand pop-ups.", "ja": "ザハ・ハディドが設計した未来型建築物！ファッションショー、展示会、Kファッションブランドポップアップが開かれるホットプレイスです。", "zh-TW": "扎哈·哈迪德設計的未來主義建築！時裝秀、展覽和K-Fashion品牌快閃店的熱門地點。", "th": "อาคารแห่งอนาคตออกแบบโดย Zaha Hadid! จุดฮอตสำหรับแฟชั่นโชว์ นิทรรศการ และป๊อปอัพแบรนด์ K-Fashion"}',
  37.5670, 127.0094,
  '{"ko": "서울특별시 중구 을지로 281", "en": "281 Eulji-ro, Jung-gu, Seoul", "ja": "ソウル特別市中区乙支路281", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800',
  ARRAY['https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800', 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800'],
  ARRAY['DDP', 'architecture', 'fashion show', 'exhibition', 'Dongdaemun'],
  '{"architect": "Zaha Hadid", "activities": ["exhibition", "fashion_show", "shopping"]}',
  4.7, 3210, 6543,
  TRUE, TRUE, TRUE
),
-- 2. Garosu-gil
(
  'kfashion',
  '{"ko": "가로수길", "en": "Garosu-gil", "ja": "カロスキル", "zh-TW": "林蔭道", "th": "Garosu-gil"}',
  '{"ko": "신사동 가로수길! 트렌디한 K-패션 브랜드 매장과 카페가 즐비한 패피들의 성지입니다.", "en": "Sinsa-dong Garosu-gil! A mecca for fashionistas lined with trendy K-fashion brand stores and cafes.", "ja": "新沙洞カロスキル！トレンディなKファッションブランドショップとカフェが立ち並ぶファッショニスタの聖地です。", "zh-TW": "新沙洞林蔭道！時尚達人的聖地，到處都是時尚K-Fashion品牌店和咖啡廳。", "th": "Sinsa-dong Garosu-gil! ศาสนสถานของแฟชั่นนิสต้าที่มีร้านแบรนด์ K-Fashion ทันสมัยและคาเฟ่เรียงราย"}',
  37.5206, 127.0230,
  '{"ko": "서울특별시 강남구 신사동 가로수길", "en": "Garosu-gil, Sinsa-dong, Gangnam-gu, Seoul", "ja": "ソウル特別市江南区新沙洞カロスキル", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
  ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
  ARRAY['Garosu-gil', 'fashion street', 'trendy', 'cafe', 'shopping'],
  '{"type": "fashion_street", "neighborhood": "Sinsa-dong"}',
  4.5, 2876, 5432,
  TRUE, TRUE, TRUE
),
-- 3. Hanbok Experience - Gyeongbokgung
(
  'kfashion',
  '{"ko": "경복궁 한복 체험", "en": "Hanbok Experience - Gyeongbokgung", "ja": "景福宮韓服体験", "zh-TW": "景福宮韓服體驗", "th": "ประสบการณ์ Hanbok - Gyeongbokgung"}',
  '{"ko": "한복을 입고 경복궁을 거닐어보세요! 한복 착용 시 경복궁 무료 입장 혜택이 있습니다.", "en": "Stroll through Gyeongbokgung Palace in hanbok! Free palace admission when wearing hanbok.", "ja": "韓服を着て景福宮を歩いてみてください！韓服着用時は景福宮無料入場の特典があります。", "zh-TW": "穿著韓服漫步景福宮！穿韓服可免費進入宮殿。", "th": "เดินเล่นในวัง Gyeongbokgung ในชุด Hanbok! เข้าชมวังฟรีเมื่อสวมชุด Hanbok"}',
  37.5796, 126.9770,
  '{"ko": "서울특별시 종로구 사직로 161", "en": "161 Sajik-ro, Jongno-gu, Seoul", "ja": "ソウル特別市鍾路区社稷路161", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=800',
  ARRAY['https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=800', 'https://images.unsplash.com/photo-1544736779-08492534e887?w=800'],
  ARRAY['hanbok', 'Gyeongbokgung', 'palace', 'traditional', 'experience'],
  '{"type": "hanbok_rental", "location": "Gyeongbokgung Palace"}',
  4.9, 4532, 8765,
  TRUE, TRUE, TRUE
),
-- 4. Hongdae Free Market
(
  'kfashion',
  '{"ko": "홍대 프리마켓", "en": "Hongdae Free Market", "ja": "弘大フリーマーケット", "zh-TW": "弘大自由市場", "th": "ตลาดนัด Hongdae"}',
  '{"ko": "매주 토요일 열리는 홍대 프리마켓! 신진 디자이너들의 핸드메이드 패션 아이템을 만나보세요.", "en": "Hongdae Free Market every Saturday! Discover handmade fashion items from emerging designers.", "ja": "毎週土曜日に開かれる弘大フリーマーケット！新進デザイナーのハンドメイドファッションアイテムに出会えます。", "zh-TW": "每週六舉辦的弘大自由市場！發現新銳設計師的手工時尚單品。", "th": "ตลาดนัด Hongdae ทุกวันเสาร์! ค้นพบแฟชั่นไอเท็มทำมือจากนักออกแบบหน้าใหม่"}',
  37.5512, 126.9234,
  '{"ko": "서울특별시 마포구 홍익로 3길 20", "en": "20 Hongik-ro 3-gil, Mapo-gu, Seoul", "ja": "ソウル特別市麻浦区弘益路3ギル20", "country": "KR", "city": "Seoul"}',
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800',
  ARRAY['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800'],
  ARRAY['Hongdae', 'free market', 'handmade', 'indie', 'weekend'],
  '{"type": "flea_market", "schedule": "Saturday", "neighborhood": "Hongdae"}',
  4.4, 1234, 2345,
  FALSE, TRUE, TRUE
);

-- ==============================================================================
-- Verify Seed Data
-- ==============================================================================
-- SELECT category, COUNT(*) as count FROM public.k_experiences GROUP BY category;
-- Expected: kpop: 5, kdrama: 5, kbeauty: 4, kfood: 4, kfashion: 4 = Total: 22
