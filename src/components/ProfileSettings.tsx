import { User, Sparkles, Crown, Lock, Check, Loader2 } from 'lucide-react';
import AvatarBorderVip, { VIP_BORDERS } from './AvatarBorderVip';

interface ProfileSettingsProps {
  userProfile: any;
  stats: { totalUploads: number };
  usernameInput: string;
  setUsernameInput: (val: string) => void;
  handleUpdateUsername: () => void;
  updatingUsername: boolean;
  activeUsername: string;
  setShowAvatarModal: (show: boolean) => void;
  handleSelectVipBorder: (url: string) => void;
}

export default function ProfileSettings({
  userProfile,
  stats,
  usernameInput,
  setUsernameInput,
  handleUpdateUsername,
  updatingUsername,
  setShowAvatarModal,
  handleSelectVipBorder
}: ProfileSettingsProps) {
  return (
    <div className="animate-in fade-in duration-300 max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Profile Settings</h2>
      <p className="text-xs text-slate-500 mb-8">Customize your appearance and account information</p>

      <div className="p-6 bg-slate-50 rounded-[32px] flex flex-col sm:flex-row items-center gap-6 mb-6">
        <div className="relative w-[88px] h-[88px] flex-shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white shadow-md relative z-10">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <User size={36} />
            )}
          </div>
          {userProfile?.is_premium && (
            <AvatarBorderVip 
              isPremium={userProfile?.is_premium} 
              borderUrl={userProfile?.vip_border_url} 
              progress={stats.totalUploads}
            />
          )}
        </div>

        <div className="text-center sm:text-left space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Character Avatar</h3>
            <p className="text-[11px] text-slate-500 mt-1">Choose an avatar to represent yourself.</p>
          </div>
          <button
            onClick={() => setShowAvatarModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-slate-700 text-xs font-bold rounded-full shadow-sm border border-slate-200 hover:border-[#10b981] hover:text-[#10b981] transition-all"
          >
            <Sparkles size={14} /> Change Avatar
          </button>
        </div>
      </div>

      {/* VIP BORDER SELECTOR */}
      <div className="p-6 bg-slate-50 rounded-[32px] mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Crown size={18} className="text-amber-500" /> VIP Avatar Border Selector
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Pilih bingkai avatar eksklusif untuk profil Anda (Khusus Akun Premium).</p>
          </div>
          {!userProfile?.is_premium && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
              <Lock size={12} /> Requires Premium
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {VIP_BORDERS.map((url, index) => {
            const isSelected = userProfile?.vip_border_url === url;
            const isPremium = !!userProfile?.is_premium;

            return (
              <div
                key={index}
                onClick={() => handleSelectVipBorder(url)}
                className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected && isPremium ? 'bg-amber-50/65 border-amber-400 shadow-md scale-105' : 'bg-white border-slate-200 hover:border-amber-300'
                } ${!isPremium ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white relative z-10">
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <AvatarBorderVip 
                    isPremium={true} 
                    borderUrl={url} 
                    progress={stats.totalUploads}
                    className="absolute top-[-16px] left-1/2 -translate-x-1/2 ml-[1px] w-[80px] h-auto max-w-none object-contain z-20 pointer-events-none" 
                  />
                </div>

                <span className="text-xs font-bold text-slate-700 mt-1">VIP Border {index + 1}</span>

                {isSelected && isPremium && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-0.5 shadow-sm"><Check size={12} /></span>
                )}
                {!isPremium && (
                  <span className="absolute top-2 right-2 text-slate-400"><Lock size={12} /></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Username</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:bg-white transition-all"
            />
            <button
              onClick={handleUpdateUsername}
              disabled={updatingUsername || usernameInput.trim() === activeUsername}
              className="px-6 py-3.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white text-sm font-bold rounded-2xl shadow-md transition-all flex-shrink-0 flex items-center justify-center min-w-[100px]"
            >
              {updatingUsername ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}