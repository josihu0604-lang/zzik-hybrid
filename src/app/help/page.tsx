'use client';

import { useState } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  FileText,
  HelpCircle,
  Phone,
  Clock,
  ExternalLink,
  Send,
  CheckCircle,
  AlertCircle,
  MapPin,
  Ticket,
  Users,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { colors, radii, liquidGlass, gradients } from '@/lib/design-tokens';
import { FAQJsonLd } from '@/components/seo/JsonLd';

/**
 * Help & Support Page - 고객 지원
 *
 * Features:
 * - FAQ 아코디언
 * - 카테고리별 도움말
 * - 1:1 문의 폼
 * - 연락처 정보
 */

// ============================================================================
// TYPES
// ============================================================================

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportCategory {
  id: string;
  icon: typeof HelpCircle;
  label: string;
  color: string;
}

// ============================================================================
// DATA
// ============================================================================

const SUPPORT_CATEGORIES: SupportCategory[] = [
  { id: 'account', icon: Users, label: '계정', color: colors.flame[500] },
  { id: 'popup', icon: MapPin, label: '팝업', color: colors.spark[500] },
  { id: 'checkin', icon: Ticket, label: '체크인', color: colors.info },
  { id: 'payment', icon: FileText, label: '결제', color: colors.success },
];

const FAQS: FAQ[] = [
  // 계정
  {
    id: '1',
    category: 'account',
    question: '회원가입은 어떻게 하나요?',
    answer:
      '카카오톡, 구글, 애플 계정으로 간편하게 가입할 수 있습니다. 앱 첫 화면에서 원하시는 소셜 로그인을 선택하시면 됩니다.',
  },
  {
    id: '2',
    category: 'account',
    question: '비밀번호를 잊어버렸어요',
    answer:
      'ZZIK은 소셜 로그인만 지원하므로 별도의 비밀번호가 없습니다. 연동된 소셜 계정(카카오, 구글, 애플)으로 로그인하시면 됩니다.',
  },
  {
    id: '3',
    category: 'account',
    question: '계정을 삭제하고 싶어요',
    answer:
      '설정 > 계정 > 계정 삭제에서 계정을 삭제할 수 있습니다. 삭제 요청 후 30일 이내에 다시 로그인하면 복구됩니다.',
  },

  // 팝업
  {
    id: '4',
    category: 'popup',
    question: '팝업에 어떻게 참여하나요?',
    answer:
      '관심있는 팝업을 찾아 "참여하기" 버튼을 누르면 됩니다. 목표 인원이 달성되면 팝업이 열리고, 알림을 받으실 수 있습니다.',
  },
  {
    id: '5',
    category: 'popup',
    question: '참여 취소는 가능한가요?',
    answer:
      '팝업이 오픈 확정되기 전까지 자유롭게 참여를 취소할 수 있습니다. 마이페이지에서 참여 중인 팝업을 확인하고 취소하세요.',
  },
  {
    id: '6',
    category: 'popup',
    question: '팝업 오픈이 취소되면 어떻게 되나요?',
    answer:
      '마감 기한 내 목표 인원이 달성되지 않으면 팝업은 자동으로 취소됩니다. 별도의 결제가 발생하지 않으므로 걱정하지 않으셔도 됩니다.',
  },

  // 체크인
  {
    id: '7',
    category: 'checkin',
    question: '체크인은 어떻게 하나요?',
    answer:
      '팝업 현장에서 GPS와 QR코드를 통해 체크인할 수 있습니다. 마이페이지에서 "체크인" 버튼을 누르고 현장의 QR코드를 스캔하세요.',
  },
  {
    id: '8',
    category: 'checkin',
    question: 'GPS가 인식되지 않아요',
    answer:
      '위치 서비스가 켜져 있는지 확인해주세요. 실내에서는 GPS가 부정확할 수 있으므로, QR코드 스캔으로 체크인을 완료할 수 있습니다.',
  },
  {
    id: '9',
    category: 'checkin',
    question: '체크인 배지는 뭔가요?',
    answer:
      '팝업에 성공적으로 체크인하면 "찍음" 배지가 부여됩니다. 배지를 많이 모을수록 특별한 혜택을 받을 수 있습니다.',
  },

  // 결제
  {
    id: '10',
    category: 'payment',
    question: '결제는 언제 되나요?',
    answer:
      'ZZIK은 현재 참여 자체는 무료입니다. 팝업 현장에서 별도로 결제가 필요한 경우 해당 브랜드의 안내를 따라주세요.',
  },
  {
    id: '11',
    category: 'payment',
    question: '리더오퍼 수익은 어떻게 정산되나요?',
    answer:
      '리더 대시보드에서 수익을 확인할 수 있습니다. 월별로 정산되며, 등록된 계좌로 입금됩니다.',
  },
];

// ============================================================================
// STYLES
// ============================================================================

const GLASS_CARD_STYLE = {
  ...liquidGlass.standard,
  borderRadius: radii.xl,
} as const;

// ============================================================================
// COMPONENTS
// ============================================================================

