-- =============================================
-- K-Experience Table Migration
-- ZZIK Global Platform
-- Created: 2024-12-08
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- Main K-Experience table
CREATE TABLE IF NOT EXISTS k_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('kpop', 'kdrama', 'kbeauty', 'kfood', 'kfashion')),
  
  -- Multilingual content (JSONB)
  title JSONB NOT NULL DEFAULT '{}',
  description JSONB NOT NULL DEFAULT '{}',
  full_description JSONB DEFAULT '{}',
  
  -- Media
  thumbnail VARCHAR(500),
  images TEXT[] DEFAULT '{}',
  
  -- Location
  location_name JSONB DEFAULT '{}',
  address VARCHAR(500),
  coordinates POINT,
  
  -- Pricing
  currency VARCHAR(10) DEFAULT 'KRW',
  amount INTEGER NOT NULL,
  original_amount INTEGER,
  discount_percent INTEGER,
  
  -- Ratings
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  
  -- Tags and metadata
  tags TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  
  -- Status
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'archived')),
  
  -- Capacity
  available_slots INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT 20,
  
  -- Duration (JSONB for multilingual)
  duration JSONB DEFAULT '{}',
  
  -- Dates
  start_date DATE,
  end_date DATE,
  
  -- Host reference
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experience details (includes, excludes, schedule)
CREATE TABLE IF NOT EXISTS k_experience_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID REFERENCES k_experiences(id) ON DELETE CASCADE,
  
  -- Includes/Excludes (multilingual arrays)
  includes JSONB DEFAULT '{}',
  not_includes JSONB DEFAULT '{}',
  
  -- Schedule
  schedule JSONB DEFAULT '[]',
  
  -- Meeting point
  meeting_point JSONB DEFAULT '{}',
  
  -- FAQs
  faqs JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hosts table
CREATE TABLE IF NOT EXISTS k_experience_hosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  avatar VARCHAR(500),
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  description JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS k_experience_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID REFERENCES k_experiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  user_name VARCHAR(100),
  user_avatar VARCHAR(500),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS k_experience_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID REFERENCES k_experiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  booking_date DATE NOT NULL,
  booking_time VARCHAR(10),
  guests INTEGER DEFAULT 1,
  
  -- Pricing at time of booking
  currency VARCHAR(10),
  total_amount INTEGER,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Payment
  payment_intent_id VARCHAR(200),
  payment_status VARCHAR(20) DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_k_experiences_category ON k_experiences(category);
CREATE INDEX IF NOT EXISTS idx_k_experiences_status ON k_experiences(status);
CREATE INDEX IF NOT EXISTS idx_k_experiences_featured ON k_experiences(featured);
CREATE INDEX IF NOT EXISTS idx_k_experiences_rating ON k_experiences(rating DESC);
CREATE INDEX IF NOT EXISTS idx_k_experience_reviews_experience ON k_experience_reviews(experience_id);
CREATE INDEX IF NOT EXISTS idx_k_experience_bookings_user ON k_experience_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_k_experience_bookings_date ON k_experience_bookings(booking_date);

-- =============================================
-- 3. ROW LEVEL SECURITY
-- =============================================

ALTER TABLE k_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE k_experience_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE k_experience_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE k_experience_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE k_experience_bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for experiences
CREATE POLICY "Experiences are viewable by everyone" ON k_experiences
  FOR SELECT USING (status = 'active');

CREATE POLICY "Experience details are viewable by everyone" ON k_experience_details
  FOR SELECT USING (true);

CREATE POLICY "Hosts are viewable by everyone" ON k_experience_hosts
  FOR SELECT USING (true);

CREATE POLICY "Reviews are viewable by everyone" ON k_experience_reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON k_experience_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only view their own bookings
CREATE POLICY "Users can view own bookings" ON k_experience_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON k_experience_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_k_experiences_updated_at
  BEFORE UPDATE ON k_experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_k_experience_details_updated_at
  BEFORE UPDATE ON k_experience_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_k_experience_hosts_updated_at
  BEFORE UPDATE ON k_experience_hosts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_k_experience_reviews_updated_at
  BEFORE UPDATE ON k_experience_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_k_experience_bookings_updated_at
  BEFORE UPDATE ON k_experience_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. SEED DATA (25 Experiences)
