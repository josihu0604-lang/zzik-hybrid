'use client';

import { memo } from 'react';
import { m } from 'framer-motion';
import { Plus, Minus, Locate, Maximize2, Loader2 } from 'lucide-react';
import { colors, liquidGlass, radii } from '@/lib/design-tokens';

/**
 * MapControls - 지도 컨트롤 버튼 그룹
 *
 * Features:
 * - 줌 인/아웃 버튼
 * - 현재 위치로 이동
 * - 전체 보기 (모든 마커 표시)
 * - Liquid Glass 디자인
 * - GPS 로딩 상태 표시
 */

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onFitAll: () => void;
  isLocating?: boolean;
  hasUserLocation?: boolean;
}

export const MapControls = memo(function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onFitAll,
  isLocating = false,
  hasUserLocation = false,
}: MapControlsProps) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
      {/* Zoom Controls */}
      <div
        className="flex flex-col rounded-xl overflow-hidden"
        style={{
          ...liquidGlass.standard,
          borderRadius: radii.lg,
        }}
      >
        <ControlButton icon={<Plus size={18} />} onClick={onZoomIn} label="확대" />
        <div className="w-full h-px" style={{ background: colors.border.subtle }} />
        <ControlButton icon={<Minus size={18} />} onClick={onZoomOut} label="축소" />
      </div>

      {/* Location Control */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          ...liquidGlass.standard,
          borderRadius: radii.lg,
        }}
      >
        <ControlButton
          icon={
            isLocating ? (
              <m.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={18} />
              </m.div>
            ) : (
              <Locate size={18} />
            )
          }
          onClick={onLocate}
          label={isLocating ? '위치 확인 중...' : '현재 위치'}
          isActive={hasUserLocation}
          disabled={isLocating}
        />
      </div>

      {/* Fit All Control */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          ...liquidGlass.standard,
          borderRadius: radii.lg,
        }}
      >
        <ControlButton icon={<Maximize2 size={18} />} onClick={onFitAll} label="전체 보기" />
      </div>
    </div>
  );
});

interface ControlButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
}

function ControlButton({
  icon,
  onClick,
  label,
  isActive = false,
  disabled = false,
}: ControlButtonProps) {
  return (
    <m.button
      onClick={onClick}
      disabled={disabled}
      className="w-12 h-12 flex items-center justify-center transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-flame-500"
      style={{
        color: isActive ? colors.flame[500] : colors.text.secondary,
        background: isActive ? `${colors.flame[500]}10` : 'transparent',
      }}
      whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      title={label}
    >
      {icon}
    </m.button>
  );
}

export default MapControls;
