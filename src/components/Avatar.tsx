import { X, Check } from 'lucide-react';

export const AVATAR_LIST = [
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(1).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(2).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(3).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(4).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(5).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(6).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(7).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(8).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(9).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(10).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(11).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(12).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(13).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(14).webp',

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 relative">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Select Character Avatar</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Select the profile photo you want to use.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grid Avatar */}
        <div className="grid grid-cols-4 gap-3 my-1">
          {AVATAR_LIST.map((url, index) => {
            const isSelected = currentAvatar === url;
            return (
              <button
                key={index}
                onClick={() => {
                  onSelectAvatar(url);
                  onClose();
                }}
                className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer p-0 bg-slate-50 ${
                  isSelected
                    ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-95'
                    : 'border-slate-100 hover:border-emerald-400 hover:scale-105'
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

        {/* Footer Action */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all border-none cursor-pointer"
          >
            Cencel
          </button>
        </div>

      </div>
    </div>
  );
}