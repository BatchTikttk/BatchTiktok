import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Cloud, Box, Download, User, Volume2, VolumeX, Crown, Lock, Play } from 'lucide-react';
import { EmeraldFolderIcon } from '../components/SharedIcons'; 
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Komponen Lazy Load
const LoginModal = lazy(() => import('../components/LoginModal'));
const PostModal = lazy(() => import('../components/PostModal'));
const Comment = lazy(() => import('../components/Comment')); // Tambahkan import Comment

const MOCK_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";
const BANNED_LOGO_URL = "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/BannedLogo.webp";

const PRESET_BACKGROUNDS = [
  { id: 'lord-hades', name: 'Lord Hades', url: 'https://qu.ax/Kd5um.webm', gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)' },
  { id: 'butterfly-waltz', name: 'Butterfly Waltz', url: 'https://qu.ax/fGDzx.webm', gradient: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)' },
  { id: 'stalkers-1', name: 'Stalkers 1', url: 'https://qu.ax/mzL2s.webm', gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)' },
  { id: 'stalkers-2', name: 'Stalker 2', url: 'https://qu.ax/G64Cg.webm', gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)' },
  { id: 'animal', name: 'Animal', url: 'https://qu.ax/niCgt.webm', gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)' },
  { id: 'lotties-cauldron', name: "Lottie's Cauldron", url: 'https://qu.ax/TWIbU.webm', gradient: 'linear-gradient(90deg, rgba(1, 49, 194, 0.1) 0%, rgba(1, 49, 194, 0.4) 100%)' },
  { id: 'mantas', name: 'MidnightMantis', url: 'https://qu.ax/bmKDF.webm', gradient: 'linear-gradient(90deg, rgba(1, 49, 194, 0.1) 0%, rgba(1, 49, 194, 0.4) 100%)' },
  { id: 'aries', name: 'Aries', url: 'https://qu.ax/wq4eK.webm', gradient: 'linear-gradient(90deg, rgba(144, 0, 7, 0.1) 0%, rgba(144, 0, 7, 0.4) 100%)' },
  { id: 'ravens', name: 'Ravens', url: 'https://qu.ax/bQC0S.webm', gradient: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)' },
  { id: 'light-wolf', name: 'LightWolf', url: 'https://qu.ax/PrsFr.webm', gradient: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)' },
  { id: 'carberus', name: 'Carberus', url: 'https://qu.ax/Yf3Q0.webm', gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)' }
];

interface PreviewPageProps {
  itemId?: string;
  itemData?: any;
  isUserPremium?: boolean;
  currentUser?: any | null; // Diubah jadi any agar bisa menangkap user object dari Supabase
  onOpenUpgradeModal?: () => void;
}

