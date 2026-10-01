import { X, Check } from 'lucide-react';

export const CLASSIC_AVATARS = [
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(1).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(2).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(3).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(4).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(5).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(6).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(7).webp',
  'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(8).webp'
];

export const DEMON_SLAYER_AVATARS = [
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
  
  // Mengelompokkan data untuk mempermudah render
  const avatarCategories = [
    { title: 'Classic Avatars', data: CLASSIC_AVATARS },
    { title: 'Demon Slayer Upper Moon', data: DEMON_SLAYER_AVATARS }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 relative">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Select Character Avatar</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Select the profile photo you want to use.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all border-none bg-transparent cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* List Kategori Avatar dengan Scrollbar */}
        <div className="overflow-y-auto max-h-[65vh] pr-2 -mr-2 flex flex-col gap-6">
          {avatarCategories.map((category, catIndex) => (
            <div key={catIndex}>
              {/* Judul Kategori */}
              <div className="flex items-center gap-3 mb-4">
                <h4 className="text-sm font-bold text-slate-700 whitespace-nowrap">
                  {category.title}
                </h4>
                <div className="h-px w-full bg-slate-100"></div>
              </div>
              
              {/* Grid Avatar (Diperbesar dengan gap-4) */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {category.data.map((url, index) => {
                  const isSelected = currentAvatar === url;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        onSelectAvatar(url);
                        onClose();
                      }}
                      className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer p-0 bg-slate-50 shadow-sm ${
                        isSelected
                          ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-95'
                          : 'border-slate-100 hover:border-emerald-400 hover:scale-105 hover:shadow-md'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${category.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Indikator Terpilih */}
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
          ))}
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
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