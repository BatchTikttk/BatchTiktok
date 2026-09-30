import { useState, useEffect } from 'react';
import { Menu, X, Plus, LogIn, LogOut, User, ChevronDown, Scale, BarChart2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function Navbar({ 
  activeCategory, 
  setActiveCategory, 
  resetSearch,
  CATEGORIES, 
  currentUser,
  handleLogout, 
  setShowAddModal, 
  setShowLoginModal,
  setShowRulesModal,
  EmeraldFolderIcon,
  onOpenProfile,
  onOpenTopContributors
}: any) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
    let channel: any;

    const fetchUserAvatar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAvatarUrl(null);
        return;
      }

      const userId = session.user.id;

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }

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
            if (payload.new && payload.new.avatar_url) {
              setAvatarUrl(payload.new.avatar_url);
            }
          }
        )
        .subscribe();
    };

    fetchUserAvatar();

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

  const isTopContributorsActive = 
    activeCategory === 'Top Contributors' || window.location.pathname === '/top-contributors';

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
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-none cursor-pointer ${
                activeCategory === 'Home' && window.location.pathname === '/'
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
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
                        className={`w-full px-5 py-2.5 text-left text-sm font-bold transition-colors border-none bg-transparent cursor-pointer ${
                          activeCategory === region && window.location.pathname === '/'
                            ? 'text-emerald-600 bg-emerald-50/50' 
                            : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleGoToTopContributors}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-none cursor-pointer ${
                isTopContributorsActive
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Top Contributors
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowRulesModal(true)}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-sm font-bold text-slate-600 flex items-center gap-2 transition-all border-none cursor-pointer"
              title="Posting Rules"
            >
              <Scale size={16} className="text-emerald-500" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            {currentUser ? (
              <div className="hidden sm:relative sm:block">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2.5 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-sm font-bold text-slate-600 flex items-center gap-2.5 transition-all border-none cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : typeof currentUser === 'object' && currentUser?.user_metadata?.avatar_url ? (
                      <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
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
                        onClick={() => {
                          setShowAddModal(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors text-left border-none bg-transparent cursor-pointer"
                      >
                        <Plus size={18} /> Add Collection
                      </button>
                      
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
                className="px-5 py-2.5 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-sm font-bold text-slate-600 flex items-center gap-2 transition-all border-none cursor-pointer"
              >
                <LogIn size={16} className="text-emerald-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <button 
              className="md:hidden p-2.5 text-slate-500 hover:text-slate-800 bg-white rounded-xl shadow-sm border-none cursor-pointer z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white mx-4 mt-2 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-2 border-none z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <button
            onClick={() => handleGoToHome('Home')}
            className={`px-4 py-3 rounded-2xl text-left text-sm font-bold transition-all border-none cursor-pointer ${
              activeCategory === 'Home' && window.location.pathname === '/'
                ? 'bg-emerald-50 text-emerald-600' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          <div className="flex flex-col gap-1 px-2 pt-1 pb-1">
            <span className="px-2 py-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">Region</span>
            {regions.map((region: string) => (
              <button
                key={region}
                onClick={() => handleGoToHome(region)}
                className={`px-4 py-2.5 rounded-2xl text-left text-sm font-bold transition-all border-none cursor-pointer ${
                  activeCategory === region && window.location.pathname === '/'
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          <button
            onClick={handleGoToTopContributors}
            className={`px-4 py-3 rounded-2xl text-left text-sm font-bold transition-all border-none cursor-pointer ${
              isTopContributorsActive
                ? 'bg-emerald-50 text-emerald-600' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Top Contributors
          </button>

          <div className="border-t border-slate-100 mt-2 pt-2 flex flex-col gap-2">
            <button 
              onClick={() => {setShowRulesModal(true); setIsMobileMenuOpen(false);}} 
              className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors rounded-2xl border-none bg-transparent cursor-pointer"
            >
              <Scale size={18} className="text-emerald-500" /> Posting Rules
            </button>

            {currentUser ? (
              <>
                <div className="px-4 py-2 mb-1 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
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

                <button onClick={() => {setShowAddModal(true); setIsMobileMenuOpen(false);}} className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-2xl border-none cursor-pointer">
                  <Plus size={18} /> Add New Collection
                </button>
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