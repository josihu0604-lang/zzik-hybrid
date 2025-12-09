'use client';

import { useState, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Flag,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Camera,
  Award,
  Verified,
  Heart,
  Share2,
  Edit2,
  Trash2,
  Clock,
  MapPin,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';
import Image from 'next/image';

// ============================================
// Types & Interfaces
// ============================================

export interface ReviewAuthor {
  id: string;
  name: string;
  avatar?: string;
  reviewCount: number;
  isVerified: boolean;
  badge?: 'expert' | 'local' | 'vip' | 'top_reviewer';
}

export interface ReviewImage {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
}

export interface ReviewReply {
  id: string;
  author: {
    name: string;
    avatar?: string;
    isOwner: boolean;
  };
  content: string;
  timestamp: Date;
}

export interface Review {
  id: string;
  author: ReviewAuthor;
  rating: number;
  title?: string;
  content: string;
  visitDate?: Date;
  visitType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  images?: ReviewImage[];
  helpful: number;
  isHelpful?: boolean;
  isLiked?: boolean;
  likeCount: number;
  replyCount: number;
  replies?: ReviewReply[];
  timestamp: Date;
  tags?: string[];
  language?: string;
  translatedContent?: string;
}

interface ReviewCardProps {
  review: Review;
  variant?: 'default' | 'compact' | 'detailed';
  isOwner?: boolean;
  onHelpful?: (reviewId: string) => void;
  onLike?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  onShare?: (reviewId: string) => void;
  onTranslate?: (reviewId: string) => void;
  showReplies?: boolean;
  className?: string;
}

// ============================================
// Constants
// ============================================

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string; labelKo: string }> = {
  expert: {
    icon: <Award size={12} />,
    color: colors.purple[400],
    label: 'Expert',
    labelKo: '전문가',
  },
  local: {
    icon: <MapPin size={12} />,
    color: colors.green[400],
    label: 'Local Guide',
    labelKo: '로컬 가이드',
  },
  vip: {
    icon: <Star size={12} fill="currentColor" />,
    color: colors.flame[500],
    label: 'VIP',
    labelKo: 'VIP',
  },
  top_reviewer: {
    icon: <Award size={12} />,
    color: colors.yellow[400],
    label: 'Top Reviewer',
    labelKo: '탑 리뷰어',
  },
};

const VISIT_TYPE_LABELS: Record<string, { label: string; labelKo: string }> = {
  solo: { label: 'Solo', labelKo: '혼자' },
  couple: { label: 'Couple', labelKo: '커플' },
  family: { label: 'Family', labelKo: '가족' },
  friends: { label: 'Friends', labelKo: '친구' },
  business: { label: 'Business', labelKo: '비즈니스' },
};

// ============================================
// Sub-Components
// ============================================

// Star Rating Display
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? colors.yellow[400] : 'transparent'}
          color={star <= rating ? colors.yellow[400] : rgba.white[30]}
          strokeWidth={2}
        />
      ))}
    </div>
  );
}

// Author Badge
function AuthorBadge({ badge, locale }: { badge: string; locale: string }) {
  const config = BADGE_CONFIG[badge];
  if (!config) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ 
        background: config.color + '20', 
        color: config.color 
      }}
    >
      {config.icon}
      {locale === 'ko' ? config.labelKo : config.label}
    </span>
  );
}

// Image Gallery
function ImageGallery({ 
  images, 
  onImageClick 
}: { 
  images: ReviewImage[]; 
  onImageClick?: (index: number) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayImages = showAll ? images : images.slice(0, 4);
  const hasMore = images.length > 4;

  return (
    <div className="mt-3">
      <div className="grid grid-cols-4 gap-2">
        {displayImages.map((image, index) => (
          <m.button
            key={image.id}
            className="relative aspect-square rounded-lg overflow-hidden"
            onClick={() => onImageClick?.(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Image
              src={image.thumbnail || image.url}
              alt={image.caption || 'Review image'}
              fill
              className="object-cover"
            />
            {!showAll && index === 3 && hasMore && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/60"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAll(true);
                }}
              >
                <span className="text-white font-semibold">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </m.button>
        ))}
      </div>
      {showAll && hasMore && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-2 text-xs font-medium"
          style={{ color: colors.flame[500] }}
        >
          Show less
        </button>
      )}
    </div>
  );
}

// Review Reply
function ReviewReplyItem({ reply, locale }: { reply: ReviewReply; locale: string }) {
  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      numeric: 'auto',
    }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div 
      className="pl-4 py-3 border-l-2"
      style={{ borderColor: reply.author.isOwner ? colors.flame[500] : rgba.white[20] }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
          {reply.author.avatar ? (
            <Image
              src={reply.author.avatar}
              alt={reply.author.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            reply.author.name[0].toUpperCase()
          )}
        </div>
        <span className="text-sm font-semibold text-white">{reply.author.name}</span>
        {reply.author.isOwner && (
          <span 
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: colors.flame[500], color: 'white' }}
          >
            {locale === 'ko' ? '사장님' : 'Owner'}
          </span>
        )}
        <span className="text-xs" style={{ color: rgba.white[40] }}>
          {formatDate(reply.timestamp)}
        </span>
      </div>
      <p className="text-sm" style={{ color: rgba.white[80] }}>{reply.content}</p>
    </div>
  );
}

