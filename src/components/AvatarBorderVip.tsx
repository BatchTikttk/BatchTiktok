interface AvatarBorderVipProps {
  isPremium: boolean;
  level?: 1 | 2 | 3 | 4; // You can specify which VIP border to use (1-4)
  className?: string;
}

// List of VIP border URLs provided from the Supabase bucket
const VIP_BORDERS = {
  1: "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%201.webp",
  2: "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%202.webp",
  3: "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%203.webp",
  4: "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/VIP%20BORDER%20AVATAR%20NEW/VIP%204.webp",
};

export default function AvatarBorderVip({ 
  isPremium, 
  level = 1, // Default to VIP 1 if level is not provided
  // Menambahkan ml-[4px] untuk menggeser sedikit ke kanan
  className = "absolute top-[-28px] left-1/2 -translate-x-1/2 ml-[4px] w-[124px] h-auto max-w-none object-contain z-20 pointer-events-none" 
}: AvatarBorderVipProps) {
  
  // If the user is not premium (FALSE), return null so the border is not rendered
  if (!isPremium) return null;

  // Get the image URL based on the provided level, fallback to level 1 if invalid
  const borderUrl = VIP_BORDERS[level] || VIP_BORDERS[1];

  return (
    <img 
      src={borderUrl}
      alt={`VIP Border Level ${level}`}
      className={className}
    />
  );
}