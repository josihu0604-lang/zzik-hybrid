import { Suspense } from 'react';
import { getKExperiences } from '@/app/actions/k-experiences';
import { ExperienceCard } from '@/components/k-experience/ExperienceCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { FilterBar } from '@/components/k-experience/FilterBar';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function KExperiencesPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  
  const experiences = await getKExperiences(category);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold mb-2">K-Experiences</h1>
            <p className="text-muted-foreground">
                Discover verified K-Culture locations and events.
            </p>
        </div>
      </div>
      
      <FilterBar />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Suspense fallback={<ExperiencesSkeleton />}>
            {experiences && experiences.length > 0 ? (
                experiences.map((exp: any) => (
                    <ExperienceCard key={exp.id} experience={exp} />
                ))
            ) : (
                <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No experiences found for this category.</p>
                </div>
            )}
        </Suspense>
      </div>
    </div>
  );
}

function ExperiencesSkeleton() {
    return Array(4).fill(0).map((_, i) => (
        <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    ));
}
