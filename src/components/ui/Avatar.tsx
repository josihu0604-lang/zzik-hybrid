'use client';

import { forwardRef, ImgHTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size' | 'src'> {
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  bordered?: boolean;
  ring?: boolean;
}

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
};

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      size = 'md',
      fallback,
      status,
      bordered = false,
      ring = false,
      ...props
    },
    ref
  ) => {
    const initials = fallback
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className={cn('relative inline-flex', className)}>
        <div
          className={cn(
            'relative rounded-full overflow-hidden',
            'bg-space-700 flex items-center justify-center',
            sizes[size],
            bordered && 'border-2 border-white/20',
            ring && 'ring-2 ring-flame-500 ring-offset-2 ring-offset-space-950'
          )}
        >
          {src ? (
            <Image
              src={src}
              alt={alt || 'Avatar'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              {...(props as any)} // Cast to any to avoid type mismatch with next/image props
            />
          ) : (
            <span className="font-medium text-white/70">
              {initials || (
                <svg className="w-1/2 h-1/2 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          )}
        </div>

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-space-950',
              statusColors[status],
              statusSizes[size]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group
interface AvatarGroupProps {
  avatars: { src?: string; fallback?: string; alt?: string }[];
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export function AvatarGroup({ avatars, max = 4, size = 'md', className }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          fallback={avatar.fallback}
          alt={avatar.alt}
          size={size}
          bordered
          className="ring-2 ring-space-950"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full bg-space-700 flex items-center justify-center',
            'border-2 border-space-950',
            'text-white/70 font-medium',
            sizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
