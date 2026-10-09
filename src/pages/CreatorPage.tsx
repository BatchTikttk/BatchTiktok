import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { 
  User, HardDrive, FolderOpen, Video, 
  MousePointerClick, Play, Check,
  Crown 
} from 'lucide-react';
import { supabase } from "../supabase";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { EmeraldFolderIcon } from "../components/SharedIcons";
import AvatarBorderVip from "../components/AvatarBorderVip";

interface BatchItem {
  id: string;
  user_id?: string;
  username: string;
  country: string;
  video_count: number | string;
  size_file: string;
  size_gb: number | string;
  uploaded_by?: string;
  uploader_is_admin?: boolean;
  is_edited?: boolean;
  is_exclusive?: boolean; 
  is_banned?: boolean;
  status?: string;
  [key: string]: any; 
}

interface BadgeItem {
  id: string;
  title: string;
  tier: string;
  iconUrl: string;
  colorClass: string;
  isUnlocked: (stats: any) => boolean;
}

const BADGES: BadgeItem[] = [
  {
    id: 'bronze',
    title: 'Acktive User',
    tier: 'Tier 1 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/ActiveUser.webp',
    colorClass: 'text-[#b08d6a]',
    isUnlocked: (stats: any) => stats.totalUploads >= 10,
  },
  {
    id: 'silver',
    title: 'Supporter',
    tier: 'Tier 2 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/Suporter.webp',
    colorClass: 'text-slate-500',
    isUnlocked: (stats: any) => stats.totalUploads >= 30,
  },
  {
    id: 'gold',
    title: 'Loyal User',
    tier: 'Tier 3 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/LoyalUser.webp',
    colorClass: 'text-amber-500',
    isUnlocked: (stats: any) => stats.totalUploads >= 50,
  },
  {
    id: 'elite',
    title: 'Achievement',
    tier: 'Tier 4 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/Archivement.webp',
    colorClass: 'text-blue-500',
    isUnlocked: (stats: any) => stats.totalUploads >= 100,
  },
  {
    id: 'legend',
    title: 'Top Creator',
    tier: 'Tier 5 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/TopCreator.webp',
    colorClass: 'text-rose-600',
    isUnlocked: (stats: any) => stats.totalUploads >= 200,
  },
];

