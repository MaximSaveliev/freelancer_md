'use client';

import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
  rounded?: 'full' | '2xl';
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getColor(name?: string): string {
  const colors = [
    'bg-blue-500/20 text-blue-400',
    'bg-purple-500/20 text-purple-400',
    'bg-green-500/20 text-green-400',
    'bg-amber-500/20 text-amber-400',
    'bg-pink-500/20 text-pink-400',
    'bg-cyan-500/20 text-cyan-400',
    'bg-indigo-500/20 text-indigo-400',
    'bg-rose-500/20 text-rose-400',
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ src, name, size = 40, className = '', rounded = 'full' }: AvatarProps) {
  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-2xl';
  const fontSize = Math.max(10, Math.round(size * 0.35));
  const base = `${roundedClass} shrink-0 overflow-hidden`;

  if (src) {
    return (
      <div
        className={`${base} ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      >
        <Image
          src={src}
          alt={name || 'Avatar'}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      className={`${base} ${getColor(name)} flex items-center justify-center font-bold ${className}`}
      style={{ width: size, height: size, minWidth: size, fontSize }}
    >
      {getInitials(name)}
    </div>
  );
}
