import { notFound } from 'next/navigation';
import { getKExperienceById } from '@/app/actions/k-experiences';
import { ExperienceDetailClient } from './ExperienceDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { id } = await params;
  const experience = await getKExperienceById(id);

  if (!experience) {
    notFound();
  }

  const locale = 'en';
  const getLocalized = (json: any) => json?.[locale] || json?.['en'] || json?.['ko'] || '';
  const title = getLocalized(experience.title);
  const description = getLocalized(experience.description);
  const addressText = getLocalized(experience.address) || experience.address?.city || 'Location';

  return (
    <ExperienceDetailClient 
        experience={experience} 
        title={title} 
        description={description} 
        addressText={addressText} 
    />
  );
}
