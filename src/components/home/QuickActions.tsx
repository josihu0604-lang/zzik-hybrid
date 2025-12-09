'use client';

import { m } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Sparkles,
  Clock,
  TrendingUp,
  Gift,
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  bgColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'nearby',
    icon: <MapPin className="w-5 h-5" />,
    label: 'Nearby',
    href: '/map',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'booking',
    icon: <Calendar className="w-5 h-5" />,
    label: 'Book Table',
    href: '/booking',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'ai-curation',
    icon: <Sparkles className="w-5 h-5" />,
    label: 'AI Picks',
    href: '/ai/recommendations',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 'waiting',
    icon: <Clock className="w-5 h-5" />,
    label: 'Wait List',
    href: '/play/waiting',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'trending',
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Trending',
    href: '/play?filter=trending',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'rewards',
    icon: <Gift className="w-5 h-5" />,
    label: 'Rewards',
    href: '/rewards',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
];

export default function QuickActions() {
  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4 px-6">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-4 px-6">
        {QUICK_ACTIONS.map((action, index) => (
          <m.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
            >
              <div
                className={`${action.bgColor} ${action.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}
              >
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                {action.label}
              </span>
            </Link>
          </m.div>
        ))}
      </div>
    </div>
  );
}