function FAQItem({ faq }: { faq: FAQ }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
      <m.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-4 flex items-start justify-between text-left"
        whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
      >
        <div className="flex items-start gap-3">
          <HelpCircle
            size={18}
            className="mt-0.5 flex-shrink-0"
            style={{ color: colors.flame[500] }}
          />
          <p className="font-medium pr-4" style={{ color: colors.text.primary }}>
            {faq.question}
          </p>
        </div>
        {isOpen ? (
          <ChevronUp size={20} style={{ color: colors.text.tertiary }} />
        ) : (
          <ChevronDown size={20} style={{ color: colors.text.tertiary }} />
        )}
      </m.button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-11">
              <p className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>
                {faq.answer}
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-8 text-center"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34, 197, 94, 0.15)' }}
        >
          <CheckCircle size={32} style={{ color: colors.success }} />
        </div>
        <h4 className="font-bold text-lg mb-2" style={{ color: colors.text.primary }}>
          문의가 접수되었습니다
        </h4>
        <p className="text-sm" style={{ color: colors.text.secondary }}>
          영업일 기준 1-2일 내에 답변 드리겠습니다
        </p>
      </m.div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
          제목
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="문의 제목을 입력하세요"
          className="w-full p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${colors.border.default}`,
            color: colors.text.primary,
            outline: 'none',
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
          내용
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="문의 내용을 자세히 적어주세요"
          rows={5}
          className="w-full p-4 rounded-xl resize-none"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${colors.border.default}`,
            color: colors.text.primary,
            outline: 'none',
          }}
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleSubmit}
        disabled={!subject || !message}
        loading={isSubmitting}
        leftIcon={<Send size={18} />}
      >
        문의하기
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HelpPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');

  const filteredFAQs = selectedCategory
    ? FAQS.filter((faq) => faq.category === selectedCategory)
    : FAQS;

  return (
    <div className="min-h-screen pb-8" style={{ background: colors.space[950] }}>
      {/* FAQ JSON-LD for SEO */}
      <FAQJsonLd
        items={FAQS.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))}
      />

      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 py-4"
        style={{
          background: 'rgba(8, 9, 10, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center gap-4">
          <IconButton
            icon={<ChevronLeft size={24} style={{ color: colors.text.primary }} />}
            onClick={() => router.back()}
            aria-label="뒤로 가기"
          />
          <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
            고객 지원
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Quick Contact */}
        <div
          className="p-4 rounded-xl flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, rgba(255, 107, 91, 0.15) 0%, rgba(255, 217, 61, 0.1) 100%)`,
            border: `1px solid ${colors.flame[500]}30`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255, 107, 91, 0.2)' }}
            >
              <MessageCircle size={20} style={{ color: colors.flame[500] }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: colors.text.primary }}>
                카카오톡 문의
              </p>
              <p className="text-micro" style={{ color: colors.text.tertiary }}>
                평일 10:00 - 18:00
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" leftIcon={<ExternalLink size={14} />}>
            문의하기
          </Button>
        </div>

        {/* Tab Selector */}
        <div
          className="flex gap-2 p-1 rounded-xl"
          style={{ background: 'rgba(255, 255, 255, 0.04)' }}
        >
          {[
            { id: 'faq', label: '자주 묻는 질문' },
            { id: 'contact', label: '1:1 문의' },
          ].map((tab) => (
            <m.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'faq' | 'contact')}
              className="flex-1 py-3 rounded-lg font-medium text-sm"
              style={{
                background: activeTab === tab.id ? gradients.flame : 'transparent',
                color: activeTab === tab.id ? 'white' : colors.text.secondary,
              }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
            </m.button>
          ))}
        </div>

        {activeTab === 'faq' ? (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <m.button
                onClick={() => setSelectedCategory(null)}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: !selectedCategory
                    ? 'rgba(255, 107, 91, 0.15)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: !selectedCategory
                    ? `1px solid ${colors.flame[500]}`
                    : `1px solid ${colors.border.subtle}`,
                  color: !selectedCategory ? colors.flame[500] : colors.text.secondary,
                }}
              >
                전체
              </m.button>
              {SUPPORT_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <m.button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                    style={{
                      background: isSelected ? `${cat.color}20` : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected
                        ? `1px solid ${cat.color}`
                        : `1px solid ${colors.border.subtle}`,
                      color: isSelected ? cat.color : colors.text.secondary,
                    }}
                  >
                    <Icon size={14} />
                    {cat.label}
                  </m.button>
                );
              })}
            </div>

            {/* FAQ List */}
            <div style={GLASS_CARD_STYLE} className="overflow-hidden">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => <FAQItem key={faq.id} faq={faq} />)
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle
                    size={48}
                    className="mx-auto mb-4"
                    style={{ color: colors.text.muted }}
                  />
                  <p style={{ color: colors.text.tertiary }}>해당 카테고리에 FAQ가 없습니다</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Contact Form */
          <div style={GLASS_CARD_STYLE} className="p-5">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255, 107, 91, 0.15)' }}
              >
                <Mail size={20} style={{ color: colors.flame[500] }} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: colors.text.primary }}>
                  1:1 문의
                </h3>
                <p className="text-micro" style={{ color: colors.text.tertiary }}>
                  영업일 기준 1-2일 내 답변
                </p>
              </div>
            </div>

            <ContactForm />
          </div>
        )}

        {/* Contact Info */}
        <div style={GLASS_CARD_STYLE} className="p-5">
          <h3 className="font-bold mb-4" style={{ color: colors.text.primary }}>
            연락처
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={18} style={{ color: colors.text.tertiary }} />
              <span className="text-sm" style={{ color: colors.text.secondary }}>
                support@zzik.kr
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} style={{ color: colors.text.tertiary }} />
              <span className="text-sm" style={{ color: colors.text.secondary }}>
                02-1234-5678
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={18} style={{ color: colors.text.tertiary }} />
              <span className="text-sm" style={{ color: colors.text.secondary }}>
                평일 10:00 - 18:00 (점심 12:00 - 13:00)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
