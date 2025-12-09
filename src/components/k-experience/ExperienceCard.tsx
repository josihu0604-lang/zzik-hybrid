import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ExperienceCardProps {
  experience: {
    id: string;
    title: any;
    category: string;
    cover_image: string | null;
    rating: number | null;
    review_count: number | null;
    location_lat: number | null;
    location_lng: number | null;
    address: any;
    is_verified?: boolean | null;
  };
  locale?: string;
}

export function ExperienceCard({ experience, locale = 'en' }: ExperienceCardProps) {
  // Helper to get localized string
  const getLocalized = (json: any) => {
    if (!json) return '';
    return json[locale] || json['en'] || json['ko'] || '';
  };

  const title = getLocalized(experience.title);
  const addressText = getLocalized(experience.address) || experience.address?.city || '';

  return (
    <Card 
      className="overflow-hidden group h-full flex flex-col" 
      padding="none" 
      variant="glass"
      hover
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
        {experience.cover_image ? (
          <Image
            src={experience.cover_image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
            No Image
          </div>
        )}
        <div className="absolute top-2 left-2">
            <Badge variant="flame" className="uppercase text-xs font-bold backdrop-blur-md border-0 text-white">
                {experience.category}
            </Badge>
        </div>
        {experience.is_verified && (
            <div className="absolute top-2 right-2">
                <Badge variant="success" className="text-white hover:bg-green-600 gap-1 border-0">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                </Badge>
            </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1 text-white">{title}</h3>
        </div>
        
        <div className="flex items-center text-sm text-slate-400 gap-1 mb-4">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{addressText}</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-white">{experience.rating || 'New'}</span>
                {experience.review_count ? (
                    <span className="text-slate-500 text-xs">({experience.review_count})</span>
                ) : null}
            </div>
            
            <Link href={`/k-experiences/${experience.id}`}>
                <Button size="sm" variant="primary">View</Button>
            </Link>
        </div>
      </div>
    </Card>
  );
}
