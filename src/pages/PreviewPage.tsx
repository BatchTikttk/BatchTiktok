import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import useSWR from 'swr';
import { Cloud, Box, Download, User, Volume2, VolumeX, Crown, Lock, Play } from 'lucide-react';
import { EmeraldFolderIcon } from '../components/SharedIcons';
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ExoClickBanner from '../components/ExoClickBanner';

// Lazy Load Components
const LoginModal = lazy(() => import('../components/LoginModal'));
const PostModal = lazy(() => import('../components/PostModal'));
const Comment = lazy(() => import('../components/Comment'));

const MOCK_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";
const BANNED_LOGO_URL = "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/BannedLogo.webp";

// Konfigurasi ID Iklan ExoClick
const EXO_BANNER_PREVIEW_ZONE = "6057344"; // Banner Spanduk 720x90

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

// SWR Fetcher untuk Item Utama
const fetchBatchItem = async (key: string) => {
  const targetId = key.replace('batch_item_', '');
  const decodedTarget = decodeURIComponent(targetId);

  let query = supabase.from('batches').select('*');
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(decodedTarget);

  if (isUUID) {
    query = query.eq('id', decodedTarget);
  } else {
    query = query.ilike('username', decodedTarget);
  }

  const { data, error } = await query.single();
  if (error) throw error;
  return data;
};

// SWR Fetcher untuk Related Folders berdasarkan uploader yang sama
const fetchRelatedFolders = async ([_, currentId, uploadedBy]: [string, any, string]) => {
  if (!uploadedBy) return [];

  let query = supabase
    .from('batches')
    .select('*')
    .eq('status', 'approved')
    .ilike('uploaded_by', uploadedBy)
    .limit(5);

  if (currentId) {
    query = query.neq('id', currentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Helper untuk menampilkan Ikon Media Sosial yang Akurat
const renderSocialIcon = (url: string) => {
  if (!url) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 group-hover:text-black transition-colors">
        <circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    );
  }
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('tiktok.com')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor" className="text-slate-800 group-hover:text-black transition-colors">
        <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('instagram.com')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600 group-hover:text-pink-700 transition-colors">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    );
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800 group-hover:text-black transition-colors">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('onlyfans.com')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-sky-500 group-hover:text-sky-600 transition-colors">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c3.87 0 7 3.13 7 7s-3.13 7-7 7-7-3.13-7-7 3.13-7 7-7zm0 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-sky-400 group-hover:text-sky-500 transition-colors">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.22-3.54 3.91-1.63 4.72-1.92 5.25-1.93.12 0 .39.03.56.17.15.12.19.28.21.4-.01.07.01.24 0 .37z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('tevi.')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500 group-hover:text-red-600 transition-colors">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2 14.5v-9l7 4.5z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('trakteer.id')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-rose-500 group-hover:text-rose-600 transition-colors">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 group-hover:text-black transition-colors">
      <circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
};

// Component Kompatibel VAST ExoClick
function ExoClickVastZone({ isVideoLandscape }: { isVideoLandscape: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVideoLandscape || !containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    if (!document.getElementById('exoclick-provider-script')) {
      const scriptProvider = document.createElement('script');
      scriptProvider.id = 'exoclick-provider-script';
      scriptProvider.async = true;
      scriptProvider.src = 'https://a.magsrv.com/ad-provider.js';
      document.body.appendChild(scriptProvider);
    }

    const ins = document.createElement('ins');
    ins.className = 'eas6a97888e2';
    ins.setAttribute('data-zoneid', '6057346');
    container.appendChild(ins);

    const scriptServe = document.createElement('script');
    scriptServe.innerHTML = '(AdProvider = window.AdProvider || []).push({"serve": {}});';
    container.appendChild(scriptServe);
  }, [isVideoLandscape]);

  if (isVideoLandscape) return null;

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-auto z-10 overflow-hidden flex items-center justify-center" 
    />
  );
}

interface PreviewPageProps {
  itemId?: string;
  itemData?: any;
  isUserPremium?: boolean;
  currentUser?: any | null; 
  onOpenUpgradeModal?: () => void;
}

