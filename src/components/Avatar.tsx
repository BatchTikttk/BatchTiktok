import { X, Check } from 'lucide-react';

export const AVATAR_LIST = [
  // --- Data Avatar Original ---
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(1).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(2).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(3).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(4).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(5).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(6).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(7).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(8).webp',
  
  // --- Data Avatar Baru: Demon Slayer Upper Moon ---
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Demonslayer/UpperMoon%201.webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Demonslayer/UpperMoon%202.webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Demonslayer/UpperMoon%203.webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Demonslayer/UpperMoon%204.webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Demonslayer/UpperMoon%206.webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Demonslayer/UpperMoon%207.webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Demonslayer/UpperMoon%208.webp'
];

interface AvatarModalProps {
  currentAvatar?: string | null;
  onSelectAvatar: (url: string) => void;
  onClose: () => void;
}

export default function AvatarModal({ 
  currentAvatar, 
  onSelectAvatar, 
  onClose 
}: AvatarModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#121212] rounded-3xl max-w-md w-full p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)] border-none flex flex-col gap-5 relative">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Demon Slayer Upper Moon & Classic</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Select the profile photo you want to use.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grid Avatar dengan Scrollbar */}
        <div className="overflow-y-auto max-h-[60vh] pr-2 -mr-2">
          <div className="grid grid-cols-4 gap-3 py-1">
            {AVATAR_LIST.map((url, index) => {
              const isSelected = currentAvatar === url;
              return (
                <button
                  key={index}
                  onClick={() => {
                    onSelectAvatar(url);
                    onClose();
                  }}
                  className={`relative group aspect-square rounded-2xl overflow-hidden transition-all cursor-pointer p-0 bg-slate-800 border-none shadow-sm ${
                    isSelected
                      ? 'ring-4 ring-emerald-500/70 scale-95'
                      : 'hover:ring-2 hover:ring-emerald-400 hover:scale-105'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Avatar Karakter ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Indikator Terpilih */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-2 border-t border-slate-800/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-all border-none cursor-pointer shadow-sm"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}