// Action Menu
function ActionMenu({ 
  isOwner, 
  onEdit, 
  onDelete, 
  onReport, 
  onShare,
  locale 
}: {
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  locale: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors"
        style={{ background: isOpen ? rgba.white[10] : 'transparent' }}
      >
        <MoreHorizontal size={18} style={{ color: rgba.white[60] }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <m.div
              className="absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden z-50"
              style={{ 
                background: colors.space[800], 
                border: `1px solid ${rgba.white[10]}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {onShare && (
                <button
                  onClick={() => { onShare(); setIsOpen(false); }}
                  className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-white/5"
                  style={{ color: rgba.white[80] }}
                >
                  <Share2 size={16} />
                  {locale === 'ko' ? '공유' : 'Share'}
                </button>
              )}
              {isOwner && onEdit && (
                <button
                  onClick={() => { onEdit(); setIsOpen(false); }}
                  className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-white/5"
                  style={{ color: rgba.white[80] }}
                >
                  <Edit2 size={16} />
                  {locale === 'ko' ? '수정' : 'Edit'}
                </button>
              )}
              {isOwner && onDelete && (
                <button
                  onClick={() => { onDelete(); setIsOpen(false); }}
                  className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-white/5"
                  style={{ color: colors.red[400] }}
                >
                  <Trash2 size={16} />
                  {locale === 'ko' ? '삭제' : 'Delete'}
                </button>
              )}
              {!isOwner && onReport && (
                <button
                  onClick={() => { onReport(); setIsOpen(false); }}
                  className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-white/5"
                  style={{ color: colors.red[400] }}
                >
                  <Flag size={16} />
                  {locale === 'ko' ? '신고' : 'Report'}
                </button>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ReviewCard({
  review,
  variant = 'default',
  isOwner = false,
  onHelpful,
  onLike,
  onReply,
  onReport,
  onEdit,
  onDelete,
  onShare,
  onTranslate,
  showReplies = true,
  className = '',
}: ReviewCardProps) {
  const { locale } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const shouldTruncate = review.content.length > 200 && variant !== 'detailed';
  const displayContent = shouldTruncate && !isExpanded 
    ? review.content.slice(0, 200) + '...'
    : review.content;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return locale === 'ko' ? '오늘' : 'Today';
    if (diffDays === 1) return locale === 'ko' ? '어제' : 'Yesterday';
    if (diffDays < 7) return locale === 'ko' ? `${diffDays}일 전` : `${diffDays} days ago`;
    
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div 
        className={`p-3 rounded-xl ${className}`}
        style={{ background: rgba.white[5], border: `1px solid ${rgba.white[10]}` }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">
            {review.author.avatar ? (
              <Image
                src={review.author.avatar}
                alt={review.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              review.author.name[0].toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white text-sm truncate">{review.author.name}</span>
              <StarRating rating={review.rating} size={12} />
            </div>
            <p className="text-sm line-clamp-2" style={{ color: rgba.white[70] }}>
              {review.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default & Detailed variant
  return (
    <m.div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: rgba.white[5], border: `1px solid ${rgba.white[10]}` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold">
                {review.author.avatar ? (
                  <Image
                    src={review.author.avatar}
                    alt={review.author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  review.author.name[0].toUpperCase()
                )}
              </div>
              {review.author.isVerified && (
                <div 
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: colors.blue[500] }}
                >
                  <Verified size={12} color="white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">{review.author.name}</span>
                {review.author.badge && (
                  <AuthorBadge badge={review.author.badge} locale={locale} />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: rgba.white[50] }}>
                <span>{review.author.reviewCount} {locale === 'ko' ? '리뷰' : 'reviews'}</span>
                <span>•</span>
                <span>{formatDate(review.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <ActionMenu
            isOwner={isOwner}
            onEdit={onEdit ? () => onEdit(review.id) : undefined}
            onDelete={onDelete ? () => onDelete(review.id) : undefined}
            onReport={onReport ? () => onReport(review.id) : undefined}
            onShare={onShare ? () => onShare(review.id) : undefined}
            locale={locale}
          />
        </div>

        {/* Rating & Visit Info */}
        <div className="flex items-center gap-4 mt-3">
          <StarRating rating={review.rating} />
          <span className="text-sm font-semibold" style={{ color: colors.yellow[400] }}>
            {review.rating.toFixed(1)}
          </span>
          {review.visitType && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: rgba.white[10], color: rgba.white[70] }}>
              {locale === 'ko' 
                ? VISIT_TYPE_LABELS[review.visitType].labelKo 
                : VISIT_TYPE_LABELS[review.visitType].label}
            </span>
          )}
          {review.visitDate && (
            <span className="text-xs flex items-center gap-1" style={{ color: rgba.white[50] }}>
              <Clock size={12} />
              {new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
                year: 'numeric',
                month: 'short',
              }).format(review.visitDate)} {locale === 'ko' ? '방문' : 'visited'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {review.title && (
          <h4 className="font-semibold text-white mb-2">{review.title}</h4>
        )}
        <p className="text-sm leading-relaxed" style={{ color: rgba.white[80] }}>
          {showTranslation && review.translatedContent ? review.translatedContent : displayContent}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm font-medium flex items-center gap-1"
            style={{ color: colors.flame[500] }}
          >
            {isExpanded 
              ? (locale === 'ko' ? '접기' : 'Show less')
              : (locale === 'ko' ? '더 보기' : 'Read more')}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        {/* Translation Button */}
        {review.language && review.language !== locale && review.translatedContent && (
          <button
            onClick={() => {
              setShowTranslation(!showTranslation);
              onTranslate?.(review.id);
            }}
            className="mt-2 text-xs font-medium"
            style={{ color: colors.blue[400] }}
          >
            {showTranslation 
              ? (locale === 'ko' ? '원문 보기' : 'Show original')
              : (locale === 'ko' ? '번역 보기' : 'Translate')}
          </button>
        )}

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {review.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: colors.flame[500] + '20', color: colors.flame[400] }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="px-4 pb-3">
          <ImageGallery images={review.images} />
        </div>
      )}

      {/* Action Bar */}
      <div 
        className="px-4 py-3 flex items-center justify-between border-t"
        style={{ borderColor: rgba.white[10] }}
      >
        <div className="flex items-center gap-4">
          {/* Helpful */}
          <button
            onClick={() => onHelpful?.(review.id)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              review.isHelpful ? '' : 'hover:opacity-80'
            }`}
            style={{ color: review.isHelpful ? colors.flame[500] : rgba.white[60] }}
          >
            <ThumbsUp size={18} fill={review.isHelpful ? 'currentColor' : 'none'} />
            <span>{review.helpful > 0 ? review.helpful : ''}</span>
            <span className="hidden sm:inline">
              {locale === 'ko' ? '도움됨' : 'Helpful'}
            </span>
          </button>

          {/* Like */}
          <button
            onClick={() => onLike?.(review.id)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              review.isLiked ? '' : 'hover:opacity-80'
            }`}
            style={{ color: review.isLiked ? colors.red[400] : rgba.white[60] }}
          >
            <Heart size={18} fill={review.isLiked ? 'currentColor' : 'none'} />
            <span>{review.likeCount > 0 ? review.likeCount : ''}</span>
          </button>

          {/* Reply */}
          {onReply && (
            <button
              onClick={() => onReply(review.id)}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: rgba.white[60] }}
            >
              <MessageCircle size={18} />
              <span>{review.replyCount > 0 ? review.replyCount : ''}</span>
              <span className="hidden sm:inline">
                {locale === 'ko' ? '댓글' : 'Reply'}
              </span>
            </button>
          )}
        </div>

        {/* Images indicator */}
        {review.images && review.images.length > 0 && (
          <div className="flex items-center gap-1 text-xs" style={{ color: rgba.white[50] }}>
            <Camera size={14} />
            <span>{review.images.length}</span>
          </div>
        )}
      </div>

      {/* Replies */}
      {showReplies && review.replies && review.replies.length > 0 && (
        <div 
          className="px-4 py-3 space-y-2"
          style={{ background: rgba.white[3], borderTop: `1px solid ${rgba.white[10]}` }}
        >
          {review.replies.map(reply => (
            <ReviewReplyItem key={reply.id} reply={reply} locale={locale} />
          ))}
        </div>
      )}
    </m.div>
  );
}

// ============================================
// Exports
// ============================================

export default ReviewCard;
