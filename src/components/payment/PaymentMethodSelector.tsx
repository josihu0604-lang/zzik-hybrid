'use client';

import { useState, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Zap,
  Check,
  Plus,
  ChevronRight,
  Shield,
  Globe,
  AlertCircle
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';

// ============================================
// Types & Interfaces
// ============================================

export type PaymentMethod = 
  | 'card'
  | 'z-pay'
  | 'kakao-pay'
  | 'naver-pay'
  | 'samsung-pay'
  | 'apple-pay'
  | 'google-pay'
  | 'bank-transfer'
  | 'paypal'
  | 'alipay'
  | 'wechat-pay';

export type Region = 'KR' | 'JP' | 'US' | 'EU' | 'CN' | 'TW' | 'TH' | 'SEA' | 'GLOBAL';

interface SavedCard {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'jcb';
  isDefault: boolean;
  expiryMonth: number;
  expiryYear: number;
}

interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  nameKo: string;
  nameJa: string;
  icon: React.ReactNode;
  color: string;
  regions: Region[];
  minAmount?: number;
  maxAmount?: number;
  fee?: number; // percentage
  recommended?: boolean;
}

interface PaymentMethodSelectorProps {
  region: Region;
  amount: number;
  currency: string;
  onSelect: (method: PaymentMethod, details?: Record<string, unknown>) => void;
  selectedMethod?: PaymentMethod;
  savedCards?: SavedCard[];
  zPayBalance?: number;
  showRecommended?: boolean;
  className?: string;
}

// ============================================
// Payment Method Configuration
// ============================================

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'z-pay',
    name: 'Z-Pay',
    nameKo: 'Z-Pay',
    nameJa: 'Z-Pay',
    icon: <Zap size={24} fill="currentColor" />,
    color: colors.flame[500],
    regions: ['KR', 'JP', 'US', 'EU', 'CN', 'TW', 'TH', 'SEA', 'GLOBAL'],
    recommended: true,
    fee: 0,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    nameKo: '신용/체크카드',
    nameJa: 'クレジット/デビットカード',
    icon: <CreditCard size={24} />,
    color: '#6366F1',
    regions: ['KR', 'JP', 'US', 'EU', 'CN', 'TW', 'TH', 'SEA', 'GLOBAL'],
    fee: 0,
  },
  {
    id: 'kakao-pay',
    name: 'Kakao Pay',
    nameKo: '카카오페이',
    nameJa: 'カカオペイ',
    icon: <Smartphone size={24} />,
    color: '#FEE500',
    regions: ['KR'],
    fee: 0,
  },
  {
    id: 'naver-pay',
    name: 'Naver Pay',
    nameKo: '네이버페이',
    nameJa: 'ネイバーペイ',
    icon: <Smartphone size={24} />,
    color: '#03C75A',
    regions: ['KR'],
    fee: 0,
  },
  {
    id: 'samsung-pay',
    name: 'Samsung Pay',
    nameKo: '삼성페이',
    nameJa: 'サムスンペイ',
    icon: <Smartphone size={24} />,
    color: '#1428A0',
    regions: ['KR', 'US', 'EU'],
    fee: 0,
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    nameKo: 'Apple Pay',
    nameJa: 'Apple Pay',
    icon: <Smartphone size={24} />,
    color: '#000000',
    regions: ['US', 'EU', 'JP', 'TW', 'SEA', 'GLOBAL'],
    fee: 0,
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    nameKo: 'Google Pay',
    nameJa: 'Google Pay',
    icon: <Smartphone size={24} />,
    color: '#4285F4',
    regions: ['US', 'EU', 'JP', 'TW', 'SEA', 'GLOBAL'],
    fee: 0,
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    nameKo: '계좌이체',
    nameJa: '銀行振込',
    icon: <Building2 size={24} />,
    color: '#059669',
    regions: ['KR', 'JP', 'EU'],
    minAmount: 10000,
    fee: 0,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameKo: 'PayPal',
    nameJa: 'PayPal',
    icon: <Globe size={24} />,
    color: '#0070BA',
    regions: ['US', 'EU', 'GLOBAL'],
    fee: 2.9,
  },
  {
    id: 'alipay',
    name: 'Alipay',
    nameKo: '알리페이',
    nameJa: 'アリペイ',
    icon: <Wallet size={24} />,
    color: '#1677FF',
    regions: ['CN'],
    fee: 0,
  },
  {
    id: 'wechat-pay',
    name: 'WeChat Pay',
    nameKo: '위챗페이',
    nameJa: 'WeChatペイ',
    icon: <Smartphone size={24} />,
    color: '#07C160',
    regions: ['CN'],
    fee: 0,
  },
];

// ============================================
// Sub-Components
// ============================================

// Card Brand Logo
function CardBrandLogo({ brand }: { brand: SavedCard['brand'] }) {
  const logoMap: Record<string, string> = {
    visa: '💳 Visa',
    mastercard: '💳 MC',
    amex: '💳 Amex',
    jcb: '💳 JCB',
  };
  return <span className="text-xs font-medium">{logoMap[brand] || '💳'}</span>;
}

