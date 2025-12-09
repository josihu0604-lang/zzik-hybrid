/**
 * Customer Queue Ticket Component
 * Digital waitlist ticket displayed to customers
 * 
 * @description A visually appealing digital queue ticket that shows:
 * - Queue position with animated updates
 * - Estimated wait time with countdown
 * - Restaurant information
 * - QR code for verification
 * - Cancel option
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import {
  Clock,
  Users,
  MapPin,
  Phone,
  QrCode,
  X,
  Share2,
  Bell,
  BellOff,
  ChevronDown,
  Sparkles,
  Timer,
  AlertCircle,
  CheckCircle,
  Ticket,
  RefreshCw,
} from 'lucide-react';
import { QueueTimeEstimator } from '@/lib/realtime-queue';
import type { QueueEntry } from '@/lib/realtime-queue';
import { Card, GlassCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface QueueTicketProps {
  entry: QueueEntry;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  totalInQueue: number;
  qrCodeUrl?: string;
  onCancel?: () => Promise<void>;
  onShare?: () => void;
  onNotificationToggle?: (enabled: boolean) => void;
  notificationsEnabled?: boolean;
  locale?: string;
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
}

// ============================================================================
// Localization
// ============================================================================

const i18n: Record<string, Record<string, string>> = {
  queueTicket: {
    en: 'Queue Ticket',
    ko: '대기표',
    ja: '整理券',
    zh: '排队票',
  },
  yourPosition: {
    en: 'Your Position',
    ko: '현재 순번',
    ja: 'あなたの順番',
    zh: '您的位置',
  },
  estimatedWait: {
    en: 'Estimated Wait',
    ko: '예상 대기 시간',
    ja: '予想待機時間',
    zh: '预计等待',
  },
  expectedTime: {
    en: 'Expected Seating',
    ko: '예상 입장 시간',
    ja: '予想入場時間',
    zh: '预计入座时间',
  },
  partySize: {
    en: 'Party Size',
    ko: '인원',
    ja: '人数',
    zh: '人数',
  },
  people: {
    en: 'people',
    ko: '명',
    ja: '名',
    zh: '人',
  },
  queueJoinedAt: {
    en: 'Joined at',
    ko: '등록 시간',
    ja: '登録時間',
    zh: '加入时间',
  },
  cancelQueue: {
    en: 'Cancel & Leave Queue',
    ko: '대기 취소',
    ja: '待機キャンセル',
    zh: '取消排队',
  },
  share: {
    en: 'Share',
    ko: '공유',
    ja: '共有',
    zh: '分享',
  },
  notifications: {
    en: 'Notifications',
    ko: '알림',
    ja: '通知',
    zh: '通知',
  },
  notificationsOn: {
    en: 'Notifications On',
    ko: '알림 켜짐',
    ja: '通知オン',
    zh: '通知已开启',
  },
  notificationsOff: {
    en: 'Notifications Off',
    ko: '알림 꺼짐',
    ja: '通知オフ',
    zh: '通知已关闭',
  },
  youreNext: {
    en: "You're Next!",
    ko: '곧 입장입니다!',
    ja: 'もうすぐです！',
    zh: '马上轮到您！',
  },
  almostThere: {
    en: 'Almost There!',
    ko: '거의 다 왔어요!',
    ja: 'もう少し！',
    zh: '快到了！',
  },
  pleaseWait: {
    en: 'Please Wait',
    ko: '잠시만 기다려주세요',
    ja: 'お待ちください',
    zh: '请稍候',
  },
  called: {
    en: 'You have been called!',
    ko: '호출되었습니다!',
    ja: '呼び出されました！',
    zh: '您已被叫号！',
  },
  calledSubtext: {
    en: 'Please proceed to the entrance',
    ko: '입구로 와주세요',
    ja: '入口へお進みください',
    zh: '请前往入口',
  },
  showQR: {
    en: 'Show QR Code',
    ko: 'QR 코드 보기',
    ja: 'QRコードを表示',
    zh: '显示二维码',
  },
  ticketId: {
    en: 'Ticket ID',
    ko: '티켓 ID',
    ja: 'チケットID',
    zh: '票号',
  },
  inQueue: {
    en: 'in queue',
    ko: '대기 중',
    ja: '待機中',
    zh: '排队中',
  },
  confirmCancel: {
    en: 'Are you sure you want to leave the queue?',
    ko: '대기열을 떠나시겠습니까?',
    ja: '本当に待機リストから離れますか？',
    zh: '确定要离开队列吗？',
  },
  yes: {
    en: 'Yes, Leave',
    ko: '네, 떠나기',
    ja: 'はい',
    zh: '是的，离开',
  },
  no: {
    en: 'No, Stay',
    ko: '아니오',
    ja: 'いいえ',
    zh: '不，继续等待',
  },
};

const t = (key: string, locale: string): string => {
  return i18n[key]?.[locale] || i18n[key]?.['en'] || key;
};

// ============================================================================
// Main Ticket Component
// ============================================================================

export function QueueTicket({
  entry,
  restaurantName,
  restaurantAddress,
  restaurantPhone,
  totalInQueue,
  qrCodeUrl,
  onCancel,
  onShare,
  onNotificationToggle,
  notificationsEnabled = true,
  locale = 'en',
  variant = 'full',
  className,
}: QueueTicketProps) {
  const [showQR, setShowQR] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(entry.estimatedWaitMinutes);

  // Update countdown timer
  useEffect(() => {
    const estimatedSeating = QueueTimeEstimator.estimateSeatingTime(entry.estimatedWaitMinutes);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((estimatedSeating.getTime() - now.getTime()) / 60000));
      setTimeLeft(diff);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [entry.estimatedWaitMinutes]);

  // Handle cancel
  const handleCancel = async () => {
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  // Check if called
  const isCalled = entry.status === 'called';

  if (variant === 'minimal') {
    return (
      <MinimalTicket
        entry={entry}
        restaurantName={restaurantName}
        timeLeft={timeLeft}
        locale={locale}
        className={className}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <CompactTicket
        entry={entry}
        restaurantName={restaurantName}
        totalInQueue={totalInQueue}
        timeLeft={timeLeft}
        locale={locale}
        onCancel={() => setShowCancelConfirm(true)}
        className={className}
      />
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Called Overlay */}
      <AnimatePresence>
        {isCalled && (
          <CalledOverlay restaurantName={restaurantName} locale={locale} />
        )}
      </AnimatePresence>

      {/* Main Ticket */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative"
      >
        {/* Ticket Container with Notched Design */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-space-850 to-space-900 border border-white/10">
          {/* Gradient Top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-flame-500 via-ember-500 to-flame-500" />

          {/* Decorative Circle Notches */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-space-950 rounded-full" />
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-space-950 rounded-full" />

          {/* Dashed Line */}
          <div className="absolute left-4 right-4 top-1/2 border-t-2 border-dashed border-white/10" />

          {/* Top Section - Position */}
          <div className="px-6 pt-6 pb-8">
            {/* Restaurant Name & Status */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm">{t('queueTicket', locale)}</p>
                <h2 className="text-xl font-bold text-white mt-1">{restaurantName}</h2>
                {restaurantAddress && (
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {restaurantAddress}
                  </p>
                )}
              </div>
              <PositionStatusBadge position={entry.position} locale={locale} />
            </div>

            {/* Main Position Display */}
            <PositionDisplay
              position={entry.position}
              totalInQueue={totalInQueue}
              locale={locale}
            />

            {/* Time Info */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <TimeCard
                label={t('estimatedWait', locale)}
                value={QueueTimeEstimator.formatWaitTime(timeLeft, locale)}
                icon={<Timer className="w-4 h-4" />}
                highlight
              />
              <TimeCard
                label={t('expectedTime', locale)}
                value={QueueTimeEstimator.estimateSeatingTime(timeLeft).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                icon={<Clock className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Bottom Section - Details */}
          <div className="px-6 pb-6 pt-8">
            {/* Entry Details */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-500 text-xs">{t('partySize', locale)}</p>
                <p className="text-white font-semibold mt-1">
                  {entry.partySize} {t('people', locale)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">{t('queueJoinedAt', locale)}</p>
                <p className="text-white font-semibold mt-1">
                  {new Date(entry.joinedAt).toLocaleTimeString(locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">{t('ticketId', locale)}</p>
                <p className="text-white font-semibold mt-1 font-mono text-sm">
                  {entry.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setShowQR(true)}
              >
                <QrCode className="w-4 h-4 mr-2" />
                {t('showQR', locale)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNotificationToggle?.(!notificationsEnabled)}
                className={cn(
                  notificationsEnabled ? 'text-green-400' : 'text-gray-400'
                )}
              >
                {notificationsEnabled ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </Button>
              {onShare && (
                <Button variant="ghost" size="sm" onClick={onShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Cancel Button */}
            {onCancel && entry.status === 'waiting' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full mt-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                {t('cancelQueue', locale)}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <QRCodeModal
            ticketId={entry.id}
            qrCodeUrl={qrCodeUrl}
            restaurantName={restaurantName}
            onClose={() => setShowQR(false)}
            locale={locale}
          />
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <CancelConfirmModal
            onConfirm={handleCancel}
            onCancel={() => setShowCancelConfirm(false)}
            isLoading={isCancelling}
            locale={locale}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Position Display
// ============================================================================

function PositionDisplay({
  position,
  totalInQueue,
  locale,
}: {
  position: number;
  totalInQueue: number;
  locale: string;
}) {
  const animatedPosition = useSpring(position, {
    stiffness: 100,
    damping: 20,
  });

  return (
    <div className="text-center">
      <p className="text-gray-400 text-sm mb-2">{t('yourPosition', locale)}</p>
      <motion.div
        key={position}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative inline-block"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-flame-500 to-ember-500 rounded-full blur-2xl opacity-30" />

        {/* Position Number */}
        <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-flame-500 to-ember-600 flex items-center justify-center shadow-2xl">
          <div className="w-28 h-28 rounded-full bg-space-900 flex items-center justify-center">
            <span className="text-5xl font-bold text-white">#{position}</span>
          </div>
        </div>

        {/* Pulse for position 1 */}
        {position === 1 && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-flame-500 to-ember-500"
          />
        )}
      </motion.div>

      <p className="text-gray-500 text-sm mt-3">
        {totalInQueue} {t('inQueue', locale)}
      </p>
    </div>
  );
}

// ============================================================================
// Position Status Badge
// ============================================================================

function PositionStatusBadge({
  position,
  locale,
}: {
  position: number;
  locale: string;
}) {
  const getStatus = () => {
    if (position === 1) {
      return {
        text: t('youreNext', locale),
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-500/20',
        icon: Sparkles,
      };
    }
    if (position <= 3) {
      return {
        text: t('almostThere', locale),
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/20',
        icon: Timer,
      };
    }
    return {
      text: t('pleaseWait', locale),
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-500/20',
      icon: Clock,
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        status.bgColor
      )}
    >
      <Icon className="w-4 h-4" style={{
        color: position === 1 ? '#22c55e' : position <= 3 ? '#3b82f6' : '#6b7280'
      }} />
      <span className="text-sm font-medium" style={{
        color: position === 1 ? '#22c55e' : position <= 3 ? '#3b82f6' : '#9ca3af'
      }}>
        {status.text}
      </span>
    </motion.div>
  );
}

// ============================================================================
// Time Card
// ============================================================================

function TimeCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-3 text-center',
        highlight
          ? 'bg-gradient-to-br from-flame-500/20 to-ember-500/20 border border-flame-500/30'
          : 'bg-white/5 border border-white/10'
      )}
    >
      <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className={cn('text-lg font-bold', highlight ? 'text-flame-400' : 'text-white')}>
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// Called Overlay
// ============================================================================

function CalledOverlay({
  restaurantName,
  locale,
}: {
  restaurantName: string;
  locale: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 bg-gradient-to-br from-green-600/95 to-emerald-700/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4"
      >
        <CheckCircle className="w-12 h-12 text-white" />
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-2"
      >
        {t('called', locale)}
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/80"
      >
        {t('calledSubtext', locale)}
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 px-6 py-3 bg-white/20 rounded-xl"
      >
        <p className="text-white font-semibold">{restaurantName}</p>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// QR Code Modal
// ============================================================================

function QRCodeModal({
  ticketId,
  qrCodeUrl,
  restaurantName,
  onClose,
  locale,
}: {
  ticketId: string;
  qrCodeUrl?: string;
  restaurantName: string;
  onClose: () => void;
  locale: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-1">{restaurantName}</h3>
        <p className="text-gray-500 text-sm mb-6">{t('queueTicket', locale)}</p>

        {/* QR Code */}
        <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Ticket ID */}
        <div className="mt-4 px-4 py-2 bg-gray-100 rounded-lg inline-block">
          <p className="text-xs text-gray-500">{t('ticketId', locale)}</p>
          <p className="font-mono font-bold text-gray-900">{ticketId.slice(0, 8).toUpperCase()}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Cancel Confirm Modal
// ============================================================================

function CancelConfirmModal({
  onConfirm,
  onCancel,
  isLoading,
  locale,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  locale: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-space-850 border border-white/10 rounded-2xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{t('cancelQueue', locale)}</h3>
        <p className="text-gray-400 text-sm mb-6">{t('confirmCancel', locale)}</p>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('no', locale)}
          </Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              t('yes', locale)
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Compact Ticket Variant
// ============================================================================

function CompactTicket({
  entry,
  restaurantName,
  totalInQueue,
  timeLeft,
  locale,
  onCancel,
  className,
}: {
  entry: QueueEntry;
  restaurantName: string;
  totalInQueue: number;
  timeLeft: number;
  locale: string;
  onCancel?: () => void;
  className?: string;
}) {
  return (
    <Card variant="glass" className={cn('p-4', className)}>
      <div className="flex items-center gap-4">
        {/* Position Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-flame-500 to-ember-600 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-white">#{entry.position}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{restaurantName}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {entry.partySize}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {QueueTimeEstimator.formatWaitTime(timeLeft, locale)}
            </span>
          </div>
        </div>

        {/* Cancel */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// Minimal Ticket Variant
// ============================================================================

function MinimalTicket({
  entry,
  restaurantName,
  timeLeft,
  locale,
  className,
}: {
  entry: QueueEntry;
  restaurantName: string;
  timeLeft: number;
  locale: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-space-800', className)}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame-500 to-ember-500 flex items-center justify-center">
        <span className="text-sm font-bold text-white">#{entry.position}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{restaurantName}</p>
        <p className="text-gray-400 text-xs">
          {QueueTimeEstimator.formatWaitTime(timeLeft, locale)}
        </p>
      </div>
    </div>
  );
}

export default QueueTicket;
