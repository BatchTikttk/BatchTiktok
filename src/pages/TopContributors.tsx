import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { EmeraldFolderIcon } from '../components/SharedIcons';
import { Users, Video, CheckCircle2, XCircle, UploadCloud, Crown, Trophy } from 'lucide-react';
import LoginModal from "../components/LoginModal";
import PostModal from "../components/PostModal";

const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

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
  { id: 'carberus', name: 'Carberus', url: 'https://qu.ax/Yf3Q0.webm', gradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)' },
];

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'info' | 'error';
}

const Toast = ({ message, isVisible, type = 'success' }: ToastProps) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 transition-all duration-300 z-[9999] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
    <span className="text-sm font-medium">{message}</span>
  </div>
);

interface Stats {
  totalUploads: number;
  totalApproved: number;
  totalVideos: number;
}

interface BadgeItem {
  id: string;
  title: string;
  tier: string;
  iconUrl: string;
  colorClass: string;
  isUnlocked: (stats: Stats) => boolean;
}

const BADGES: BadgeItem[] = [
  {
    id: 'bronze',
    title: 'Bronze Tier',
    tier: 'Tier 1 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Bronze.webp',
    colorClass: 'text-[#b08d6a]',
    isUnlocked: (stats: Stats) => stats.totalUploads >= 10,
  },
  {
    id: 'silver',
    title: 'Silver Tier',
    tier: 'Tier 2 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Silver.webp',
    colorClass: 'text-slate-500',
    isUnlocked: (stats: Stats) => stats.totalUploads >= 30,
  },
  {
    id: 'gold',
    title: 'Gold Tier',
    tier: 'Tier 3 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Gold.webp',
    colorClass: 'text-amber-500',
    isUnlocked: (stats: Stats) => stats.totalUploads >= 50,
  },
  {
    id: 'elite',
    title: 'Elite Tier',
    tier: 'Tier 4 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Elite.webp',
    colorClass: 'text-blue-500',
    isUnlocked: (stats: Stats) => stats.totalUploads >= 100,
  },
  {
    id: 'legend',
    title: 'Legend Tier',
    tier: 'Tier 5 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Legend.webp',
    colorClass: 'text-rose-600',
    isUnlocked: (stats: Stats) => stats.totalUploads >= 200,
  },
];

interface ContributeBannerProps {
  onOpenUploadModal: () => void;
}