export default function PreviewPage({ 
  itemId,
  itemData: initialItemData,
  isUserPremium = false,
  currentUser = null,
  onOpenUpgradeModal
}: PreviewPageProps) {
  const [item, setItem] = useState<any>(initialItemData || null);
  const [loading, setLoading] = useState<boolean>(!initialItemData);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const [uploaderAvatar, setUploaderAvatar] = useState<string | null>(null);
  const [uploaderBorder, setUploaderBorder] = useState<string | null>(null);
  const [uploaderIsAdmin, setUploaderIsAdmin] = useState<boolean>(false);
  const [uploaderIsPremium, setUploaderIsPremium] = useState<boolean>(false);
  const [uploaderCardBgUrl, setUploaderCardBgUrl] = useState<string | null>(null);
  const [uploaderCount, setUploaderCount] = useState<number>(0);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Memastikan halaman otomatis berada di atas saat dimuat
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      const targetId = itemId || window.location.pathname.split('/preview/')[1];
      if (!targetId && !initialItemData) {
        setLoading(false);
        return;
      }

      if (initialItemData) {
        setItem(initialItemData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('batches')
          .select('*')
          .eq('id', targetId)
          .single();

        if (!error && data) {
          setItem(data);
        }
      } catch (err) {
        console.error('Failed to fetch batch item:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, initialItemData]);

  useEffect(() => {
    let channel: any;

    if (!item) return;

    if (item.uploader_avatar || item.avatar_url) {
      setUploaderAvatar(item.uploader_avatar || item.avatar_url);
    }
    if (item.uploader_is_admin !== undefined) {
      setUploaderIsAdmin(item.uploader_is_admin);
    }

    const fetchUploaderProfile = async () => {
      let profileData: any = null;

      if (item.user_id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', item.user_id)
          .maybeSingle();

        if (data) profileData = data;
      }

      if (!profileData && item.uploaded_by) {
        const targetName = item.uploaded_by.trim();
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike."${targetName}",full_name.ilike."${targetName}"`)
          .limit(1);

        if (data && data.length > 0) profileData = data[0];
      }

      if (profileData) {
        if (profileData.avatar_url !== undefined) setUploaderAvatar(profileData.avatar_url);
        
        const borderUrl = profileData.animation_border_url || profileData.equipped_border_url;
        if (borderUrl !== undefined) setUploaderBorder(borderUrl);

        if (profileData.is_admin !== undefined) setUploaderIsAdmin(profileData.is_admin);
        if (profileData.is_premium !== undefined) setUploaderIsPremium(profileData.is_premium);
        if (profileData.card_bg_url !== undefined) setUploaderCardBgUrl(profileData.card_bg_url);

        const uniqueChannelName = `profile_${profileData.id}_${Date.now()}`;
        
        channel = supabase
          .channel(uniqueChannelName)
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
                if (payload.new.avatar_url !== undefined) setUploaderAvatar(payload.new.avatar_url);
                const updatedBorder = payload.new.animation_border_url || payload.new.equipped_border_url;
                if (updatedBorder !== undefined) setUploaderBorder(updatedBorder);
                if (payload.new.is_admin !== undefined) setUploaderIsAdmin(payload.new.is_admin);
                if (payload.new.is_premium !== undefined) setUploaderIsPremium(payload.new.is_premium);
                if (payload.new.card_bg_url !== undefined) setUploaderCardBgUrl(payload.new.card_bg_url);
              }
            }
          )
          .subscribe();
      }

      if (item.uploaded_by) {
        const { count } = await supabase
          .from('batches')
          .select('id', { count: 'exact', head: true })
          .eq('uploaded_by', item.uploaded_by)
          .eq('status', 'approved');

        if (count !== null) setUploaderCount(count);
      }
    };

    fetchUploaderProfile();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [item]);

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

  const handleUploaderClick = () => {
    const targetName = item?.uploaded_by;
    if (!targetName) return;

    window.history.pushState({}, '', `/creator/${encodeURIComponent(targetName)}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownloadClick = async (url: string, id: any) => {
    if (!url) return;
    window.open(url, '_blank');
    
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

  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
        <Navbar 
          setActiveCategory={() => {}} 
          currentUser={currentUser} 
          handleLogout={handleLogout} 
          setShowAddModal={() => setShowAddModal(true)} 
          setShowLoginModal={() => setShowLoginModal(true)} 
          EmeraldFolderIcon={EmeraldFolderIcon} 
        />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Collection Not Found</h2>
          <p className="text-slate-500 mb-6">The collection folder you are looking for does not exist or has been removed.</p>
          <button 
            onClick={handleBack} 
            className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold shadow-md hover:bg-emerald-600 transition-all border-none cursor-pointer"
          >
            Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

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
  
  let finalGdriveLink = item.gdrive_url || '';
  let finalTeraboxLink = item.terabox_url || '';

  if (item.is_exclusive && item.exclusive_url) {
    if (item.exclusive_url.includes('drive.google')) finalGdriveLink = item.exclusive_url;
    else if (item.exclusive_url.includes('tera')) finalTeraboxLink = item.exclusive_url;
    else if (!finalGdriveLink) finalGdriveLink = item.exclusive_url;
  } else if (!item.is_exclusive && item.download_url) {
    if (item.download_url.includes('drive.google')) finalGdriveLink = item.download_url;
    else if (item.download_url.includes('tera')) finalTeraboxLink = item.download_url;
    else if (!finalGdriveLink) finalGdriveLink = item.exclusive_url || item.download_url;
  }

  const hasGdrive = Boolean(finalGdriveLink && finalGdriveLink.trim() !== '');
  const hasTerabox = Boolean(finalTeraboxLink && finalTeraboxLink.trim() !== '');

  const currentUserUsername = currentUser?.user_metadata?.username || currentUser?.email || currentUser;

  const isUploader = Boolean(
    currentUserUsername && 
    ((item.uploaded_by && typeof currentUserUsername === 'string' && currentUserUsername.toLowerCase() === item.uploaded_by.toLowerCase()) ||
     (item.username && typeof currentUserUsername === 'string' && currentUserUsername.toLowerCase() === item.username.toLowerCase()))
  );
  
  const isLocked = Boolean(item.is_exclusive && !isUserPremium && !isUploader);

  const isUploaderVip = Boolean(uploaderIsAdmin || uploaderIsPremium);
  const activeWebmUrl = uploaderCardBgUrl || "https://qu.ax/Kd5um.webm";
  const selectedPreset = PRESET_BACKGROUNDS.find(p => p.url === activeWebmUrl);
  const cardGradient = selectedPreset?.gradient || 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <div>
        <Navbar 
          setActiveCategory={() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
          }}
          currentUser={currentUserUsername} // Menyesuaikan dengan Navbar yang sebelumnya menerima string
          handleLogout={handleLogout}
          setShowAddModal={() => setShowAddModal(true)}
          setShowLoginModal={() => setShowLoginModal(true)}
          setShowRulesModal={() => {
            window.history.pushState({}, '', '/rules');
            window.dispatchEvent(new Event('popstate'));
          }}
          EmeraldFolderIcon={EmeraldFolderIcon}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
          
          <div className="w-full max-w-[800px] bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row items-stretch">
            
            {/* Left TikTok Video Area */}
            <div className="w-full md:w-[310px] lg:w-[330px] aspect-[9/16] bg-black relative flex-shrink-0 flex items-center justify-center">
              {isTikTokLink && tikTokEmbedUrl ? (
                <iframe 
                  src={tikTokEmbedUrl} 
                  className="absolute inset-0 w-full h-full border-none"
                  allowFullScreen
                  allow="encrypted-media"
                ></iframe>
              ) : (
                <div 
                  onClick={toggleVideoPlay}
                  className="absolute inset-0 w-full h-full cursor-pointer group"
                >
                  <video 
                    ref={videoRef}
                    src={videoUrl} 
                    autoPlay 
                    loop 
                    muted={isMuted} 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                  
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="p-4 bg-white/20 rounded-full text-white backdrop-blur-md shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play size={28} className="fill-white translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }} 
                    className="absolute top-3 left-3 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all shadow-sm border-none cursor-pointer"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                <h4 className="font-bold text-base drop-shadow-md flex items-center gap-2 pointer-events-auto">
                  {item.username}
                </h4>
              </div>
            </div>

            {/* Right Side Info */}
            <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between bg-white overflow-hidden">
              
              {/* 1. Top Header Info Folder & Uploader */}
              <div>
                <div className="flex items-start gap-3.5">
                  <div 
                    className="flex-shrink-0 pt-0.5 relative drop-shadow-sm w-12 h-12" 
                    title={item.is_exclusive ? "TikTok Exclusive Collection" : ""}
                  >
                    <EmeraldFolderIcon className="w-12 h-12 object-contain drop-shadow-sm" country={item.country} isExclusive={item.is_exclusive} isBanned={item.is_banned} />
                    
                    {item.is_exclusive && (
                      <div 
                        className="absolute -top-[12px] -left-[5px] z-20 -rotate-[15deg] transition-transform duration-300 pointer-events-none filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.5)]"
                        title="Exclusive Premium Collection"
                      >
                        <Crown size={22} className="text-amber-500 fill-amber-400" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5 truncate">
                      <span className="truncate">{item.username}</span>
                      {item.is_banned && (
                        <img 
                          src={BANNED_LOGO_URL} 
                          alt="Account Banned" 
                          title="Account Banned" 
                          className="h-5 w-auto object-contain flex-shrink-0" 
                        />
                      )}
                    </h2>
                    
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-semibold text-emerald-600">
                        {item.country} Batch
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section Uploaded By */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center gap-2 text-center w-full">
                  <span className="text-xs font-semibold text-slate-400 italic">
                    Uploaded by
                  </span>
                  
                  {isUploaderVip ? (
                    /* SPECIAL WEBM CONTRIBUTOR CARD UNTUK ADMIN/PREMIUM (BERSIH TANPA BADGE SUDUT) */
                    <div 
                      onClick={handleUploaderClick}
                      className="relative w-full rounded-2xl overflow-hidden shadow-md cursor-pointer group flex flex-col items-center justify-center text-center transition-all hover:scale-[1.01] my-1"
                      style={{ background: cardGradient }}
                    >
                      {/* WebM Background */}
                      <div 
                        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
                        style={{ maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 165px, rgb(0, 0, 0) 215px)' }}
                      >
                        <video 
                          key={activeWebmUrl}
                          src={activeWebmUrl} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] pointer-events-none" />

                      {/* Content Uploader */}
                      <div className="relative z-10 py-3 px-4 flex flex-col items-center justify-center w-full">
                        <div className="relative w-16 h-16 flex items-center justify-center my-1">
                          {uploaderBorder && (
                            <img 
                              src={uploaderBorder} 
                              alt="Avatar Border" 
                              className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none drop-shadow-md"
                            />
                          )}
                          <div className="w-[85%] h-[85%] rounded-full bg-slate-900/80 text-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/30 shadow-sm">
                            {uploaderAvatar ? (
                              <img 
                                src={uploaderAvatar} 
                                alt={item.uploaded_by || 'Uploader'} 
                                className="w-full h-full object-cover scale-125" 
                                onError={() => setUploaderAvatar(null)}
                              />
                            ) : (
                              <User size={22} className="text-slate-300" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 mt-1">
                          <span className="font-extrabold text-sm text-white drop-shadow-md group-hover:text-emerald-300 transition-colors">
                            {item.uploaded_by}
                          </span>
                          
                          {uploaderIsAdmin ? (
                            <img 
                              src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/AdminBadge.webp" 
                              alt="Admin Verified" 
                              title="Admin Verified"
                              className="w-4 h-4 object-contain drop-shadow-md"
                            />
                          ) : badge ? (
                            <img 
                              src={badge.url} 
                              alt={badge.title} 
                              title={`${badge.title} (${uploaderCount} Uploads)`}
                              className="w-4 h-4 object-contain drop-shadow-md"
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* KARTU REGULER DENGAN STYLE STANDAR */
                    <div 
                      onClick={handleUploaderClick}
                      className="inline-flex flex-col items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                      title={`View profile of ${item.uploaded_by}`}
                    >
                      <div className="relative w-16 h-16 flex items-center justify-center aspect-square">
                        {uploaderBorder && (
                          <img 
                            src={uploaderBorder} 
                            alt="Avatar Border" 
                            className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none drop-shadow-sm"
                          />
                        )}

                        <div className="w-[85%] h-[85%] rounded-full bg-slate-100 text-slate-400 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200/50 shadow-sm z-0">
                          {uploaderAvatar ? (
                            <img 
                              src={uploaderAvatar} 
                              alt={item.uploaded_by || 'Uploader'} 
                              className="w-full h-full object-cover scale-125" 
                              onError={() => setUploaderAvatar(null)}
                            />
                          ) : (
                            <User size={22} className="text-slate-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-bold text-sm text-slate-800 hover:text-emerald-600 transition-colors">
                          {item.uploaded_by}
                        </span>
                        
                        {uploaderIsAdmin ? (
                          <img 
                            src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/AdminBadge.webp" 
                            alt="Admin Verified" 
                            title="Admin Verified"
                            className="w-4 h-4 object-contain drop-shadow-sm cursor-help hover:scale-110 transition-transform"
                          />
                        ) : badge ? (
                          <img 
                            src={badge.url} 
                            alt={badge.title} 
                            title={`${badge.title} (${uploaderCount} Uploads)`}
                            className="w-4 h-4 object-contain drop-shadow-sm cursor-pointer hover:scale-110 transition-transform"
                          />
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Middle Info Section */}
              <div className="my-auto py-3">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">Total Videos</span>
                    <span className="text-lg font-bold text-slate-700">{item.video_count} files</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">Archive Size</span>
                    <span className="text-lg font-bold text-emerald-600">{item.size_file || `${item.size_gb} GB`}</span>
                  </div>
                </div>

                <div>
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
              </div>

              {/* 3. Bottom Download Mirrors */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 mb-2.5">Official Download Mirrors</h3>
                
                {isLocked ? (
                  <div className="w-full p-4 rounded-xl bg-gradient-to-br from-slate-50 to-amber-50/50 border border-amber-200/60 flex items-center justify-between shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col z-10">
                      <span className="text-xs font-bold text-slate-800">Premium Access Required</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">Upgrade to premium to access this file</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onOpenUpgradeModal) onOpenUpgradeModal();
                        }}
                        className="mt-2.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition-colors w-max shadow-sm cursor-pointer z-20 relative border-none"
                      >
                        Upgrade Now
                      </button>
                    </div>
                    <div className="absolute right-4 z-0 transition-transform group-hover:scale-110 duration-300">
                      <Lock size={40} className="text-amber-500/20" strokeWidth={1.5} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button 
                      disabled={!hasGdrive}
                      onClick={() => hasGdrive && handleDownloadClick(finalGdriveLink, item.id)} 
                      className={`w-full p-3 rounded-xl transition-all flex items-center justify-between border border-slate-100 ${hasGdrive ? 'bg-white hover:bg-blue-50/50 hover:shadow-sm group cursor-pointer' : 'bg-slate-50 opacity-60 cursor-not-allowed grayscale'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${hasGdrive ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <Cloud size={18} />
                        </div>
                        <div className="text-left">
                          <div className={`text-xs font-bold transition-colors ${hasGdrive ? 'text-slate-800 group-hover:text-blue-600' : 'text-slate-500'}`}>Google Drive</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {hasGdrive 
                              ? (item.is_exclusive ? 'Exclusive Direct Link • VIP Speed' : 'High Speed • Single ZIP Archive') 
                              : 'Link Unavailable'}
                          </div>
                        </div>
                      </div>
                      <div className={`p-1.5 rounded-lg transition-all ${hasGdrive ? 'bg-slate-50 text-slate-400 group-hover:bg-blue-500 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <Download size={15} />
                      </div>
                    </button>

                    <button 
                      disabled={!hasTerabox}
                      onClick={() => hasTerabox && handleDownloadClick(finalTeraboxLink, item.id)} 
                      className={`w-full p-3 rounded-xl transition-all flex items-center justify-between border border-slate-100 ${hasTerabox ? 'bg-white hover:bg-cyan-50/50 hover:shadow-sm group cursor-pointer' : 'bg-slate-50 opacity-60 cursor-not-allowed grayscale'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${hasTerabox ? 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <Box size={18} />
                        </div>
                        <div className="text-left">
                          <div className={`text-xs font-bold transition-colors ${hasTerabox ? 'text-slate-800 group-hover:text-cyan-600' : 'text-slate-500'}`}>TeraBox Cloud</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {hasTerabox 
                              ? (item.is_exclusive ? 'Exclusive Direct Link • VIP Speed' : 'Unlimited Cloud Mirror • Free Download') 
                              : 'Link Unavailable'}
                          </div>
                        </div>
                      </div>
                      <div className={`p-1.5 rounded-lg transition-all ${hasTerabox ? 'bg-slate-50 text-slate-400 group-hover:bg-cyan-500 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <Download size={15} />
                      </div>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
          
          {/* ---> SECTION KOMENTAR DITAMBAHKAN DI SINI <--- */}
          <div className="w-full max-w-[800px] mt-8">
            <Suspense fallback={<div className="h-40 bg-white rounded-[2rem] shadow-sm animate-pulse border border-slate-100 mt-8"></div>}>
              <Comment 
                itemId={item.id} 
                currentUser={currentUser} 
                onRequireLogin={() => setShowLoginModal(true)} 
              />
            </Suspense>
          </div>
          {/* ----------------------------------------------- */}

        </div>
      </div>

      <Footer onSelectCountry={() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
      }} />

      <Suspense fallback={null}>
        {showAddModal && (
          <PostModal 
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {}} 
            currentUser={currentUserUsername}
            showToast={() => {}}
            CATEGORIES={['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam']}
            isAdmin={false}
          />
        )}

        {showLoginModal && (
          <LoginModal 
            onClose={() => setShowLoginModal(false)}
            onSuccess={() => {}}
            showToast={() => {}}
          />
        )}
      </Suspense>
    </div>
  );
}