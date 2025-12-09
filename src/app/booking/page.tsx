'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n';
import BookingForm from '@/components/booking/BookingForm';
import CalendarPicker from '@/components/booking/CalendarPicker';

export default function BookingPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'select' | 'details' | 'confirm'>('select');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [partySize, setPartySize] = useState(2);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('details');
  };

  const handleBookingSubmit = (details: any) => {
    // In production, send to API
    console.log('Booking details:', { selectedDate, selectedTime, partySize, ...details });
    setStep('confirm');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('booking.title')}</h1>
          <p className="text-gray-600 mt-1">{t('booking.bookTable')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {step === 'select' && (
          <div className="space-y-6">
            <CalendarPicker onSelectDate={handleDateSelect} />
          </div>
        )}

        {step === 'details' && selectedDate && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">{t('booking.selectDate')}</div>
              <div className="font-semibold text-gray-900">
                {selectedDate.toLocaleDateString()}
              </div>
            </div>

            <BookingForm
              date={selectedDate}
              time={selectedTime}
              partySize={partySize}
              onTimeChange={setSelectedTime}
              onPartySizeChange={setPartySize}
              onSubmit={handleBookingSubmit}
              onBack={() => setStep('select')}
            />
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('booking.bookingConfirmed')}
              </h2>
              <p className="text-gray-600 mb-6">
                Your table has been reserved successfully
              </p>

              <div className="bg-purple-50 rounded-xl p-6 mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.bookingReference')}</span>
                    <span className="font-semibold text-gray-900">
                      BK-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.selectDate')}</span>
                    <span className="font-semibold text-gray-900">
                      {selectedDate?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.selectTime')}</span>
                    <span className="font-semibold text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.partySize')}</span>
                    <span className="font-semibold text-gray-900">
                      {partySize} {t('booking.guests')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-6">
                <p>✓ {t('booking.reminderSet')}</p>
                <p>✓ Confirmation email sent</p>
              </div>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
              >
                {t('common.back')} to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
