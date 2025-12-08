'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from '@/i18n/LanguageProvider';

export default function PartnerDashboardClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!isLoading && !user) {
      router.push('/login?redirect=/partner/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">{t('common.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('partner.dashboard')}</h1>
          <button className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-pink-600/20">
            + {t('partner.createExperience')}
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardCard title={t('partner.stats.activeExperiences')} value="0" icon="🎭" />
          <DashboardCard title={t('partner.stats.totalBookings')} value="0" icon="📅" />
          <DashboardCard title={t('partner.stats.totalEarnings')} value="$0" icon="💰" />
          <DashboardCard title={t('partner.stats.pendingReviews')} value="0" icon="⭐" />
        </div>

        {/* Recent Activity / Empty State */}
        <h2 className="text-xl font-bold mb-4">{t('partner.manageExperiences')}</h2>
        <div className="bg-neutral-800 rounded-xl p-12 text-center border border-white/10 flex flex-col items-center justify-center min-h-[300px]">
          <span className="text-5xl mb-4">✨</span>
          <p className="text-gray-400 mb-6 text-lg">{t('kexperience.noExperiences')}</p>
          <button className="text-pink-500 hover:text-pink-400 font-bold bg-pink-500/10 px-6 py-3 rounded-full hover:bg-pink-500/20 transition-all">
            {t('partner.createExperience')}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon }: { title: string, value: string, icon: string }) {
  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-white/5 hover:border-pink-500/30 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
