'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n';

interface BookingFormProps {
  date: Date;
  time: string;
  partySize: number;
  onTimeChange: (time: string) => void;
  onPartySizeChange: (size: number) => void;
  onSubmit: (details: any) => void;
  onBack: () => void;
}

const TIME_SLOTS = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30',
];

export default function BookingForm({
  date,
  time,
  partySize,
  onTimeChange,
  onPartySizeChange,
  onSubmit,
  onBack,
}: BookingFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, phone, email, specialRequests });
  };

  const canSubmit = name && phone && time;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Time Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">{t('booking.selectTime')}</h3>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onTimeChange(slot)}
              className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors ${
                time === slot
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Party Size */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">{t('booking.partySize')}</h3>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => onPartySizeChange(Math.max(1, partySize - 1))}
            className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
          >
            -
          </button>
          <span className="text-3xl font-bold text-gray-900">{partySize}</span>
          <button
            type="button"
            onClick={() => onPartySizeChange(Math.min(20, partySize + 1))}
            className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
          >
            +
          </button>
          <span className="text-gray-600 ml-4">{t('booking.guests')}</span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">{t('booking.contactInfo')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('booking.name')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('booking.phone')} *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="+82 10-1234-5678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('booking.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('booking.specialRequests')}
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              placeholder="Any special requests or dietary restrictions..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 px-6 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('common.back')}
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-colors ${
            canSubmit
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t('booking.confirmBooking')}
        </button>
      </div>
    </form>
  );
}
