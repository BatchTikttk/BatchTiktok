import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Trophy, Award, Medal, Folder, Video, User, Sparkles, Flame } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { EmeraldFolderIcon } from '../components/SharedIcons';

interface Contributor {
  username: string;
  avatar_url?: string | null;
  total_batches: number;
  total_videos: number;
  rank: number;
}

export default function TopContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchTopContributors();
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

  const fetchTopContributors = async () => {
    setLoading(true);

    // Fetch profiles untuk memfilter Admin
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_admin');

    const adminUsernames = new Set(
      (profiles || [])
        .filter((p: any) => p.is_admin === true)
        .map((p: any) => (p.username || '').toLowerCase())
    );

    // Fetch batches yang disetujui
    const { data: batches } = await supabase
      .from('batches')
      .select('uploaded_by, user_id, video_count')
      .eq('status', 'approved');

    // Akumulasi total batch dan video per kontributor non-admin
    const statsMap: Record<string, { total_batches: number; total_videos: number; avatar_url: string | null }> = {};

    (batches || []).forEach((b: any) => {
      const uploader = b.uploaded_by;
      if (!uploader) return;

      const uploaderLower = uploader.toLowerCase();

      // Lewati jika user adalah Admin
      if (adminUsernames.has(uploaderLower)) return;

      const profile = profiles?.find(
        (p: any) => p.username && p.username.toLowerCase() === uploaderLower
      );

      if (!statsMap[uploader]) {
        statsMap[uploader] = {
          total_batches: 0,
          total_videos: 0,
          avatar_url: profile?.avatar_url || null
        };
      }

      statsMap[uploader].total_batches += 1;
      statsMap[uploader].total_videos += Number(b.video_count || 0);
    });

    // Susun array dan urutkan berdasarkan jumlah kontribusi batch terbanyak
    const sortedContributors: Contributor[] = Object.keys(statsMap)
      .map((username) => ({
        username,
        avatar_url: statsMap[username].avatar_url,
        total_batches: statsMap[username].total_batches,
        total_videos: statsMap[username].total_videos,
        rank: 0
      }))
      .sort((a, b) => b.total_batches - a.total_batches)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    setContributors(sortedContributors);
    setLoading(false);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shadow-sm border-none">
          <Trophy size={16} />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-sm border-none">
          <Medal size={16} />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700/10 text-amber-800 flex items-center justify-center font-bold text-xs shadow-sm border-none">
          <Award size={16} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border-none">
        #{rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between">
      <div>
        <Navbar 
          activeCategory="Top Contributors" 
          setActiveCategory={() => {}}
          CATEGORIES={['Home', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines']}
          currentUser={currentUser}
          handleLogout={async () => {
            await supabase.auth.signOut();
            setCurrentUser(null);
          }}
          setShowAddModal={() => {}}
          setShowLoginModal={() => {}}
          setShowRulesModal={() => {}}
          EmeraldFolderIcon={EmeraldFolderIcon}
        />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6 mb-10">
          <div className="bg-slate-900 rounded-[2.5rem] py-12 px-8 sm:py-14 sm:px-12 shadow-2xl relative overflow-hidden border-none">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4 backdrop-blur-md border-none">
                <Sparkles size={14} /> Community Recognition
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                Top <span className="text-emerald-400">Contributors</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
                Appreciation for the most active community members who consistently share the best collections.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Layout (2 Kolom: Main Cards + Leaderboard Sidebar) */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
              <p className="text-slate-500 font-bold text-sm">Loading Top Contributors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Kolom Kiri: Grid Kartu Profil Kontributor (2 Kolom) */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                    <Flame className="text-emerald-500" size={22} /> Contributor Profiles
                  </h2>
                  <span className="text-xs font-bold text-slate-400 bg-white px-3.5 py-1.5 rounded-full shadow-sm border-none">
                    {contributors.length} Community Members
                  </span>
                </div>

                {contributors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {contributors.map((user) => (
                      <div 
                        key={user.username}
                        className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between border-none relative group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-5">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center overflow-hidden font-black text-xl shadow-inner border-none">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                user.username.charAt(0).toUpperCase()
                              )}
                            </div>
                            {getRankBadge(user.rank)}
                          </div>

                          <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">
                            @{user.username}
                          </h3>
                          <p className="text-xs font-medium text-slate-400 mb-6">Community Contributor</p>
                        </div>

                        {/* Stats Box */}
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border-none">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-0.5">
                              <Folder className="text-emerald-500" size={12} /> Collections
                            </span>
                            <span className="text-sm font-extrabold text-slate-700">{user.total_batches}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-0.5">
                              <Video className="text-emerald-500" size={12} /> Total Videos
                            </span>
                            <span className="text-sm font-extrabold text-slate-700">{user.total_videos}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-[2rem] text-center shadow-sm border-none">
                    <User className="text-slate-300 mx-auto mb-3" size={40} />
                    <p className="text-slate-500 font-bold">No non-admin contributors yet.</p>
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Leaderboard Sidebar */}
              <div className="lg:col-span-4">
                <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-none sticky top-28">
                  
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold border-none">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800">Leaderboard</h3>
                      <p className="text-xs text-slate-400 font-medium">Top Community Ranks</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contributors.slice(0, 10).map((user) => (
                      <div 
                        key={user.username}
                        className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border-none ${
                          user.rank === 1 
                            ? 'bg-amber-50/60 text-slate-800' 
                            : 'bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-black w-6 text-center ${
                            user.rank === 1 ? 'text-amber-600' : user.rank === 2 ? 'text-slate-500' : user.rank === 3 ? 'text-amber-800' : 'text-slate-400'
                          }`}>
                            #{user.rank}
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold text-xs flex items-center justify-center overflow-hidden shadow-sm border-none">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              user.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-xs font-bold tracking-tight text-slate-800 truncate max-w-[110px]">
                            @{user.username}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl shadow-xs border-none">
                          <Folder className="text-emerald-500" size={12} />
                          <span className="text-xs font-black text-slate-700">{user.total_batches}</span>
                        </div>
                      </div>
                    ))}

                    {contributors.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">No rankings yet.</p>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      <Footer onSelectCountry={() => {}} />
    </div>
  );
}