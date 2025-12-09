'use client';

import { m } from 'framer-motion';

export function VibeGrid({ items }: { items: any[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/20">
        <p>No Vibes collected yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 pb-20">
      {items.map((item, i) => (
        <m.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-space-900 border border-white/5"
        >
          {/* Image */}
          <div className="absolute inset-0 bg-gray-800 animate-pulse" /> {/* Placeholder */}
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-[10px] text-flame-400 font-bold tracking-wider mb-1">
              {item.metadata.rarity}
            </p>
            <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
            <p className="text-[10px] text-white/50">{item.metadata.date}</p>
          </div>
        </m.div>
      ))}
    </div>
  );
}