-- =============================================

-- K-POP Experiences
INSERT INTO k_experiences (slug, category, title, description, thumbnail, images, location_name, address, currency, amount, original_amount, discount_percent, rating, review_count, tags, languages, verified, featured, available_slots, duration, start_date, end_date) VALUES
('bts-pilgrimage-premium-tour', 'kpop', 
 '{"ko": "BTS 성지순례 프리미엄 투어", "en": "BTS Pilgrimage Premium Tour", "ja": "BTS聖地巡礼プレミアムツアー"}',
 '{"ko": "BTS의 뮤직비디오 촬영지와 멤버들의 추천 맛집을 방문하는 프리미엄 투어", "en": "Premium tour visiting BTS music video filming locations and member-recommended restaurants", "ja": "BTSのミュージックビデオ撮影地とメンバーおすすめの飲食店を訪問するプレミアムツアー"}',
 'https://images.unsplash.com/photo-1619229666372-3c26c399a4cb?w=800',
 ARRAY['https://images.unsplash.com/photo-1619229666372-3c26c399a4cb?w=1200', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200'],
 '{"ko": "서울 용산구", "en": "Yongsan, Seoul", "ja": "ソウル龍山区"}',
 '서울특별시 용산구 한남대로 42길',
 'KRW', 89000, 120000, 26, 4.9, 1234, ARRAY['BTS', 'ARMY', '성지순례', 'HYBE'], ARRAY['ko', 'en', 'ja', 'zh'], true, true, 12, '{"ko": "4시간", "en": "4 hours", "ja": "4時間"}', '2024-01-01', '2025-12-31'),

('blackpink-mv-location-tour', 'kpop',
 '{"ko": "BLACKPINK 뮤직비디오 로케이션 투어", "en": "BLACKPINK Music Video Location Tour", "ja": "BLACKPINK MVロケーションツアー"}',
 '{"ko": "BLACKPINK의 아이코닉한 뮤직비디오 촬영지를 방문하는 특별 투어", "en": "Special tour visiting iconic BLACKPINK music video filming locations", "ja": "BLACKPINKの象徴的なMV撮影地を訪問する特別ツアー"}',
 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
 ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200'],
 '{"ko": "서울 성동구", "en": "Seongdong, Seoul", "ja": "ソウル城東区"}',
 '서울특별시 성동구 성수동',
 'KRW', 79000, 100000, 21, 4.8, 987, ARRAY['BLACKPINK', 'BLINK', 'MV', 'YG'], ARRAY['ko', 'en', 'ja'], true, true, 15, '{"ko": "3시간 30분", "en": "3.5 hours", "ja": "3時間30分"}', '2024-01-01', '2025-12-31'),

('kpop-dance-class-idol-choreography', 'kpop',
 '{"ko": "K-POP 댄스 클래스 (아이돌 안무)", "en": "K-POP Dance Class (Idol Choreography)", "ja": "K-POPダンスクラス（アイドル振付）"}',
 '{"ko": "현직 백업 댄서에게 배우는 인기 K-POP 아이돌 안무 클래스", "en": "Learn popular K-POP idol choreography from active backup dancers", "ja": "現役バックダンサーから学ぶ人気K-POPアイドル振付クラス"}',
 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
 ARRAY['https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=1200'],
 '{"ko": "서울 마포구 홍대", "en": "Hongdae, Mapo, Seoul", "ja": "ソウル麻浦区弘大"}',
 '서울특별시 마포구 와우산로 94',
 'KRW', 55000, NULL, NULL, 4.9, 2345, ARRAY['K-POP', '댄스', '안무', '홍대'], ARRAY['ko', 'en', 'ja', 'zh'], true, true, 20, '{"ko": "2시간", "en": "2 hours", "ja": "2時間"}', '2024-01-01', '2025-12-31'),

('sm-entertainment-artist-fan-tour', 'kpop',
 '{"ko": "SM엔터테인먼트 아티스트 팬투어", "en": "SM Entertainment Artist Fan Tour", "ja": "SMエンターテインメントアーティストファンツアー"}',
 '{"ko": "NCT, aespa, EXO 등 SM 아티스트 관련 명소 투어", "en": "Tour visiting SM artist related spots including NCT, aespa, EXO locations", "ja": "NCT、aespa、EXOなどSMアーティスト関連スポットツアー"}',
 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
 ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200'],
 '{"ko": "서울 강남구", "en": "Gangnam, Seoul", "ja": "ソウル江南区"}',
 '서울특별시 강남구 압구정로',
 'KRW', 75000, 95000, 21, 4.7, 876, ARRAY['SM', 'NCT', 'aespa', 'EXO', '강남'], ARRAY['ko', 'en', 'ja'], true, false, 16, '{"ko": "4시간", "en": "4 hours", "ja": "4時間"}', '2024-01-01', '2025-12-31'),

('kpop-recording-studio-experience', 'kpop',
 '{"ko": "K-POP 레코딩 스튜디오 체험", "en": "K-POP Recording Studio Experience", "ja": "K-POPレコーディングスタジオ体験"}',
 '{"ko": "실제 K-POP 아티스트들이 녹음하는 스튜디오에서 나만의 노래 녹음", "en": "Record your own song in a studio where actual K-POP artists record", "ja": "実際のK-POPアーティストが録音するスタジオで自分の歌を録音"}',
 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
 ARRAY['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200'],
 '{"ko": "서울 마포구", "en": "Mapo, Seoul", "ja": "ソウル麻浦区"}',
 '서울특별시 마포구 양화로',
 'KRW', 120000, 150000, 20, 4.8, 543, ARRAY['K-POP', '레코딩', '스튜디오', '녹음'], ARRAY['ko', 'en'], true, false, 4, '{"ko": "1시간 30분", "en": "1.5 hours", "ja": "1時間30分"}', '2024-01-01', '2025-12-31');

-- K-Drama Experiences
INSERT INTO k_experiences (slug, category, title, description, thumbnail, images, location_name, address, currency, amount, original_amount, discount_percent, rating, review_count, tags, languages, verified, featured, available_slots, duration, start_date, end_date) VALUES
('goblin-filming-location-gangneung-tour', 'kdrama',
 '{"ko": "도깨비 촬영지 강릉 투어", "en": "Goblin Filming Location Gangneung Tour", "ja": "トッケビ撮影地江陵ツアー"}',
 '{"ko": "드라마 도깨비의 로맨틱한 촬영 장소를 방문하는 감성 투어", "en": "Emotional tour visiting romantic filming locations from drama Goblin", "ja": "ドラマ「トッケビ」のロマンチックな撮影地を訪問する感性ツアー"}',
 'https://images.unsplash.com/photo-1596276020587-8044fe049813?w=800',
 ARRAY['https://images.unsplash.com/photo-1596276020587-8044fe049813?w=1200'],
 '{"ko": "강원도 강릉", "en": "Gangneung, Gangwon", "ja": "江原道江陵"}',
 '강원특별자치도 강릉시 주문진읍',
 'KRW', 95000, 130000, 27, 4.9, 1856, ARRAY['도깨비', 'Goblin', '강릉', '로맨스'], ARRAY['ko', 'en', 'ja', 'zh'], true, true, 20, '{"ko": "8시간", "en": "8 hours", "ja": "8時間"}', '2024-01-01', '2025-12-31'),

('crash-landing-on-you-dmz-tour', 'kdrama',
 '{"ko": "사랑의 불시착 DMZ 투어", "en": "Crash Landing on You DMZ Tour", "ja": "愛の不時着DMZツアー"}',
 '{"ko": "드라마 속 남북 국경 지역 촬영지를 방문하는 특별 투어", "en": "Special tour visiting the inter-Korean border filming locations from the drama", "ja": "ドラマの南北国境地域撮影地を訪問する特別ツアー"}',
 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800',
 ARRAY['https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200'],
 '{"ko": "경기도 파주 DMZ", "en": "DMZ, Paju, Gyeonggi", "ja": "京畿道坡州DMZ"}',
 '경기도 파주시 임진각로',
 'KRW', 85000, NULL, NULL, 4.8, 1234, ARRAY['사랑의불시착', 'CLOY', 'DMZ', '현빈', '손예진'], ARRAY['ko', 'en', 'ja'], true, true, 25, '{"ko": "6시간", "en": "6 hours", "ja": "6時間"}', '2024-01-01', '2025-12-31'),

('itaewon-class-seongsu-tour', 'kdrama',
 '{"ko": "이태원 클라쓰 성수동 투어", "en": "Itaewon Class Seongsu-dong Tour", "ja": "梨泰院クラス聖水洞ツアー"}',
 '{"ko": "드라마 이태원 클라쓰 촬영지와 성수동 힙플레이스 투어", "en": "Tour of Itaewon Class filming locations and Seongsu-dong hip places", "ja": "梨泰院クラス撮影地と聖水洞のヒップスポットツアー"}',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
 ARRAY['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'],
 '{"ko": "서울 성동구 성수동", "en": "Seongsu-dong, Seoul", "ja": "ソウル聖水洞"}',
 '서울특별시 성동구 성수동2가',
 'KRW', 45000, NULL, NULL, 4.6, 678, ARRAY['이태원클라쓰', '성수동', '박서준', '카페'], ARRAY['ko', 'en'], true, false, 15, '{"ko": "3시간", "en": "3 hours", "ja": "3時間"}', '2024-01-01', '2025-12-31'),

('the-glory-filming-location-tour', 'kdrama',
 '{"ko": "더 글로리 촬영지 투어", "en": "The Glory Filming Location Tour", "ja": "ザ・グローリー撮影地ツアー"}',
 '{"ko": "Netflix 화제작 더 글로리의 주요 촬영지를 방문하는 투어", "en": "Tour visiting major filming locations of Netflix hit The Glory", "ja": "Netflixヒット作「ザ・グローリー」の主要撮影地を訪問するツアー"}',
 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800',
 ARRAY['https://images.unsplash.com/photo-1568667256549-094345857637?w=1200'],
 '{"ko": "서울 송파구", "en": "Songpa, Seoul", "ja": "ソウル松坡区"}',
 '서울특별시 송파구',
 'KRW', 55000, 70000, 21, 4.7, 432, ARRAY['더글로리', 'TheGlory', 'Netflix', '송혜교'], ARRAY['ko', 'en', 'ja'], true, false, 12, '{"ko": "4시간", "en": "4 hours", "ja": "4時間"}', '2024-01-01', '2025-12-31'),

('queen-of-tears-jeju-tour', 'kdrama',
 '{"ko": "눈물의 여왕 제주도 투어", "en": "Queen of Tears Jeju Island Tour", "ja": "涙の女王済州島ツアー"}',
 '{"ko": "2024 최고 화제작 눈물의 여왕 제주도 촬영지 투어", "en": "2024 hit drama Queen of Tears Jeju Island filming location tour", "ja": "2024年最高の話題作「涙の女王」済州島撮影地ツアー"}',
 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
 ARRAY['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200'],
 '{"ko": "제주특별자치도", "en": "Jeju Island", "ja": "済州島"}',
 '제주특별자치도 서귀포시',
 'KRW', 150000, 200000, 25, 4.9, 567, ARRAY['눈물의여왕', 'QueenOfTears', '제주도', '김수현', '김지원'], ARRAY['ko', 'en', 'ja', 'zh'], true, true, 10, '{"ko": "10시간", "en": "10 hours", "ja": "10時間"}', '2024-01-01', '2025-12-31');

-- K-Beauty Experiences
INSERT INTO k_experiences (slug, category, title, description, thumbnail, images, location_name, address, currency, amount, original_amount, discount_percent, rating, review_count, tags, languages, verified, featured, available_slots, duration, start_date, end_date) VALUES
('gangnam-kbeauty-makeup-masterclass', 'kbeauty',
 '{"ko": "강남 K-뷰티 메이크업 마스터클래스", "en": "Gangnam K-Beauty Makeup Masterclass", "ja": "江南K-ビューティーメイクアップマスタークラス"}',
 '{"ko": "전문 메이크업 아티스트에게 배우는 K-뷰티 메이크업의 모든 것", "en": "Learn everything about K-Beauty makeup from professional makeup artists", "ja": "プロのメイクアップアーティストからK-ビューティーメイクの全てを学ぶ"}',
 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
 ARRAY['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200'],
 '{"ko": "서울 강남구 신사동", "en": "Sinsa-dong, Gangnam, Seoul", "ja": "ソウル江南区新沙洞"}',
 '서울특별시 강남구 압구정로 10길',
 'KRW', 150000, 200000, 25, 4.9, 1423, ARRAY['K-뷰티', '메이크업', '강남', '마스터클래스'], ARRAY['ko', 'en', 'ja', 'zh'], true, true, 8, '{"ko": "3시간", "en": "3 hours", "ja": "3時間"}', '2024-01-01', '2025-12-31'),

('myeongdong-kbeauty-shopping-tour', 'kbeauty',
 '{"ko": "명동 K-뷰티 쇼핑 & 스킨케어 투어", "en": "Myeongdong K-Beauty Shopping & Skincare Tour", "ja": "明洞K-ビューティーショッピング＆スキンケアツアー"}',
 '{"ko": "K-뷰티 전문가와 함께하는 명동 화장품 쇼핑 가이드 투어", "en": "Myeongdong cosmetics shopping guide tour with K-Beauty expert", "ja": "K-ビューティー専門家と一緒の明洞コスメショッピングガイドツアー"}',
 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800',
 ARRAY['https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=1200'],
 '{"ko": "서울 중구 명동", "en": "Myeongdong, Jung-gu, Seoul", "ja": "ソウル中区明洞"}',
 '서울특별시 중구 명동길',
 'KRW', 45000, NULL, NULL, 4.7, 2134, ARRAY['K-뷰티', '명동', '쇼핑', '스킨케어'], ARRAY['ko', 'en', 'ja', 'zh'], true, false, 12, '{"ko": "2시간 30분", "en": "2.5 hours", "ja": "2時間30分"}', '2024-01-01', '2025-12-31'),

('korean-herbal-spa-skincare', 'kbeauty',
 '{"ko": "한방 스파 & 피부 관리 체험", "en": "Korean Herbal Spa & Skincare Experience", "ja": "韓方スパ＆スキンケア体験"}',
 '{"ko": "전통 한방 재료를 사용한 프리미엄 스파 & 피부 관리", "en": "Premium spa & skincare using traditional Korean herbal ingredients", "ja": "伝統韓方材料を使用したプレミアムスパ＆スキンケア"}',
 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
 ARRAY['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200'],
 '{"ko": "서울 종로구 북촌", "en": "Bukchon, Jongno, Seoul", "ja": "ソウル鍾路区北村"}',
 '서울특별시 종로구 북촌로',
 'KRW', 180000, 250000, 28, 4.9, 876, ARRAY['한방', '스파', '피부관리', '북촌'], ARRAY['ko', 'en', 'ja'], true, true, 6, '{"ko": "2시간", "en": "2 hours", "ja": "2時間"}', '2024-01-01', '2025-12-31'),

('olive-young-vip-shopping', 'kbeauty',
 '{"ko": "올리브영 VIP 쇼핑 체험", "en": "Olive Young VIP Shopping Experience", "ja": "オリーブヤングVIPショッピング体験"}',
 '{"ko": "올리브영 뷰티 전문가와 함께하는 맞춤형 쇼핑 체험", "en": "Customized shopping experience with Olive Young beauty expert", "ja": "オリーブヤングビューティー専門家とのカスタマイズショッピング体験"}',
 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
 ARRAY['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1200'],
 '{"ko": "서울 강남구", "en": "Gangnam, Seoul", "ja": "ソウル江南区"}',
 '서울특별시 강남구 강남대로',
 'KRW', 35000, NULL, NULL, 4.6, 1567, ARRAY['올리브영', 'K-뷰티', '쇼핑', '강남'], ARRAY['ko', 'en', 'ja', 'zh'], true, false, 10, '{"ko": "1시간 30분", "en": "1.5 hours", "ja": "1時間30分"}', '2024-01-01', '2025-12-31'),

('kbeauty-brand-factory-tour', 'kbeauty',
 '{"ko": "K-뷰티 브랜드 공장 견학", "en": "K-Beauty Brand Factory Tour", "ja": "K-ビューティーブランド工場見学"}',
 '{"ko": "유명 K-뷰티 브랜드의 생산 공장을 직접 견학하는 특별 투어", "en": "Special tour visiting production facilities of famous K-Beauty brands", "ja": "有名K-ビューティーブランドの生産工場を直接見学する特別ツアー"}',
 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800',
 ARRAY['https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=1200'],
 '{"ko": "경기도 오산", "en": "Osan, Gyeonggi", "ja": "京畿道烏山"}',
 '경기도 오산시',
 'KRW', 65000, 80000, 19, 4.7, 234, ARRAY['K-뷰티', '공장견학', '화장품'], ARRAY['ko', 'en'], true, false, 20, '{"ko": "4시간", "en": "4 hours", "ja": "4時間"}', '2024-01-01', '2025-12-31');

-- K-Food Experiences
INSERT INTO k_experiences (slug, category, title, description, thumbnail, images, location_name, address, currency, amount, original_amount, discount_percent, rating, review_count, tags, languages, verified, featured, available_slots, duration, start_date, end_date) VALUES
('traditional-korean-cooking-class', 'kfood',
 '{"ko": "전통 한식 쿠킹클래스 (비빔밥 & 김치)", "en": "Traditional Korean Cooking Class (Bibimbap & Kimchi)", "ja": "伝統韓国料理クッキングクラス（ビビンバ＆キムチ）"}',
 '{"ko": "비빔밥, 김치 등 정통 한식을 배우는 프리미엄 요리 클래스", "en": "Premium cooking class to learn authentic Korean dishes like bibimbap and kimchi", "ja": "ビビンバ、キムチなど本格韓国料理を学ぶプレミアムクッキングクラス"}',
 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
 ARRAY['https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1200'],
 '{"ko": "서울 종로구 인사동", "en": "Insadong, Jongno, Seoul", "ja": "ソウル鍾路区仁寺洞"}',
 '서울특별시 종로구 인사동길',
 'KRW', 75000, NULL, NULL, 4.9, 3456, ARRAY['한식', '쿠킹클래스', '비빔밥', '김치', '인사동'], ARRAY['ko', 'en', 'ja', 'zh'], true, true, 12, '{"ko": "2시간 30분", "en": "2.5 hours", "ja": "2時間30分"}', '2024-01-01', '2025-12-31'),

('gwangjang-market-food-tour', 'kfood',
 '{"ko": "광장시장 먹거리 투어", "en": "Gwangjang Market Food Tour", "ja": "広蔵市場グルメツアー"}',
 '{"ko": "서울 최고의 전통 시장에서 다양한 길거리 음식을 맛보는 투어", "en": "Tour tasting various street foods at Seoul''s best traditional market", "ja": "ソウル最高の伝統市場で様々な屋台料理を味わうツアー"}',
 'https://images.unsplash.com/photo-1583224994076-0de5e5de7cb8?w=800',
 ARRAY['https://images.unsplash.com/photo-1583224994076-0de5e5de7cb8?w=1200'],
 '{"ko": "서울 종로구 광장시장", "en": "Gwangjang Market, Jongno, Seoul", "ja": "ソウル鍾路区広蔵市場"}',
 '서울특별시 종로구 종로 88',
 'KRW', 55000, NULL, NULL, 4.8, 2876, ARRAY['광장시장', '먹거리투어', '빈대떡', '마약김밥'], ARRAY['ko', 'en', 'ja', 'zh'], true, true, 15, '{"ko": "2시간", "en": "2 hours", "ja": "2時間"}', '2024-01-01', '2025-12-31'),

('jeonju-bibimbap-hanok-tour', 'kfood',
 '{"ko": "전주 비빔밥 & 한옥마을 투어", "en": "Jeonju Bibimbap & Hanok Village Tour", "ja": "全州ビビンバ＆韓屋村ツアー"}',
 '{"ko": "비빔밥의 본고장 전주에서 즐기는 미식 여행", "en": "Culinary trip enjoying authentic bibimbap in Jeonju, the home of bibimbap", "ja": "ビビンバの本場全州で楽しむグルメ旅行"}',
 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800',
 ARRAY['https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=1200'],
 '{"ko": "전라북도 전주", "en": "Jeonju, Jeonbuk", "ja": "全羅北道全州"}',
 '전라북도 전주시 완산구 한옥마을',
 'KRW', 120000, 150000, 20, 4.9, 1234, ARRAY['전주', '비빔밥', '한옥마을', '맛집'], ARRAY['ko', 'en', 'ja'], true, false, 20, '{"ko": "10시간", "en": "10 hours", "ja": "10時間"}', '2024-01-01', '2025-12-31'),

('makgeolli-brewery-tour-tasting', 'kfood',
 '{"ko": "막걸리 양조장 투어 & 시음", "en": "Makgeolli Brewery Tour & Tasting", "ja": "マッコリ醸造所ツアー＆試飲"}',
 '{"ko": "전통 막걸리 양조 과정을 배우고 다양한 막걸리를 시음하는 체험", "en": "Experience learning traditional makgeolli brewing and tasting various makgeolli", "ja": "伝統マッコリ醸造過程を学び、様々なマッコリを試飲する体験"}',
 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
 ARRAY['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200'],
 '{"ko": "경기도 포천", "en": "Pocheon, Gyeonggi", "ja": "京畿道抱川"}',
 '경기도 포천시 이동면',
 'KRW', 65000, NULL, NULL, 4.7, 567, ARRAY['막걸리', '양조장', '전통주', '시음'], ARRAY['ko', 'en'], true, false, 25, '{"ko": "4시간", "en": "4 hours", "ja": "4時間"}', '2024-01-01', '2025-12-31'),

('itaewon-fusion-korean-food-tour', 'kfood',
 '{"ko": "이태원 글로벌 퓨전 한식 투어", "en": "Itaewon Global Fusion Korean Food Tour", "ja": "梨泰院グローバルフュージョン韓食ツアー"}',
 '{"ko": "이태원의 트렌디한 퓨전 한식 레스토랑을 탐방하는 미식 투어", "en": "Culinary tour exploring trendy fusion Korean restaurants in Itaewon", "ja": "梨泰院のトレンディなフュージョン韓食レストランを探訪するグルメツアー"}',
 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800',
 ARRAY['https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1200'],
 '{"ko": "서울 용산구 이태원", "en": "Itaewon, Yongsan, Seoul", "ja": "ソウル龍山区梨泰院"}',
 '서울특별시 용산구 이태원로',
 'KRW', 85000, 100000, 15, 4.6, 432, ARRAY['이태원', '퓨전한식', '미식투어', '트렌디'], ARRAY['ko', 'en', 'ja'], true, false, 10, '{"ko": "3시간", "en": "3 hours", "ja": "3時間"}', '2024-01-01', '2025-12-31');

-- K-Fashion Experiences
INSERT INTO k_experiences (slug, category, title, description, thumbnail, images, location_name, address, currency, amount, original_amount, discount_percent, rating, review_count, tags, languages, verified, featured, available_slots, duration, start_date, end_date) VALUES
('premium-hanbok-gyeongbokgung-tour', 'kfashion',
 '{"ko": "프리미엄 한복 체험 & 경복궁 투어", "en": "Premium Hanbok Experience & Gyeongbokgung Tour", "ja": "プレミアム韓服体験＆景福宮ツアー"}',
 '{"ko": "최고급 한복을 입고 경복궁을 자유롭게 관람하는 프리미엄 체험", "en": "Premium experience wearing finest hanbok while freely touring Gyeongbokgung Palace", "ja": "最高級韓服を着て景福宮を自由に見学するプレミアム体験"}',
 'https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=800',
 ARRAY['https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=1200'],
 '{"ko": "서울 종로구 경복궁", "en": "Gyeongbokgung, Jongno, Seoul", "ja": "ソウル鍾路区景福宮"}',
 '서울특별시 종로구 사직로 161',
 'KRW', 65000, 85000, 24, 4.8, 4567, ARRAY['한복', '경복궁', '전통', '포토존'], ARRAY['ko', 'en', 'ja', 'zh'], true, true, 50, '{"ko": "4시간", "en": "4 hours", "ja": "4時間"}', '2024-01-01', '2025-12-31'),

('dongdaemun-kfashion-shopping-tour', 'kfashion',
 '{"ko": "동대문 K-패션 쇼핑 투어", "en": "Dongdaemun K-Fashion Shopping Tour", "ja": "東大門K-ファッションショッピングツアー"}',
 '{"ko": "패션 전문가와 함께하는 동대문 쇼핑몰 심층 투어", "en": "In-depth Dongdaemun shopping mall tour with fashion expert", "ja": "ファッション専門家と一緒の東大門ショッピングモール深層ツアー"}',
 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
 ARRAY['https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200'],
 '{"ko": "서울 중구 동대문", "en": "Dongdaemun, Jung-gu, Seoul", "ja": "ソウル中区東大門"}',
 '서울특별시 중구 을지로6가',
 'KRW', 45000, NULL, NULL, 4.6, 1234, ARRAY['동대문', 'K-패션', '쇼핑', '야시장'], ARRAY['ko', 'en', 'ja', 'zh'], true, false, 12, '{"ko": "3시간", "en": "3 hours", "ja": "3時間"}', '2024-01-01', '2025-12-31'),

('hongdae-street-fashion-photo-tour', 'kfashion',
 '{"ko": "홍대 스트릿 패션 포토 투어", "en": "Hongdae Street Fashion Photo Tour", "ja": "弘大ストリートファッションフォトツアー"}',
 '{"ko": "홍대의 트렌디한 거리에서 K-패션 스타일 사진 촬영", "en": "K-fashion style photoshoot on trendy streets of Hongdae", "ja": "弘大のトレンディな街でK-ファッションスタイル写真撮影"}',
 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800',
 ARRAY['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200'],
 '{"ko": "서울 마포구 홍대", "en": "Hongdae, Mapo, Seoul", "ja": "ソウル麻浦区弘大"}',
 '서울특별시 마포구 홍대입구',
 'KRW', 120000, 150000, 20, 4.8, 876, ARRAY['홍대', '패션', '포토', '스트릿'], ARRAY['ko', 'en', 'ja'], true, true, 8, '{"ko": "2시간", "en": "2 hours", "ja": "2時間"}', '2024-01-01', '2025-12-31'),

('apgujeong-rodeo-kbrand-tour', 'kfashion',
 '{"ko": "압구정 로데오 K-브랜드 투어", "en": "Apgujeong Rodeo K-Brand Tour", "ja": "狎鷗亭ロデオK-ブランドツアー"}',
 '{"ko": "한국 디자이너 브랜드와 럭셔리 K-패션의 중심지 투어", "en": "Tour of Korean designer brands and luxury K-fashion hub", "ja": "韓国デザイナーブランドとラグジュアリーK-ファッションの中心地ツアー"}',
 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
 ARRAY['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200'],
 '{"ko": "서울 강남구 압구정", "en": "Apgujeong, Gangnam, Seoul", "ja": "ソウル江南区狎鷗亭"}',
 '서울특별시 강남구 압구정로',
 'KRW', 55000, NULL, NULL, 4.5, 345, ARRAY['압구정', 'K-브랜드', '럭셔리', '디자이너'], ARRAY['ko', 'en'], true, false, 10, '{"ko": "2시간 30분", "en": "2.5 hours", "ja": "2時間30分"}', '2024-01-01', '2025-12-31'),

('seongsu-hipster-fashion-cafe-tour', 'kfashion',
 '{"ko": "성수동 힙스터 패션 & 카페 투어", "en": "Seongsu-dong Hipster Fashion & Cafe Tour", "ja": "聖水洞ヒップスターファッション＆カフェツアー"}',
 '{"ko": "서울의 브루클린, 성수동의 트렌디한 패션과 카페 문화 체험", "en": "Experience trendy fashion and cafe culture in Seoul''s Brooklyn, Seongsu-dong", "ja": "ソウルのブルックリン、聖水洞のトレンディなファッションとカフェ文化体験"}',
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
 ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200'],
 '{"ko": "서울 성동구 성수동", "en": "Seongsu-dong, Seongdong, Seoul", "ja": "ソウル城東区聖水洞"}',
 '서울특별시 성동구 성수동2가',
 'KRW', 48000, NULL, NULL, 4.7, 567, ARRAY['성수동', '힙스터', '카페', '패션'], ARRAY['ko', 'en', 'ja'], true, false, 12, '{"ko": "3시간", "en": "3 hours", "ja": "3時間"}', '2024-01-01', '2025-12-31');

-- =============================================
-- 6. VERIFICATION
-- =============================================

-- Verify data was inserted
DO $$
DECLARE
  exp_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exp_count FROM k_experiences;
  RAISE NOTICE 'Total K-Experiences created: %', exp_count;
END $$;
