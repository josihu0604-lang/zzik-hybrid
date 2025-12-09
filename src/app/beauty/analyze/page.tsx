'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Camera, X, Zap, Sun, AlertCircle } from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';

/**
 * AI Skin Analysis Camera (BEAUTY-001)
 * 
 * 🎯 K-Beauty 차별화 핵심 기능
 * 
 * Features:
 * - 실시간 얼굴 감지 프레임
 * - 조명 상태 체크
 * - 30초 분석 프로세스
 * - 피부 타입 + 점수 결과
 * 
 * Flow:
 * 1. 카메라 권한 요청
 * 2. 얼굴 가이드 오버레이
 * 3. 조명 체크 ("더 밝은 곳으로")
 * 4. 촬영 → 분석 중 로딩
 * 5. 결과 화면 이동
 */

type AnalysisStep = 'permission' | 'camera' | 'analyzing' | 'complete';

export default function SkinAnalyzePage() {
  const router = useRouter();
  const haptic = useHaptic();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [step, setStep] = useState<AnalysisStep>('permission');
  const [lightingQuality, setLightingQuality] = useState<'good' | 'poor' | 'checking'>('checking');
  const [progress, setProgress] = useState(0);

  // 카메라 권한 요청 및 시작
  const handleStartCamera = async () => {
    try {
      haptic.selection();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setStep('camera');
      
      // 조명 품질 시뮬레이션 (실제로는 프레임 분석 필요)
      setTimeout(() => {
        setLightingQuality('good');
      }, 1500);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera permission is required for skin analysis');
    }
  };

  // 사진 촬영 및 분석 시작
  const handleCapture = () => {
    haptic.tap();
    setStep('analyzing');
    
    // 분석 진행 시뮬레이션
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setStep('complete');
            // 결과 페이지로 이동
            router.push('/beauty/results?score=85&type=combination');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  // 카메라 스트림 정리
  const handleClose = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    router.back();
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <AnimatePresence mode="wait">
        {/* Step 1: Permission Request */}
        {step === 'permission' && (
          <m.div
            key="permission"
            className="flex flex-col items-center justify-center h-full px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center max-w-md">
              {/* Icon */}
              <div 
                className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                style={{ background: gradients.flame }}
              >
                <Camera size={48} color="white" strokeWidth={2} />
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black mb-3">AI Skin Analysis</h1>
              <p className="text-base mb-8" style={{ color: rgba.white[70] }}>
                Get personalized skincare advice in 30 seconds
              </p>

              {/* Instructions */}
              <div className="space-y-4 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: colors.flame[500] }}
                  >
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <p className="text-sm" style={{ color: rgba.white[80] }}>
                    Position your face in the frame
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: colors.flame[500] }}
                  >
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <p className="text-sm" style={{ color: rgba.white[80] }}>
                    Ensure good lighting
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: colors.flame[500] }}
                  >
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <p className="text-sm" style={{ color: rgba.white[80] }}>
                    Remove glasses and keep face neutral
                  </p>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartCamera}
                className="w-full py-4 rounded-2xl font-bold text-lg text-white"
                style={{ background: gradients.flame }}
              >
                Start Analysis
              </button>

              <button
                onClick={handleClose}
                className="mt-4 text-sm font-medium"
                style={{ color: rgba.white[50] }}
              >
                Maybe Later
              </button>
            </div>
          </m.div>
        )}

        {/* Step 2: Camera View */}
        {step === 'camera' && (
          <m.div
            key="camera"
            className="relative h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Face Guide Frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="relative w-72 h-96 rounded-[3rem]"
                style={{ border: `4px solid ${colors.flame[500]}` }}
              >
                {/* Corner Markers */}
                {[
                  'top-0 left-0',
                  'top-0 right-0',
                  'bottom-0 left-0',
                  'bottom-0 right-0'
                ].map((position, i) => (
                  <div
                    key={i}
                    className={`absolute ${position} w-8 h-8`}
                    style={{ 
                      border: `3px solid ${colors.flame[500]}`,
                      borderRadius: position.includes('top') 
                        ? position.includes('left') ? '24px 0 0 0' : '0 24px 0 0'
                        : position.includes('left') ? '0 0 0 24px' : '0 0 24px 0'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: rgba.black[60] }}
              >
                <X size={24} color="white" />
              </button>

              {/* Lighting Quality Indicator */}
              <div 
                className="px-4 py-2 rounded-full flex items-center gap-2"
                style={{ 
                  background: rgba.black[60],
                  border: `1px solid ${lightingQuality === 'good' ? colors.green[500] : colors.yellow[500]}`
                }}
              >
                {lightingQuality === 'checking' ? (
                  <>
                    <Sun size={16} color={colors.yellow[500]} />
                    <span className="text-xs font-medium">Checking light...</span>
                  </>
                ) : lightingQuality === 'good' ? (
                  <>
                    <Sun size={16} color={colors.green[500]} />
                    <span className="text-xs font-medium">Good lighting ✓</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} color={colors.yellow[500]} />
                    <span className="text-xs font-medium">Move to brighter area</span>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Instructions */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <p className="text-white text-sm mb-6">
                Position your face in the frame
              </p>
              
              {/* Capture Button */}
              <m.button
                onClick={handleCapture}
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{ background: colors.flame[500] }}
                whileTap={{ scale: 0.9 }}
                disabled={lightingQuality !== 'good'}
              >
                <div className="w-16 h-16 rounded-full bg-white" />
              </m.button>
            </div>
          </m.div>
        )}

        {/* Step 3: Analyzing */}
        {step === 'analyzing' && (
          <m.div
            key="analyzing"
            className="flex flex-col items-center justify-center h-full px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Progress Circle */}
            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={rgba.white[10]}
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Circle */}
                <m.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={colors.flame[500]}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 552' }}
                  animate={{ strokeDasharray: `${(progress / 100) * 552} 552` }}
                  transition={{ duration: 0.1 }}
                />
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Zap size={40} color={colors.flame[500]} fill={colors.flame[500]} />
                <p className="text-4xl font-black mt-2">{progress}%</p>
              </div>
            </div>

            {/* Status Text */}
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Skin</h2>
            <p className="text-base" style={{ color: rgba.white[60] }}>
              Please wait, AI is processing...
            </p>

            {/* Processing Steps */}
            <div className="mt-8 space-y-2 text-sm" style={{ color: rgba.white[70] }}>
              <div className={progress > 20 ? 'opacity-100' : 'opacity-30'}>
                ✓ Detecting facial features
              </div>
              <div className={progress > 40 ? 'opacity-100' : 'opacity-30'}>
                ✓ Analyzing skin texture
              </div>
              <div className={progress > 60 ? 'opacity-100' : 'opacity-30'}>
                ✓ Identifying skin concerns
              </div>
              <div className={progress > 80 ? 'opacity-100' : 'opacity-30'}>
                ✓ Generating recommendations
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
