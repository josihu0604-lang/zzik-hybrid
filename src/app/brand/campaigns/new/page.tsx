'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, Info, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { GlassCard, CosmicInput, PrimaryButton, SecondaryButton } from '@/components/cosmic';
import { colors } from '@/lib/design-tokens';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import type { CampaignFormData } from '@/types/brand';

const categories = [
  { value: 'fashion', label: '패션', emoji: '👗' },
  { value: 'beauty', label: '뷰티', emoji: '💄' },
  { value: 'food', label: '맛집', emoji: '🍽️' },
  { value: 'cafe', label: '카페', emoji: '☕' },
  { value: 'kpop', label: 'K-Pop', emoji: '🎤' },
  { value: 'lifestyle', label: '라이프스타일', emoji: '🏠' },
  { value: 'tech', label: '테크', emoji: '📱' },
  { value: 'culture', label: '문화', emoji: '🎨' },
];

const popularLocations = [
  '성수동 카페거리',
  '홍대입구역',
  '강남역',
  '잠실 롯데월드몰',
  '명동',
  '이태원',
  '가로수길',
];

const goalPresets = [50, 100, 150, 200, 300, 500];

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    image_url: '',
    location: '',
    category: '',
    goal_participants: 100,
    deadline_at: '',
    starts_at: '',
    ends_at: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CampaignFormData, string>>>({});

  const updateForm = (key: keyof CampaignFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: typeof errors = {};

    if (stepNum === 1) {
      if (!formData.title.trim()) newErrors.title = '캠페인 이름을 입력해주세요';
      if (!formData.category) newErrors.category = '카테고리를 선택해주세요';
    }

    if (stepNum === 2) {
      if (!formData.location.trim()) newErrors.location = '위치를 입력해주세요';
      if (!formData.goal_participants || formData.goal_participants < 10) {
        newErrors.goal_participants = '목표 참여자는 최소 10명 이상이어야 합니다';
      }
    }

    if (stepNum === 3) {
      if (!formData.deadline_at) newErrors.deadline_at = '마감일을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      const response = await fetch('/api/brand/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/brand/campaigns');
      } else {
        // Handle error
        console.error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get min date for deadline (tomorrow)
  const minDeadline = new Date();
  minDeadline.setDate(minDeadline.getDate() + 1);
  const minDeadlineStr = minDeadline.toISOString().split('T')[0];

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-4 mb-8"
      >
        <Link href="/brand/campaigns">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <ArrowLeft size={20} style={{ color: colors.text.secondary }} />
          </motion.button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">새 캠페인 만들기</h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            단계 {step}/3
          </p>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: s <= step ? colors.flame[500] : 'rgba(255, 255, 255, 0.1)',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Form Content */}
      <motion.div
        key={step}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {step === 1 && (
          <>
            {/* Step 1: Basic Info */}
            <motion.div variants={staggerItem}>
              <GlassCard padding="lg">
                <h2 className="text-lg font-semibold text-white mb-4">기본 정보</h2>

                <div className="space-y-5">
                  {/* Title */}
                  <CosmicInput
                    label="캠페인 이름 *"
                    placeholder="예: 2024 Winter Collection"
                    value={formData.title}
                    onChange={(v) => updateForm('title', v)}
                    error={errors.title}
                  />

                  {/* Description */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.text.secondary }}
                    >
                      설명
                    </label>
                    <textarea
                      placeholder="캠페인에 대한 간단한 설명을 입력해주세요"
                      value={formData.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl resize-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${colors.border.subtle}`,
                        color: colors.text.primary,
                      }}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-3"
                      style={{ color: colors.text.secondary }}
                    >
                      카테고리 *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {categories.map((cat) => (
                        <motion.button
                          key={cat.value}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateForm('category', cat.value)}
                          className="p-3 rounded-xl text-center transition-all"
                          style={{
                            background:
                              formData.category === cat.value
                                ? `rgba(255, 107, 91, 0.15)`
                                : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${
                              formData.category === cat.value
                                ? colors.flame[500]
                                : colors.border.subtle
                            }`,
                          }}
                        >
                          <span className="text-xl">{cat.emoji}</span>
                          <p
                            className="text-xs mt-1"
                            style={{
                              color:
                                formData.category === cat.value
                                  ? colors.flame[500]
                                  : colors.text.secondary,
                            }}
                          >
                            {cat.label}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                    {errors.category && (
                      <p className="text-sm mt-2" style={{ color: colors.error }}>
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Image Upload */}
            <motion.div variants={staggerItem}>
              <GlassCard padding="lg">
                <h2 className="text-lg font-semibold text-white mb-4">대표 이미지</h2>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: colors.border.default,
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255, 107, 91, 0.1)' }}
                  >
                    <ImageIcon size={28} style={{ color: colors.flame[400] }} />
                  </div>
                  <p className="text-white font-medium">이미지 업로드</p>
                  <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                    PNG, JPG (최대 5MB)
                  </p>
                </motion.div>
              </GlassCard>
            </motion.div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Step 2: Location & Goal */}
            <motion.div variants={staggerItem}>
              <GlassCard padding="lg">
                <h2 className="text-lg font-semibold text-white mb-4">위치 정보</h2>

                <div className="space-y-5">
                  {/* Location Input */}
                  <CosmicInput
                    label="팝업 위치 *"
                    placeholder="예: 성수동 카페거리"
                    value={formData.location}
                    onChange={(v) => updateForm('location', v)}
                    icon={<MapPin size={18} />}
                    error={errors.location}
                  />

                  {/* Popular Locations */}
                  <div>
                    <p className="text-xs mb-2" style={{ color: colors.text.tertiary }}>
                      인기 위치
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularLocations.map((loc) => (
                        <motion.button
                          key={loc}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateForm('location', loc)}
                          className="px-3 py-1.5 rounded-full text-sm transition-all"
                          style={{
                            background:
                              formData.location === loc
                                ? colors.flame[500]
                                : 'rgba(255, 255, 255, 0.05)',
                            color: formData.location === loc ? '#fff' : colors.text.secondary,
                          }}
                        >
                          {loc}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <GlassCard padding="lg">
                <h2 className="text-lg font-semibold text-white mb-4">목표 참여자 수</h2>

                <div className="space-y-4">
                  {/* Goal Input */}
                  <CosmicInput
                    label="목표 인원 *"
                    type="number"
                    placeholder="100"
                    value={String(formData.goal_participants)}
                    onChange={(v) => updateForm('goal_participants', parseInt(v) || 0)}
                    icon={<Users size={18} />}
                    error={errors.goal_participants}
                  />

                  {/* Presets */}
                  <div>
                    <p className="text-xs mb-2" style={{ color: colors.text.tertiary }}>
                      추천 목표
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {goalPresets.map((goal) => (
                        <motion.button
                          key={goal}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateForm('goal_participants', goal)}
                          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background:
                              formData.goal_participants === goal
                                ? colors.flame[500]
                                : 'rgba(255, 255, 255, 0.05)',
                            color:
                              formData.goal_participants === goal ? '#fff' : colors.text.secondary,
                            border: `1px solid ${
                              formData.goal_participants === goal
                                ? colors.flame[500]
                                : colors.border.subtle
                            }`,
                          }}
                        >
                          {goal}명
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div
                    className="flex gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <Info size={18} style={{ color: colors.info }} />
                    <p className="text-sm" style={{ color: colors.info }}>
                      목표 인원에 도달하면 팝업이 확정됩니다
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Step 3: Schedule */}
            <motion.div variants={staggerItem}>
              <GlassCard padding="lg">
                <h2 className="text-lg font-semibold text-white mb-4">일정 설정</h2>

                <div className="space-y-5">
                  {/* Deadline */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.text.secondary }}
                    >
                      펀딩 마감일 *
                    </label>
                    <input
                      type="date"
                      min={minDeadlineStr}
                      value={formData.deadline_at}
                      onChange={(e) => updateForm('deadline_at', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${
                          errors.deadline_at ? colors.error : colors.border.subtle
                        }`,
                        color: colors.text.primary,
                        colorScheme: 'dark',
                      }}
                    />
                    {errors.deadline_at && (
                      <p className="text-sm mt-2" style={{ color: colors.error }}>
                        {errors.deadline_at}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.text.secondary }}
                    >
                      팝업 시작일 (선택)
                    </label>
                    <input
                      type="date"
                      min={formData.deadline_at || minDeadlineStr}
                      value={formData.starts_at || ''}
                      onChange={(e) => updateForm('starts_at', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${colors.border.subtle}`,
                        color: colors.text.primary,
                        colorScheme: 'dark',
                      }}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.text.secondary }}
                    >
                      팝업 종료일 (선택)
                    </label>
                    <input
                      type="date"
                      min={formData.starts_at || formData.deadline_at || minDeadlineStr}
                      value={formData.ends_at || ''}
                      onChange={(e) => updateForm('ends_at', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${colors.border.subtle}`,
                        color: colors.text.primary,
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Summary */}
            <motion.div variants={staggerItem}>
              <GlassCard padding="lg" glow="flame">
                <h2 className="text-lg font-semibold text-white mb-4">캠페인 요약</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: colors.text.secondary }}>이름</span>
                    <span className="text-white font-medium">{formData.title || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: colors.text.secondary }}>카테고리</span>
                    <span className="text-white">
                      {categories.find((c) => c.value === formData.category)?.label || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: colors.text.secondary }}>위치</span>
                    <span className="text-white">{formData.location || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: colors.text.secondary }}>목표 인원</span>
                    <span style={{ color: colors.flame[500] }}>{formData.goal_participants}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: colors.text.secondary }}>마감일</span>
                    <span className="text-white">
                      {formData.deadline_at
                        ? new Date(formData.deadline_at).toLocaleDateString('ko-KR')
                        : '-'}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="flex gap-3 mt-8"
      >
        {step > 1 && (
          <SecondaryButton onClick={prevStep} className="flex-1">
            이전
          </SecondaryButton>
        )}
        {step < 3 ? (
          <PrimaryButton onClick={nextStep} className="flex-1">
            다음
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={handleSubmit} loading={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Check size={20} />
                캠페인 생성
              </>
            )}
          </PrimaryButton>
        )}
      </motion.div>
    </div>
  );
}
