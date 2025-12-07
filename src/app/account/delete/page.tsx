'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Clock,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { colors, radii, liquidGlass } from '@/lib/design-tokens';

/**
 * Account Deletion Page - 계정 삭제
 *
 * iOS App Store REQUIRED:
 * - Apple requires all apps to provide account deletion functionality
 * - Must be accessible from within the app
 * - Must clearly explain what data will be deleted
 *
 * Flow:
 * 1. Show warning and consequences
 * 2. Confirm with typing (email or account name)
 * 3. 30-day grace period before permanent deletion
 */

// ============================================================================
// TYPES
// ============================================================================

type DeletionReason =
  | 'not-using'
  | 'privacy'
  | 'found-alternative'
  | 'too-many-notifications'
  | 'other';

const DELETION_REASONS: { value: DeletionReason; label: string }[] = [
  { value: 'not-using', label: '더 이상 사용하지 않음' },
  { value: 'privacy', label: '개인정보 우려' },
  { value: 'found-alternative', label: '다른 서비스 이용' },
  { value: 'too-many-notifications', label: '알림이 너무 많음' },
  { value: 'other', label: '기타' },
];

// ============================================================================
// STYLES
// ============================================================================

const GLASS_CARD_STYLE = {
  ...liquidGlass.standard,
  borderRadius: radii.xl,
  padding: '20px',
} as const;

