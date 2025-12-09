'use client';

import { useTranslation } from '@/i18n';

const features = [
  {
    id: 'pay',
    icon: '💳',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'play',
    icon: '🗺️',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100',
  },
  {
    id: 'beauty',
    icon: '✨',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    iconBg: 'bg-pink-100',
  },
];

export default function FeatureIntro() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <div
          key={feature.id}
          className={`${feature.bgColor} p-6 rounded-2xl border-2 border-gray-100`}
        >
          <div className="flex items-start space-x-4">
            <div
              className={`${feature.iconBg} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-3xl">{feature.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {t(`onboarding.${feature.id}Title`)}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {t(`onboarding.${feature.id}Desc`)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Key Benefits */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold mb-1">All in one app</div>
            <div className="text-sm opacity-90">Your perfect travel companion</div>
          </div>
          <div className="text-4xl">🚀</div>
        </div>
      </div>
    </div>
  );
}
