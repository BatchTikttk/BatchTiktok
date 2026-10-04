import { useState, useEffect } from 'react';
import { X, Cloud, Box, Download, User, Volume2, VolumeX, Crown } from 'lucide-react';
import { EmeraldFolderIcon } from './SharedIcons'; 
import { supabase } from '../supabase';

const MOCK_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";
const BANNED_LOGO_URL = "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/BannedLogo.webp";

// Interface TypeScript menggunakan any agar fleksibel dan tidak error saat build
interface PreviewModalProps {
  item: any;
  onClose: () => void;
  onDownload: (source: string, url: string, id: any) => void;
  uploaderCount?: number;
  onSelectCreator?: (creatorName: string) => void;
}

const PreviewModal = ({ item, onClose, onDownload, uploaderCount = 0, onSelectCreator }: PreviewModalProps) => {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  
  const [uploaderAvatar, setUploaderAvatar] = useState<string | null>(
    item?.uploader_avatar || item?.avatar_url || null
  );
  const [uploaderIsAdmin, setUploaderIsAdmin] = useState<boolean>(item?.uploader_is_admin || false);

  const getAchievementBadge = (count: number) => {
    if (uploaderIsAdmin) return null; 
    
    if (count >= 200) return { title: 'Legend Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Legend.webp' };
    if (count >= 100) return { title: 'Elite Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Elite.webp' };
    if (count >= 50) return { title: 'Gold Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Gold.webp' };
    if (count >= 30) return { title: 'Silver Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Silver.webp' };
    if (count >= 10) return { title: 'Bronze Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Bronze.webp' };
    
    return null;
  };

  const badge = getAchievementBadge(uploaderCount);

  // Handler navigasi ke Halaman Detail Kreator
  const handleCreatorClick = (creatorName?: string) => {
    const targetName = creatorName || item?.username || item?.uploaded_by;
    if (!targetName) return;

    if (onClose) onClose();

    if (onSelectCreator) {
      onSelectCreator(targetName);
    } else {
      window.history.pushState({}, '', `/creator/${encodeURIComponent(targetName)}`);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Handler klik download untuk insert ke download_count
  const handleDownloadClick = async (source: string, url: string, id: any) => {
    onDownload(source, url, id);
    
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('download_count')
        .eq('id', id)
        .single();
        
      if (!error) {
        const currentCount = data?.download_count || 0;
        await supabase
          .from('batches')
          .update({ download_count: currentCount + 1 })
          .eq('id', id);
      }
    } catch (err) {
      console.error("Gagal menambahkan download count", err);
    }
  };

  useEffect(() => {
    let channel: any;

    if (item?.uploader_avatar || item?.avatar_url) {
      setUploaderAvatar(item.uploader_avatar || item.avatar_url);
    }
    if (item?.uploader_is_admin !== undefined) {
      setUploaderIsAdmin(item.uploader_is_admin);
    }

    const fetchUploaderProfile = async () => {
      if (!item) return;

      let profileData: any = null;

      if (item.user_id) {
        const { data } = await supabase
          .from('profiles')
          .select('id, avatar_url, is_admin')
          .eq('id', item.user_id)
          .maybeSingle();

        if (data) profileData = data;
      }

      if (!profileData && item.uploaded_by) {
        const targetName = item.uploaded_by.trim();
        const { data } = await supabase
          .from('profiles')
          .select('id, avatar_url, is_admin')
          .or(`username.ilike."${targetName}",full_name.ilike."${targetName}"`)
          .limit(1);

        if (data && data.length > 0) profileData = data[0];
      }

      if (profileData) {
        if (profileData.avatar_url !== undefined) setUploaderAvatar(profileData.avatar_url);
        if (profileData.is_admin !== undefined) setUploaderIsAdmin(profileData.is_admin);

        channel = supabase
          .channel(`public:profiles:uploader_${profileData.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${profileData.id}`,
            },
            (payload: any) => {
              if (payload?.new) {
                if (payload.new.avatar_url !== undefined) {
                  setUploaderAvatar(payload.new.avatar_url);
                }
                if (payload.new.is_admin !== undefined) {
                  setUploaderIsAdmin(payload.new.is_admin);
                }
              }
            }
          )
          .subscribe();
      }
    };

    fetchUploaderProfile();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [item?.id, item?.user_id, item?.uploaded_by, item?.uploader_avatar, item?.avatar_url, item?.uploader_is_admin]);

  if (!item) return null;

  const videoUrl = item.video_url || MOCK_VIDEO_URL;
  const isTikTokLink = videoUrl.includes("tiktok.com");

  const getTikTokEmbedUrl = (url: string) => {
    try {
      const match = url.match(/\/video\/(\d+)/);
      if (match && match[1]) {
        return `https://www.tiktok.com/embed/v2/${match[1]}`;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const tikTokEmbedUrl = isTikTokLink ? getTikTokEmbedUrl(videoUrl) : null;
  
  // Smart logic untuk sinkronisasi link exclusive_url & download_url tanpa merubah struktur UI
  let finalGdriveLink = item.gdrive_url || '';
  let finalTeraboxLink = item.terabox_url || '';

  // Fallback map data exclusive_url atau download_url jika terisi dari database
  if (item.is_exclusive && item.exclusive_url) {
    if (item.exclusive_url.includes('drive.google')) finalGdriveLink = item.exclusive_url;
    else if (item.exclusive_url.includes('tera')) finalTeraboxLink = item.exclusive_url;
    else if (!finalGdriveLink) finalGdriveLink = item.exclusive_url;
  } else if (!item.is_exclusive && item.download_url) {
    if (item.download_url.includes('drive.google')) finalGdriveLink = item.download_url;
    else if (item.download_url.includes('tera')) finalTeraboxLink = item.download_url;
    else if (!finalGdriveLink) finalGdriveLink = item.download_url;
  }

  const hasGdrive = Boolean(finalGdriveLink && finalGdriveLink.trim() !== '');
  const hasTerabox = Boolean(finalTeraboxLink && finalTeraboxLink.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-[850px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all shadow-sm">
          <X size={20} />
        </button>

        <div className="w-full md:w-[300px] bg-black relative flex-shrink-0 flex items-center justify-center min-h-[320px] md:min-h-[540px]">
          
          {isTikTokLink && tikTokEmbedUrl ? (
            <iframe 
              src={tikTokEmbedUrl} 
              className="absolute inset-0 w-full h-full border-none"
              allowFullScreen
              allow="encrypted-media"
            ></iframe>
          ) : (
            <>
              <video 
                src={videoUrl} 
                autoPlay 
                loop 
                muted={isMuted} 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover opacity-90" 
              />
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }} 
                className="absolute top-4 left-4 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all shadow-sm"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
            <h4 
              onClick={(e) => {
                e.stopPropagation();
                handleCreatorClick(item.username);
              }}
              className="font-bold text-lg drop-shadow-md flex items-center gap-2 pointer-events-auto cursor-pointer hover:text-emerald-400 transition-colors"
            >
              {item.username}
            </h4>
            <p className="text-xs text-white/90 line-clamp-2 mt-1 drop-shadow-md">
              Sample preview from {item.country} TikTok batch archive. Watermark-free HD quality. ⚡
            </p>
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-8 flex flex-col bg-white overflow-y-auto">
          <div className="mb-6 flex items-start gap-4">
            
            {/* Folder Container - Otomatis ganti warna & memakai mahkota jika is_exclusive */}
            <div 
              className="flex-shrink-0 pt-1 relative drop-shadow-sm" 
              title={item.is_exclusive ? "TikTok Exclusive Collection" : ""}
            >
              <EmeraldFolderIcon className="w-12 h-12 drop-shadow-sm" country={item.country} isExclusive={item.is_exclusive} />
              
              {item.is_exclusive && (
                <div 
                  className="absolute -top-[14px] -left-[6px] z-20 -rotate-[15deg] transition-transform duration-300 pointer-events-none filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.5)]"
                  title="Exclusive Premium Collection"
                >
                  <Crown size={24} className="text-amber-500 fill-amber-400" strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span 
                  onClick={() => handleCreatorClick(item.username)} 
                  className="cursor-pointer hover:text-emerald-600 transition-colors"
                  title={`View details for ${item.username}`}
                >
                  {item.username}
                </span>
                {item.is_banned && (
                  <img 
                    src={BANNED_LOGO_URL} 
                    alt="Account Banned" 
                    title="Account Banned" 
                    className="h-6 w-auto object-contain flex-shrink-0" 
                  />
                )}
              </h2>
              
              <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                <span className="text-sm font-semibold text-emerald-600">
                  {item.country} Batch
                </span>
                
                <span className="text-slate-300 text-sm">•</span>
                
                {/* Area uploader yang dapat diklik untuk navigasi */}
                <div 
                  onClick={() => handleCreatorClick(item.uploaded_by || item.username)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 cursor-pointer hover:opacity-80 transition-opacity"
                  title={`View profile of ${item.uploaded_by}`}
                >
                  <span className="italic">Uploaded by</span> 
                  
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                    {uploaderAvatar ? (
                      <img 
                        src={uploaderAvatar} 
                        alt={item.uploaded_by || 'Uploader'} 
                        className="w-full h-full object-cover" 
                        onError={() => setUploaderAvatar(null)}
                      />
                    ) : (
                      <User size={12} className="text-slate-400" />
                    )}
                  </div>

                  <span className="font-bold text-slate-700 not-italic hover:text-emerald-600 transition-colors">
                    {item.uploaded_by}
                  </span>
                  
                  {uploaderIsAdmin ? (
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/AdminBadge.webp" 
                      alt="Admin Verified" 
                      title="Admin Verified"
                      className="w-5 h-5 object-contain drop-shadow-sm cursor-help hover:scale-110 transition-transform ml-0.5"
                    />
                  ) : badge ? (
                    <img 
                      src={badge.url} 
                      alt={badge.title} 
                      title={`${badge.title} (${uploaderCount} Uploads)`}
                      className="w-5 h-5 object-contain drop-shadow-sm cursor-pointer hover:scale-110 transition-transform ml-0.5"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Total Videos</span>
              <span className="text-lg font-bold text-slate-700">{item.video_count} files</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Archive Size</span>
              <span className="text-lg font-bold text-emerald-600">{item.size_file || `${item.size_gb} GB`}</span>
            </div>
          </div>

          <div className="mb-8">
            {item.is_banned ? (
              <div className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-red-50/50 rounded-2xl border border-red-100 text-red-500 font-bold text-sm cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                </svg>
                <span>TikTok Account Banned</span>
              </div>
            ) : (
              <a 
                href={item.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 text-slate-700 hover:text-black font-bold text-sm transition-all group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor" className="text-slate-800 group-hover:text-black transition-colors">
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                </svg>
                <span>{item.username}</span>
              </a>
            )}
          </div>

          <div className="mt-auto">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Official Download Mirrors</h3>
            <div className="space-y-3">
              <button 
                disabled={!hasGdrive}
                onClick={() => hasGdrive && handleDownloadClick('Google Drive', finalGdriveLink, item.id)} 
                className={`w-full p-4 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] transition-all flex items-center justify-between border border-slate-100 ${hasGdrive ? 'bg-white hover:bg-blue-50/50 hover:shadow-md group cursor-pointer' : 'bg-slate-50 opacity-60 cursor-not-allowed grayscale'}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl transition-colors ${hasGdrive ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Cloud size={22} />
                  </div>
                  <div className="text-left">
                    <div className={`font-bold transition-colors ${hasGdrive ? 'text-slate-800 group-hover:text-blue-600' : 'text-slate-500'}`}>Google Drive</div>
                    <div className="text-xs text-slate-400 font-medium">
                      {hasGdrive 
                        ? (item.is_exclusive ? 'Exclusive Direct Link • VIP Speed' : 'High Speed • Single ZIP Archive') 
                        : 'Link Unavailable'}
                    </div>
                  </div>
                </div>
                <div className={`p-2 rounded-xl transition-all ${hasGdrive ? 'bg-slate-50 text-slate-400 group-hover:bg-blue-500 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <Download size={18} />
                </div>
              </button>

              <button 
                disabled={!hasTerabox}
                onClick={() => hasTerabox && handleDownloadClick('TeraBox', finalTeraboxLink, item.id)} 
                className={`w-full p-4 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] transition-all flex items-center justify-between border border-slate-100 ${hasTerabox ? 'bg-white hover:bg-cyan-50/50 hover:shadow-md group cursor-pointer' : 'bg-slate-50 opacity-60 cursor-not-allowed grayscale'}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl transition-colors ${hasTerabox ? 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Box size={22} />
                  </div>
                  <div className="text-left">
                    <div className={`font-bold transition-colors ${hasTerabox ? 'text-slate-800 group-hover:text-cyan-600' : 'text-slate-500'}`}>TeraBox Cloud</div>
                    <div className="text-xs text-slate-400 font-medium">
                      {hasTerabox 
                        ? (item.is_exclusive ? 'Exclusive Direct Link • VIP Speed' : 'Unlimited Cloud Mirror • Free Download') 
                        : 'Link Unavailable'}
                    </div>
                  </div>
                </div>
                <div className={`p-2 rounded-xl transition-all ${hasTerabox ? 'bg-slate-50 text-slate-400 group-hover:bg-cyan-500 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <Download size={18} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;