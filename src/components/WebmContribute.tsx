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

  if (fetching) return <div className="p-6 text-center text-slate-500">Loading data...</div>;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-2xl">
            <Video size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Top Contribute Card Effect
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown size={12} /> VIP / Premium
              </span>
            </h2>
            <p className="text-xs text-slate-500">Choose a WebM animation effect for your card background on the Top Contributors page.</p>
          </div>
        </div>
      </div>

      {/* Access Warning Banner */}
      {!isAllowed && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-between gap-3">
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
        {/* ANIMATION PRESET GALLERY */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            Animation Effects Collection
          </label>
          <div className="flex flex-col gap-4">
            {PRESET_BACKGROUNDS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  if (!isAllowed) {
                    if (onOpenUpgradeModal) onOpenUpgradeModal();
                    return;
                  }
                  setWebmUrl(preset.url);
                }}
                className={`relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                  webmUrl === preset.url 
                    ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'border-slate-200 hover:border-emerald-300'
                } ${!isAllowed ? 'opacity-75' : ''}`}
              >
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover z-0 opacity-70 group-hover:opacity-100 transition-opacity"
                >
                  <source src={preset.url} type="video/webm" />
                </video>
                
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center p-2 text-center">
                  <span className="text-white text-lg font-bold drop-shadow-md">
                    {preset.name}
                  </span>
                </div>

                {!isAllowed && (
                  <div className="absolute top-3 left-3 z-20 bg-black/60 text-amber-400 p-2 rounded-full">
                    <Lock size={16} />
                  </div>
                )}

                {webmUrl === preset.url && (
                  <div className="absolute top-3 right-3 z-20 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CUSTOM URL INPUT */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Or Custom WebM URL
          </label>
          <input
            type="url"
            disabled={!isAllowed}
            value={webmUrl}
            onChange={(e) => setWebmUrl(e.target.value)}
            placeholder={isAllowed ? "https://.../video.webm" : "Premium & Admin Members Only"}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' && <CheckCircle2 size={16} />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !webmUrl || !isAllowed}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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