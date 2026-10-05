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
  // Ukuran diperbesar ke 145% agar lingkaran dalam border pas berada di luar tepi foto avatar
  className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] w-[145%] h-[145%] max-w-none pointer-events-none z-20 object-contain" 
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