import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import useSWR from 'swr';
import { supabase } from '../supabase';
import { 
  Search, CheckCircle2, Play, XCircle, ChevronLeft, ChevronRight, Check,
  Folder, Film, HardDrive, Users, Crown, Star
} from 'lucide-react';

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { EmeraldFolderIcon } from "../components/SharedIcons"; 

// 1. Lazy Load Modals
const LoginModal = lazy(() => import("../components/LoginModal"));
const PostModal = lazy(() => import("../components/PostModal"));
const PreviewModal = lazy(() => import("../components/PreviewModal"));

export const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'error' | 'info';
}

interface CreatorCardProps {
  data: any;
  onOpenPreview: (item: any) => void;
  uploaderCount: number;
}

interface HomeProps {
  onCheckAccess?: any; 
  isUserPremium?: boolean;
  currentUser?: string | null; 
  onOpenUpgradeModal?: () => void;
}

const Toast = ({ message, isVisible, type = 'success' }: ToastProps) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 transition-all duration-300 z-[9999] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${type === 'success' ? 'bg-slate-900 text-white' : type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
    <span className="text-sm font-medium">{message}</span>
  </div>
);

// --- KOMPONEN PREMIUM HERO BANNER DENGAN SLIDER ---
interface PremiumHeroBannerProps {
  onOpenUpgradeModal: () => void;
}