const ContributeBanner = ({ onOpenUploadModal }: ContributeBannerProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      title: "Jadilah Kontributor Teratas &",
      highlight: "Puncaki Leaderboard!",
      textColor: "text-emerald-400",
      btnBg: "bg-emerald-500 hover:bg-emerald-400",
      dotActive: "bg-emerald-400",
      gradientFrom: "from-emerald-500/15",
      description: "Bagikan dan unggah koleksi arsip terbaik milikmu sekarang. Kumpulkan poin upload, naikkan level, dan dapatkan Lencana Eksklusif!",
      visual: (
        <div className="relative transform scale-[1.35] group-hover:scale-110 transition-transform duration-500">
          <EmeraldFolderIcon className="w-24 h-24" />
        </div>
      )
    },
    {
      title: "Unggah & Bagikan",
      highlight: "Koleksi Eksklusif",
      textColor: "text-amber-400",
      btnBg: "bg-amber-500 hover:bg-amber-400",
      dotActive: "bg-amber-400",
      gradientFrom: "from-amber-500/15",
      description: "Koleksi eksklusif kamu mendapatkan perhatian khusus dan membantu komunitas menemukan arsip berkualitas terbaik.",
      visual: (
        <div className="relative transform scale-[1.35] group-hover:scale-110 transition-transform duration-500">
          <EmeraldFolderIcon className="w-24 h-24" isExclusive={true} />
          <div className="absolute -top-[14px] -left-[6px] z-20 -rotate-[15deg] pointer-events-none filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.5)]">
            <Crown size={24} className="text-amber-500 fill-amber-400" strokeWidth={1.5} />
          </div>
        </div>
      )
    },
    {
      title: "Dukung Komunitas",
      highlight: "Koleksi Adult (+18)",
      textColor: "text-pink-400",
      btnBg: "bg-pink-500 hover:bg-pink-400",
      dotActive: "bg-pink-400",
      gradientFrom: "from-pink-500/15",
      description: "Bantu mengkategorikan arsip khusus pengguna dewasa secara terorganisir, rapi, dan mudah diakses.",
      visual: (
        <div className="relative transform scale-[1.35] group-hover:scale-110 transition-transform duration-500">
          <EmeraldFolderIcon className="w-24 h-24" isAdult={true} />
        </div>
      )
    },
    {
      title: "Amankan Koleksi Arsip",
      highlight: "Khusus TikTok Banned",
      textColor: "text-red-400",
      btnBg: "bg-red-500 hover:bg-red-400",
      dotActive: "bg-red-400",
      gradientFrom: "from-red-500/15",
      description: "Simpan dan amankan kembali koleksi video atau arsip yang terkena banned dari platform TikTok di sini.",
      visual: (
        <div className="relative transform scale-[1.35] group-hover:scale-110 transition-transform duration-500">
          <EmeraldFolderIcon className="w-24 h-24" isBanned={true} />
        </div>
      )
    }
  ];

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const activeSlide = slides[currentSlide];

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full overflow-hidden bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-none flex flex-col md:flex-row items-center justify-between p-8 md:p-10 mb-8 group cursor-default"
    >
      <div className={`absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l ${activeSlide.gradientFrom} to-transparent pointer-events-none transition-all duration-1000`}></div>

      <div className="relative z-10 w-full md:w-3/5 flex flex-col items-start text-left">
        <div className="relative w-full min-h-[160px] flex flex-col justify-center mb-6">
          {slides.map((slide, index) => (
            <div
              key={`text-${index}`}
              className={`transition-all duration-700 ease-in-out ${
                currentSlide === index 
                  ? 'opacity-100 translate-y-0 relative z-10 block' 
                  : 'opacity-0 translate-y-3 absolute inset-0 pointer-events-none hidden'
              }`}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                {slide.title} <br />
                <span className={slide.textColor}>{slide.highlight}</span>
              </h2>

              <p className="text-slate-300 font-medium max-w-lg text-sm sm:text-base leading-relaxed">
                {slide.description}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenUploadModal}
          className={`flex items-center gap-2 ${activeSlide.btnBg} text-slate-900 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-md border-none hover:-translate-y-0.5 cursor-pointer text-sm`}
        >
          <UploadCloud size={18} className="text-slate-900" />
          Mulai Upload Arsip Sekarang
        </button>
      </div>

      <div className="relative z-10 w-full md:w-2/5 h-[160px] flex items-center justify-center md:justify-end mt-6 md:mt-0">
        {slides.map((slide, index) => (
          <div
            key={`visual-${index}`}
            className={`transition-all duration-700 ease-in-out flex items-center justify-center ${
              currentSlide === index 
                ? 'opacity-100 scale-100 relative z-10 block' 
                : 'opacity-0 scale-90 absolute pointer-events-none hidden'
            }`}
          >
            {slide.visual}
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 right-8 md:right-10 flex gap-2 z-20">
        {slides.map((slide, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === index ? `w-6 ${slide.dotActive}` : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function TopContributors() {
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<any[]>([]);
  
  // Ambil state awal dari localStorage agar langsung sinkron tanpa glitch
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('cached_username'));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ message: string; isVisible: boolean; type: 'success' | 'info' | 'error' }>({ message: '', isVisible: false, type: 'success' });

  useEffect(() => {
    fetchTopContributors();
    checkUser();

    const handleProfileUpdate = () => {
      checkUser();
      fetchTopContributors();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    window.addEventListener('focus', handleProfileUpdate);

    const channel = supabase
      .channel('schema-db-changes-top')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          checkUser();
          fetchTopContributors();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batches' },
        () => {
          fetchTopContributors();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
      window.removeEventListener('focus', handleProfileUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('username, is_admin, is_premium')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setCurrentUser(data.username);
        localStorage.setItem('cached_username', data.username);
        localStorage.setItem('cached_is_admin', data.is_admin ? 'true' : 'false');
        localStorage.setItem('cached_is_premium', data.is_premium ? 'true' : 'false');
      }
    } else {
      setCurrentUser(null);
      localStorage.removeItem('cached_username');
      localStorage.removeItem('cached_is_admin');
      localStorage.removeItem('cached_is_premium');
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastConfig({ message, isVisible: true, type });
    setTimeout(() => setToastConfig({ message: '', isVisible: false, type: 'success' }), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('cached_username');
    localStorage.removeItem('cached_is_admin');
    localStorage.removeItem('cached_is_premium');
    showToast("You have been logged out.", "info");
  };

  const handleNavigateToCreator = (username: string) => {
    if (!username) return;
    window.history.pushState({}, '', `/creator/${username}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleOpenUpload = () => {
    if (!currentUser) {
      setShowLoginModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  const fetchTopContributors = async () => {
    setLoading(true);
    
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: batches } = await supabase.from('batches').select('*');

    if (profiles && batches) {
      const userStats = profiles.map(profile => {
        const userBatches = batches.filter(b => b.user_id === profile.id);
        
        const totalUploads = userBatches.length;
        const totalApproved = userBatches.filter(b => b.status === 'approved').length;
        const totalVideos = userBatches.reduce((acc, b) => acc + (Number(b.video_count) || 0), 0);
        
        const stats: Stats = { totalUploads, totalApproved, totalVideos };
        
        const calculatedLevel = Math.floor(totalUploads / 3) + 1;

        const unlockedBadges = BADGES.filter(badge => badge.isUnlocked(stats));
        const highestBadge = unlockedBadges.length > 0 ? unlockedBadges[unlockedBadges.length - 1] : null;

        return {
          ...profile,
          stats,
          highestBadge,
          level: calculatedLevel 
        };
      })
      .filter(user => user.stats.totalUploads > 0 && user.role !== 'admin' && user.is_admin !== true)
      .sort((a, b) => b.stats.totalVideos - a.stats.totalVideos);

      setContributors(userStats);
    }
    setLoading(false);
  };

  const rank1 = contributors[0];
  const rank2 = contributors[1];
  const rank3 = contributors[2];
  const restOfContributors = contributors.slice(3, 10);

  const getBorderUrl = (user: any) => {
    if (!user) return null;
    if (user.is_premium && user.vip_border_url) return user.vip_border_url;
    if (user.animation_border_url) return user.animation_border_url;
    return null;
  };

  const rank1Border = getBorderUrl(rank1);
  const rank2Border = getBorderUrl(rank2);
  const rank3Border = getBorderUrl(rank3);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between">
      <div>
        <Navbar 
          activeCategory="Top Contributors"
          setActiveCategory={(category: string) => {
             // Menggunakan SPA Router event alih-alih window.location.href agar tidak terjadi full reload/glitch
             const targetUrl = category === 'Home' ? '/' : `/?category=${category}`;
             window.history.pushState({}, '', targetUrl);
             window.dispatchEvent(new Event('popstate'));
          }}
          resetSearch={() => {}}
          CATEGORIES={CATEGORIES}
          EmeraldFolderIcon={EmeraldFolderIcon}
          currentUser={currentUser}
          handleLogout={handleLogout}
          setShowAddModal={() => setShowAddModal(true)}
          setShowLoginModal={() => setShowLoginModal(true)}
          setShowRulesModal={() => {
            window.history.pushState({}, '', '/rules');
            window.dispatchEvent(new Event('popstate'));
          }}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <ContributeBanner onOpenUploadModal={handleOpenUpload} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-emerald-500" size={20} />
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Contributor Profiles</h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-28 animate-pulse"></div>
                  ))}
                </div>
              ) : contributors.length === 0 ? (
                 <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center col-span-1 sm:col-span-2">
                   <p className="text-slate-500 font-medium">Belum ada kontributor komunitas.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {contributors.map((user) => {
                    const hasWebm = (user.is_premium || user.is_admin) && user.card_bg_url;
                    
                    const matchedPreset = PRESET_BACKGROUNDS.find(p => p.url === user.card_bg_url);
                    const cardGradient = matchedPreset?.gradient || 'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)';

                    return (
                      <div 
                        key={user.id} 
                        onClick={() => handleNavigateToCreator(user.username)}
                        style={hasWebm ? { background: cardGradient } : undefined}
                        className={`p-5 relative overflow-hidden group transition-all cursor-pointer flex items-center justify-between min-h-[96px] ${
                          hasWebm 
                            ? 'rounded-2xl shadow-md hover:shadow-xl border border-white/20' 
                            : 'bg-white border border-slate-100 shadow-sm hover:shadow-md rounded-3xl' 
                        }`}
                      >
                        {hasWebm && (
                          <div 
                            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
                            style={{ maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 165.312px, rgb(0, 0, 0) 215.312px)' }}
                          >
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover object-right"
                            >
                              <source src={user.card_bg_url} type="video/webm" />
                            </video>
                          </div>
                        )}

                        <div className="flex items-center gap-4 relative z-10 w-full">
                          <div className={`w-14 h-14 rounded-full flex-shrink-0 overflow-hidden ${hasWebm ? 'border-2 border-white/80 shadow-md' : 'bg-slate-100 border-2 border-white shadow-sm'}`}>
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center font-black text-xl ${hasWebm ? 'bg-slate-800 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                {user.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-bold transition-colors drop-shadow-md truncate ${hasWebm ? 'text-white' : 'text-slate-800 group-hover:text-emerald-600'}`}>
                              {user.username}
                            </h3>

                            <div className="flex items-center gap-2 mt-1">
                              <p className={`text-[11px] font-semibold drop-shadow-sm ${hasWebm ? 'text-white/90' : 'text-slate-600'}`}>
                                Community Contributor
                              </p>
                              <span className={`w-1 h-1 rounded-full ${hasWebm ? 'bg-white/60' : 'bg-slate-400'}`}></span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-md ${
                                hasWebm 
                                  ? 'text-white bg-white/20 border border-white/30 drop-shadow-sm' 
                                  : 'text-emerald-800 bg-emerald-50/90 border border-emerald-200/80'
                              }`}>
                                Level {user.level}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 sticky top-8">
                
                <div className="flex flex-col items-center text-center mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy size={20} className="fill-amber-500 text-amber-500 flex-shrink-0" />
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">Leaderboard</h2>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Total Videos Uploaded</p>
                </div>

                {!loading && contributors.length > 0 ? (
                  <>
                    <div className="flex justify-center items-end gap-3 my-6">
                      
                      {/* LEADERBOARD RANK 2 */}
                      {rank2 && (
                        <div 
                          className="flex flex-col items-center cursor-pointer group" 
                          onClick={() => handleNavigateToCreator(rank2.username)}
                        >
                          <span className="text-[11px] text-slate-500 font-medium mb-1.5 truncate w-16 text-center group-hover:text-emerald-500">
                            @{rank2.username}
                          </span>
                          <div className="relative flex items-center justify-center w-16 h-16 my-2">
                            {rank2Border && (
                              <img 
                                src={rank2Border} 
                                alt="Border" 
                                className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none drop-shadow-sm scale-[1.25]" 
                              />
                            )}
                            <div className="rounded-full border-2 border-white bg-white w-full h-full relative z-10 overflow-hidden flex items-center justify-center shadow-sm">
                              {rank2.avatar_url ? (
                                <img src={rank2.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                  {rank2.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[11px] font-black border-2 border-white shadow-sm z-30 -bottom-2.5">
                              2
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100 mt-3">
                            <Video size={12} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">{rank2.stats.totalVideos}</span>
                          </div>
                        </div>
                      )}

                      {/* LEADERBOARD RANK 1 */}
                      {rank1 && (
                        <div 
                          className="flex flex-col items-center mb-4 cursor-pointer group" 
                          onClick={() => handleNavigateToCreator(rank1.username)}
                        >
                          <span className="text-[12px] text-slate-800 font-bold mb-1.5 truncate w-20 text-center group-hover:text-emerald-600">
                            @{rank1.username}
                          </span>
                          <div className="relative flex items-center justify-center w-20 h-20 my-2">
                            {rank1Border && (
                              <img 
                                src={rank1Border} 
                                alt="Border" 
                                className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none drop-shadow-sm scale-[1.25]" 
                              />
                            )}
                            <div className="rounded-full border-2 border-white bg-white w-full h-full relative z-10 overflow-hidden flex items-center justify-center shadow-md">
                              {rank1.avatar_url ? (
                                <img src={rank1.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xl">
                                  {rank1.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-black border-2 border-white shadow-sm z-30 -bottom-3">
                              1
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 shadow-xs mt-4">
                            <Video size={13} className="text-amber-500 fill-amber-500/20" />
                            <span className="text-xs font-black text-amber-700">{rank1.stats.totalVideos}</span>
                          </div>
                        </div>
                      )}

                      {/* LEADERBOARD RANK 3 */}
                      {rank3 && (
                        <div 
                          className="flex flex-col items-center cursor-pointer group" 
                          onClick={() => handleNavigateToCreator(rank3.username)}
                        >
                          <span className="text-[11px] text-slate-500 font-medium mb-1.5 truncate w-16 text-center group-hover:text-emerald-500">
                            @{rank3.username}
                          </span>
                          <div className="relative flex items-center justify-center w-16 h-16 my-2">
                            {rank3Border && (
                              <img 
                                src={rank3Border} 
                                alt="Border" 
                                className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none drop-shadow-sm scale-[1.25]" 
                              />
                            )}
                            <div className="rounded-full border-2 border-white bg-white w-full h-full relative z-10 overflow-hidden flex items-center justify-center shadow-sm">
                              {rank3.avatar_url ? (
                                <img src={rank3.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-700 font-bold">
                                  {rank3.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-[11px] font-black border-2 border-white shadow-sm z-30 -bottom-2.5">
                              3
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100 mt-3">
                            <Video size={12} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">{rank3.stats.totalVideos}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {restOfContributors.length > 0 && (
                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <div className="flex justify-between items-center mb-3 px-1">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Members</h3>
                          <span className="text-[11px] font-semibold text-slate-400">Total Uploaded</span>
                        </div>
                        <div className="space-y-1">
                          {restOfContributors.map((user, idx) => (
                            <div 
                              key={user.id} 
                              onClick={() => handleNavigateToCreator(user.username)}
                              className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group relative overflow-hidden"
                            >
                              <span className="w-5 text-center text-xs font-bold text-slate-400 group-hover:text-slate-600 relative z-10">
                                {idx + 4}
                              </span>
                              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative z-10">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                    {user.username?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden relative z-10">
                                <p className="text-[13px] font-bold text-slate-700 truncate group-hover:text-emerald-600 drop-shadow-sm">
                                  @{user.username}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 bg-slate-100/80 backdrop-blur-sm px-2.5 py-1 rounded-full relative z-10">
                                <Video size={12} className="text-emerald-500" />
                                <span className="text-xs font-extrabold text-slate-700">{user.stats.totalVideos}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : loading ? (
                  <div className="space-y-4 py-6 animate-pulse">
                    <div className="h-16 bg-slate-100 rounded-2xl w-full"></div>
                    <div className="h-24 bg-slate-100 rounded-2xl w-full"></div>
                  </div>
                ) : (
                  <div className="text-center text-sm text-slate-400 py-8">
                    Belum ada data kontributor.
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
      
      <Footer onSelectCountry={(category: string) => {
         const targetUrl = category === 'Home' ? '/' : `/?category=${category}`;
         window.history.pushState({}, '', targetUrl);
         window.dispatchEvent(new Event('popstate'));
      }} />

      <Toast message={toastConfig.message} isVisible={toastConfig.isVisible} type={toastConfig.type} />
      
      {showAddModal && (
        <PostModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchTopContributors}
          currentUser={currentUser}
          showToast={showToast}
          CATEGORIES={CATEGORIES}
        />
      )}

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSuccess={checkUser}
          showToast={showToast}
        />
      )}
    </div>
  );
}