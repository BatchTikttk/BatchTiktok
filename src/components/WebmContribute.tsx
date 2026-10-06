import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Video, CheckCircle2, Loader2, Save, Lock, Crown, ChevronDown } from 'lucide-react';

// Data preset lengkap dengan gradien warna spesifik sesuai struktur kartu Discord
const PRESET_BACKGROUNDS = [
  { 
    id: 'lord-hades', 
    name: 'Lord Hades', 
    url: 'https://qu.ax/Kd5um.webm',
    gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)'
  },
  { 
    id: 'butterfly-waltz', 
    name: 'Butterfly Waltz', 
    url: 'https://qu.ax/fGDzx.webm',
    gradient: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)'
  },
  { 
    id: 'stalkers-1', 
    name: 'Stalkers 1', 
    url: 'https://qu.ax/mzL2s.webm',
    gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)'
  },
  { 
    id: 'stalkers-2', 
    name: 'Stalker 2', 
    url: 'https://qu.ax/G64Cg.webm',
    gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)'
  },
  { 
    id: 'animal', 
    name: 'Animal', 
    url: 'https://qu.ax/niCgt.webm',
    gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)'
  },
  { 
    id: 'lotties-cauldron', 
    name: "Lottie's Cauldron", 
    url: 'https://qu.ax/TWIbU.webm',
    gradient: 'linear-gradient(90deg, rgba(1, 49, 194, 0.1) 0%, rgba(1, 49, 194, 0.4) 100%)'
  },
  { 
    id: 'mantas', 
    name: 'MidnightMantis', 
    url: 'https://qu.ax/bmKDF.webm',
    gradient: 'linear-gradient(90deg, rgba(1, 49, 194, 0.1) 0%, rgba(1, 49, 194, 0.4) 100%)'
  },
  { 
    id: 'aries', 
    name: 'Aries', 
    url: 'https://qu.ax/wq4eK.webm',
    gradient: 'linear-gradient(90deg, rgba(144, 0, 7, 0.1) 0%, rgba(144, 0, 7, 0.4) 100%)'
  },
  { 
    id: 'ravens', 
    name: 'Ravens', 
    url: 'https://qu.ax/bQC0S.webm',
    gradient: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)'
  },
  { 
    id: 'light-wolf', 
    name: 'LightWolf', 
    url: 'https://qu.ax/PrsFr.webm',
    gradient: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)'
  },
  { 
    id: 'carberus', 
    name: 'Carberus', 
    url: 'https://qu.ax/Yf3Q0.webm',
    gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)'
  },
];

interface WebmContributeProps {
  onOpenUpgradeModal?: () => void;
  onSuccess?: () => void;
}

