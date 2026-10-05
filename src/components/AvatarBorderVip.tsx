export interface AvatarBorderVipProps {
  isPremium?: boolean;
  borderUrl?: string;
  progress?: number;
  className?: string;
}

export const VIP_BORDERS = [
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%201.webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%202.webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%203.webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%204.webp'
];

export default function AvatarBorderVip({ 
  borderUrl, 
  // Ukuran diperkecil ke 120% agar lebih pas/zoom-out sedikit, posisi presisi tetap dipertahankan
  className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] w-[120%] h-[120%] max-w-none pointer-events-none z-20 object-contain" 
}: AvatarBorderVipProps) {
  if (!borderUrl) return null;

  return (
    <img 
      src={borderUrl} 
      alt="VIP Border" 
      className={className} 
    />
  );
}