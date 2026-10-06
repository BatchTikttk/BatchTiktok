import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Video, CheckCircle2, Loader2, Save, Lock, Crown } from 'lucide-react';

const PRESET_BACKGROUNDS = [
  { id: 'lord-hades', name: 'Lord Hades', url: 'https://qu.ax/Kd5um.webm' },
  { id: 'butterfly-waltz', name: 'Butterfly Waltz', url: 'https://qu.ax/fGDzx.webm' },
  { id: 'stalkers-1', name: 'Stalkers 1', url: 'https://qu.ax/mzL2s.webm' },
  { id: 'stalkers-2', name: 'Stalker 2', url: 'https://qu.ax/G64Cg.webm' },
  { id: 'animal', name: 'Animal', url: 'https://qu.ax/niCgt.webm' },
  { id: 'lotties-cauldron', name: "Lottie's Cauldron", url: 'https://qu.ax/TWIbU.webm' },
  // Aset Tambahan Baru
  { id: 'mantas', name: 'Mantas', url: 'https://qu.ax/bmKDF.webm' },
  { id: 'aries', name: 'Aries', url: 'https://qu.ax/wq4eK.webm' },
  { id: 'ravens', name: 'Ravens', url: 'https://qu.ax/bQC0S.webm' },
  { id: 'light-wolf', name: 'LightWolf', url: 'https://qu.ax/PrsFr.webm' },
  { id: 'carberus', name: 'Carberus', url: 'https://qu.ax/Yf3Q0.webm' },
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

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm w-full max-w-3xl mx-auto relative overflow-hidden">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
            <Video size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              Top Contribute Effect
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Crown size={12} /> VIP
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Select an exclusive WebM animation for your contributor card.</p>
          </div>
        </div>
      </div>

      {!isAllowed && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-amber-800 text-sm font-semibold">
            <Lock size={18} className="text-amber-600 flex-shrink-0" />
            <span>This feature is locked. Exclusive for <strong>Premium</strong> & <strong>Admin</strong> users.</span>
          </div>
          {onOpenUpgradeModal && (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex-shrink-0"
            >
              Upgrade
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* LIVE PREVIEW */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">
            Live Preview
          </label>
          {webmUrl ? (
            <div className="relative w-full h-28 sm:h-36 rounded-2xl overflow-hidden shadow-lg bg-slate-900 group">
              <video 
                key={webmUrl}
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover z-0"
              >
                <source src={webmUrl} type="video/webm" />
              </video>
              
              <div className="absolute top-3 right-3 z-20 bg-emerald-500 text-white rounded-full p-1.5 shadow-md">
                <CheckCircle2 size={16} />
              </div>

              {selectedPreset && (
                <div className="absolute bottom-3 left-4 z-10 bg-black/40 backdrop-blur-md px-3 py-1 rounded-xl">
                  <span className="text-white text-xs font-bold tracking-wide">
                    {selectedPreset.name}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-28 sm:h-36 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400">
              <Video size={28} className="mb-2 opacity-40" />
              <span className="text-sm font-semibold">No animation selected</span>
            </div>
          )}
        </div>

        {/* ANIMATION COLLECTION */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">
            Animation Collection
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  }}
                  className={`relative overflow-hidden flex items-center justify-between p-4 rounded-2xl transition-all text-left ${
                    isSelected 
                      ? 'bg-slate-900 text-white shadow-md transform scale-[1.02]' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  } ${!isAllowed ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {/* Efek WebM diputar di background tombol saat diselect */}
                  {isSelected && (
                    <>
                      <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
                      >
                        <source src={preset.url} type="video/webm" />
                      </video>
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent z-0"></div>
                    </>
                  )}

                  <span className="relative z-10 text-sm font-bold truncate pr-2">
                    {preset.name}
                  </span>
                  
                  <span className="relative z-10 flex-shrink-0">
                    {!isAllowed ? (
                      <Lock size={16} className={isSelected ? 'text-amber-300' : 'text-amber-400'} />
                    ) : isSelected ? (
                      <CheckCircle2 size={18} className="text-emerald-400 drop-shadow-md" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CUSTOM URL */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">
            Or Custom WebM URL
          </label>
          <input
            type="url"
            disabled={!isAllowed}
            value={webmUrl}
            onChange={(e) => setWebmUrl(e.target.value)}
            placeholder={isAllowed ? "https://.../video.webm" : "Premium & Admin Members Only"}
            className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 transition-all text-sm outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400"
          />
        </div>

        {/* ALERTS */}
        {message.text && (
          <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' && <CheckCircle2 size={18} />}
            {message.text}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading || !webmUrl || !isAllowed}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 px-6 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : !isAllowed ? (
            <>
              <Lock size={20} className="text-amber-400" />
              Premium & Admin Only
            </>
          ) : (
            <>
              <Save size={20} />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}