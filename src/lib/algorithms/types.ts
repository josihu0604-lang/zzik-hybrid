/**
 * ZZIK Live - Type Definitions
 */

// ============================================================================
// SHOW HOST TYPES
// ============================================================================

export interface ShowHost {
  id: string;
  nickname: string;
  profileImage?: string;
  tier: ShowHostTier;
  categories: string[];
  skills: ShowHostSkills;
  performance: ShowHostPerformance;
  availability: HostAvailability;
  pricing: HostPricing;
  languages: string[];
  location?: string;
}

export type ShowHostTier = 'rookie' | 'rising' | 'pro' | 'star' | 'legend';

export interface ShowHostSkills {
  presentation: number; // 진행력 (0-100)
  productKnowledge: number; // 제품 설명력 (0-100)
  audienceInteraction: number; // 고객 소통력 (0-100)
  salesClosing: number; // 구매 유도력 (0-100)
  crisisManagement: number; // 돌발 상황 대처 (0-100)
}

export interface ShowHostPerformance {
  totalShows: number;
  totalSalesAmount: number; // 총 판매액
  avgSalesPerShow: number; // 회당 평균 판매액
  avgViewers: number; // 평균 시청자 수
  avgWatchTime: number; // 평균 시청 시간 (분)
  conversionRate: number; // 시청→구매 전환율 (0-1)
  returnViewerRate: number; // 재시청률 (0-1)
  cancelRate: number; // 쇼 취소율 (0-1)
  avgRating: number; // 평균 평점 (0-5)
  recentTrend: 'up' | 'stable' | 'down';
}

export interface HostAvailability {
  preferredDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  preferredHours: number[]; // 0-23
  blockedDates: string[]; // ISO date strings
  maxShowsPerWeek: number;
  currentBookings: number;
}

export interface HostPricing {
  baseFee: number; // 기본 출연료 (KRW)
  commissionRate: number; // 판매 수수료율 (0-1)
  minimumGuarantee?: number; // 최소 보장 금액
  travelFee?: number; // 이동비
  overtimeFee?: number; // 연장 시간당 추가료
}

// ============================================================================
// LIVE SHOW REQUEST TYPES
// ============================================================================

export interface LiveShowRequest {
  popupId: string;
  brandName: string;
  category: string;
  targetAudience: {
    ageGroups: Record<string, number>;
    genderRatio: { male: number; female: number };
    interests: string[];
  };
  products: ProductInfo[];
  budget: BudgetInfo;
  schedule: ScheduleInfo;
  venue: VenueInfo;
  priority: 'standard' | 'premium' | 'exclusive';
}

export interface ProductInfo {
  name: string;
  price: number;
  inventory: number;
  category: string;
  targetMargin: number;
}

export interface BudgetInfo {
  totalBudget: number;
  hostBudgetMax: number;
  expectedSales: number;
}

export interface ScheduleInfo {
  date: string;
  startTime: string;
  duration: number; // minutes
  flexibility: 'fixed' | 'flexible' | 'negotiable';
}

export interface VenueInfo {
  popupLocation: string;
  hasStudio: boolean;
  streamingEquipment: boolean;
  expectedFootTraffic: number;
}

// ============================================================================
// MATCHING RESULT TYPES
// ============================================================================

export interface HostMatchResult {
  hostId: string;
  hostName: string;
  matchScore: number;
  breakdown: {
    sales: number;
    engagement: number;
    expertise: number;
    reliability: number;
  };
  estimatedSales: number;
  estimatedRevenue: EstimatedRevenue;
  reasons: string[];
  availability: 'available' | 'limited' | 'busy';
}

export interface EstimatedRevenue {
  grossSales: number;
  hostFee: number;
  hostCommission: number;
  platformFee: number;
  brandNet: number;
  hostTotal: number;
}

// ============================================================================
// LICENSING TYPES
// ============================================================================

export interface LicensingDeal {
  brandId: string;
  hostId: string;
  dealType: 'one-time' | 'series' | 'exclusive';
  baseLicenseFee: number;
  performanceBonus: PerformanceBonus;
  duration: {
    startDate: string;
    endDate: string;
    showCount: number;
  };
  exclusivity?: ExclusivityTerms;
}

export interface PerformanceBonus {
  salesThreshold: number;
  bonusRate: number; // Additional % above threshold
  viewerBonus?: number; // Per 1000 viewers bonus
}

export interface ExclusivityTerms {
  categoryExclusive: boolean;
  competitorRestriction: string[];
  radius?: number; // km
}