// Saved Card Item
function SavedCardItem({ 
  card, 
  isSelected, 
  onSelect 
}: { 
  card: SavedCard; 
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <m.button
      onClick={onSelect}
      className="w-full p-4 rounded-xl flex items-center gap-3 text-left transition-all"
      style={{
        background: isSelected ? rgba.flame[500] + '20' : rgba.white[5],
        border: `1px solid ${isSelected ? colors.flame[500] : rgba.white[10]}`,
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div 
        className="w-12 h-8 rounded flex items-center justify-center"
        style={{ background: rgba.white[10] }}
      >
        <CardBrandLogo brand={card.brand} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">•••• {card.last4}</span>
          {card.isDefault && (
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: colors.flame[500], color: 'white' }}
            >
              Default
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: rgba.white[50] }}>
          Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear.toString().slice(-2)}
        </span>
      </div>
      {isSelected && (
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: colors.flame[500] }}
        >
          <Check size={14} color="white" strokeWidth={3} />
        </div>
      )}
    </m.button>
  );
}

// Z-Pay Balance Card
function ZPayBalanceCard({ 
  balance, 
  amount,
  isSelected,
  onSelect 
}: { 
  balance: number;
  amount: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { locale } = useLocale();
  const hasEnoughBalance = balance >= amount;

  return (
    <m.button
      onClick={onSelect}
      disabled={!hasEnoughBalance}
      className="w-full p-4 rounded-xl text-left transition-all disabled:opacity-50"
      style={{
        background: isSelected 
          ? `linear-gradient(135deg, ${rgba.flame[500]}30, ${rgba.flame[600]}20)`
          : rgba.white[5],
        border: `2px solid ${isSelected ? colors.flame[500] : hasEnoughBalance ? rgba.white[10] : colors.red[500] + '40'}`,
      }}
      whileHover={hasEnoughBalance ? { scale: 1.01 } : {}}
      whileTap={hasEnoughBalance ? { scale: 0.99 } : {}}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: gradients.flame }}
          >
            <Zap size={24} color="white" fill="white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg">Z-Pay</span>
              <span 
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: colors.green[500] + '20', color: colors.green[400] }}
              >
                {locale === 'ko' ? '수수료 무료' : 'No Fee'}
              </span>
            </div>
            <span style={{ color: rgba.white[60] }} className="text-sm">
              {locale === 'ko' ? '잔액' : 'Balance'}: ₩{balance.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          {isSelected ? (
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: colors.flame[500] }}
            >
              <Check size={18} color="white" strokeWidth={3} />
            </div>
          ) : !hasEnoughBalance ? (
            <div className="flex items-center gap-1 text-xs" style={{ color: colors.red[400] }}>
              <AlertCircle size={14} />
              <span>{locale === 'ko' ? '잔액 부족' : 'Insufficient'}</span>
            </div>
          ) : (
            <ChevronRight size={20} style={{ color: rgba.white[40] }} />
          )}
        </div>
      </div>

      {!hasEnoughBalance && (
        <div 
          className="mt-3 p-2 rounded-lg flex items-center justify-between text-sm"
          style={{ background: rgba.white[5] }}
        >
          <span style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '필요 금액' : 'Required'}: ₩{(amount - balance).toLocaleString()}
          </span>
          <button 
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: colors.flame[500], color: 'white' }}
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to charge page
              window.location.href = '/wallet/charge';
            }}
          >
            {locale === 'ko' ? '충전하기' : 'Top Up'}
          </button>
        </div>
      )}
    </m.button>
  );
}

// Payment Method Item
function PaymentMethodItem({ 
  method, 
  isSelected, 
  onSelect,
  locale
}: { 
  method: PaymentMethodConfig;
  isSelected: boolean;
  onSelect: () => void;
  locale: string;
}) {
  const name = locale === 'ko' ? method.nameKo : locale === 'ja' ? method.nameJa : method.name;
  
  return (
    <m.button
      onClick={onSelect}
      className="w-full p-4 rounded-xl flex items-center gap-3 text-left transition-all"
      style={{
        background: isSelected ? rgba.flame[500] + '15' : rgba.white[5],
        border: `1px solid ${isSelected ? colors.flame[500] : rgba.white[10]}`,
      }}
      whileHover={{ scale: 1.01, borderColor: rgba.white[30] }}
      whileTap={{ scale: 0.99 }}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: method.color + '20', color: method.color }}
      >
        {method.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{name}</span>
          {method.recommended && (
            <span 
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: colors.flame[500], color: 'white' }}
            >
              {locale === 'ko' ? '추천' : 'Recommended'}
            </span>
          )}
        </div>
        {method.fee !== undefined && method.fee > 0 && (
          <span className="text-xs" style={{ color: rgba.white[50] }}>
            +{method.fee}% fee
          </span>
        )}
      </div>
      {isSelected ? (
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: colors.flame[500] }}
        >
          <Check size={14} color="white" strokeWidth={3} />
        </div>
      ) : (
        <ChevronRight size={20} style={{ color: rgba.white[40] }} />
      )}
    </m.button>
  );
}

