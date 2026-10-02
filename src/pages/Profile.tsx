import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { 
  User, 
  Folder, 
  Video, 
  HardDrive, 
  CheckCircle2, 
  XCircle,
  Clock, 
  Trash2, 
  TrendingUp, 
  ShieldCheck,
  Camera,
  LayoutDashboard,
  FolderHeart,
  Settings,
  LogOut,
  Sparkles,
  Loader2,
  Edit2,
  Search,
  X,
  Save,
  Award,
  Lock,
  Check,
  AlertCircle,
  ExternalLink,
  MousePointerClick
} from 'lucide-react';
import { EmeraldFolderIcon } from '../components/SharedIcons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PostModal from '../components/PostModal';
import LoginModal from '../components/LoginModal';
import AvatarModal from '../components/Avatar';

const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

// Badge Tier Definitions & Logic
const BADGES = [
  {
    id: 'low_tier',
    title: 'Emerald Rookie',
    tier: 'Tier 1 Badge',
    description: 'Unlocked automatically after uploading at least 10 video batches.',
    reqText: '10 Uploaded Batches',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Low%20Tier.webp',
    isUnlocked: (stats: any) => stats.totalUploads >= 10,
    getCurrentProgress: (stats: any) => Math.min(stats.totalUploads, 10),
    target: 10,
  },
  {
    id: 'medium_tier',
    title: 'Emerald Pro',
    tier: 'Tier 2 Badge',
    description: 'Unlocked automatically upon reaching 30 approved video batches.',
    reqText: '30 Approved Batches',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Medium%20Tier.webp',
    isUnlocked: (stats: any) => stats.totalApproved >= 30,
    getCurrentProgress: (stats: any) => Math.min(stats.totalApproved, 30),
    target: 30,
  },
  {
    id: 'advance_tier',
    title: 'Emerald Master',
    tier: 'Tier 3 Badge',
    description: 'Unlocked automatically upon reaching 50 approved video batches.',
    reqText: '50 Approved Batches',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Advance%20Tier.webp',
    isUnlocked: (stats: any) => stats.totalApproved >= 50,
    getCurrentProgress: (stats: any) => Math.min(stats.totalApproved, 50),
    target: 50,
  },
];

