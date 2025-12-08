'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/LanguageProvider';
import { useRouter } from 'next/navigation';

export default function CreateExperienceClient() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'kpop',
    price: '',
    currency: 'USD',
    location: '',
    images: [] as File[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real implementation: upload images, then call API to save data
    alert('Experience created successfully! (Mock)');
    router.push('/partner/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 pt-20">
      <div className="max-w-3xl mx-auto bg-neutral-800 rounded-2xl p-8 border border-white/10">
        <h1 className="text-2xl font-bold mb-6">{t('partner.createExperience')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="e.g., K-Pop Dance Masterclass"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
              >
                <option value="kpop">K-Pop</option>
                <option value="kdrama">K-Drama</option>
                <option value="kbeauty">K-Beauty</option>
                <option value="kfood">K-Food</option>
                <option value="kfashion">K-Fashion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                placeholder="Describe your experience..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="KRW">KRW</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="e.g., Gangnam, Seoul"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-pink-600 hover:bg-pink-700 px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-pink-600/20 disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : 'Create Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
