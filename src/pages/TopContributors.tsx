import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { EmeraldFolderIcon } from '../components/SharedIcons';
import { Trophy, Users, Video, Folder } from 'lucide-react';

const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

const BADGES = [
  {
    id: 'low_tier',
    title: 'Emerald Rookie',
    tier: 'Tier 1 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Low%20Tier.webp',
    isUnlocked: (stats: any) => stats.totalUploads >= 10,
  },
  {
    id: 'medium_tier',
    title: 'Emerald Pro',
    tier: 'Tier 2 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Medium%20Tier.webp',
    isUnlocked: (stats: any) => stats.totalApproved >= 30,
  },
  {
    id: 'advance_tier',
    title: 'Emerald Master',
    tier: 'Tier 3 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Advance%20Tier.webp',
    isUnlocked: (stats: any) => stats.totalApproved >= 50,
  },
];

export default function TopContributors() {
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<any[]>([]);

  useEffect(() => {
    fetchTopContributors();
  }, []);

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
        
        const stats = { totalUploads, totalApproved, totalVideos };
        
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
          setActiveCategory={() => {}}
          resetSearch={() => {}}
          CATEGORIES={CATEGORIES}
          EmeraldFolderIcon={EmeraldFolderIcon}
          currentUser={null}
          handleLogout={() => {}}
          setShowAddModal={() => {}}
          setShowLoginModal={() => {}}
          setShowRulesModal={() => {}}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          
          {/* Header Banner */}
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 mb-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                Top Contributors
              </h1>
              <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
                Appreciation for the most active community members who consistently share the best collections.
              </p>
            </div>
            {/* Dekorasi Background */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Kolom Kiri: Contributor Profiles Grid */}
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
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-40 animate-pulse"></div>
                  ))}
                </div>
              ) : contributors.length === 0 ? (
                 <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center col-span-1 sm:col-span-2">
                   <p className="text-slate-500 font-medium">Belum ada kontributor komunitas.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {contributors.map((user) => (
                    <div key={user.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative group transition-all hover:shadow-md">
                      
                      {/* Lencana Diperbesar (w-12 h-12) */}
                      {user.highestBadge && (
                        <div className="absolute top-4 right-4" title={user.highestBadge.title}>
                          <img 
                            src={user.highestBadge.iconUrl} 
                            alt={user.highestBadge.title} 
                            className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-4 mb-5">
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
                          <h3 className="text-base font-black text-slate-800">
                            @{user.username}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            Community Contributor
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                        <div>
                          {/* Label dengan Ikon Folder */}
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 tracking-wide mb-1">
                            <Folder size={12} className="text-emerald-500" />
                            Collections
                          </span>
                          <span className="text-base font-black text-slate-700">
                            {user.stats.totalUploads}
                          </span>
                        </div>
                        <div>
                          {/* Label dengan Ikon Video */}
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 tracking-wide mb-1">
                            <Video size={12} className="text-emerald-500" />
                            Total Videos
                          </span>
                          <span className="text-base font-black text-slate-700">
                            {user.stats.totalVideos}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kolom Kanan: Leaderboard List */}
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
                    <div key={user.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 text-center text-xs font-black ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-300'}`}>
                          #{index + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
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
                      
                      {/* Tampilan Clean Tanpa Background Container */}
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
      <Footer onSelectCountry={() => {}} />
    </div>
  );
}