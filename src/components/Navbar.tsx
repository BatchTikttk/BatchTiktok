import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Plus, LogIn, LogOut, User, ChevronDown, 
  Scale, BarChart2, Home, Globe, Trophy, Crown 
} from 'lucide-react';
import { supabase } from '../supabase';
import AvatarBorderVip from './AvatarBorderVip';

// Komponen helper untuk menampilkan bendera di Navbar
const RegionFlag = ({ country, className = "w-4 h-4" }: { country: string, className?: string }) => {
  const clipId = `nav-flag-${country.toLowerCase().replace(/\s+/g, '-')}`;
  
  let flagContent = null;
  switch (country) {
    case 'Indonesia':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="12" fill="#EF4444" />
          <rect x="0" y="12" width="24" height="12" fill="#FFFFFF" />
        </>
      );
      break;
    case 'Thailand':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="24" fill="#EF4444" />
          <rect x="0" y="4.3" width="24" height="15.4" fill="#FFFFFF" />
          <rect x="0" y="7.7" width="24" height="8.6" fill="#1E3A8A" />
        </>
      );
      break;
    case 'Taiwan':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="24" fill="#EF4444" />
          <rect x="0" y="0" width="12" height="12" fill="#1E3A8A" />
          <circle cx="6" cy="6" r="3.5" fill="#FFFFFF" />
        </>
      );
      break;
    case 'Philippines':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="12" fill="#1D4ED8" />
          <rect x="0" y="12" width="24" height="12" fill="#EF4444" />
          <polygon points="0,0 0,24 13.2,12" fill="#FFFFFF" />
          <circle cx="4.3" cy="12" r="3.6" fill="#FACC15" />
        </>
      );
      break;
    case 'Vietnam':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="24" fill="#EF4444" />
          <polygon 
            points="12,4.8 13.6,9.4 18.8,9.4 14.6,12.4 16.2,17.8 12,14.7 7.8,17.8 9.4,12.4 5.2,9.4 10.4,9.4" 
            fill="#FACC15" 
          />
        </>
      );
      break;
    default:
      return <Globe className={className} />;
  }

  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`${className} rounded-full overflow-hidden flex-shrink-0 drop-shadow-sm`}>
      <circle cx="12" cy="12" r="12" fill="#FFFFFF" />
      <clipPath id={clipId}>
        <circle cx="12" cy="12" r="11.5" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {flagContent}
      </g>
      <circle cx="12" cy="12" r="11.5" fill="none" stroke="#E2E8F0" strokeWidth="1" />
    </svg>
  );
};

// Mendefinisikan tipe data (TypeScript Interface)
interface NavbarProps {
  activeCategory?: string;
  setActiveCategory: (category: string) => void;
  resetSearch?: () => void;
  CATEGORIES?: string[];
  currentUser?: Record<string, any> | string | null;
  handleLogout: () => void;
  setShowAddModal: (show: boolean) => void;
  setShowLoginModal: (show: boolean) => void;
  setShowRulesModal?: any; 
  EmeraldFolderIcon: React.ElementType;
  onOpenProfile?: () => void;
  onOpenTopContributors?: () => void;
  onOpenUpgrade?: () => void;
}