// Local Toast Component
const Toast = ({ message, isVisible, type = 'success' }: any) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 transition-all duration-300 z-[9999] border ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${type === 'success' ? 'bg-slate-900/90 text-white border-slate-800' : 'bg-red-600/90 text-white border-red-500'}`}>
    {type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-white" />}
    <span className="text-sm font-semibold tracking-wide">{message}</span>
  </div>
);

interface ProfileProps {
  currentUser: string | null;
  onBack: () => void;
  onLogout?: () => void;
  onSelectCategory?: (category: string) => void;
  showToast?: (message: string, type?: string) => void;
  onProfileUpdate?: (newUsername: string, newAvatar?: string) => void; 
}

export default function Profile({ 
  currentUser, 
  onBack, 
  onLogout,
  onSelectCategory,
  showToast: propShowToast,
  onProfileUpdate
}: ProfileProps) {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBatches, setUserBatches] = useState<any[]>([]);
  const [allBatches, setAllBatches] = useState<any[]>([]); 
  const [, setAdminList] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

  const [usernameInput, setUsernameInput] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'collections' | 'settings' | 'admin'>('overview');
  const [collectionSearchQuery, setCollectionSearchQuery] = useState('');
  
  const [adminStatusFilter, setAdminStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [isUpdatingBatch, setIsUpdatingBatch] = useState(false);

  const [toastConfig, setToastConfig] = useState({ message: '', isVisible: false, type: 'success' });

  const selectableCategories = CATEGORIES.filter((c: string) => c !== 'Home' && c !== 'All');

  const handleShowToast = (message: string, type = 'success') => {
    if (propShowToast) propShowToast(message, type);
    setToastConfig({ message, isVisible: true, type });
    setTimeout(() => setToastConfig({ message: '', isVisible: false, type }), 3000);
  };

  useEffect(() => {
    fetchUserData(true);
    fetchAdmins();
  }, [currentUser]);

  useEffect(() => {
    if (userProfile?.is_admin) {
      fetchAllBatches();
    }
  }, [userProfile?.is_admin]);

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('is_admin', true);

    if (data) {
      setAdminList(data.map((p: any) => (p.username || '').toLowerCase()));
    }
  };

  const fetchUserData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setUserProfile(null);
      setUserBatches([]);
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
      setUsernameInput(profile.username || currentUser || '');
    } else if (currentUser) {
      setUsernameInput(currentUser);
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

  const fetchAllBatches = async () => {
    const { data } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setAllBatches(data);
    }
  };

  const handleUpdateStatus = async (batchId: string | number, newStatus: 'approved' | 'rejected' | 'pending') => {
    setActionLoadingId(batchId);
    
    const { error } = await supabase
      .from('batches')
      .update({ status: newStatus })
      .eq('id', batchId);

    setActionLoadingId(null);

    if (error) {
      handleShowToast(`Gagal memperbarui status: ${error.message}`, "error");
    } else {
      handleShowToast(`Status batch berhasil diubah menjadi ${newStatus}`, "success");
      setAllBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: newStatus } : b));
      setUserBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: newStatus } : b));
    }
  };

  const handleUpdateAvatar = async (avatarUrl: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', session.user.id);

    if (error) {
      handleShowToast("Gagal memperbarui avatar profil", "error");
    } else {
      setUserProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }));
      if (onProfileUpdate) onProfileUpdate(userProfile?.username || currentUser || '', avatarUrl);
      handleShowToast("Avatar berhasil diperbarui!", "success");
    }
  };

  const handleUpdateUsername = async () => {
    const trimmedUsername = usernameInput.trim();
    if (!trimmedUsername) {
      handleShowToast("Username tidak boleh kosong", "error");
      return;
    }

    setUpdatingUsername(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setUpdatingUsername(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username: trimmedUsername })
      .eq('id', session.user.id);

    setUpdatingUsername(false);

    if (error) {
      handleShowToast("Gagal memperbarui username", "error");
    } else {
      setUserProfile((prev: any) => ({ ...prev, username: trimmedUsername }));
      if (onProfileUpdate) onProfileUpdate(trimmedUsername, userProfile?.avatar_url);
      handleShowToast("Username berhasil diperbarui!", "success");
    }
  };

  const activeUsername = userProfile?.username || currentUser;

  const stats = useMemo(() => {
    const totalUploads = userBatches.length;
    const totalApproved = userBatches.filter(b => b.status === 'approved').length;
    const totalPending = userBatches.filter(b => b.status === 'pending').length;
    const totalRejected = userBatches.filter(b => b.status === 'rejected').length;
    const totalVideos = userBatches.reduce((acc: number, b: any) => acc + (Number(b.video_count) || 0), 0);
    
    const totalClicks = userBatches.reduce((acc: number, b: any) => {
      const clickVal = b.clicks ?? b.click_count ?? b.total_clicks ?? b.click ?? b.views ?? 0;
      return acc + (Number(clickVal) || 0);
    }, 0);

    const totalGB = userBatches.reduce((acc: number, b: any) => {
      if (b.size_gb !== undefined && b.size_gb !== null && b.size_gb !== '') {
        return acc + Number(b.size_gb);
      }
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
      totalRejected,
      totalVideos,
      totalClicks,
      totalSizeDisplay
    };
  }, [userBatches]);

  const unlockedBadges = useMemo(() => {
    return BADGES.filter(b => b.isUnlocked(stats));
  }, [stats]);

  const handleDeleteBatch = async (batchId: string | number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus folder koleksi ini?")) return;

    setDeletingId(batchId);
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', batchId);

    setDeletingId(null);

    if (error) {
      handleShowToast("Gagal menghapus folder", "error");
    } else {
      setUserBatches(prev => prev.filter(b => b.id !== batchId));
      setAllBatches(prev => prev.filter(b => b.id !== batchId));
      handleShowToast("Folder berhasil dihapus", "success");
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setEditingBatch((prev: any) => ({ ...prev, [target.name]: value }));
  };

  const handleUpdateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    setIsUpdatingBatch(true);
    try {
      const clickVal = parseInt(editingBatch.clicks ?? editingBatch.click_count ?? editingBatch.total_clicks ?? editingBatch.click) || 0;
      
      const updateData: any = {
        username: editingBatch.username,
        country: editingBatch.country,
        video_count: parseInt(editingBatch.video_count) || 0,
        size_file: editingBatch.size_file,
        tiktok_url: editingBatch.tiktok_url,
        video_url: editingBatch.video_url,
        gdrive_url: editingBatch.gdrive_url,
        terabox_url: editingBatch.terabox_url,
        is_banned: editingBatch.is_banned,
        is_edited: true
      };

      if (editingBatch.clicks !== undefined) updateData.clicks = clickVal;
      else if (editingBatch.click_count !== undefined) updateData.click_count = clickVal;
      else if (editingBatch.total_clicks !== undefined) updateData.total_clicks = clickVal;
      else updateData.clicks = clickVal;

      const { error } = await supabase
        .from('batches')
        .update(updateData)
        .eq('id', editingBatch.id);

      if (error) throw error;

      handleShowToast("Batch berhasil diperbarui!", "success");
      
      setUserBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...editingBatch, is_edited: true } : b));
      setAllBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...editingBatch, is_edited: true } : b));
      setEditingBatch(null);
    } catch (error: any) {
      handleShowToast(error.message || "Gagal memperbarui batch", "error");
    } finally {
      setIsUpdatingBatch(false);
    }
  };

  const handleLogoutAction = async () => {
    await supabase.auth.signOut();
    if (onLogout) onLogout();
    onBack();
  };

  const filteredBatches = useMemo(() => {
    if (!collectionSearchQuery.trim()) return userBatches;
    const lowerQuery = collectionSearchQuery.toLowerCase();
    return userBatches.filter(batch => 
      (batch.username && batch.username.toLowerCase().includes(lowerQuery)) ||
      (batch.country && batch.country.toLowerCase().includes(lowerQuery))
    );
  }, [userBatches, collectionSearchQuery]);

  const filteredAdminBatches = useMemo(() => {
    return allBatches.filter(batch => {
      const matchesStatus = adminStatusFilter === 'all' || batch.status === adminStatusFilter;
      const lowerQuery = adminSearchQuery.toLowerCase();
      const matchesSearch = !adminSearchQuery.trim() || 
        (batch.username && batch.username.toLowerCase().includes(lowerQuery)) ||
        (batch.country && batch.country.toLowerCase().includes(lowerQuery));
      return matchesStatus && matchesSearch;
    });
  }, [allBatches, adminStatusFilter, adminSearchQuery]);

  const adminStats = useMemo(() => {
    const pendingCount = allBatches.filter(b => b.status === 'pending').length;
    const approvedCount = allBatches.filter(b => b.status === 'approved').length;
    const rejectedCount = allBatches.filter(b => b.status === 'rejected').length;
    return { pendingCount, approvedCount, rejectedCount, total: allBatches.length };
  }, [allBatches]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-xs border border-slate-100">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-600 tracking-wide">Memuat Profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
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
          setShowRulesModal={() => {
            window.history.pushState({}, '', '/rules');
            window.dispatchEvent(new Event('popstate'));
          }}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDEBAR - Clean Figma Dashboard Style */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100/90 flex flex-col items-center text-center relative overflow-hidden transition-all hover:shadow-md">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setShowAvatarModal(true)}
                  title="Klik untuk mengubah avatar"
                >
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white shadow-lg shadow-emerald-500/15 border-4 border-white transition-all duration-300 group-hover:scale-105">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User size={48} strokeWidth={2.2} />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md transition-all border-2 border-white flex items-center justify-center">
                    <Camera size={15} />
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-center w-full">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">
                      {activeUsername || 'User'}
                    </h1>
                    {unlockedBadges.map((badge) => (
                      <div 
                        key={badge.id} 
                        className="relative group/badge cursor-pointer"
                        title={`${badge.title} (${badge.reqText})`}
                      >
                        <img 
                          src={badge.iconUrl} 
                          alt={badge.title} 
                          className="w-7 h-7 object-contain drop-shadow transition-transform hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center gap-2 flex-wrap justify-center">
                    {userProfile?.is_admin && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full shadow-2xs">
                        <ShieldCheck size={13} /> Official Admin
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-semibold bg-slate-100/80 px-3 py-1 rounded-full">
                      Active Contributor
                    </span>
                  </div>
                </div>

                <div className="w-full mt-6 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100/80 text-emerald-700 rounded-xl">
                      <TrendingUp size={18} />
                    </div>
                    <div className="text-left">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Creator Level</span>
                      <span className="text-sm font-extrabold text-slate-800">Level {Math.floor(stats.totalUploads / 3) + 1}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100/70 px-3 py-1.5 rounded-xl">
                    {stats.totalUploads} Uploads
                  </span>
                </div>
              </div>

              {/* Sidebar Navigation */}
              <div className="bg-white rounded-3xl p-3 shadow-xs border border-slate-100/90 space-y-1.5">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer ${
                    activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 shadow-2xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard size={18} /> Ringkasan Statistik
                </button>

                <button
                  onClick={() => setActiveTab('collections')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer ${
                    activeTab === 'collections' ? 'bg-emerald-50 text-emerald-700 shadow-2xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FolderHeart size={18} /> Koleksi Batch Saya
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer ${
                    activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 shadow-2xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Settings size={18} /> Pengaturan Akun
                </button>

                {userProfile?.is_admin && (
                  <>
                    <div className="my-2 border-t border-slate-100"></div>
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        fetchAllBatches();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer ${
                        activeTab === 'admin' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-amber-700 bg-amber-50/80 hover:bg-amber-100/70 border border-amber-200/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} /> Panel Admin Moderasi
                      </div>
                      {adminStats.pendingCount > 0 && (
                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-black ${
                          activeTab === 'admin' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
                        }`}>
                          {adminStats.pendingCount}
                        </span>
                      )}
                    </button>
                  </>
                )}

                <div className="my-2 border-t border-slate-100"></div>

                <button
                  onClick={handleLogoutAction}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all border-none cursor-pointer"
                >
                  <LogOut size={18} /> Keluar / Logout
                </button>
              </div>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="lg:col-span-8 space-y-6">
              
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Dashboard Stat Cards Inspired by Figma Reference */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100/90 flex items-center gap-4 transition-all hover:shadow-md">
                      <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <Folder size={26} strokeWidth={2.2} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Folder</span>
                        <span className="text-2xl font-black text-slate-800">{stats.totalUploads}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100/90 flex items-center gap-4 transition-all hover:shadow-md">
                      <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl">
                        <Video size={26} strokeWidth={2.2} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Video</span>
                        <span className="text-2xl font-black text-slate-800">{stats.totalVideos}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100/90 flex items-center gap-4 transition-all hover:shadow-md">
                      <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
                        <HardDrive size={26} strokeWidth={2.2} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Ukuran</span>
                        <span className="text-2xl font-black text-slate-800">{stats.totalSizeDisplay}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100/90 flex items-center gap-4 transition-all hover:shadow-md">
                      <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                        <MousePointerClick size={26} strokeWidth={2.2} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Total Unduhan</span>
                        <span className="text-2xl font-black text-slate-800">{stats.totalClicks}</span>
                      </div>
                    </div>
                  </div>

                  {/* BADGES SECTION */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100/90">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <Award className="text-emerald-600" size={22} />
                          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Pencapaian & Lencana Profil</h2>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Lencana akan terbuka secara otomatis seiring bertambahnya kontribusi batch Anda.
                        </p>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-100 self-start sm:self-auto">
                        {unlockedBadges.length} / {BADGES.length} Terbuka
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {BADGES.map((badge) => {
                        const unlocked = badge.isUnlocked(stats);
                        const progress = badge.getCurrentProgress(stats);
                        const percent = Math.min(Math.round((progress / badge.target) * 100), 100);

                        return (
                          <div 
                            key={badge.id}
                            className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                              unlocked ? 'bg-gradient-to-b from-white to-emerald-50/20 border-emerald-200/80 shadow-xs hover:shadow-md' : 'bg-slate-50/60 border-slate-200/60 opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl ${
                                unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/80 text-slate-600'
                              }`}>
                                {badge.tier}
                              </span>
                              {unlocked ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600">
                                  <Sparkles size={12} /> Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                  <Lock size={12} /> Terkunci
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col items-center my-3 text-center">
                              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                                <img 
                                  src={badge.iconUrl} 
                                  alt={badge.title} 
                                  className={`w-20 h-20 object-contain transition-all duration-300 ${
                                    unlocked ? 'drop-shadow-lg hover:scale-110' : 'grayscale opacity-40'
                                  }`}
                                />
                              </div>
                              <h3 className="text-sm font-extrabold text-slate-800">{badge.title}</h3>
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                                {badge.description}
                              </p>
                            </div>

                            <div className="mt-4 pt-3.5 border-t border-slate-100">
                              <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                                <span className="text-slate-400">Progres</span>
                                <span className={unlocked ? 'text-emerald-700 font-extrabold' : 'text-slate-600'}>
                                  {progress} / {badge.target}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 rounded-full ${unlocked ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'collections' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100/90 animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Koleksi Batch Saya</h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Daftar lengkap folder video yang telah Anda unggah</p>
                    </div>
                    
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Cari koleksi..." 
                        value={collectionSearchQuery}
                        onChange={(e) => setCollectionSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  {filteredBatches.length > 0 ? (
                    <div className="space-y-3">
                      {filteredBatches.map((batch) => (
                        <div 
                          key={batch.id} 
                          className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-100"
                        >
                          <div className="flex items-center gap-3.5">
                            <EmeraldFolderIcon className="w-11 h-11 flex-shrink-0" country={batch.country} />
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">{batch.username}</h3>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium flex-wrap">
                                <span className="text-emerald-700 font-bold">{batch.country}</span>
                                <span>•</span>
                                <span>{batch.video_count} Video</span>
                                <span>•</span>
                                <span>{batch.size_file || `${batch.size_gb || 0} GB`}</span>
                                <span>•</span>
                                <span>{batch.clicks ?? batch.click_count ?? batch.total_clicks ?? batch.click ?? 0} Unduhan</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                            {batch.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100/80 text-emerald-800">
                                <CheckCircle2 size={13} /> Disetujui
                              </span>
                            ) : batch.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-red-100/80 text-red-800">
                                <XCircle size={13} /> Ditolak
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-100/80 text-amber-800">
                                <Clock size={13} /> Menunggu Review
                              </span>
                            )}

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingBatch(batch)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                title="Edit Folder"
                              >
                                <Edit2 size={16} />
                              </button>

                              <button
                                onClick={() => handleDeleteBatch(batch.id)}
                                disabled={deletingId === batch.id}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer disabled:opacity-50"
                                title="Hapus Folder"
                              >
                                {deletingId === batch.id ? (
                                  <Loader2 className="animate-spin text-red-600" size={16} />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                        <Folder size={28} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700 mb-1">Koleksi Tidak Ditemukan</h3>
                      <p className="text-xs text-slate-400 max-w-xs font-medium">
                        {collectionSearchQuery ? 'Tidak ada batch yang cocok dengan pencarian Anda.' : 'Anda belum mengunggah koleksi video apapun.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100/90 space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Pengaturan Akun</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Kelola avatar profil dan detail akun Anda</p>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500 overflow-hidden flex items-center justify-center text-white shadow-md flex-shrink-0">
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} />
                      )}
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <h3 className="text-sm font-bold text-slate-800">Avatar Karakter</h3>
                      <p className="text-xs text-slate-500">Pilih dari koleksi avatar karakter resmi kami untuk mempersonalisasi profil Anda.</p>
                      <button
                        onClick={() => setShowAvatarModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all border-none cursor-pointer"
                      >
                        <Sparkles size={14} /> Ubah Avatar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="Masukkan username Anda"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                        />
                        <button
                          onClick={handleUpdateUsername}
                          disabled={updatingUsername || usernameInput.trim() === activeUsername}
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-xs transition-all border-none cursor-pointer flex-shrink-0 flex items-center justify-center min-w-[90px]"
                        >
                          {updatingUsername ? <Loader2 className="animate-spin" size={16} /> : 'Simpan'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && userProfile?.is_admin && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100/90 space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="text-amber-500" size={24} />
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Pusat Moderasi Admin</h2>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Atur dan kelola persetujuan batch pengunggah video secara langsung.
                      </p>
                    </div>

                    <button
                      onClick={fetchAllBatches}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border-none cursor-pointer self-start md:self-auto flex items-center gap-1.5"
                    >
                      <Loader2 size={14} className={actionLoadingId ? "animate-spin" : ""} /> Muat Ulang Data
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button 
                      onClick={() => setAdminStatusFilter('pending')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        adminStatusFilter === 'pending' ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-amber-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Pending</span>
                        <Clock size={16} />
                      </div>
                      <div className="text-2xl font-black mt-1">{adminStats.pendingCount}</div>
                    </button>

                    <button 
                      onClick={() => setAdminStatusFilter('approved')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        adminStatusFilter === 'approved' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-emerald-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Disetujui</span>
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="text-2xl font-black mt-1">{adminStats.approvedCount}</div>
                    </button>

                    <button 
                      onClick={() => setAdminStatusFilter('rejected')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        adminStatusFilter === 'rejected' ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-red-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Ditolak</span>
                        <XCircle size={16} />
                      </div>
                      <div className="text-2xl font-black mt-1">{adminStats.rejectedCount}</div>
                    </button>

                    <button 
                      onClick={() => setAdminStatusFilter('all')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        adminStatusFilter === 'all' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Semua Batch</span>
                        <Folder size={16} />
                      </div>
                      <div className="text-2xl font-black mt-1">{adminStats.total}</div>
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Cari berdasarkan username pengunggah atau negara..." 
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium text-slate-700 transition-all"
                    />
                  </div>

                  {filteredAdminBatches.length > 0 ? (
                    <div className="space-y-4">
                      {filteredAdminBatches.map((batch) => (
                        <div 
                          key={batch.id} 
                          className={`p-5 rounded-3xl border transition-all flex flex-col gap-4 ${
                            batch.status === 'pending' ? 'bg-amber-50/30 border-amber-200/80' : batch.status === 'approved' ? 'bg-emerald-50/20 border-emerald-200/60' : 'bg-red-50/20 border-red-200/60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <EmeraldFolderIcon className="w-12 h-12 flex-shrink-0" country={batch.country} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-base font-black text-slate-800">{batch.username}</h3>
                                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-200/80 text-slate-700">
                                    {batch.country}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                  {batch.video_count} Video • {batch.size_file || `${batch.size_gb || 0} GB`} • {batch.clicks ?? batch.click_count ?? batch.total_clicks ?? batch.click ?? 0} Unduhan
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {batch.status === 'approved' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 size={13} /> Disetujui
                                </span>
                              )}
                              {batch.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-red-100 text-red-800">
                                  <XCircle size={13} /> Ditolak
                                </span>
                              )}
                              {batch.status === 'pending' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800">
                                  <Clock size={13} /> Menunggu Review
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-white/80 p-3 rounded-2xl border border-slate-100 text-xs">
                            {batch.tiktok_url && (
                              <a href={batch.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline font-semibold truncate">
                                <ExternalLink size={12} /> Profil TikTok
                              </a>
                            )}
                            {batch.gdrive_url && (
                              <a href={batch.gdrive_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-700 hover:underline font-semibold truncate">
                                <ExternalLink size={12} /> Google Drive
                              </a>
                            )}
                            {batch.terabox_url && (
                              <a href={batch.terabox_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-purple-600 hover:underline font-semibold truncate">
                                <ExternalLink size={12} /> Tautan TeraBox
                              </a>
                            )}
                            {batch.video_url && (
                              <a href={batch.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-amber-600 hover:underline font-semibold truncate">
                                <ExternalLink size={12} /> Pratinjau Video
                              </a>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100/80">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateStatus(batch.id, 'approved')}
                                disabled={actionLoadingId === batch.id || batch.status === 'approved'}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-extrabold rounded-xl transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-xs"
                              >
                                {actionLoadingId === batch.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Setujui
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(batch.id, 'rejected')}
                                disabled={actionLoadingId === batch.id || batch.status === 'rejected'}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-extrabold rounded-xl transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-xs"
                              >
                                {actionLoadingId === batch.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                Tolak
                              </button>

                              {batch.status !== 'pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(batch.id, 'pending')}
                                  disabled={actionLoadingId === batch.id}
                                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-all border-none cursor-pointer flex items-center gap-1"
                                >
                                  Kembalikan ke Pending
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingBatch(batch)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                title="Edit Batch"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteBatch(batch.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                title="Hapus Batch"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                      <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-sm font-bold text-slate-600">Data batch tidak ditemukan</p>
                      <p className="text-xs text-slate-400 mt-0.5">Coba ubah filter status atau kata kunci pencarian Anda.</p>
                    </div>
                  )}
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

      {/* Modal Edit Batch */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setEditingBatch(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Edit Koleksi Batch</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">Perbarui informasi batch sebagai Admin.</p>
              </div>
              <button onClick={() => setEditingBatch(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateBatchSubmit} className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Username Kreator</label>
                  <input required type="text" name="username" value={editingBatch.username || ''} onChange={handleEditChange} placeholder="Contoh: jennie_bp" className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Negara / Wilayah</label>
                  <select name="country" value={editingBatch.country || ''} onChange={handleEditChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium">
                    {selectableCategories.map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Jumlah Video</label>
                  <input required type="number" name="video_count" value={editingBatch.video_count || ''} onChange={handleEditChange} placeholder="Contoh: 150" className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Ukuran Berkas</label>
                  <input required type="text" name="size_file" value={editingBatch.size_file || ''} onChange={handleEditChange} placeholder="Contoh: 500 MB" className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Total Unduhan</label>
                  <input type="number" name="clicks" value={editingBatch.clicks ?? editingBatch.click_count ?? editingBatch.total_clicks ?? editingBatch.click ?? 0} onChange={handleEditChange} placeholder="Contoh: 100" className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Tautan Profil TikTok</label>
                  <input required={!editingBatch.is_banned} type="url" name="tiktok_url" value={editingBatch.tiktok_url || ''} onChange={handleEditChange} disabled={editingBatch.is_banned} placeholder={editingBatch.is_banned ? "Tautan tidak diperlukan untuk akun terblokir" : "https://tiktok.com/@username"} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 disabled:bg-slate-100 text-sm font-medium" />
                  
                  <div className="flex items-center gap-2 mt-3 p-3.5 bg-red-50/50 border border-red-100 rounded-2xl">
                    <input type="checkbox" name="is_banned" id="edit_is_banned" checked={editingBatch.is_banned || false} onChange={handleEditChange} className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500 cursor-pointer" />
                    <label htmlFor="edit_is_banned" className="text-xs font-bold text-red-600 cursor-pointer select-none">
                      Tandai Sebagai Akun Terblokir (Banned)
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Pratinjau Video</label>
                  <input type="url" name="video_url" value={editingBatch.video_url || ''} onChange={handleEditChange} placeholder="https://files.catbox.moe/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
                </div>

                <div className="space-y-1.5 md:col-span-2 mt-1">
                  <label className="text-xs font-bold text-slate-700">Tautan Google Drive</label>
                  <input type="url" name="gdrive_url" value={editingBatch.gdrive_url || ''} onChange={handleEditChange} placeholder="https://drive.google.com/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Tautan TeraBox</label>
                  <input type="url" name="terabox_url" value={editingBatch.terabox_url || ''} onChange={handleEditChange} placeholder="https://terabox.com/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingBatch(null)} className="px-6 py-2.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-xs">
                  Batal
                </button>
                <button type="submit" disabled={isUpdatingBatch} className="px-6 py-2.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md cursor-pointer text-xs">
                  {isUpdatingBatch ? "Menyimpan..." : <><Save size={16} /> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAvatarModal && (
        <AvatarModal 
          currentAvatar={userProfile?.avatar_url} 
          onClose={() => setShowAvatarModal(false)}
          onSelectAvatar={handleUpdateAvatar} 
        />
      )}

      {showAddModal && (
        <PostModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchUserData(false);
            if (userProfile?.is_admin) fetchAllBatches();
            setShowAddModal(false);
          }}
          currentUser={activeUsername}
          showToast={handleShowToast}
          CATEGORIES={CATEGORIES}
        />
      )}

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            fetchUserData(false);
            setShowLoginModal(false);
          }}
          showToast={handleShowToast}
        />
      )}

      <Toast message={toastConfig.message} isVisible={toastConfig.isVisible} type={toastConfig.type} />
    </div>
  );
}