import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { EmeraldFolderIcon } from '../components/SharedIcons';
import { Trophy, Users, Video, CheckCircle2, XCircle } from 'lucide-react';
import LoginModal from "../components/LoginModal";
import PostModal from "../components/PostModal";

const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

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
  isUnlocked: (stats: Stats) => boolean;
}

const BADGES: BadgeItem[] = [
  {
    id: 'low_tier',
    title: 'Emerald Rookie',
    tier: 'Tier 1 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Low%20Tier.webp',
    isUnlocked: (stats: Stats) => stats.totalUploads >= 10,
  },
  {
    id: 'medium_tier',
    title: 'Emerald Pro',
    tier: 'Tier 2 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Medium%20Tier.webp',
    isUnlocked: (stats: Stats) => stats.totalApproved >= 30,
  },
  {
    id: 'advance_tier',
    title: 'Emerald Master',
    tier: 'Tier 3 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Advance%20Tier.webp',
    isUnlocked: (stats: Stats) => stats.totalApproved >= 50,
  },
];

export default function TopContributors() {
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<any[]>([]);
  
  // Sinkronisasi state dari logika homepage
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ message: string; isVisible: boolean; type: 'success' | 'info' | 'error' }>({ message: '', isVisible: false, type: 'success' });

  useEffect(() => {
    fetchTopContributors();
    checkUser();

    // Subscribe ke perubahan auth/profile seperti di beranda
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
        
      if (data) setCurrentUser(data.username);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastConfig({ message, isVisible: true, type });
    setTimeout(() => setToastConfig({ message: '', isVisible: false, type: 'success' }), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    showToast("You have been logged out.", "info");
  };

  const handleNavigateToCreator = (username: string) => {
    if (!username) return;
    window.history.pushState({}, '', `/creator/${username}`);
    window.dispatchEvent(new Event('popstate'));
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
        
        const unlockedBadges = BADGES.filter(badge => badge.isUnlocked(stats));
        const highestBadge = unlockedBadges.length > 0 ? unlockedBadges[unlockedBadges.length - 1] : null;

        return {
          ...profile,
          stats,
          highestBadge
        };
      })
      .filter(user => user.stats.totalUploads > 0 && user.role !== 'admin' && user.is_admin !== true)
      .sort((a, b) => b.stats.totalVideos - a.stats.totalVideos);

      setContributors(userStats);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between">
      <div>
        <Navbar 
          activeCategory="Top Contributors"
          setActiveCategory={(category: string) => {
             window.location.href = category === 'Home' ? '/' : `/?category=${category}`;
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
          
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 mb-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                Top Contributors
              </h1>
              <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
                Appreciation for the most active community members who consistently share the best collections.
              </p>
            </div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-emerald-500" size={20} />
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Contributor Profiles</h2>
                <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  {contributors.length} Community Members
                </span>
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
                  {contributors.map((user) => (
                    <div 
                      key={user.id} 
                      onClick={() => handleNavigateToCreator(user.username)}
                      className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative group transition-all hover:shadow-md cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xl">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                            @{user.username}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            Community Contributor
                          </p>
                        </div>
                      </div>

                      {user.highestBadge && (
                        <div title={user.highestBadge.title} className="flex-shrink-0">
                          <img 
                            src={user.highestBadge.iconUrl} 
                            alt={user.highestBadge.title} 
                            className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Leaderboard</h2>
                    <p className="text-[11px] text-slate-400 font-semibold">Top Community Ranks</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {contributors.slice(0, 5).map((user, index) => (
                    <div 
                      key={user.id} 
                      onClick={() => handleNavigateToCreator(user.username)}
                      className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 text-center text-xs font-black ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-300'}`}>
                          #{index + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200 flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors truncate max-w-[100px]">
                            @{user.username}
                          </span>
                          
                          {user.highestBadge && (
                            <img 
                              src={user.highestBadge.iconUrl} 
                              alt="Badge" 
                              className="w-4 h-4 object-contain flex-shrink-0"
                              title={user.highestBadge.title}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Video size={14} className="text-emerald-500" /> {user.stats.totalVideos}
                      </div>
                    </div>
                  ))}
                  
                  {!loading && contributors.length === 0 && (
                     <div className="text-center text-sm text-slate-400 py-4">
                       Belum ada data.
                     </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
      
      <Footer onSelectCountry={(category: string) => {
         window.location.href = category === 'Home' ? '/' : `/?category=${category}`;
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