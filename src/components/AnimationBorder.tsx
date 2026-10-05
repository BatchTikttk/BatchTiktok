import { useState } from 'react';
import { Lock, Check, Sparkles, Trophy, ImageOff } from 'lucide-react';

interface BorderItem {
  id: string;
  name: string;
  imageUrl: string;
  requiredProgress: number;
}

// Daftar 33 Link Animasi Border Supabase dengan Kelipatan 10 Upload
const BORDER_COLLECTION: BorderItem[] = [
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Angry.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/animated2.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/BlackWing.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/venom.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/spider.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/animated.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/TigerCute.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/BeautyButter.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/CrystalCrown.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/CuteMagic.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Croppy.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/StyxSpirits.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Doggy.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/DopinRainbow.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Fairytile.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Gardeer's%20Friend.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/GoticHat.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/LeafyLoaf.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/LittleTwinstar.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/LordOfTheDead.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/MidnightMantas.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Motyxia.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Pirrates.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Racoon.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/RoseViligrie.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Shark.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/silent.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/snipet.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/BlackWidow.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Demon.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/cathoodi.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/clone.webp",
  "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/AnimationBorder/Stalkers.webp"
].map((url, index) => {
  // Ekstrak nama file dari URL
  const filename = decodeURIComponent(url.split('/').pop() || '')
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ');

  return {
    id: `border-${index + 1}`,
    name: filename,
    imageUrl: url,
    requiredProgress: (index + 1) * 10 // Kelipatan 10 upload
  };
});

interface AnimationBorderProps {
  userProgress?: number;
  equippedBorderUrl?: string | null;
  userAvatarUrl?: string | null;
  isAdmin?: boolean; // Tambahan prop untuk mengecek apakah user adalah admin
  onSelectBorder?: (borderUrl: string | null) => void;
}

const AnimationBorder = ({
  userProgress = 0,
  equippedBorderUrl = null,
  userAvatarUrl = null,
  isAdmin = false, // Nilai default false
  onSelectBorder,
}: AnimationBorderProps) => {
  const [activeBorder, setActiveBorder] = useState<string | null>(equippedBorderUrl);

  const handleEquipBorder = (imageUrl: string, isUnlocked: boolean) => {
    if (!isUnlocked) return;

    // Klik ulang border yang sama untuk melepas (unequip)
    const newEquipped = activeBorder === imageUrl ? null : imageUrl;
    setActiveBorder(newEquipped);

    if (onSelectBorder) {
      onSelectBorder(newEquipped);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Animated Avatar Border Collection</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Every 10 uploaded File will unlock one new animated avatar border.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 font-bold text-xs">
          <Trophy size={16} />
          <span>{isAdmin ? 'Admin Access' : `Progress Upload: ${userProgress} Video`}</span>
        </div>
      </div>

      {/* Grid Koleksi Border */}
      {BORDER_COLLECTION.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <ImageOff className="w-10 h-10 text-slate-300" />
          <span className="text-sm font-semibold">Tidak ada border yang ditemukan.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {BORDER_COLLECTION.map((border) => {
            // Logika utama: Terbuka jika user adalah admin ATAU progress mencukupi
            const isUnlocked = isAdmin || userProgress >= border.requiredProgress;
            const isEquipped = activeBorder === border.imageUrl;

            // Hitung persentase progress (Maksimal 100%)
            const progressPercent = Math.min(
              100,
              Math.floor((userProgress / border.requiredProgress) * 100)
            );

            return (
              <div
                key={border.id}
                onClick={() => handleEquipBorder(border.imageUrl, isUnlocked)}
                className={`relative group rounded-2xl p-4 transition-all flex flex-col items-center text-center border overflow-hidden ${
                  isUnlocked
                    ? 'bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-slate-200 hover:border-emerald-400 hover:shadow-md'
                    : 'bg-slate-50/50 border-slate-100 opacity-80 cursor-not-allowed'
                } ${isEquipped ? 'ring-2 ring-emerald-500 bg-emerald-50/30 border-emerald-300' : ''}`}
              >
                {/* Badge Status Pakai */}
                {isEquipped && (
                  <div className="absolute top-2 right-2 z-10 bg-emerald-500 text-white p-1 rounded-full shadow-sm">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Preview Avatar & Border (Proporsional 1:1) */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 my-2 flex items-center justify-center aspect-square">
                  {/* Gambar Animasi Border Original */}
                  <img
                    src={border.imageUrl}
                    alt={border.name}
                    className={`absolute inset-0 w-full h-full object-contain z-10 pointer-events-none drop-shadow-sm ${
                      !isUnlocked ? 'grayscale blur-[0.5px]' : ''
                    }`}
                  />

                  {/* FOTO AVATAR KARAKTER: Ukuran diperbesar ke 85% & di-zoom dengan scale-125 */}
                  <div className="w-[85%] h-[85%] rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400 text-xs font-bold">
                    {userAvatarUrl ? (
                      <img
                        src={userAvatarUrl}
                        alt="User Avatar"
                        className="w-full h-full object-cover scale-125"
                      />
                    ) : (
                      <span>User</span>
                    )}
                  </div>

                  {/* Overlay Icon Lock Jika Terkunci */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 rounded-2xl backdrop-blur-[1px]">
                      <div className="p-2 bg-slate-800/80 rounded-full text-white shadow-md">
                        <Lock size={16} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Nama Border */}
                <span className="font-bold text-xs text-slate-800 line-clamp-1 mt-1 capitalize">
                  {border.name}
                </span>

                {/* Status Progress */}
                <div className="w-full mt-3">
                  {isUnlocked ? (
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block ${
                      isEquipped ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isEquipped ? 'Selected' : 'Use'}
                    </span>
                  ) : (
                    <div className="w-full flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>{userProgress}/{border.requiredProgress} Video</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnimationBorder;