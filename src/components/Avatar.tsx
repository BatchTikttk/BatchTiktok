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
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(15).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(16).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(17).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(18).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(19).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(20).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(21).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(22).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(23).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(24).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(25).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(26).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(27).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(28).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(29).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Update%20New/Avatar(30).webp',
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
      {/* Changed to max-w-4xl to create a horizontal, widescreen (16:9) style layout */}
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 relative">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Select Character Avatar</h3>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Select the profile photo you want to use. Scroll down to see more options.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all border-none bg-transparent cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Container for Avatars */}
        <div className="overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar">
          {/* Expanded grid to 8 columns on medium screens for the horizontal look */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 my-1">
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
                    alt={`Character Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all border-none cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}