const PremiumHeroBanner = ({ onOpenUpgradeModal }: PremiumHeroBannerProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Stand Out With",
      highlight: "Exclusive Visuals",
      description: "Upgrade once and unlock animated contributor cards and VIP avatar borders.",
      visual: (
        <div className="relative w-full max-w-[320px] mx-auto md:mr-0 flex justify-center md:justify-end">
          <div className="relative w-full max-w-[280px] h-[120px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/10 bg-slate-800 transform rotate-2 group-hover:rotate-0 transition-all duration-500">
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 100px, rgb(0, 0, 0) 200px)', WebkitMaskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 100px, rgb(0, 0, 0) 200px)' }}>
              <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                <source src="https://qu.ax/Kd5um.webm" type="video/webm" />
              </video>
            </div>
            
            <div className="relative z-10 flex items-center h-full px-5 gap-4">
              <img 
                src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Avatar%20Karakter/Avatar%20(1).webp" 
                alt="Creator Avatar" 
                className="w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-md flex-shrink-0 bg-slate-800"
              />
              <div>
                <div className="h-4 w-24 bg-white/90 rounded mb-2"></div>
                <div className="h-3 w-16 bg-white/60 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Unlock All",
      highlight: "Exclusive Content",
      description: "Get full access to premium collections and exclusive locked folders across all regions.",
      visual: (
        <div className="relative w-full h-[140px] flex items-center justify-center md:justify-end md:pr-10 transform -rotate-2 group-hover:rotate-0 transition-all duration-500">
           {/* Decorative background glow */}
           <div className="absolute top-1/2 left-1/2 md:left-[80%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-[40px] pointer-events-none"></div>
           
           <div className="relative transform scale-[1.5] drop-shadow-2xl">
             <EmeraldFolderIcon country="Premium" isExclusive={true} />
             <div className="absolute -top-[14px] -left-[6px] z-20 -rotate-[15deg] pointer-events-none filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.5)]">
               <Crown size={24} className="text-amber-500 fill-amber-400" strokeWidth={1.5} />
             </div>
           </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500); 
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full overflow-hidden bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-none flex flex-col md:flex-row items-center justify-between p-8 md:p-12 mb-8 group min-h-[300px]">
      
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none transition-all duration-1000"></div>

      {/* Left Content: Text area */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col items-start text-left mb-8 md:mb-0">
         <div className="relative w-full h-[160px] md:h-[140px] mb-6">
            {slides.map((slide, index) => (
               <div 
                 key={`text-${index}`}
                 className={`absolute inset-0 flex flex-col items-start text-left transition-all duration-700 ease-in-out ${
                   currentSlide === index ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 z-0 pointer-events-none'
                 }`}
               >
                 <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                   {slide.title} <br />
                   <span className="text-amber-400">
                     {slide.highlight}
                   </span>
                 </h2>
                 
                 <p className="text-slate-300 font-medium max-w-md">
                   {slide.description}
                 </p>
               </div>
            ))}
         </div>

         {/* Upgrade Button */}
         <button 
           onClick={onOpenUpgradeModal}
           className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(245,158,11,0.25)] border-none hover:-translate-y-0.5"
         >
           <Star size={18} className="fill-slate-900" />
           Upgrade Now for Rp 50,000
         </button>
      </div>

      {/* Right Content: Visual Showcase Mockup */}
      <div className="relative z-10 w-full md:w-1/2 h-[140px] flex items-center justify-center md:justify-end pr-0 md:pr-4">
         {slides.map((slide, index) => (
            <div 
              key={`visual-${index}`}
              className={`absolute w-full right-0 md:pr-4 transition-all duration-700 ease-in-out flex justify-center md:justify-end ${
                currentSlide === index ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              {slide.visual}
            </div>
         ))}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-8 md:right-12 flex gap-2 z-20">
         {slides.map((_, index) => (
           <button
             key={`dot-${index}`}
             onClick={() => setCurrentSlide(index)}
             className={`h-1.5 rounded-full transition-all duration-300 ${
               currentSlide === index ? 'w-6 bg-amber-400' : 'w-2 bg-white/20 hover:bg-white/40'
             }`}
             aria-label={`Go to slide ${index + 1}`}
           />
         ))}
      </div>
    </div>
  );
};
// --- END KOMPONEN ---

const CreatorCard = ({ data, onOpenPreview, uploaderCount }: CreatorCardProps) => {
  const getAchievementBadge = (count: number) => {
    if (data.uploader_is_admin) return null; 
    
    if (count >= 200) return { title: 'Legend Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Legend.webp' };
    if (count >= 100) return { title: 'Elite Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Elite.webp' };
    if (count >= 50) return { title: 'Gold Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Gold.webp' };
    if (count >= 30) return { title: 'Silver Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Silver.webp' };
    if (count >= 10) return { title: 'Bronze Tier', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Bronze.webp' };
    
    return null;
  };

  const badge = getAchievementBadge(uploaderCount);

  return (
    <div 
      onClick={() => onOpenPreview(data)} 
      className="bg-white p-6 pt-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col items-center text-center group border-none cursor-pointer transform hover:-translate-y-1 relative"
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 w-full justify-center transition-all duration-300 opacity-80 group-hover:opacity-100">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-[11px] font-medium text-slate-500 italic flex items-center gap-1.5">
            Uploaded by <span className="font-semibold text-emerald-600 not-italic">{data.uploaded_by}</span>
          </span>
          
          {data.uploader_is_admin ? (
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
        
        {data.is_edited && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500" title="Folder has been updated">
            <Check size={12} strokeWidth={3} />
            Updated
          </span>
        )}
      </div>

      <div 
        className="relative mb-5 mt-2 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
        title={data.is_banned ? "Account Banned" : data.is_exclusive ? "TikTok Exclusive Collection" : ""}
      >
        <EmeraldFolderIcon 
          country={data.country} 
          isExclusive={data.is_exclusive} 
          isBanned={data.is_banned} 
        />
        
        {data.is_exclusive && (
          <div 
            className="absolute -top-[14px] -left-[6px] z-20 -rotate-[15deg] transition-transform duration-300 pointer-events-none filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.5)]"
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
        {data.country}
      </span>
      
      <div className="flex w-full justify-between px-5 py-3.5 bg-slate-50/80 rounded-2xl mb-5 border-none">
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Videos</span>
          <span className="text-sm font-bold text-slate-700">{data.video_count}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Size</span>
          <span className="text-sm font-bold text-slate-700">{data.size_file || `${data.size_gb} GB`}</span>
        </div>
      </div>
      
      <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg border-none">
        <Play size={18} className="fill-current" />
        Preview Folder
      </div>
    </div>
  );
};

// Fetcher Data untuk SWR
const fetchApprovedBatches = async () => {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, is_admin');
  
  const { data: batchesData, error } = await supabase
    .from('batches')
    .select('*')
    .eq('status', 'approved') 
    .order('created_at', { ascending: false });
  
  if (error) throw new Error('Failed to load data from database');

  return (batchesData || []).map((batch: any) => {
    const uploaderProfile = profiles?.find(
      (p: any) => (batch.user_id && p.id === batch.user_id) ||
           (p.username && batch.uploaded_by && p.username.toLowerCase() === batch.uploaded_by.toLowerCase())
    );
    
    return {
      ...batch,
      uploaded_by: uploaderProfile?.username || batch.uploaded_by,
      avatar_url: uploaderProfile?.avatar_url || null,
      uploader_avatar: uploaderProfile?.avatar_url || null,
      uploader_is_admin: uploaderProfile?.is_admin || false 
    };
  });
};

export default function Home({ isUserPremium, onOpenUpgradeModal, currentUser: propCurrentUser }: HomeProps) { 
  const { data: batches = [], mutate, error: swrError } = useSWR('approved_batches', fetchApprovedBatches, {
    dedupingInterval: 600000, 
    revalidateOnFocus: false,
  });

  const [activeCategory, setActiveCategory] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [localCurrentUser, setLocalCurrentUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [toastConfig, setToastConfig] = useState<{ message: string; isVisible: boolean; type: 'success' | 'error' | 'info' }>({ 
    message: '', 
    isVisible: false, 
    type: 'success' 
  });

  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const page = searchParams.get('page');
      return page ? parseInt(page, 10) : 1;
    }
    return 1;
  });

  const ITEMS_PER_PAGE = 16;

  const currentUser = propCurrentUser !== undefined ? propCurrentUser : localCurrentUser;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentPage > 1) {
      url.searchParams.set('page', currentPage.toString());
    } else {
      url.searchParams.delete('page');
    }
    window.history.pushState({}, '', url);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    if (swrError) showToast(swrError.message, 'error');
  }, [swrError]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (previewItem && batches.length > 0) {
      const updatedItem = batches.find((b: any) => b.id === previewItem.id);
      if (updatedItem && JSON.stringify(updatedItem) !== JSON.stringify(previewItem)) {
        setPreviewItem(updatedItem);
      }
    }
  }, [batches, previewItem]);

  useEffect(() => {
    checkUser();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          checkUser();
          mutate(); 
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batches' },
        () => mutate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mutate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('username, is_admin')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setLocalCurrentUser(data.username);
        setIsAdmin(!!data.is_admin);
      }
    } else {
      setLocalCurrentUser(null);
      setIsAdmin(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastConfig({ message, isVisible: true, type });
    setTimeout(() => setToastConfig({ message: '', isVisible: false, type: 'success' }), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocalCurrentUser(null);
    setIsAdmin(false);
    showToast("You have been logged out.", "info");
  };

  const handleDownloadInitiate = async (providerName: string, url: string, batchId?: string) => {
    if (!url) return showToast('Download link is not available', 'error');

    if (batchId) {
      const { error } = await supabase.rpc('increment_download_count', { batch_id: batchId });
      if (error) {
        console.error('Failed to update download count:', error);
      }
    }

    showToast(`Redirecting to ${providerName}...`);
    setTimeout(() => {
      window.open(url, '_blank');
      setPreviewItem(null);
    }, 600);
  };

  const uploaderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    batches.forEach((batch: any) => {
      const user = batch.uploaded_by;
      if (user) {
        counts[user] = (counts[user] || 0) + 1;
      }
    });
    return counts;
  }, [batches]);

  const stats = useMemo(() => {
    const totalBatches = batches.length;
    
    const uniqueCreators = new Set(
      batches.map((b: any) => b.uploaded_by || b.username).filter(Boolean)
    ).size;

    const totalVideos = batches.reduce((sum: number, batch: any) => {
      const count = parseInt(batch.video_count, 10);
      return sum + (isNaN(count) ? 0 : count);
    }, 0);

    const totalSize = batches.reduce((sum: number, batch: any) => {
      let sizeInGB = 0;
      const sizeStr = (batch.size_file || `${batch.size_gb} GB` || '').toString().toUpperCase();
      const numericValue = parseFloat(sizeStr.replace(/[^\d.]/g, ''));

      if (!isNaN(numericValue)) {
        if (sizeStr.includes('MB')) {
          sizeInGB = numericValue / 1024;
        } else if (sizeStr.includes('KB')) {
          sizeInGB = numericValue / (1024 * 1024);
        } else {
          sizeInGB = numericValue;
        }
      }
      return sum + sizeInGB;
    }, 0);

    return { totalBatches, uniqueCreators, totalVideos, totalSize };
  }, [batches]);

  const filteredBatches = batches.filter((batch: any) => {
    const matchesCategory = activeCategory === 'Home' || batch.country === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (batch.username && batch.username.toLowerCase().includes(searchLower)) ||
      (batch.country && batch.country.toLowerCase().includes(searchLower)) ||
      (batch.uploaded_by && batch.uploaded_by.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);
  const paginatedBatches = filteredBatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      
      <div>
        <Navbar 
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          resetSearch={() => setSearchQuery('')}
          CATEGORIES={CATEGORIES}
          currentUser={currentUser}
          handleLogout={handleLogout}
          setShowAddModal={() => setShowAddModal(true)}
          setShowLoginModal={() => setShowLoginModal(true)}
          setShowRulesModal={() => {
            window.history.pushState({}, '', '/rules');
            window.dispatchEvent(new Event('popstate'));
          }} 
          EmeraldFolderIcon={EmeraldFolderIcon}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6 mb-10">
          
          {/* Banner Premium Selalu Tampil */}
          <PremiumHeroBanner onOpenUpgradeModal={() => onOpenUpgradeModal && onOpenUpgradeModal()} />

          {/* Search Bar */}
          <div className="w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search creators, region, uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white text-slate-800 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all font-medium placeholder:text-slate-400 border border-slate-200"
            />
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            <div className="bg-emerald-700 rounded-[1.5rem] p-6 text-white shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-medium text-[13px] tracking-wide text-emerald-50">Total Folders</span>
                <div className="p-2 bg-white/20 rounded-[0.75rem]">
                  <Folder size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-[2rem] leading-none font-bold mb-2 text-white">{stats.totalBatches}</h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 opacity-90 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                  Active Regions
                </p>
              </div>
            </div>

            <div className="bg-emerald-600 rounded-[1.5rem] p-6 text-white shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-medium text-[13px] tracking-wide text-emerald-50">Total Videos</span>
                <div className="p-2 bg-white/20 rounded-[0.75rem]">
                  <Film size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-[2rem] leading-none font-bold mb-2 text-white">{stats.totalVideos}</h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1 opacity-90 font-medium">
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                  Successfully Archived
                </p>
              </div>
            </div>

            <div className="bg-emerald-500 rounded-[1.5rem] p-6 text-white shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-medium text-[13px] tracking-wide text-emerald-50">Total Size</span>
                <div className="p-2 bg-white/20 rounded-[0.75rem]">
                  <HardDrive size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-[2rem] leading-none font-bold mb-2 text-white">
                  {stats.totalSize.toFixed(2)} GB
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 font-medium">
                  Total Uploaded
                </p>
              </div>
            </div>

            <div className="bg-emerald-400 rounded-[1.5rem] p-6 text-white shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-medium text-[13px] tracking-wide text-emerald-50">Total Creators</span>
                <div className="p-2 bg-white/20 rounded-[0.75rem]">
                  <Users size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-[2rem] leading-none font-bold mb-2 text-white">{stats.uniqueCreators}</h3>
                <p className="text-[11px] text-emerald-50 flex items-center gap-1.5 font-medium">
                  Joined Contributors
                </p>
              </div>
            </div>

          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedBatches.length > 0 ? (
                paginatedBatches.map((batch: any) => (
                  <CreatorCard 
                    key={batch.id} 
                    data={batch} 
                    onOpenPreview={setPreviewItem} 
                    uploaderCount={uploaderCounts[batch.uploaded_by] || 0} 
                  />
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Search size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No collections found</h3>
                  <p className="text-slate-500 max-w-md">Try adjusting your search query or switching categories to find what you're looking for.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12 mb-20">
                <a
                  href={currentPage > 1 ? `?page=${currentPage - 1}` : '#'}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(prev => prev - 1);
                  }}
                  className={`p-2.5 rounded-xl border border-slate-200 text-slate-600 transition-colors shadow-sm flex items-center justify-center ${
                    currentPage === 1 
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 pointer-events-none' 
                      : 'bg-white hover:bg-slate-50'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </a>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <a
                      key={i}
                      href={`?page=${i + 1}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center ${
                        currentPage === i + 1
                          ? 'bg-emerald-500 text-white border-none'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </a>
                  ))}
                </div>

                <a
                  href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
                  }}
                  className={`p-2.5 rounded-xl border border-slate-200 text-slate-600 transition-colors shadow-sm flex items-center justify-center ${
                    currentPage === totalPages 
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 pointer-events-none' 
                      : 'bg-white hover:bg-slate-50'
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </a>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer onSelectCountry={(category: string) => {
        setActiveCategory(category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      <Toast message={toastConfig.message} isVisible={toastConfig.isVisible} type={toastConfig.type} />
      
      <Suspense fallback={null}>
        {previewItem && (
          <PreviewModal 
            item={previewItem} 
            onClose={() => setPreviewItem(null)} 
            onDownload={handleDownloadInitiate}
            uploaderCount={uploaderCounts[previewItem.uploaded_by] || 0} 
            isUserPremium={isUserPremium}
            currentUser={currentUser} 
            onOpenUpgradeModal={onOpenUpgradeModal}
          />
        )}

        {showAddModal && (
          <PostModal 
            onClose={() => setShowAddModal(false)}
            onSuccess={() => mutate()} 
            currentUser={currentUser}
            showToast={showToast}
            CATEGORIES={CATEGORIES}
            isAdmin={isAdmin}
          />
        )}

        {showLoginModal && (
          <LoginModal 
            onClose={() => setShowLoginModal(false)}
            onSuccess={checkUser}
            showToast={showToast}
          />
        )}
      </Suspense>
    </div>
  );
}