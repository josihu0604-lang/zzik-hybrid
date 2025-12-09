'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { verifyExperience } from '@/app/actions/k-experiences';
import { Loader2, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface VerificationModalProps {
  experienceId: string;
  isOpen: boolean;
  onClose: () => void;
  targetLat?: number | null;
  targetLng?: number | null;
}

export function VerificationModal({ experienceId, isOpen, onClose, targetLat, targetLng }: VerificationModalProps) {
  const [step, setStep] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const toast = useToast();

  const handleVerify = async () => {
    setStep('verifying');

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Client-side distance check (simulated for better UX, server should double check)
          if (targetLat && targetLng) {
            const dist = getDistanceFromLatLonInKm(latitude, longitude, targetLat, targetLng);
            if (dist > 0.5) { // 500m radius
                setErrorMessage(`You are too far away (${dist.toFixed(2)}km). Please move closer.`);
                setStep('error');
                return;
            }
          }

          // Call Server Action
          const result = await verifyExperience(experienceId, 'gps', {
            lat: latitude,
            lng: longitude,
            accuracy: position.coords.accuracy
          });

          if (result.error) {
            setErrorMessage(result.error);
            setStep('error');
          } else {
            setStep('success');
            toast.success("Verified!", "You have successfully verified your visit.");
          }
        },
        (error) => {
          setErrorMessage(error.message || 'Failed to get location');
          setStep('error');
        }
      );
    } catch (e: any) {
      setErrorMessage(e.message);
      setStep('error');
    }
  };

  const reset = () => {
      setStep('idle');
      setErrorMessage('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Visit">
      <div className="flex flex-col items-center justify-center p-4 space-y-6 text-center">
        
        {step === 'idle' && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                <MapPin className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <div>
                <p className="text-white text-lg font-medium">GPS Verification</p>
                <p className="text-slate-400 text-sm mt-1">We will check your current location to verify you are at the venue.</p>
            </div>
            <Button onClick={handleVerify} className="w-full bg-blue-500 hover:bg-blue-600">
                Start Verification
            </Button>
          </>
        )}

        {step === 'verifying' && (
            <>
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-white">Checking location...</p>
            </>
        )}

        {step === 'success' && (
            <>
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <div>
                    <h3 className="text-xl font-bold text-white">Verified!</h3>
                    <p className="text-slate-400 text-sm mt-2">Your visit has been confirmed.</p>
                </div>
                <Button onClick={onClose} variant="secondary" className="w-full">
                    Close
                </Button>
            </>
        )}

        {step === 'error' && (
            <>
                <XCircle className="w-16 h-16 text-red-500" />
                <div>
                    <h3 className="text-xl font-bold text-white">Verification Failed</h3>
                    <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
                </div>
                <div className="flex gap-2 w-full">
                    <Button onClick={onClose} variant="ghost" className="flex-1">Cancel</Button>
                    <Button onClick={reset} variant="secondary" className="flex-1">Try Again</Button>
                </div>
            </>
        )}
      </div>
    </Modal>
  );
}

// Helper: Haversine Formula (Client Side duplication for UX)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