// ============================================
// Main Component
// ============================================

export function PaymentMethodSelector({
  region,
  amount,
  currency,
  onSelect,
  selectedMethod,
  savedCards = [],
  zPayBalance = 0,
  showRecommended = true,
  className = '',
}: PaymentMethodSelectorProps) {
  const { locale } = useLocale();
  const [showAllMethods, setShowAllMethods] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    savedCards.find(c => c.isDefault)?.id || null
  );

  // Filter methods by region
  const availableMethods = PAYMENT_METHODS.filter(method => 
    method.regions.includes(region) &&
    (!method.minAmount || amount >= method.minAmount) &&
    (!method.maxAmount || amount <= method.maxAmount)
  );

  // Sort: recommended first, then by name
  const sortedMethods = [...availableMethods].sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.name.localeCompare(b.name);
  });

  // Primary methods (first 4)
  const primaryMethods = sortedMethods.slice(0, 4);
  const otherMethods = sortedMethods.slice(4);

  const handleMethodSelect = useCallback((method: PaymentMethod, details?: Record<string, unknown>) => {
    onSelect(method, details);
  }, [onSelect]);

  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
    handleMethodSelect('card', { cardId });
  }, [handleMethodSelect]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-white text-lg">
          {locale === 'ko' ? '결제 수단' : locale === 'ja' ? '支払い方法' : 'Payment Method'}
        </h3>
        <div className="flex items-center gap-1 text-xs" style={{ color: rgba.white[50] }}>
          <Shield size={14} />
          <span>{locale === 'ko' ? '안전 결제' : 'Secure'}</span>
        </div>
      </div>

      {/* Z-Pay Section (Always First) */}
      <div className="space-y-2">
        <p className="text-xs font-medium px-1" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '추천 결제' : 'Recommended'}
        </p>
        <ZPayBalanceCard 
          balance={zPayBalance}
          amount={amount}
          isSelected={selectedMethod === 'z-pay'}
          onSelect={() => handleMethodSelect('z-pay')}
        />
      </div>

      {/* Saved Cards */}
      {savedCards.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium" style={{ color: rgba.white[60] }}>
              {locale === 'ko' ? '저장된 카드' : 'Saved Cards'}
            </p>
            <button 
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: colors.flame[500] }}
            >
              <Plus size={12} />
              {locale === 'ko' ? '카드 추가' : 'Add Card'}
            </button>
          </div>
          <div className="space-y-2">
            {savedCards.map(card => (
              <SavedCardItem
                key={card.id}
                card={card}
                isSelected={selectedMethod === 'card' && selectedCardId === card.id}
                onSelect={() => handleCardSelect(card.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Payment Methods */}
      <div className="space-y-2">
        <p className="text-xs font-medium px-1" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '다른 결제 수단' : 'Other Methods'}
        </p>
        <div className="space-y-2">
          {primaryMethods.filter(m => m.id !== 'z-pay').map(method => (
            <PaymentMethodItem
              key={method.id}
              method={method}
              isSelected={selectedMethod === method.id}
              onSelect={() => handleMethodSelect(method.id)}
              locale={locale}
            />
          ))}
        </div>

        {/* Show More */}
        {otherMethods.length > 0 && (
          <>
            <AnimatePresence>
              {showAllMethods && (
                <m.div
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {otherMethods.map(method => (
                    <PaymentMethodItem
                      key={method.id}
                      method={method}
                      isSelected={selectedMethod === method.id}
                      onSelect={() => handleMethodSelect(method.id)}
                      locale={locale}
                    />
                  ))}
                </m.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setShowAllMethods(!showAllMethods)}
              className="w-full py-3 text-sm font-medium rounded-xl transition-colors"
              style={{ 
                background: rgba.white[5], 
                color: colors.flame[500],
              }}
            >
              {showAllMethods 
                ? (locale === 'ko' ? '간략히 보기' : 'Show Less')
                : (locale === 'ko' ? `+${otherMethods.length}개 더 보기` : `+${otherMethods.length} More`)}
            </button>
          </>
        )}
      </div>

      {/* Amount Summary */}
      <div 
        className="p-4 rounded-xl mt-4"
        style={{ background: rgba.white[5], border: `1px solid ${rgba.white[10]}` }}
      >
        <div className="flex items-center justify-between">
          <span style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '결제 금액' : 'Total Amount'}
          </span>
          <span className="text-xl font-bold text-white">
            {currency === 'KRW' ? '₩' : '$'}{amount.toLocaleString()}
          </span>
        </div>
        {selectedMethod && (
          <m.div 
            className="mt-2 pt-2 border-t flex items-center gap-2"
            style={{ borderColor: rgba.white[10] }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Check size={14} style={{ color: colors.green[400] }} />
            <span className="text-sm" style={{ color: rgba.white[60] }}>
              {locale === 'ko' ? '결제 수단 선택됨' : 'Payment method selected'}
            </span>
          </m.div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Exports
// ============================================

export default PaymentMethodSelector;
