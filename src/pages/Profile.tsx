import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { 
  User, 
  Folder, 
  Video, 
  HardDrive, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  TrendingUp, 
  BarChart3,
  ShieldCheck,
  Camera,
  LayoutDashboard,
  FolderHeart,
  Settings,
  LogOut,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { EmeraldFolderIcon, UserBadge } from '../components/SharedIcons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RulesModal from '../components/RulesModal';
import PostModal from '../components/PostModal';
import LoginModal from '../components/LoginModal';
import AvatarModal from '../components/Avatar';

const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines'];

interface ProfileProps {
  currentUser: string | null;
  onBack: () => void;
  onLogout?: () => void;
  onSelectCategory?: (category: string) => void;
  showToast?: (message: string, type?: string) => void;
}

export default function Profile({ 
  currentUser, 
  onBack, 
  onLogout,
  onSelectCategory,
  showToast 
}: ProfileProps) {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBatches, setUserBatches] = useState<any[]>([]);
  const [adminList, setAdminList] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // State Tabs Layout
  const [activeTab, setActiveTab] = useState<'overview' | 'collections' | 'settings'>('overview');

  // State Modals
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchAdmins();
  }, [currentUser]);

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('is_admin', true);

    if (data) {
      setAdminList(data.map((p: any) => (p.username || '').toLowerCase()));
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setUserProfile(profile);
    }

    const { data: batches } = await supabase
      .from('batches')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (batches) {
      setUserBatches(batches);
    }

    setLoading(false);
  };

  // Fungsi Update Avatar ke Supabase
  const handleUpdateAvatar = async (avatarUrl: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', session.user.id);

    if (error) {
      if (showToast) showToast("Gagal memperbarui avatar profil", "error");
    } else {
      setUserProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }));
      if (showToast) showToast("Avatar berhasil diperbarui!", "success");
    }
  };

  const activeUsername = userProfile?.username || currentUser;

  const stats = useMemo(() => {
    const totalUploads = userBatches.length;
    const totalApproved = userBatches.filter(b => b.status === 'approved').length;
    const totalPending = userBatches.filter(b => b.status === 'pending').length;
    
    const totalVideos = userBatches.reduce((acc: number, b: any) => acc + (Number(b.video_count) || 0), 0);
    
    const totalGB = userBatches.reduce((acc: number, b: any) => {
      if (b.size_gb) return acc + Number(b.size_gb);
      if (b.size_file) {
        const sizeStr = b.size_file.toString().toUpperCase();
        const val = parseFloat(sizeStr);
        if (isNaN(val)) return acc;
        
        if (sizeStr.includes('MB')) return acc + (val / 1024);
        if (sizeStr.includes('KB')) return acc + (val / (1024 * 1024));
        if (sizeStr.includes('TB')) return acc + (val * 1024);
        
        return acc + val;
      }
      return acc;
    }, 0);

    let totalSizeDisplay = '0 GB';
    if (totalGB > 0) {
      if (totalGB < 1) {
        totalSizeDisplay = (totalGB * 1024).toFixed(1) + ' MB';
      } else {
        totalSizeDisplay = totalGB.toFixed(1) + ' GB';
      }
    }

    return {
      totalUploads,
      totalApproved,
      totalPending,
      totalVideos,
      totalSizeDisplay
    };
  }, [userBatches]);

  const handleDeleteBatch = async (batchId: string | number) => {
    if (!confirm("Are you sure you want to delete this collection folder?")) return;

    setDeletingId(batchId);
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', batchId);

    setDeletingId(null);

    if (error) {
      if (showToast) showToast("Failed to delete folder", "error");
    } else {
      setUserBatches(prev => prev.filter(b => b.id !== batchId));
      if (showToast) showToast("Folder deleted successfully", "success");
    }
  };

  const handleLogoutAction = async () => {
    await supabase.auth.signOut();
    if (onLogout) onLogout();
    onBack();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-500">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      
      <div>
        <Navbar 
          activeCategory=""
          setActiveCategory={(category: string) => {
            if (onSelectCategory) onSelectCategory(category);
            onBack(); 
          }}
          resetSearch={() => {}}
          CATEGORIES={CATEGORIES}
          EmeraldFolderIcon={EmeraldFolderIcon}
          currentUser={activeUsername} 
          handleLogout={handleLogoutAction}
          setShowAddModal={() => setShowAddModal(true)}
          setShowLoginModal={() => setShowLoginModal(true)}
          setShowRulesModal={() => setShowRulesModal(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          
          {/* Main Layout Grid (Sidebar Tabs & Content) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SIDEBAR KIRI: Info Pengguna & Navigasi Menu */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Card Profil Pengguna */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                
                {/* Avatar dengan Tombol Edit Ganti Foto */}
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setShowAvatarModal(true)}
                  title="Klik untuk ganti avatar"
                >
                  <div className="w-24 h-24 rounded-3xl bg-emerald-500 overflow-hidden flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 border-4 border-white transition-all group-hover:scale-105">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User size={44} strokeWidth={2.2} />
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md transition-all border-2 border-white cursor-pointer">
                    <Camera size={14} />
                  </button>
                </div>

                {/* Username & Badges */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">
                      {activeUsername || 'User'}
                    </h1>
                    <UserBadge 
                      username={activeUsername || ''} 
                      count={stats.totalUploads} 
                      adminList={adminList} 
                    />
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    {userProfile?.is_admin && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                        <ShieldCheck size={12} /> Official Admin
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium">Active Contributor</span>
                  </div>
                </div>

                {/* Status Level */}
                <div className="w-full mt-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <TrendingUp size={18} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Creator Status</span>
                      <span className="text-xs font-bold text-slate-700">Level {Math.floor(stats.totalUploads / 3) + 1}</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {stats.totalUploads} Uploads
                  </span>
                </div>

              </div>

              {/* Sidebar Tabs Menu */}
              <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard size={18} /> Overview Stats
                </button>

                <button
                  onClick={() => setActiveTab('collections')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer ${
                    activeTab === 'collections'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FolderHeart size={18} /> Koleksi Batch Saya
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Settings size={18} /> Pengaturan Akun
                </button>

                <hr className="my-2 border-slate-100" />

                <button
                  onClick={onBack}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all border-none cursor-pointer"
                >
                  <ArrowLeft size={18} /> Kembali ke Home
                </button>

                <button
                  onClick={handleLogoutAction}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all border-none cursor-pointer"
                >
                  <LogOut size={18} /> Keluar Akun
                </button>
              </div>

            </div>

            {/* KONTEN KANAN: Isi Berdasarkan Tab */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* TAB 1: OVERVIEW STATS */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <Folder size={26} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Folders</span>
                        <span className="text-3xl font-black text-slate-800">{stats.totalUploads}</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                        <Video size={26} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Videos</span>
                        <span className="text-3xl font-black text-slate-800">{stats.totalVideos}</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                        <HardDrive size={26} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Storage</span>
                        <span className="text-3xl font-black text-slate-800">{stats.totalSizeDisplay}</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                        <BarChart3 size={26} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Status Approved</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-800">{stats.totalApproved}</span>
                          <span className="text-xs text-slate-400 font-semibold">/ {stats.totalUploads}</span>
                          {stats.totalPending > 0 && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                              {stats.totalPending} pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Ringkasan Koleksi Terbaru */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Koleksi Terbaru</h2>
                        <p className="text-xs text-slate-400 font-medium">Beberapa folder video terakhir yang Anda posting</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('collections')}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 border-none bg-transparent cursor-pointer"
                      >
                        Lihat Semua →
                      </button>
                    </div>

                    {userBatches.length > 0 ? (
                      <div className="space-y-3">
                        {userBatches.slice(0, 3).map((batch) => (
                          <div 
                            key={batch.id} 
                            className="p-4 rounded-2xl bg-slate-50/60 flex items-center justify-between gap-4 border border-slate-100/50"
                          >
                            <div className="flex items-center gap-3.5">
                              <EmeraldFolderIcon country={batch.country} className="w-10 h-10 flex-shrink-0" />
                              <div>
                                <h3 className="text-sm font-bold text-slate-800">{batch.username}</h3>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                                  <span className="text-emerald-600 font-bold">{batch.country}</span>
                                  <span>•</span>
                                  <span>{batch.video_count} Videos</span>
                                </div>
                              </div>
                            </div>
                            {batch.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-700">
                                <CheckCircle2 size={14} /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-700">
                                <Clock size={14} /> Pending
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">Belum ada koleksi yang diunggah.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DAFTAR KOLEKSI BATCH */}
              {activeTab === 'collections' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 tracking-tight">Koleksi Batch Saya</h2>
                      <p className="text-xs text-slate-400 font-medium">Daftar lengkap folder video yang Anda miliki</p>
                    </div>
                  </div>

                  {userBatches.length > 0 ? (
                    <div className="space-y-3">
                      {userBatches.map((batch) => (
                        <div 
                          key={batch.id} 
                          className="p-4 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-100/50"
                        >
                          <div className="flex items-center gap-3.5">
                            <EmeraldFolderIcon country={batch.country} className="w-10 h-10 flex-shrink-0" />
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">{batch.username}</h3>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                                <span className="text-emerald-600 font-bold">{batch.country}</span>
                                <span>•</span>
                                <span>{batch.video_count} Videos</span>
                                <span>•</span>
                                <span>{batch.size_file || `${batch.size_gb} GB`}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                            {batch.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-700">
                                <CheckCircle2 size={14} /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-700">
                                <Clock size={14} /> Pending Review
                              </span>
                            )}

                            <button
                              onClick={() => handleDeleteBatch(batch.id)}
                              disabled={deletingId === batch.id}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                              title="Delete Folder"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-14 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                        <Folder size={28} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700 mb-1">Belum Ada Koleksi</h3>
                      <p className="text-xs text-slate-400 max-w-xs font-medium">
                        Anda belum pernah mengunggah folder koleksi video.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PENGATURAN PROFIL & AVATAR */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Pengaturan Profil</h2>
                    <p className="text-xs text-slate-400 font-medium">Kelola avatar dan data profil Anda</p>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Pengaturan Avatar */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500 overflow-hidden flex items-center justify-center text-white shadow-md flex-shrink-0">
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} />
                      )}
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <h3 className="text-sm font-bold text-slate-800">Avatar Profil Karakter</h3>
                      <p className="text-xs text-slate-400">Pilih dari koleksi avatar karakter resmi untuk mempercantik profil Anda.</p>
                      <button
                        onClick={() => setShowAvatarModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all border-none cursor-pointer"
                      >
                        <Sparkles size={14} /> Ganti Avatar Karakter
                      </button>
                    </div>
                  </div>

                  {/* Informasi Akun */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</label>
                      <input 
                        type="text" 
                        disabled 
                        value={activeUsername || ''} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-bold text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </main>
      </div>

      <Footer onSelectCountry={(category: string) => {
        if (onSelectCategory) onSelectCategory(category);
        onBack();
      }} />

      {/* Modal Avatar */}
      {showAvatarModal && (
        <AvatarModal 
          currentAvatar={userProfile?.avatar_url}
          onSelectAvatar={handleUpdateAvatar}
          onClose={() => setShowAvatarModal(false)}
        />
      )}

      {/* Modal Lainnya */}
      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {showAddModal && (
        <PostModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchUserData}
          currentUser={activeUsername}
          showToast={showToast}
          CATEGORIES={CATEGORIES}
        />
      )}

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSuccess={fetchUserData}
          showToast={showToast}
        />
      )}

    </div>
  );
}