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
  ShieldCheck
} from 'lucide-react';
import { EmeraldFolderIcon, UserBadge } from '../components/SharedIcons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RulesModal from '../components/RulesModal';
import PostModal from '../components/PostModal';
import LoginModal from '../components/LoginModal';

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

  // State untuk Modal agar seirama dengan Home.tsx
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
    if (!confirm("Apakah Anda yakin ingin menghapus folder koleksi ini?")) return;

    setDeletingId(batchId);
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', batchId);

    setDeletingId(null);

    if (error) {
      if (showToast) showToast("Gagal menghapus folder", "error");
    } else {
      setUserBatches(prev => prev.filter(b => b.id !== batchId));
      if (showToast) showToast("Folder berhasil dihapus", "success");
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
          <span className="text-sm font-bold text-slate-500">Memuat Profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      
      <div>
        {/* Navbar Aplikasi - Tersinkronisasi penuh dengan Home.tsx */}
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

        {/* Kontainer Utama */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/80 mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <User size={38} strokeWidth={2.2} />
              </div>
              
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                    {activeUsername || 'Pengguna'}
                  </h1>
                  <UserBadge 
                    username={activeUsername || ''} 
                    count={stats.totalUploads} 
                    adminList={adminList} 
                  />
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-sm">
                  <span className="text-slate-400 font-medium">
                    Kontributor Aktif
                  </span>
                  {userProfile?.is_admin && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded-full">
                      <ShieldCheck size={14} /> Official Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50/70 px-5 py-3 rounded-2xl border border-emerald-100/50">
              <TrendingUp size={22} className="text-emerald-600" />
              <div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Status Creator</div>
                <div className="text-sm font-extrabold text-emerald-600">Level {Math.floor(stats.totalUploads / 3) + 1}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Folder size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Folder</span>
                <span className="text-2xl font-black text-slate-800">{stats.totalUploads}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <Video size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Video</span>
                <span className="text-2xl font-black text-slate-800">{stats.totalVideos}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
                <HardDrive size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Ukuran</span>
                <span className="text-2xl font-black text-slate-800">{stats.totalSizeDisplay}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                <BarChart3 size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Disetujui</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-800">{stats.totalApproved}</span>
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

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Koleksi Batch Anda</h2>
                <p className="text-xs text-slate-400 font-medium">Daftar folder video yang telah Anda unggah ke sistem</p>
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
                          <span>{batch.video_count} Video</span>
                          <span>•</span>
                          <span>{batch.size_file || `${batch.size_gb} GB`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                      {batch.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-700">
                          <CheckCircle2 size={14} /> Disetujui
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-700">
                          <Clock size={14} /> Menunggu Review
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        disabled={deletingId === batch.id}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                        title="Hapus Folder"
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
                  Anda belum memiliki koleksi video yang diunggah.
                </p>
              </div>
            )}
          </div>

        </main>
      </div>

      <Footer onSelectCountry={(category: string) => {
        if (onSelectCategory) onSelectCategory(category);
        onBack();
      }} />

      {/* Modal pendukung Navbar */}
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