export default function WebmContribute({ onOpenUpgradeModal, onSuccess }: WebmContributeProps) {
  const [webmUrl, setWebmUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchCurrentBackground();
  }, []);

  const fetchCurrentBackground = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('card_bg_url, is_premium, is_admin')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setWebmUrl(data.card_bg_url || '');
        const hasAccess = Boolean(data.is_premium || data.is_admin);
        setIsAllowed(hasAccess);
      }
    }
    setFetching(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAllowed) {
      setMessage({ text: 'This feature is strictly for Premium or Admin members!', type: 'error' });
      if (onOpenUpgradeModal) onOpenUpgradeModal();
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage({ text: 'Error: You must be logged in first.', type: 'error' });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ card_bg_url: webmUrl })
      .eq('id', user.id);

    if (error) {
      setMessage({ text: `Failed to save: ${error.message}`, type: 'error' });
    } else {
      setMessage({ text: 'Top Contribute card background updated successfully!', type: 'success' });
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-6 text-center text-slate-500 font-medium">Loading data...</div>;

  const selectedPreset = PRESET_BACKGROUNDS.find(p => p.url === webmUrl);
  // Default gradient jika menggunakan URL kustom
  const currentGradient = selectedPreset?.gradient || 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)';

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm w-full max-w-3xl mx-auto relative overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Video size={28} strokeWidth={2.5} className="text-emerald-500 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Top Contribute Effect
              <span className="text-[11px] font-black text-amber-500 flex items-center gap-1 drop-shadow-sm ml-1">
                <Crown size={14} strokeWidth={2.5} /> VIP
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Select an exclusive WebM animation for your contributor card.</p>
          </div>
        </div>
      </div>

      {/* ACCESS WARNING */}
      {!isAllowed && (
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
            <Lock size={16} className="text-amber-600 flex-shrink-0" />
            <span>This feature is locked. Exclusive for <strong>Premium</strong> & <strong>Admin</strong> users.</span>
          </div>
          {onOpenUpgradeModal && (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex-shrink-0"
            >
              Upgrade
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* LIVE PREVIEW - DENGAN STRUKTUR WIDGET CARD DISCORD */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">
            Live Preview
          </label>
          {webmUrl ? (
            <div className="relative rounded-2xl overflow-hidden shadow-sm">
              <div 
                className="container_df39b2 relative w-full h-24 sm:h-[120px] flex items-center justify-center transition-all duration-300" 
                aria-hidden="true" 
                style={{ background: currentGradient }}
              >
                <div 
                  className="videoContainer_df39b2 w-full h-full flex items-center justify-center" 
                  style={{ maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 165.312px, rgb(0, 0, 0) 215.312px)' }}
                >
                  <video 
                    key={webmUrl}
                    tabIndex={-1} 
                    src={webmUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="img_df39b2 hover_df39b2 preview_df39b2 w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Ikon CheckCircle */}
              <CheckCircle2 
                size={22} 
                strokeWidth={2.5} 
                className="absolute top-3 right-3 z-20 text-emerald-400 drop-shadow-md" 
              />

              {selectedPreset && (
                <div className="absolute bottom-2.5 left-3 z-10 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-lg">
                  <span className="text-white text-[11px] font-bold tracking-wide">
                    {selectedPreset.name}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-24 sm:h-[120px] rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400">
              <Video size={24} className="mb-1 opacity-40" />
              <span className="text-xs font-semibold">No animation selected</span>
            </div>
          )}
        </div>

        {/* CUSTOM DROPDOWN COLLECTION - Lightweight */}
        <div className="relative z-30">
          <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">
            Animation Collection
          </label>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <span className={!selectedPreset ? "text-slate-400" : ""}>
              {selectedPreset ? selectedPreset.name : 'Select an animation...'}
            </span>
            <ChevronDown 
              size={18} 
              className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu Container */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)} 
              ></div>
              
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 max-h-60 overflow-y-auto">
                {PRESET_BACKGROUNDS.map((preset) => {
                  const isSelected = webmUrl === preset.url;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        if (!isAllowed) {
                          if (onOpenUpgradeModal) onOpenUpgradeModal();
                          return;
                        }
                        setWebmUrl(preset.url);
                        setIsDropdownOpen(false);
                      }}
                      className={`relative w-full flex items-center justify-between px-4 py-3.5 transition-all text-left border-b border-slate-50 last:border-0 ${
                        isSelected 
                          ? 'bg-slate-900 text-white font-bold' 
                          : 'bg-white hover:bg-slate-50 text-slate-700 font-medium'
                      } ${!isAllowed ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      <span className="relative z-10 text-xs truncate pr-2">
                        {preset.name}
                      </span>
                      
                      <span className="relative z-10 flex-shrink-0">
                        {!isAllowed ? (
                          <Lock size={14} className={isSelected ? 'text-amber-300' : 'text-amber-400'} />
                        ) : isSelected ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* CUSTOM URL */}
        <div className="relative z-20">
          <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">
            Or Custom WebM URL
          </label>
          <input
            type="url"
            disabled={!isAllowed}
            value={webmUrl}
            onChange={(e) => setWebmUrl(e.target.value)}
            placeholder={isAllowed ? "https://.../video.webm" : "Premium & Admin Members Only"}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400"
          />
        </div>

        {/* MESSAGES */}
        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' && <CheckCircle2 size={16} />}
            {message.text}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading || !webmUrl || !isAllowed}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : !isAllowed ? (
            <>
              <Lock size={18} className="text-amber-400" />
              Premium & Admin Only
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}