interface CreatorCardProps {
  data: BatchItem;
  onOpenPreview: (item: BatchItem) => void;
  creatorBadge: BadgeItem | null;
  isAdmin: boolean;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ data, onOpenPreview, creatorBadge, isAdmin }) => {
  return (
    <div 
      onClick={() => onOpenPreview(data)} 
      className="bg-white p-6 pt-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col items-center text-center group border-none cursor-pointer transform hover:-translate-y-1 relative"
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 w-full justify-center transition-all duration-300 opacity-80 group-hover:opacity-100">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-[11px] font-medium text-slate-500 italic flex items-center gap-1.5">
            Uploaded by <span className="font-semibold text-emerald-600 not-italic">{data.uploaded_by || data.username}</span>
          </span>
          
          {isAdmin ? (
            <span title="Admin Verified">
              <img 
                src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/AdminBadge.webp" 
                alt="Admin Verified"
                className="w-6 h-6 object-contain drop-shadow-sm cursor-pointer hover:scale-110 transition-transform ml-0.5"
              />
            </span>
          ) : creatorBadge ? (
            <img 
              src={creatorBadge.iconUrl} 
              alt={creatorBadge.title} 
              title={creatorBadge.title}
              className="w-6 h-6 object-contain drop-shadow-sm cursor-pointer hover:scale-110 transition-transform ml-0.5"
            />
          ) : null}
        </div>
        
        {data.is_edited && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500" title="Folder has been updated">
            <Check size={12} strokeWidth={3} /> Updated
          </span>
        )}
      </div>

      <div 
        className="mb-5 mt-2 relative transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
        title={data.is_banned ? "Account Banned" : data.is_exclusive ? "TikTok Exclusive Collection" : ""}
      >
        <EmeraldFolderIcon country={data.country} isExclusive={data.is_exclusive} isBanned={data.is_banned} />
        
        {data.is_exclusive && (
          <div 
            className="absolute -top-[14px] -left-[6px] z-20 -rotate-[15deg] group-hover:-rotate-[25deg] transition-transform duration-300 pointer-events-none filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.5)]"
            title="Exclusive Premium Collection"
          >
            <Crown size={24} className="text-amber-500 fill-amber-400" strokeWidth={1.5} />
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-1 tracking-tight">
        {data.username}
      </h3>
      
      <span className="text-[11px] font-bold tracking-wider text-white bg-emerald-500 px-3 py-1 rounded-full mb-4 shadow-sm border-none">
        {data.country || 'Unknown'}
      </span>
      
      <div className="flex w-full justify-between px-5 py-3.5 bg-slate-50/80 rounded-2xl mb-5 border-none">
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Videos</span>
          <span className="text-sm font-bold text-slate-700">{data.video_count || 0}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Size</span>
          <span className="text-sm font-bold text-slate-700">{data.size_file || `${data.size_gb || 0} GB`}</span>
        </div>
      </div>
      
      <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg border-none">
        <Play size={18} className="fill-current" />
        Preview Folder
      </div>
    </div>
  );
};

const fetchCreatorData = async (username: string) => {
  if (!username) return { profile: null, batches: [] };

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle();

  let mappedBatches: BatchItem[] = [];

  if (profileData) {
    const { data: batchData } = await supabase
      .from('batches')
      .select('*')
      .or(`user_id.eq.${profileData.id},username.ilike.${username}`)
      .order('created_at', { ascending: false });

    if (batchData) {
      mappedBatches = batchData.map(b => ({
        ...b,
        uploaded_by: profileData.username, 
        uploader_is_admin: profileData.is_admin
      }));
    }
  } else {
    const { data: batchData } = await supabase
      .from('batches')
      .select('*')
      .ilike('username', username)
      .order('created_at', { ascending: false });

    if (batchData) {
      mappedBatches = batchData.map(b => ({
        ...b,
        uploaded_by: b.uploaded_by || username,
        uploader_is_admin: false
      }));
    }
  }

  return { profile: profileData, batches: mappedBatches };
};

interface CreatorPageProps {
  username: string;
  isUserPremium?: boolean;
  onOpenUpgradeModal?: () => void;
  currentUser?: any; 
  setActiveCategory?: (category: string) => void;
  setShowAddModal?: (show: boolean) => void;
  setShowLoginModal?: (show: boolean) => void;
  setShowRulesModal?: (show: boolean) => void;
  onOpenProfile?: () => void;
  onOpenTopContributors?: () => void;
  handleLogout?: () => void;
}

export default function CreatorPage({ 
  username, 
  onOpenUpgradeModal, 
  currentUser: propCurrentUser,
  setActiveCategory,
  setShowAddModal = () => {},
  setShowLoginModal = () => {},
  setShowRulesModal,
  onOpenProfile,
  onOpenTopContributors,
  handleLogout: propHandleLogout
}: CreatorPageProps) {
  const [localCurrentUser, setLocalCurrentUser] = useState<any>(null); 

  const currentUser = propCurrentUser !== undefined ? propCurrentUser : localCurrentUser;

  const { data: creatorData, isLoading: loading, mutate } = useSWR(
    username ? `creator_page_${username}` : null,
    () => fetchCreatorData(username),
    {
      dedupingInterval: 600000, 
      revalidateOnFocus: false,
    }
  );

  const creatorProfile = creatorData?.profile || null;
  const batches = creatorData?.batches || [];

  const defaultHandleLogout = async () => {
    if (propHandleLogout) {
      propHandleLogout();
    } else {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const handleSelectCategory = (category: string) => {
    if (setActiveCategory) {
      setActiveCategory(category);
    }
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  // Navigasi statis ke PreviewPage dengan Username (SEO Friendly)
  const handleOpenPreview = (item: BatchItem) => {
    const seoSlug = item.username 
      ? `@${item.username.replace(/^@/, '').replace(/\s+/g, '-').toLowerCase()}` 
      : item.id;
    window.history.pushState({ item }, '', `/preview/${seoSlug}`);
    window.dispatchEvent(new Event('popstate'));
  };

  useEffect(() => {
    if (propCurrentUser !== undefined) return;
    
    let isMounted = true;
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted) setLocalCurrentUser(user);
    };
    fetchCurrentUser();
    return () => { isMounted = false; };
  }, [propCurrentUser]);

  useEffect(() => {
    if (!username) return;

    const profileSubscription = supabase
      .channel(`creator-profile-updates-${username}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          if (
            payload.new && 
            payload.new.username && 
            username && 
            payload.new.username.toLowerCase() === username.toLowerCase()
          ) {
            mutate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [username, mutate]);

  const stats = useMemo(() => {
    const totalUploads = batches.length;
    const totalApproved = batches.filter((b: any) => b.status === 'approved').length;
    const totalVideos = batches.reduce((acc: number, b: any) => acc + (Number(b.video_count) || 0), 0);
    
    const totalDownloads = batches.reduce((acc: number, b: any) => {
      const downloadVal = b.download_count ?? b.downloads ?? b.clicks ?? b.click_count ?? b.total_clicks ?? b.click ?? b.views ?? 0;
      return acc + (Number(downloadVal) || 0);
    }, 0);

    const totalGB = batches.reduce((acc: number, b: any) => {
      if (b.size_gb !== undefined && b.size_gb !== null && b.size_gb !== '') return acc + Number(b.size_gb);
      if (b.size_file) {
        const sizeStr = b.size_file.toString().toUpperCase();
        const val = parseFloat(sizeStr.replace(/[^\d.]/g, ''));
        if (isNaN(val)) return acc;
        if (sizeStr.includes('MB')) return acc + (val / 1024);
        if (sizeStr.includes('KB')) return acc + (val / (1024 * 1024));
        return acc + val;
      }
      return acc;
    }, 0);

    let totalSizeDisplay = '0 GB';
    if (totalGB > 0) {
      totalSizeDisplay = totalGB < 1 ? (totalGB * 1024).toFixed(1) + ' MB' : totalGB.toFixed(1) + ' GB';
    }

    return { totalFolders: totalUploads, totalUploads, totalApproved, totalVideos, totalDownloads, totalSizeDisplay };
  }, [batches]);

  const unlockedBadges = useMemo(() => {
    return BADGES.filter(b => b.isUnlocked(stats));
  }, [stats]);
  const highestBadge = unlockedBadges.length > 0 ? unlockedBadges[unlockedBadges.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar Integration */}
      <Navbar 
        activeCategory=""
        setActiveCategory={handleSelectCategory}
        currentUser={currentUser}
        handleLogout={defaultHandleLogout}
        setShowAddModal={setShowAddModal}
        setShowLoginModal={setShowLoginModal}
        setShowRulesModal={setShowRulesModal}
        EmeraldFolderIcon={EmeraldFolderIcon}
        onOpenProfile={onOpenProfile}
        onOpenTopContributors={onOpenTopContributors}
        onOpenUpgrade={onOpenUpgradeModal}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full flex-grow pt-8 pb-16 px-6 sm:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="relative bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 mt-4">
          
          {!creatorProfile?.is_admin && highestBadge && (
            <div className="absolute top-6 right-6 sm:top-8 sm:right-10 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300 z-0">
              <img 
                src={highestBadge.iconUrl} 
                alt={highestBadge.title} 
                title={highestBadge.title}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-md"
              />
              <span className={`mt-1.5 text-[10px] sm:text-xs font-extrabold tracking-wide text-center whitespace-nowrap drop-shadow-sm ${highestBadge.colorClass}`}>
                {highestBadge.title}
              </span>
            </div>
          )}

          {creatorProfile?.is_admin && (
            <div className="absolute top-6 right-6 sm:top-8 sm:right-10 flex flex-col items-center justify-center z-0 hover:scale-105 transition-transform duration-300">
              <img 
                src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/AdminBadge.webp"
                alt="Verified Staff"
                title="Verified Staff"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-md"
              />
              <span className="mt-1.5 text-[10px] sm:text-xs font-extrabold tracking-wide text-amber-500 text-center whitespace-nowrap drop-shadow-sm">
                Verified Staff
              </span>
            </div>
          )}

          <div className="relative w-[88px] h-[88px] flex-shrink-0 z-10">
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center text-white bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20 border-4 border-white relative z-10">
              {creatorProfile?.avatar_url ? (
                <img src={creatorProfile.avatar_url} alt={username} className="w-full h-full object-cover" />
              ) : (
                <User size={40} strokeWidth={2.2} />
              )}
            </div>

            {creatorProfile?.vip_border_url ? (
              <AvatarBorderVip 
                borderUrl={creatorProfile?.vip_border_url} 
                isPremium={creatorProfile?.is_premium} 
              />
            ) : creatorProfile?.animation_border_url ? (
              <img 
                src={creatorProfile.animation_border_url} 
                alt="Animated Border" 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-none object-contain z-20 pointer-events-none drop-shadow-sm"
              />
            ) : null}
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 flex items-center gap-2">
                {creatorProfile?.username || username}
                {creatorProfile?.is_premium && (
                  <span 
                    title="Premium Creator" 
                    className="inline-flex items-center justify-center bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white text-[11px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md shadow-amber-500/20 border border-amber-300/30 translate-y-[4px]"
                  >
                    Vip Member
                  </span>
                )}
              </h1>
            </div>

            <p className="text-slate-500 font-medium mb-6">Creator Portfolio & Archives</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6">
              {[
                { icon: FolderOpen, label: "Total Batches", val: stats.totalFolders },
                { icon: Video, label: "Total Videos", val: stats.totalVideos },
                { icon: HardDrive, label: "Total Size", val: stats.totalSizeDisplay },
                { icon: MousePointerClick, label: "Total Downloads", val: stats.totalDownloads }
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#F8FAFC] px-5 py-3 rounded-2xl flex items-center gap-3 border border-slate-50">
                  <stat.icon className="text-emerald-500" size={20} />
                  <div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                    <div className="font-bold text-slate-700">{stat.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            Collection by {creatorProfile?.username || username}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 text-slate-500">
            No collections found for this creator.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {batches.map((batch: BatchItem) => (
              <CreatorCard 
                key={batch.id} 
                data={batch}
                creatorBadge={highestBadge}
                isAdmin={!!creatorProfile?.is_admin} 
                onOpenPreview={handleOpenPreview}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer Integration */}
      <Footer onSelectCountry={handleSelectCategory} />
    </div>
  );
}