export default function PreviewPage({ 
  itemId,
  itemData: initialItemData,
  isUserPremium = false,
  currentUser = null,
  onOpenUpgradeModal
}: PreviewPageProps) {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAdmin] = useState<boolean>(false); // Diperbaiki: setIsAdmin dihapus karena tidak digunakan
  const [isVideoLandscape, setIsVideoLandscape] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const [uploaderAvatar, setUploaderAvatar] = useState<string | null>(null);
  const [uploaderBorder, setUploaderBorder] = useState<string | null>(null);
  const [uploaderIsAdmin, setUploaderIsAdmin] = useState<boolean>(false);
  const [uploaderIsPremium, setUploaderIsPremium] = useState<boolean>(false);
  const [uploaderCardBgUrl, setUploaderCardBgUrl] = useState<string | null>(null);
  const [uploaderCount, setUploaderCount] = useState<number>(0);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  let targetId = itemId || (typeof window !== 'undefined' ? window.location.pathname.split('/preview/')[1] : '');
  if (targetId && targetId.endsWith('/')) {
    targetId = targetId.slice(0, -1);
  }

  const { data: fetchedItem, error: itemError, isLoading: itemLoading } = useSWR(
    initialItemData ? null : (targetId ? `batch_item_${targetId}` : null),
    fetchBatchItem,
    { revalidateOnFocus: false }
  );

  const item = initialItemData || fetchedItem;
  const loading = !initialItemData && itemLoading && !item;

  useEffect(() => {
    if (!item || !item.video_url) return;
    const url = item.video_url.toLowerCase();
    
    if (url.includes('abys.to') || url.includes('shadowclips.asia') || url.includes('vidara')) {
      setIsVideoLandscape(true);
    } else if (url.includes('tiktok.com')) {
      setIsVideoLandscape(false);
    }
  }, [item]);

  const { data: fetchedRelated } = useSWR(
    item?.id && item?.uploaded_by ? ['related-folders', item.id, item.uploaded_by] : null,
    fetchRelatedFolders,
    { revalidateOnFocus: false }
  );

  const relatedFolders = fetchedRelated || [];

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
    
    if (count >= 200) return { title: 'TopCreator', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/TopCreator.webp' };
    if (count >= 100) return { title: 'Achievement', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/Archivement.webp' };
    if (count >= 50) return { title: 'LoyalUser', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/LoyalUser.webp' };
    if (count >= 30) return { title: 'Supporter', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/Suporter.webp' };
    if (count >= 10) return { title: 'ActiveUser', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/ActiveUser.webp' };
    
    return null;
  };

  const badge = getAchievementBadge(uploaderCount);

  const handleUploaderClick = () => {
    const targetName = item?.uploaded_by;
    if (!targetName) return;

    window.history.pushState({}, '', `/creator/${encodeURIComponent(targetName)}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleFolderClick = (folderId: string) => {
    window.history.pushState({}, '', `/preview/${folderId}`);
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

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      const ratio = video.videoWidth / video.videoHeight;
      if (ratio > 1.2) {
        setIsVideoLandscape(true);
      } else {
        setIsVideoLandscape(false);
      }
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
      console.error("Failed to update download count", err);
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

  if (!item || itemError) {
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
  const isVidaraLink = videoUrl.includes("vidara");
  const isAbysLink = videoUrl.includes("abys.to") || videoUrl.includes("shadowclips.asia");

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

  const getVidaraEmbedUrl = (url: string) => {
    try {
      if (url.includes('/embed/')) return url;
      return url;
    } catch (e) {
      return url;
    }
  };

  const getAbysEmbedUrl = (url: string) => {
    try {
      return url;
    } catch (e) {
      return url;
    }
  };

  const tikTokEmbedUrl = isTikTokLink ? getTikTokEmbedUrl(videoUrl) : null;
  const vidaraEmbedUrl = isVidaraLink ? getVidaraEmbedUrl(videoUrl) : null;
  const abysEmbedUrl = isAbysLink ? getAbysEmbedUrl(videoUrl) : null;
  
  let finalGdriveLink = '';
  let finalTeraboxLink = '';

  if (item.gdrive_url && item.gdrive_url.trim() !== '') {
    finalGdriveLink = (item.is_exclusive && item.exclusive_url) ? item.exclusive_url : item.gdrive_url;
  }

  if (item.terabox_url && item.terabox_url.trim() !== '') {
    finalTeraboxLink = (item.is_exclusive && item.exclusive_url) ? item.exclusive_url : item.terabox_url;
  }

  if (!finalGdriveLink && !finalTeraboxLink && item.download_url) {
    if (item.download_url.includes('drive.google')) {
      finalGdriveLink = item.download_url;
    } else if (item.download_url.includes('tera')) {
      finalTeraboxLink = item.download_url;
    }
  }

  const hasGdrive = Boolean(finalGdriveLink && finalGdriveLink.trim() !== '');
  const hasTerabox = Boolean(finalTeraboxLink && finalTeraboxLink.trim() !== '');

  const currentUserUsername = currentUser?.user_metadata?.username || currentUser?.email || currentUser;

  const isUploader = Boolean(
    currentUserUsername && 
    ((item.uploaded_by && typeof currentUserUsername === 'string' && currentUserUsername.toLowerCase() === item.uploaded_by.toLowerCase()) ||
     (item.username && typeof currentUserUsername === 'string' && currentUserUsername.toLowerCase() === item.username.toLowerCase()))
  );
  
  const isCurrentUserAdmin = Boolean(isAdmin || currentUser?.is_admin);
  const isLocked = Boolean(item.is_exclusive && !isUserPremium && !isUploader && !isCurrentUserAdmin);

  const isUploaderVip = Boolean(uploaderIsAdmin || uploaderIsPremium);
  const activeWebmUrl = uploaderCardBgUrl || "https://qu.ax/Kd5um.webm";
  const selectedPreset = PRESET_BACKGROUNDS.find(p => p.url === activeWebmUrl);
  const cardGradient = selectedPreset?.gradient || 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)';

  const socialLinkUrl = item.social_url || item.tiktok_url;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <div>
        <Navbar 
          setActiveCategory={() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
          }}
          currentUser={currentUserUsername}
          handleLogout={handleLogout}
          setShowAddModal={() => setShowAddModal(true)}
          setShowLoginModal={() => setShowLoginModal(true)}
          setShowRulesModal={() => {
            window.history.pushState({}, '', '/rules');
            window.dispatchEvent(new Event('popstate'));
          }}
          EmeraldFolderIcon={EmeraldFolderIcon}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column */}
            <div className={`${isVideoLandscape ? 'lg:col-span-2 w-full max-w-4xl mx-auto' : 'lg:col-span-2'} flex flex-col items-center w-full`}>
              
              <div className={`w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex ${isVideoLandscape ? 'flex-col' : 'flex-col md:flex-row'} items-stretch`}>
                
                {/* Video Area */}
                <div className={`w-full ${isVideoLandscape ? 'aspect-video w-full' : 'md:w-[310px] lg:w-[330px] aspect-[9/16]'} bg-black relative flex-shrink-0 flex items-center justify-center`}>
                  {isTikTokLink && tikTokEmbedUrl ? (
                    <iframe 
                      src={tikTokEmbedUrl} 
                      className="absolute inset-0 w-full h-full border-none z-10"
                      allowFullScreen
                      allow="encrypted-media"
                    ></iframe>
                  ) : isVidaraLink && vidaraEmbedUrl ? (
                    <iframe 
                      src={vidaraEmbedUrl} 
                      className="absolute inset-0 w-full h-full border-none z-10"
                      allowFullScreen
                      allow="encrypted-media"
                    ></iframe>
                  ) : isAbysLink && abysEmbedUrl ? (
                    <iframe 
                      src={abysEmbedUrl} 
                      className="absolute inset-0 w-full h-full border-none z-10"
                      allowFullScreen
                      allow="encrypted-media; autoplay"
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
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        className="w-full h-full object-cover" 
                      />
                      
                      <ExoClickVastZone isVideoLandscape={isVideoLandscape} />
                      
                      {!isPlaying && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px] z-20">
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
                        className="absolute top-3 left-3 z-30 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all shadow-sm border-none cursor-pointer"
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>
                  )}

                  {isVideoLandscape ? (
                    !isAbysLink && (
                      <div className="absolute top-4 right-4 text-white pointer-events-none z-20 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <h4 className="font-bold text-xs drop-shadow-md flex items-center gap-2 pointer-events-auto">
                          {item.username}
                        </h4>
                      </div>
                    )
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none z-20">
                        <h4 className="font-bold text-base drop-shadow-md flex items-center gap-2 pointer-events-auto">
                          {item.username}
                        </h4>
                      </div>
                    </>
                  )}
                </div>

                {/* Info Card Side */}
                <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between bg-white overflow-hidden">
                  
                  <div>
                    <div className="flex items-start gap-3.5">
                      <div 
                        className="flex-shrink-0 pt-0.5 relative drop-shadow-sm w-12 h-12" 
                        title={item.is_exclusive ? "TikTok Exclusive Collection" : ""}
                      >
                        <EmeraldFolderIcon 
                          className="w-12 h-12 object-contain drop-shadow-sm" 
                          country={item.country} 
                          isExclusive={item.is_exclusive} 
                          isBanned={item.is_banned}
                          isAdult={item.is_adult} 
                        />
                        
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
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-emerald-600">
                            {item.country} Batch
                          </span>
                          {item.is_adult && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md">
                              18+ Adult
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center gap-2 text-center w-full">
                      <span className="text-xs font-semibold text-slate-400 italic">
                        Uploaded by
                      </span>
                      
                      {isUploaderVip ? (
                        <div 
                          onClick={handleUploaderClick}
                          className="relative w-full rounded-2xl overflow-hidden shadow-md cursor-pointer group flex flex-col items-center justify-center text-center transition-all hover:scale-[1.01] my-1"
                          style={{ background: cardGradient }}
                        >
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
                                  src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/Admin.webp" 
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
                                src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/Admin.webp" 
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
                          {renderSocialIcon(socialLinkUrl)}
                          <span>Account Banned</span>
                        </div>
                      ) : (
                        <a 
                          href={socialLinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 text-slate-700 hover:text-black font-bold text-sm transition-all group"
                        >
                          {renderSocialIcon(socialLinkUrl)}
                          <span>{item.username}</span>
                        </a>
                      )}
                    </div>
                  </div>

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
              
              <div className="w-full my-6 flex justify-center">
                <ExoClickBanner zoneId={EXO_BANNER_PREVIEW_ZONE} />
              </div>

              {item?.id && (
                <div className="w-full mt-2">
                  <Suspense fallback={<div className="h-40 bg-white rounded-[2rem] shadow-sm animate-pulse border border-slate-100 mt-8"></div>}>
                    <Comment 
                      itemId={item.id} 
                      currentUser={currentUser} 
                      onRequireLogin={() => setShowLoginModal(true)} 
                    />
                  </Suspense>
                </div>
              )}

            </div>

            {/* Right Column: Related Folders Sidebar */}
            <div className="lg:col-span-1 w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 sticky top-24">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                <span>More from {item.uploaded_by || 'Creator'}</span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {relatedFolders.length} Folders
                </span>
              </h3>

              <div className="space-y-1.5">
                {relatedFolders.length > 0 ? (
                  relatedFolders.map((folder) => (
                    <div 
                      key={folder.id}
                      onClick={() => handleFolderClick(folder.id)}
                      className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 flex-shrink-0 relative">
                        <EmeraldFolderIcon 
                          className="w-12 h-12 object-contain drop-shadow-sm" 
                          country={folder.country} 
                          isExclusive={folder.is_exclusive} 
                          isBanned={folder.is_banned} 
                          isAdult={folder.is_adult}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                          {folder.username}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                          <span>{folder.country}</span>
                          <span>•</span>
                          <span>{folder.video_count || 0} files</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-400 font-medium">No other folders from this creator.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
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
            CATEGORIES={['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam', 'Japanese']}
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