export default function Navbar({ 
  activeCategory = 'Home', 
  setActiveCategory, 
  resetSearch,
  CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'], 
  currentUser,
  handleLogout, 
  setShowAddModal, 
  setShowLoginModal,
  setShowRulesModal,
  EmeraldFolderIcon,
  onOpenProfile,
  onOpenTopContributors,
  onOpenUpgrade
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [animationBorderUrl, setAnimationBorderUrl] = useState<string | null>(null);
  const [vipBorderUrl, setVipBorderUrl] = useState<string | null>(null);

  const regions = CATEGORIES.filter((c: string) => c !== 'Home');

  let displayUser = '';
  if (currentUser) {
    if (typeof currentUser === 'string') {
      displayUser = currentUser;
    } else if (typeof currentUser === 'object') {
      displayUser = currentUser.user_metadata?.full_name?.replace(/\s+/g, '').toLowerCase() || 
                    currentUser.email?.split('@')[0] || 
                    'user';
    }
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAvatarUrl(null);
        setIsPremium(false);
        setAnimationBorderUrl(null);
        setVipBorderUrl(null);
        return;
      }

      const userId = session.user.id;

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, is_premium, animation_border_url, vip_border_url')
        .eq('id', userId)
        .single();

      if (data) {
        if (data.avatar_url !== undefined) setAvatarUrl(data.avatar_url);
        if (data.is_premium !== undefined) setIsPremium(data.is_premium);
        if (data.animation_border_url !== undefined) setAnimationBorderUrl(data.animation_border_url);
        if (data.vip_border_url !== undefined) setVipBorderUrl(data.vip_border_url);
      }

      // Realtime subscription untuk mendeteksi perubahan profil & border secara instan
      channel = supabase
        .channel(`public:profiles:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            if (payload.new) {
              const newProfile = payload.new as Record<string, any>;
              if (newProfile.avatar_url !== undefined) {
                setAvatarUrl(newProfile.avatar_url);
              }
              if (newProfile.is_premium !== undefined) {
                setIsPremium(newProfile.is_premium);
              }
              if (newProfile.animation_border_url !== undefined) {
                setAnimationBorderUrl(newProfile.animation_border_url);
              }
              if (newProfile.vip_border_url !== undefined) {
                setVipBorderUrl(newProfile.vip_border_url);
              }
            }
          }
        )
        .subscribe();
    };

    fetchUserData();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const handleGoToProfile = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsRegionOpen(false);
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      window.history.pushState({}, '', '/profile');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleGoToHome = (category?: string) => {
    if (category) setActiveCategory(category);
    setIsMobileMenuOpen(false);
    setIsRegionOpen(false);
    resetSearch?.();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  const handleGoToTopContributors = () => {
    setIsMobileMenuOpen(false);
    setIsRegionOpen(false);
    if (onOpenTopContributors) {
      onOpenTopContributors();
    } else {
      setActiveCategory('Top Contributors');
      window.history.pushState({}, '', '/top-contributors');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleGoToRules = () => {
    setIsMobileMenuOpen(false);
    setIsRegionOpen(false);
    
    if (typeof setShowRulesModal === 'function') {
      setShowRulesModal(true);
    } else {
      window.history.pushState({}, '', '/rules');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleGoToUpgrade = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    
    if (isPremium) return; 

    if (onOpenUpgrade) {
      onOpenUpgrade();
    } else {
      window.dispatchEvent(new Event('openUpgradeModal'));
    }
  };

  const isTopContributorsActive = 
    activeCategory === 'Top Contributors' || window.location.pathname === '/top-contributors';

  const isRulesActive = window.location.pathname === '/rules';

  return (
    <nav className="sticky top-0 z-40 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-white/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleGoToHome('Home')}
          >
            <div className="w-10 h-10 flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <EmeraldFolderIcon className="w-8 h-8 drop-shadow-md" />
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">
              Batch<span className="text-emerald-500">Tiktok</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white p-1.5 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none relative">
            <button
              onClick={() => handleGoToHome('Home')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-none cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'Home' && window.location.pathname === '/'
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Home size={16} />
              Home
            </button>

            <div className="relative">
              <button
                onClick={() => setIsRegionOpen(!isRegionOpen)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-1.5 border-none cursor-pointer ${
                  regions.includes(activeCategory) && window.location.pathname === '/'
                    ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Globe size={16} />
                Region
                <ChevronDown size={14} className={`transition-transform duration-200 ${isRegionOpen ? 'rotate-180' : ''}`} />
              </button>

              {isRegionOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsRegionOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col z-40 animate-in fade-in slide-in-from-top-2 duration-200 py-1.5 border-none">
                    {regions.map((region: string) => (
                      <button
                        key={region}
                        onClick={() => handleGoToHome(region)}
                        className={`w-full px-5 py-2.5 text-left text-sm font-bold transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2.5 ${
                          activeCategory === region && window.location.pathname === '/'
                            ? 'text-emerald-600 bg-emerald-50/50' 
                            : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        <RegionFlag country={region} className="w-[18px] h-[18px]" />
                        {region}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleGoToTopContributors}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-none cursor-pointer flex items-center gap-1.5 ${
                isTopContributorsActive
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Trophy size={16} />
              Top Contributors
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button 
              onClick={handleGoToRules}
              className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-sm font-bold flex items-center gap-2 transition-all border-none cursor-pointer ${
                isRulesActive ? 'text-emerald-600 ring-2 ring-emerald-500/20' : 'text-slate-600'
              }`}
              title="Posting Rules"
            >
              <Scale className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-500" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            {currentUser ? (
              <div className="hidden sm:relative sm:block">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2.5 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-sm font-bold text-slate-600 flex items-center gap-2.5 transition-all border-none cursor-pointer"
                >
                  {/* Container Avatar + Animation Border */}
                  <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : typeof currentUser === 'object' && currentUser?.user_metadata?.avatar_url ? (
                        <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} />
                      )}
                    </div>

                    {/* Menampilkan VIP Border jika ada, atau Animation Border (Progress) jika tidak ada VIP */}
                    {vipBorderUrl ? (
                      <AvatarBorderVip borderUrl={vipBorderUrl} isPremium={isPremium} />
                    ) : animationBorderUrl ? (
                      <img 
                        src={animationBorderUrl} 
                        alt="Animated Border" 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain z-20 pointer-events-none drop-shadow-sm"
                      />
                    ) : null}
                  </div>

                  <span>@{displayUser}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200 border-none">
                      
                      <button
                        onClick={handleGoToProfile}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors text-left border-none bg-transparent cursor-pointer"
                      >
                        <BarChart2 size={18} /> User Profile
                      </button>

                      <button
                        onClick={handleGoToUpgrade}
                        className={`w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold transition-colors text-left border-none bg-transparent cursor-pointer ${
                          isPremium 
                            ? 'text-amber-600 bg-amber-50/60 cursor-default' 
                            : 'text-amber-500 hover:bg-amber-50'
                        }`}
                      >
                        <Crown size={18} /> {isPremium ? 'VIP User' : 'Upgrade VIP'}
                      </button>

                      <button
                        onClick={() => {
                          setShowAddModal(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors text-left border-none bg-transparent cursor-pointer"
                      >
                        <Plus size={18} /> Add Collection
                      </button>
                      
                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left border-none bg-transparent cursor-pointer"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-sm font-bold text-slate-600 flex items-center gap-2 transition-all border-none cursor-pointer"
                title="Sign In"
              >
                <LogIn className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <button 
              className="md:hidden p-2.5 text-slate-500 hover:text-slate-800 bg-white rounded-xl shadow-sm border-none cursor-pointer z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white mx-4 mt-2 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-2 border-none z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <button
            onClick={() => handleGoToHome('Home')}
            className={`px-4 py-3 rounded-2xl text-left text-sm font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${
              activeCategory === 'Home' && window.location.pathname === '/'
                ? 'bg-emerald-50 text-emerald-600' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Home size={18} />
            Home
          </button>

          <div className="flex flex-col gap-1 px-2 pt-1 pb-1">
            <span className="px-2 py-1 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Globe size={12} /> Region</span>
            {regions.map((region: string) => (
              <button
                key={region}
                onClick={() => handleGoToHome(region)}
                className={`px-4 py-2.5 rounded-2xl text-left text-sm font-bold transition-all border-none cursor-pointer flex items-center gap-2.5 ${
                  activeCategory === region && window.location.pathname === '/'
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <RegionFlag country={region} className="w-5 h-5" />
                {region}
              </button>
            ))}
          </div>

          <button
            onClick={handleGoToTopContributors}
            className={`px-4 py-3 rounded-2xl text-left text-sm font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${
              isTopContributorsActive
                ? 'bg-emerald-50 text-emerald-600' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Trophy size={18} />
            Top Contributors
          </button>

          <div className="border-t border-slate-100 mt-2 pt-2 flex flex-col gap-2">
            <button 
              onClick={handleGoToRules} 
              className={`px-4 py-3 flex items-center gap-2 text-left text-sm font-bold hover:bg-slate-50 transition-colors rounded-2xl border-none bg-transparent cursor-pointer ${
                isRulesActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600'
              }`}
            >
              <Scale size={18} className="text-emerald-500" /> Posting Rules
            </button>

            {currentUser ? (
              <>
                <div className="px-4 py-2 mb-1 flex items-center gap-3">
                  {/* Container Avatar + Border di Tampilan Mobile */}
                  <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>

                    {vipBorderUrl ? (
                      <AvatarBorderVip borderUrl={vipBorderUrl} isPremium={isPremium} />
                    ) : animationBorderUrl ? (
                      <img 
                        src={animationBorderUrl} 
                        alt="Animated Border" 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain z-20 pointer-events-none drop-shadow-sm"
                      />
                    ) : null}
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</span>
                    <span className="block text-sm font-bold text-slate-800">@{displayUser}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleGoToProfile}
                  className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors rounded-2xl border-none bg-transparent cursor-pointer"
                >
                  <BarChart2 size={18} /> User Profile
                </button>

                <button 
                  onClick={handleGoToUpgrade}
                  className={`px-4 py-3 flex items-center gap-2 text-left text-sm font-bold transition-colors rounded-2xl border-none bg-transparent cursor-pointer ${
                    isPremium ? 'text-amber-600 bg-amber-50/60' : 'text-amber-500 hover:bg-amber-50'
                  }`}
                >
                  <Crown size={18} /> {isPremium ? 'VIP User' : 'Upgrade VIP'}
                </button>

                <button onClick={() => {setShowAddModal(true); setIsMobileMenuOpen(false);}} className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-2xl border-none cursor-pointer">
                  <Plus size={18} /> Add New Collection
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button onClick={() => {handleLogout(); setIsMobileMenuOpen(false);}} className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 transition-colors rounded-2xl border-none cursor-pointer">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <button onClick={() => {setShowLoginModal(true); setIsMobileMenuOpen(false);}} className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors border-none cursor-pointer">
                <LogIn size={18} /> Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}