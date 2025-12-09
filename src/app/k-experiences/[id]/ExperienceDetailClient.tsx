'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Calendar, Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { VerificationModal } from '@/components/k-experience/VerificationModal';

interface Props {
  experience: any;
  title: string;
  description: string;
  addressText: string;
}

export function ExperienceDetailClient({ experience, title, description, addressText }: Props) {
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Image */}
      <div className="relative h-[40vh] w-full">
        {experience.cover_image ? (
          <Image
            src={experience.cover_image}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
            No Cover Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 container mx-auto">
           <Badge className="mb-2 bg-flame-500 text-white border-none">{experience.category}</Badge>
           <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{title}</h1>
           <div className="flex items-center gap-4 text-white/80 text-sm md:text-base">
             <div className="flex items-center gap-1">
               <MapPin className="w-4 h-4" />
               <span>{addressText}</span>
             </div>
             <div className="flex items-center gap-1">
               <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
               <span>{experience.rating || 'New'}</span>
             </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4 text-white">About</h2>
            <Card padding="lg" variant="glass">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-white">Location</h2>
            <Card padding="none" className="h-[300px] overflow-hidden bg-slate-800 relative">
               {/* Placeholder for Mapbox */}
               <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-flame-500" />
                    <p>Map View Loading...</p>
                    <p className="text-sm mt-1">{experience.location_lat}, {experience.location_lng}</p>
                  </div>
               </div>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-white">Gallery</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {experience.images && experience.images.length > 0 ? (
                    experience.images.map((img: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                            <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 col-span-full">No additional images.</p>
                )}
             </div>
          </section>
        </div>

        {/* Sidebar / Actions */}
        <div className="lg:col-span-1">
          <Card variant="glass" padding="lg" className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-1 text-white">Experience Verification</h3>
              <p className="text-sm text-slate-400">Verify your visit to earn points and badges.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-white">GPS Check-in</p>
                  <p className="text-xs text-slate-400">Available within 100m</p>
                </div>
                <CheckCircle2 className="w-5 h-5 ml-auto text-slate-600" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                 <div>
                  <p className="font-medium text-white">Date Verification</p>
                  <p className="text-xs text-slate-400">Visit during event period</p>
                </div>
              </div>
            </div>

            <Button 
                onClick={() => setIsVerifyOpen(true)}
                className="w-full bg-flame-500 hover:bg-flame-600 text-white font-bold h-12 text-lg"
            >
               Verify Visit
            </Button>
            
            <p className="text-xs text-center text-slate-500">
               Login required to save verification progress.
            </p>
          </Card>
        </div>
      </div>

      <VerificationModal 
        experienceId={experience.id} 
        isOpen={isVerifyOpen} 
        onClose={() => setIsVerifyOpen(false)}
        targetLat={experience.location_lat}
        targetLng={experience.location_lng}
      />
    </div>
  );
}
