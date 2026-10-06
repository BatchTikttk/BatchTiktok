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
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-2xl">
            <Video size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Top Contribute Effect
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown size={12} /> VIP
              </span>
            </h2>
            <p className="text-xs text-slate-500">Select an exclusive WebM animation for your contributor card.</p>
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
        
        {/* LIVE PREVIEW - PROPOSIONAL BANNER ASPECT RATIO */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">
            Live Preview
          </label>
          {webmUrl ? (
            <div className="relative w-full aspect-[3.2/1] max-h-32 sm:max-h-36 rounded-2xl overflow-hidden shadow-sm bg-slate-950 flex items-center justify-center">
              <video 
                key={webmUrl}
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover object-center"
              >
                <source src={webmUrl} type="video/webm" />
              </video>
              
              <div className="absolute top-2.5 right-2.5 z-20 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                <CheckCircle2 size={14} />
              </div>

              {selectedPreset && (
                <div className="absolute bottom-2.5 left-3 z-10 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-lg">
                  <span className="text-white text-[11px] font-bold tracking-wide">
                    {selectedPreset.name}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[3.2/1] max-h-32 sm:max-h-36 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400">
              <Video size={24} className="mb-1 opacity-40" />
              <span className="text-xs font-semibold">No animation selected</span>
            </div>
          )}
        </div>

        {/* ANIMATION COLLECTION */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">
            Animation Collection
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                  className={`relative overflow-hidden flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    isSelected 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  } ${!isAllowed ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {/* WebM Background saat terpilih tanpa merusak bentuk tombol */}
                  {isSelected && (
                    <>
                      <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-30"
                      >
                        <source src={preset.url} type="video/webm" />
                      </video>
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-0"></div>
                    </>
                  )}

                  <span className="relative z-10 text-xs font-bold truncate pr-2">
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
        </div>

        {/* CUSTOM URL */}
        <div>
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