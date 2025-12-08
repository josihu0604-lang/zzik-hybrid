'use client';

import { useEffect, useState } from 'react';

/**
 * usePerformanceMode Hook
 * 
 * 기기의 성능(CPU 코어 수, 메모리, 배터리 상태)을 감지하여
 * 저사양 환경일 경우 'low-power' 모드를 활성화합니다.
 */
export function usePerformanceMode() {
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkPerformance = async () => {
      // 1. Hardware Concurrency (CPU Cores)
      const cores = navigator.hardwareConcurrency || 4;
      
      // 2. Device Memory (RAM in GB) - Chrome only
      // @ts-expect-error - deviceMemory is not standard yet
      const ram = navigator.deviceMemory || 4;

      // 3. Low Power Mode Criteria
      // - 코어 4개 미만 또는 램 4GB 미만이면 저사양으로 간주
      const isHardwareLowSpec = cores < 4 || ram < 4;

      // 4. Save Data Mode (Lite Mode)
      // @ts-expect-error - connection is not standard yet
      const isSaveData = navigator.connection?.saveData === true;

      if (isHardwareLowSpec || isSaveData) {
        setIsLowPower(true);
        document.documentElement.classList.add('low-power');
      } else {
        document.documentElement.classList.remove('low-power');
      }
    };

    checkPerformance();
  }, []);

  return isLowPower;
}

export function PerformanceMonitor() {
  usePerformanceMode();
  return null;
}
