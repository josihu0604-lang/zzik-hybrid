'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'kpop', label: 'K-POP' },
  { id: 'kdrama', label: 'K-Drama' },
  { id: 'kbeauty', label: 'K-Beauty' },
  { id: 'kfood', label: 'K-Food' },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`/k-experiences?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={currentCategory === cat.id ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleCategoryChange(cat.id)}
          className="whitespace-nowrap"
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );
}
