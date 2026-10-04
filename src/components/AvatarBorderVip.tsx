interface AvatarBorderVipProps {
  isPremium: boolean;
  borderUrl?: string | null; // Menerima URL bingkai pilihan user
  className?: string;
}

// Kumpulan URL Border VIP dalam bentuk Array (tanpa level)
export const VIP_BORDERS = [
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%201.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%202.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%203.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%204.webp",
];

export default function AvatarBorderVip({ 
  isPremium, 
  borderUrl, 
  className = "absolute top-[-28px] left-1/2 -translate-x-1/2 ml-[2px] w-[124px] h-auto max-w-none object-contain z-20 pointer-events-none" 
}: AvatarBorderVipProps) {
  
  // Jangan render apapun jika user bukan premium atau belum memilih border
  if (!isPremium || !borderUrl) return null;

  return (
    <img 
      src={borderUrl}
      alt="VIP Avatar Border"
      className={className}
    />
  );
}