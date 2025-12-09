'use client';

import { useState, useCallback, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Star,
  Camera,
  X,
  Image as ImageIcon,
  Smile,
  Plus,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Send,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';
import Image from 'next/image';

// ============================================
// Types & Interfaces
// ============================================

export type VisitType = 'solo' | 'couple' | 'family' | 'friends' | 'business';

export interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  visitDate?: Date;
  visitType?: VisitType;
  images: File[];
  tags: string[];
}

interface ReviewFormProps {
  targetId: string;
  targetName: string;
  targetType: 'restaurant' | 'experience' | 'venue';
  initialData?: Partial<ReviewFormData>;
  onSubmit: (data: ReviewFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  maxImages?: number;
  maxContentLength?: number;
  suggestedTags?: string[];
  className?: string;
}

// ============================================
// Constants
// ============================================

const RATING_LABELS = {
  1: { label: 'Poor', labelKo: '별로', emoji: '😞' },
  2: { label: 'Fair', labelKo: '그저그럼', emoji: '😕' },
  3: { label: 'Good', labelKo: '괜찮음', emoji: '😊' },
  4: { label: 'Very Good', labelKo: '좋음', emoji: '😄' },
  5: { label: 'Excellent', labelKo: '최고', emoji: '🤩' },
};

const VISIT_TYPES: { value: VisitType; label: string; labelKo: string; emoji: string }[] = [
  { value: 'solo', label: 'Solo', labelKo: '혼자', emoji: '👤' },
  { value: 'couple', label: 'Couple', labelKo: '커플', emoji: '💑' },
  { value: 'family', label: 'Family', labelKo: '가족', emoji: '👨‍👩‍👧‍👦' },
  { value: 'friends', label: 'Friends', labelKo: '친구', emoji: '👯' },
  { value: 'business', label: 'Business', labelKo: '비즈니스', emoji: '💼' },
];

// ============================================
// Sub-Components
// ============================================

// Interactive Star Rating
function StarRatingInput({ 
  rating, 
  onChange, 
  locale 
}: { 
  rating: number; 
  onChange: (rating: number) => void;
  locale: string;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;
  const ratingLabel = displayRating > 0 ? RATING_LABELS[displayRating as keyof typeof RATING_LABELS] : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <m.button
            key={star}
            type="button"
            className="p-1 focus:outline-none"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Star
              size={40}
              fill={star <= displayRating ? colors.yellow[400] : 'transparent'}
              color={star <= displayRating ? colors.yellow[400] : rgba.white[30]}
              strokeWidth={2}
            />
          </m.button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {ratingLabel && (
          <m.div
            className="text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-3xl mr-2">{ratingLabel.emoji}</span>
            <span className="font-semibold text-white">
              {locale === 'ko' ? ratingLabel.labelKo : ratingLabel.label}
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Image Upload Preview
function ImagePreview({ 
  images, 
  onRemove,
  maxImages,
  onAdd,
}: { 
  images: { file: File; preview: string }[];
  onRemove: (index: number) => void;
  maxImages: number;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {images.map((img, index) => (
        <m.div
          key={index}
          className="relative w-20 h-20 rounded-lg overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Image
            src={img.preview}
            alt={`Preview ${index + 1}`}
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <X size={12} color="white" />
          </button>
        </m.div>
      ))}
      
      {images.length < maxImages && (
        <button
          type="button"
          onClick={onAdd}
          className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1"
          style={{ borderColor: rgba.white[20] }}
        >
          <Plus size={20} style={{ color: rgba.white[40] }} />
          <span className="text-xs" style={{ color: rgba.white[40] }}>
            {images.length}/{maxImages}
          </span>
        </button>
      )}
    </div>
  );
}

// Tag Input
function TagInput({
  tags,
  onChange,
  suggestedTags = [],
  locale,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestedTags?: string[];
  locale: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      onChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const availableSuggestions = suggestedTags.filter(t => !tags.includes(t));

  return (
    <div className="space-y-3">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
            style={{ background: colors.flame[500] + '20', color: colors.flame[400] }}
          >
            #{tag}
            <button type="button" onClick={() => handleRemove(tag)}>
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      {tags.length < 5 && (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={locale === 'ko' ? '태그 추가 (최대 5개)' : 'Add tag (max 5)'}
            className="flex-1 px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame-500"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-50"
            style={{ background: colors.flame[500], color: 'white' }}
          >
            {locale === 'ko' ? '추가' : 'Add'}
          </button>
        </div>
      )}

      {/* Suggestions */}
      {availableSuggestions.length > 0 && tags.length < 5 && (
        <div className="flex flex-wrap gap-2">
          {availableSuggestions.slice(0, 5).map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange([...tags, tag])}
              className="px-3 py-1.5 rounded-full text-xs"
              style={{ background: rgba.white[5], color: rgba.white[60] }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ReviewForm({
  targetId,
  targetName,
  targetType,
  initialData,
  onSubmit,
  onCancel,
  maxImages = 5,
  maxContentLength = 1000,
  suggestedTags = [],
  className = '',
}: ReviewFormProps) {
  const { locale } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: initialData?.rating || 0,
    title: initialData?.title || '',
    content: initialData?.content || '',
    visitDate: initialData?.visitDate,
    visitType: initialData?.visitType,
    images: initialData?.images || [],
    tags: initialData?.tags || [],
  });
  
  const [imagePreviews, setImagePreviews] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVisitOptions, setShowVisitOptions] = useState(false);

  // Handle image selection
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxImages - imagePreviews.length;
    const newFiles = files.slice(0, remainingSlots);

    const newPreviews = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [imagePreviews.length, maxImages]);

  // Handle image remove
  const handleImageRemove = useCallback((index: number) => {
    URL.revokeObjectURL(imagePreviews[index].preview);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, [imagePreviews]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.rating === 0) {
      setError(locale === 'ko' ? '별점을 선택해주세요' : 'Please select a rating');
      return;
    }
    if (formData.content.trim().length < 10) {
      setError(locale === 'ko' ? '리뷰는 최소 10자 이상 작성해주세요' : 'Review must be at least 10 characters');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit(formData);
      if (!result.success) {
        setError(result.error || (locale === 'ko' ? '제출 실패' : 'Submission failed'));
      }
    } catch (err) {
      setError(locale === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Target Info */}
      <div 
        className="p-4 rounded-xl text-center"
        style={{ background: rgba.white[5] }}
      >
        <p className="text-sm" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '리뷰 작성' : 'Write a Review'}
        </p>
        <p className="font-bold text-white text-lg mt-1">{targetName}</p>
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '별점' : 'Rating'} <span style={{ color: colors.red[400] }}>*</span>
        </label>
        <div 
          className="p-6 rounded-xl"
          style={{ background: rgba.white[5] }}
        >
          <StarRatingInput
            rating={formData.rating}
            onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
            locale={locale}
          />
        </div>
      </div>

      {/* Title (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '제목 (선택)' : 'Title (Optional)'}
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder={locale === 'ko' ? '리뷰 제목을 입력하세요' : 'Enter review title'}
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame-500"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '리뷰 내용' : 'Review'} <span style={{ color: colors.red[400] }}>*</span>
        </label>
        <div className="relative">
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder={locale === 'ko' 
              ? '솔직한 리뷰를 작성해주세요 (최소 10자)'
              : 'Share your honest experience (min 10 characters)'}
            rows={5}
            maxLength={maxContentLength}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame-500 resize-none"
          />
          <span 
            className="absolute bottom-3 right-3 text-xs"
            style={{ color: formData.content.length > maxContentLength * 0.9 ? colors.red[400] : rgba.white[40] }}
          >
            {formData.content.length}/{maxContentLength}
          </span>
        </div>
      </div>

      {/* Visit Info */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowVisitOptions(!showVisitOptions)}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: colors.flame[500] }}
        >
          <Info size={16} />
          {locale === 'ko' ? '방문 정보 추가 (선택)' : 'Add visit info (optional)'}
          <ChevronDown 
            size={16} 
            className={`transition-transform ${showVisitOptions ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {showVisitOptions && (
            <m.div
              className="space-y-4 p-4 rounded-xl"
              style={{ background: rgba.white[5] }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {/* Visit Date */}
              <div>
                <label className="block text-sm mb-2" style={{ color: rgba.white[60] }}>
                  {locale === 'ko' ? '방문 날짜' : 'Visit Date'}
                </label>
                <input
                  type="month"
                  value={formData.visitDate 
                    ? `${formData.visitDate.getFullYear()}-${String(formData.visitDate.getMonth() + 1).padStart(2, '0')}`
                    : ''}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setFormData(prev => ({
                      ...prev,
                      visitDate: year ? new Date(parseInt(year), parseInt(month) - 1) : undefined,
                    }));
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-flame-500"
                />
              </div>

              {/* Visit Type */}
              <div>
                <label className="block text-sm mb-2" style={{ color: rgba.white[60] }}>
                  {locale === 'ko' ? '방문 유형' : 'Visit Type'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {VISIT_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        visitType: prev.visitType === type.value ? undefined : type.value,
                      }))}
                      className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      style={{
                        background: formData.visitType === type.value ? colors.flame[500] + '30' : rgba.white[5],
                        border: `1px solid ${formData.visitType === type.value ? colors.flame[500] : rgba.white[10]}`,
                        color: formData.visitType === type.value ? colors.flame[400] : rgba.white[70],
                      }}
                    >
                      <span>{type.emoji}</span>
                      {locale === 'ko' ? type.labelKo : type.label}
                    </button>
                  ))}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '사진 첨부 (선택)' : 'Photos (Optional)'}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <ImagePreview
          images={imagePreviews}
          onRemove={handleImageRemove}
          maxImages={maxImages}
          onAdd={() => fileInputRef.current?.click()}
        />
        <p className="text-xs" style={{ color: rgba.white[40] }}>
          {locale === 'ko' 
            ? `최대 ${maxImages}장, 각 10MB 이하`
            : `Max ${maxImages} photos, 10MB each`}
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '태그 (선택)' : 'Tags (Optional)'}
        </label>
        <TagInput
          tags={formData.tags}
          onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
          suggestedTags={suggestedTags}
          locale={locale}
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <m.div
            className="p-3 rounded-xl flex items-center gap-2"
            style={{ background: colors.red[500] + '20', border: `1px solid ${colors.red[500]}40` }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={18} style={{ color: colors.red[400] }} />
            <span className="text-sm" style={{ color: colors.red[400] }}>{error}</span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-xl font-semibold disabled:opacity-50"
            style={{ background: rgba.white[5], color: rgba.white[70] }}
          >
            {locale === 'ko' ? '취소' : 'Cancel'}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || formData.rating === 0}
          className="flex-1 py-4 rounded-xl font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: gradients.flame }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {locale === 'ko' ? '제출 중...' : 'Submitting...'}
            </>
          ) : (
            <>
              <Send size={18} />
              {locale === 'ko' ? '리뷰 등록' : 'Submit Review'}
            </>
          )}
        </button>
      </div>

      {/* Guidelines */}
      <div 
        className="p-4 rounded-xl"
        style={{ background: rgba.white[3], border: `1px solid ${rgba.white[5]}` }}
      >
        <p className="text-xs font-medium mb-2" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '📝 리뷰 작성 가이드' : '📝 Review Guidelines'}
        </p>
        <ul className="text-xs space-y-1" style={{ color: rgba.white[40] }}>
          <li>• {locale === 'ko' ? '실제 방문/이용 경험을 바탕으로 작성해주세요' : 'Base your review on actual visit/experience'}</li>
          <li>• {locale === 'ko' ? '욕설, 비방, 허위 내용은 삭제될 수 있습니다' : 'Profanity, slander, or false content may be removed'}</li>
          <li>• {locale === 'ko' ? '사진은 직접 촬영한 것만 사용해주세요' : 'Only use photos you took yourself'}</li>
        </ul>
      </div>
    </form>
  );
}

// ============================================
// Exports
// ============================================

export default ReviewForm;