const WARNING_CARD_STYLE = {
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: radii.xl,
  padding: '20px',
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DeleteAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState<DeletionReason | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Confirmation text required to delete account
  const requiredText = '삭제합니다';

  const handleDelete = async () => {
    if (confirmText !== requiredText) return;

    setIsDeleting(true);

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          otherReason: reason === 'other' ? otherReason : undefined,
          confirmText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '계정 삭제에 실패했습니다');
      }

      setIsDeleted(true);
    } catch (error) {
      console.error('Account deletion error:', error);
      alert(error instanceof Error ? error.message : '계정 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/account/export');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '데이터 내보내기에 실패했습니다');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zzik-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Data export error:', error);
      alert(error instanceof Error ? error.message : '데이터 내보내기에 실패했습니다');
    }
  };

  // Step 1: Warning and reason selection
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Warning Card */}
      <div style={WARNING_CARD_STYLE}>
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239, 68, 68, 0.2)' }}
          >
            <AlertTriangle size={24} style={{ color: colors.error }} />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2" style={{ color: colors.error }}>
              계정을 삭제하시겠습니까?
            </h3>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              계정 삭제 시 아래 데이터가 모두 삭제되며, 복구할 수 없습니다.
            </p>
          </div>
        </div>
      </div>

      {/* What will be deleted */}
      <div style={GLASS_CARD_STYLE}>
        <h4 className="font-semibold mb-4" style={{ color: colors.text.primary }}>
          삭제되는 데이터
        </h4>
        <ul className="space-y-3">
          {[
            '프로필 정보 및 계정 데이터',
            '모든 참여 기록 및 체크인 내역',
            '획득한 배지 및 포인트',
            '리더오퍼 수익 및 정산 내역',
            '저장한 팝업 및 알림 설정',
          ].map((item, index) => (
            <li key={index} className="flex items-center gap-3">
              <XCircle size={16} style={{ color: colors.error }} />
              <span className="text-sm" style={{ color: colors.text.secondary }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Data Download Option */}
      <motion.button
        onClick={handleDownloadData}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2"
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: `1px solid ${colors.border.default}`,
          color: colors.text.secondary,
        }}
      >
        <Download size={18} />
        삭제 전 내 데이터 다운로드
      </motion.button>

      {/* Reason Selection */}
      <div style={GLASS_CARD_STYLE}>
        <h4 className="font-semibold mb-4" style={{ color: colors.text.primary }}>
          탈퇴 사유 (선택)
        </h4>
        <div className="space-y-2">
          {DELETION_REASONS.map((item) => (
            <motion.button
              key={item.value}
              onClick={() => setReason(item.value)}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 rounded-xl text-left flex items-center justify-between"
              style={{
                background:
                  reason === item.value ? 'rgba(255, 107, 91, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border:
                  reason === item.value
                    ? `1px solid ${colors.flame[500]}`
                    : `1px solid ${colors.border.subtle}`,
              }}
            >
              <span
                style={{
                  color: reason === item.value ? colors.flame[500] : colors.text.secondary,
                }}
              >
                {item.label}
              </span>
              {reason === item.value && (
                <CheckCircle size={18} style={{ color: colors.flame[500] }} />
              )}
            </motion.button>
          ))}
        </div>

        {reason === 'other' && (
          <motion.textarea
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full mt-4 p-4 rounded-xl resize-none"
            placeholder="탈퇴 사유를 입력해주세요..."
            rows={3}
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${colors.border.default}`,
              color: colors.text.primary,
              outline: 'none',
            }}
          />
        )}
      </div>

      {/* Next Button */}
      <Button variant="danger" size="lg" fullWidth onClick={() => setStep(2)}>
        계정 삭제 진행
      </Button>
    </motion.div>
  );

  // Step 2: Confirmation
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Grace Period Notice */}
      <div
        style={{
          ...GLASS_CARD_STYLE,
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(59, 130, 246, 0.2)' }}
          >
            <Clock size={24} style={{ color: colors.info }} />
          </div>
          <div>
            <h3 className="font-bold mb-2" style={{ color: colors.info }}>
              30일 유예 기간
            </h3>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              삭제 요청 후 30일 이내에 다시 로그인하면 계정이 복구됩니다. 30일이 지나면 모든
              데이터가 영구 삭제됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Input */}
      <div style={GLASS_CARD_STYLE}>
        <h4 className="font-semibold mb-2" style={{ color: colors.text.primary }}>
          삭제 확인
        </h4>
        <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
          계정 삭제를 확인하려면 아래에{' '}
          <span style={{ color: colors.error, fontWeight: 600 }}>&quot;{requiredText}&quot;</span>를
          입력하세요.
        </p>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={requiredText}
          className="w-full p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border:
              confirmText === requiredText
                ? `1px solid ${colors.error}`
                : `1px solid ${colors.border.default}`,
            color: colors.text.primary,
            outline: 'none',
          }}
        />

        {confirmText && confirmText !== requiredText && (
          <p className="text-micro mt-2" style={{ color: colors.error }}>
            정확하게 입력해주세요
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onClick={handleDelete}
          disabled={confirmText !== requiredText}
          loading={isDeleting}
          leftIcon={<Trash2 size={18} />}
        >
          계정 영구 삭제
        </Button>

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={() => setStep(1)}
          disabled={isDeleting}
        >
          이전으로
        </Button>
      </div>
    </motion.div>
  );

  // Step 3: Deletion Complete
  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'rgba(239, 68, 68, 0.15)' }}
      >
        <CheckCircle size={40} style={{ color: colors.error }} />
      </motion.div>

      <h2 className="text-2xl font-bold mb-3" style={{ color: colors.text.primary }}>
        계정 삭제가 예약되었습니다
      </h2>

      <p className="text-base mb-8 max-w-sm" style={{ color: colors.text.secondary }}>
        30일 후 모든 데이터가 영구 삭제됩니다.
        <br />그 전에 다시 로그인하면 계정이 복구됩니다.
      </p>

      <Button variant="secondary" size="lg" onClick={() => router.push('/')}>
        홈으로 돌아가기
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen" style={{ background: colors.space[950] }}>
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
            onClick={() => (step === 1 ? router.back() : setStep(step - 1))}
            disabled={isDeleted}
            aria-label={step === 1 ? '뒤로 가기' : '이전 단계'}
          />
          <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
            계정 삭제
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {isDeleted ? renderComplete() : step === 1 ? renderStep1() : renderStep2()}
        </AnimatePresence>
      </div>
    </div>
  );
}
