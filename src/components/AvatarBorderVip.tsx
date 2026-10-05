import React from 'react';

export interface AvatarBorderVipProps {
  isPremium?: boolean;
  borderUrl?: string;
  progress?: number;
  className?: string;
}

export const VIP_BORDERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=150&auto=format&fit=crop&q=80'
];

export default function AvatarBorderVip({ borderUrl, className = "absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none z-20 object-contain" }: AvatarBorderVipProps) {
  if (!borderUrl) return null;
  return (
    <img 
      src={borderUrl} 
      alt="VIP Border" 
      className={className} 
    />
  );
}