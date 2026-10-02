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
      handleShowToast(`Failed to update status: ${error.message}`, "error");
    } else {
      handleShowToast(`Batch status successfully changed to ${newStatus}`, "success");
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
      handleShowToast("Failed to update profile avatar", "error");
    } else {
      setUserProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }));
      if (onProfileUpdate) onProfileUpdate(userProfile?.username || currentUser || '', avatarUrl);
      handleShowToast("Avatar successfully updated!", "success");
    }
  };

  const handleUpdateUsername = async () => {
    const trimmedUsername = usernameInput.trim();
    if (!trimmedUsername) {
      handleShowToast("Username cannot be empty", "error");
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
      handleShowToast("Failed to update username", "error");
    } else {
      setUserProfile((prev: any) => ({ ...prev, username: trimmedUsername }));
      if (onProfileUpdate) onProfileUpdate(trimmedUsername, userProfile?.avatar_url);
      handleShowToast("Username successfully updated!", "success");
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
    if (!window.confirm("Are you sure you want to delete this collection folder?")) return;

    setDeletingId(batchId);
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', batchId);

    setDeletingId(null);

    if (error) {
      handleShowToast("Failed to delete folder", "error");
    } else {
      setUserBatches(prev => prev.filter(b => b.id !== batchId));
      setAllBatches(prev => prev.filter(b => b.id !== batchId));
      handleShowToast("Folder successfully deleted", "success");
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

      handleShowToast("Batch successfully updated!", "success");
      
      setUserBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...editingBatch, is_edited: true } : b));
      setAllBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...editingBatch, is_edited: true } : b));
      setEditingBatch(null);
    } catch (error: any) {
      handleShowToast(error.message || "Failed to update batch", "error");
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
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-10 h-10 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-600 tracking-wide">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col justify-between">
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

        <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-16">
          {/* Main Unified Dashboard Container */}
          <div className="bg-white rounded-[40px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-[75vh]">
            
            {/* LEFT SIDEBAR - Soft UI Menu */}
            <div className="w-full lg:w-[260px] shrink-0 space-y-8">
              <div className="flex flex-col items-center text-center">
                <div 
                  className="relative group cursor-pointer mb-4"
                  onClick={() => setShowAvatarModal(true)}
                  title="Click to change avatar"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-400 overflow-hidden flex items-center justify-center text-white shadow-lg shadow-violet-500/20 border-4 border-white transition-all duration-300 group-hover:scale-105">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User size={40} strokeWidth={2.2} />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-2 bg-white text-slate-600 rounded-full shadow-md transition-all border border-slate-100 flex items-center justify-center hover:text-violet-600">
                    <Camera size={14} />
                  </div>
                </div>

                <div className="flex flex-col items-center w-full">
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    {activeUsername || 'User'}
                    {unlockedBadges.length > 0 && (
                      <img 
                        src={unlockedBadges[unlockedBadges.length - 1].iconUrl} 
                        alt={unlockedBadges[unlockedBadges.length - 1].title} 
                        title={unlockedBadges[unlockedBadges.length - 1].title}
                        className="w-6 h-6 object-contain drop-shadow-sm cursor-pointer hover:scale-110 transition-transform"
                      />
                    )}
                  </h1>

                  <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
                    {userProfile?.is_admin && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-[#fbbf24] px-3 py-1 rounded-full shadow-sm">
                        <ShieldCheck size={12} /> Admin
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">
                      Level {Math.floor(stats.totalUploads / 3) + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation - Style matched with screenshot */}
              <div className="space-y-2">
                <div className="mb-4">
                  <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/30 transition-all border-none cursor-default pointer-events-none">
                    <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-md">
                      <LayoutDashboard size={14} />
                    </div>
                    Main Menu
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
                    activeTab === 'overview' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard size={18} className={activeTab === 'overview' ? 'text-[#8b5cf6]' : ''} /> 
                  Statistics
                </button>

                <button
                  onClick={() => setActiveTab('collections')}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
                    activeTab === 'collections' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FolderHeart size={18} className={activeTab === 'collections' ? 'text-[#8b5cf6]' : ''} /> 
                  Collections
                  <div className="ml-auto w-2 h-2 rounded-full bg-[#f97316]"></div>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
                    activeTab === 'settings' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Settings size={18} className={activeTab === 'settings' ? 'text-[#8b5cf6]' : ''} /> 
                  Settings
                </button>

                {userProfile?.is_admin && (
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      fetchAllBatches();
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
                      activeTab === 'admin' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck size={18} className={activeTab === 'admin' ? 'text-[#fbbf24]' : ''} /> 
                    Admin Panel
                    {adminStats.pendingCount > 0 && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#10b981]"></div>
                    )}
                  </button>
                )}

                <div className="pt-4 mt-2 border-t border-slate-100">
                  <button
                    onClick={handleLogoutAction}
                    className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all border-none cursor-pointer"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="flex-1 lg:pl-6 space-y-8">
              
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Dashboard Stat Cards - Colorful Soft UI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {/* Blue Card */}
                    <div className="bg-[#3b82f6] p-6 rounded-[32px] shadow-[0_12px_24px_-8px_rgba(59,130,246,0.4)] flex flex-col justify-between text-white relative overflow-hidden transition-transform hover:-translate-y-1">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-sm font-medium text-blue-100">Total Folders</span>
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                          <Folder size={18} className="text-white" />
                        </div>
                      </div>
                      <div className="relative z-10">
                        <div className="text-3xl font-bold">{stats.totalUploads}</div>
                        <div className="text-[10px] mt-1 text-blue-100 flex items-center gap-1">
                          <TrendingUp size={12} /> Active Progress
                        </div>
                      </div>
                    </div>

                    {/* Green Card */}
                    <div className="bg-[#84cc16] p-6 rounded-[32px] shadow-[0_12px_24px_-8px_rgba(132,204,22,0.4)] flex flex-col justify-between text-white relative overflow-hidden transition-transform hover:-translate-y-1">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-sm font-medium text-green-100">Total Videos</span>
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                          <Video size={18} className="text-white" />
                        </div>
                      </div>
                      <div className="relative z-10">
                        <div className="text-3xl font-bold">{stats.totalVideos}</div>
                        <div className="text-[10px] mt-1 text-green-100 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Successfully Uploaded
                        </div>
                      </div>
                    </div>

                    {/* White Card 1 */}
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.06)] flex flex-col justify-between transition-transform hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium text-slate-500">Total Size</span>
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                          <HardDrive size={18} />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalSizeDisplay}</div>
                        <div className="text-[10px] mt-1 text-slate-400">Capacity used</div>
                      </div>
                    </div>

                    {/* White Card 2 */}
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.06)] flex flex-col justify-between transition-transform hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium text-slate-500">Total Downloads</span>
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                          <MousePointerClick size={18} />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalClicks}</div>
                        <div className="text-[10px] mt-1 text-slate-400">Inbound click traffic</div>
                      </div>
                    </div>
                  </div>

                  {/* BADGES SECTION */}
                  <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Achievement Badges</h2>
                        <p className="text-xs text-slate-500 mt-1">Badges unlock automatically based on contributions</p>
                      </div>
                      <span className="text-xs font-bold text-[#8b5cf6] bg-purple-50 px-4 py-2 rounded-full">
                        {unlockedBadges.length} / {BADGES.length} Unlocked
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
                            className={`relative p-5 rounded-[24px] transition-all duration-300 flex flex-col justify-between ${
                              unlocked ? 'bg-gradient-to-b from-white to-blue-50/30 border border-blue-100 shadow-[0_4px_16px_-8px_rgba(59,130,246,0.2)] hover:-translate-y-1' : 'bg-slate-50 border border-slate-100 opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
                                unlocked ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {badge.tier}
                              </span>
                              {unlocked ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#84cc16]">
                                  <Sparkles size={12} /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                  <Lock size={12} /> Locked
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col items-center mb-4 text-center">
                              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                                <img 
                                  src={badge.iconUrl} 
                                  alt={badge.title} 
                                  className={`w-16 h-16 object-contain transition-all duration-300 ${
                                    unlocked ? 'drop-shadow-lg hover:scale-110' : 'grayscale opacity-40'
                                  }`}
                                />
                              </div>
                              <h3 className="text-sm font-bold text-slate-800">{badge.title}</h3>
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                                {badge.description}
                              </p>
                            </div>

                            <div className="mt-auto">
                              <div className="flex justify-between items-center text-[10px] font-bold mb-1.5">
                                <span className="text-slate-400">Progress</span>
                                <span className={unlocked ? 'text-[#8b5cf6]' : 'text-slate-500'}>
                                  {progress} / {badge.target}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 rounded-full ${unlocked ? 'bg-[#8b5cf6]' : 'bg-slate-300'}`}
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
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Batch Collections</h2>
                      <p className="text-xs text-slate-500 mt-1">List of uploaded video folders</p>
                    </div>
                    
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search collections..." 
                        value={collectionSearchQuery}
                        onChange={(e) => setCollectionSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] text-sm font-medium text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  {filteredBatches.length > 0 ? (
                    <div className="space-y-4">
                      {filteredBatches.map((batch) => (
                        <div 
                          key={batch.id} 
                          className="p-5 rounded-[24px] bg-white border border-slate-100 shadow-[0_4px_16px_-10px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl">
                              <EmeraldFolderIcon className="w-10 h-10 flex-shrink-0" country={batch.country} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">{batch.username}</h3>
                              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-medium flex-wrap">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-semibold">{batch.country}</span>
                                <span>•</span>
                                <span>{batch.video_count} Videos</span>
                                <span>•</span>
                                <span>{batch.size_file || `${batch.size_gb || 0} GB`}</span>
                                <span>•</span>
                                <span>{batch.clicks ?? batch.click_count ?? batch.total_clicks ?? batch.click ?? 0} Downloads</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            {batch.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#84cc16]/10 text-[#84cc16]">
                                <CheckCircle2 size={14} /> Approved
                              </span>
                            ) : batch.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-50 text-red-500">
                                <XCircle size={14} /> Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-500">
                                <Clock size={14} /> Pending
                              </span>
                            )}

                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => setEditingBatch(batch)}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                title="Edit Folder"
                              >
                                <Edit2 size={16} />
                              </button>

                              <button
                                onClick={() => handleDeleteBatch(batch.id)}
                                disabled={deletingId === batch.id}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                title="Delete Folder"
                              >
                                {deletingId === batch.id ? (
                                  <Loader2 className="animate-spin text-red-500" size={16} />
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
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-300">
                        <Folder size={28} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700 mb-1">No Collections</h3>
                      <p className="text-xs text-slate-400 font-medium max-w-xs">
                        {collectionSearchQuery ? 'No matches for your search.' : 'Folders you upload will appear here.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-300 max-w-2xl">
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Profile Settings</h2>
                  <p className="text-xs text-slate-500 mb-8">Customize your appearance and account information</p>

                  <div className="p-6 bg-slate-50 rounded-[32px] flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-400 overflow-hidden flex items-center justify-center text-white shadow-md flex-shrink-0">
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} />
                      )}
                    </div>
                    <div className="text-center sm:text-left space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Character Avatar</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Choose an avatar to represent yourself.</p>
                      </div>
                      <button
                        onClick={() => setShowAvatarModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-white text-slate-700 text-xs font-bold rounded-full shadow-sm border border-slate-200 hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-all"
                      >
                        <Sparkles size={14} /> Change Avatar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Username</label>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="Enter your username"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] focus:bg-white transition-all"
                        />
                        <button
                          onClick={handleUpdateUsername}
                          disabled={updatingUsername || usernameInput.trim() === activeUsername}
                          className="px-6 py-3.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white text-sm font-bold rounded-2xl shadow-md shadow-purple-500/20 transition-all flex-shrink-0 flex items-center justify-center min-w-[100px]"
                        >
                          {updatingUsername ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && userProfile?.is_admin && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="text-[#fbbf24]" size={24} /> Moderation Panel
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Manage batch approvals from creators</p>
                    </div>

                    <button
                      onClick={fetchAllBatches}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-full transition-all flex items-center gap-2"
                    >
                      <Loader2 size={14} className={actionLoadingId ? "animate-spin" : ""} /> Reload
                    </button>
                  </div>

                  {/* Filter Tabs matching the soft UI style */}
                  <div className="flex overflow-x-auto gap-3 pb-2 mb-6 [&::-webkit-scrollbar]:hidden">
                    <button 
                      onClick={() => setAdminStatusFilter('pending')}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        adminStatusFilter === 'pending' ? 'bg-[#fbbf24] text-white shadow-md shadow-amber-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Clock size={14} /> Pending ({adminStats.pendingCount})
                    </button>
                    <button 
                      onClick={() => setAdminStatusFilter('approved')}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        adminStatusFilter === 'approved' ? 'bg-[#84cc16] text-white shadow-md shadow-green-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 size={14} /> Approved ({adminStats.approvedCount})
                    </button>
                    <button 
                      onClick={() => setAdminStatusFilter('rejected')}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        adminStatusFilter === 'rejected' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <XCircle size={14} /> Rejected ({adminStats.rejectedCount})
                    </button>
                    <button 
                      onClick={() => setAdminStatusFilter('all')}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        adminStatusFilter === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Folder size={14} /> All ({adminStats.total})
                    </button>
                  </div>

                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search creator or region..." 
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/30 focus:border-[#fbbf24] text-sm font-medium transition-all"
                    />
                  </div>

                  {filteredAdminBatches.length > 0 ? (
                    <div className="space-y-4">
                      {filteredAdminBatches.map((batch) => (
                        <div 
                          key={batch.id} 
                          className="p-5 rounded-[24px] bg-white border border-slate-100 shadow-[0_4px_16px_-10px_rgba(0,0,0,0.05)] flex flex-col gap-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-slate-50 rounded-2xl">
                                <EmeraldFolderIcon className="w-10 h-10 flex-shrink-0" country={batch.country} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-slate-800">{batch.username}</h3>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-blue-50 text-blue-600">
                                    {batch.country}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium mt-1">
                                  {batch.video_count} Videos • {batch.size_file || `${batch.size_gb || 0} GB`} • {batch.clicks ?? batch.click_count ?? batch.total_clicks ?? batch.click ?? 0} Downloads
                                </p>
                              </div>
                            </div>

                            <div>
                              {batch.status === 'approved' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#84cc16]/10 text-[#84cc16]">
                                  <CheckCircle2 size={13} /> Approved
                                </span>
                              )}
                              {batch.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-50 text-red-500">
                                  <XCircle size={13} /> Rejected
                                </span>
                              )}
                              {batch.status === 'pending' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-500">
                                  <Clock size={13} /> Pending
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px]">
                            {batch.tiktok_url && (
                              <a href={batch.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-slate-600 hover:text-blue-500 transition-colors shadow-sm">
                                <ExternalLink size={12} /> TikTok Profile
                              </a>
                            )}
                            {batch.gdrive_url && (
                              <a href={batch.gdrive_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-slate-600 hover:text-green-600 transition-colors shadow-sm">
                                <ExternalLink size={12} /> Google Drive
                              </a>
                            )}
                            {batch.terabox_url && (
                              <a href={batch.terabox_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-slate-600 hover:text-purple-600 transition-colors shadow-sm">
                                <ExternalLink size={12} /> TeraBox
                              </a>
                            )}
                            {batch.video_url && (
                              <a href={batch.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-slate-600 hover:text-orange-500 transition-colors shadow-sm">
                                <ExternalLink size={12} /> Preview
                              </a>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateStatus(batch.id, 'approved')}
                                disabled={actionLoadingId === batch.id || batch.status === 'approved'}
                                className="px-4 py-2 bg-[#84cc16] hover:bg-[#65a30d] disabled:opacity-50 text-white text-[11px] font-bold rounded-full transition-all shadow-sm shadow-green-500/20 flex items-center gap-1.5"
                              >
                                {actionLoadingId === batch.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Approve
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(batch.id, 'rejected')}
                                disabled={actionLoadingId === batch.id || batch.status === 'rejected'}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-[11px] font-bold rounded-full transition-all shadow-sm shadow-red-500/20 flex items-center gap-1.5"
                              >
                                {actionLoadingId === batch.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                Reject
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingBatch(batch)}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                title="Edit Batch"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteBatch(batch.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete Batch"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                      <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
                      <p className="text-sm font-bold text-slate-600">No data found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Change filter or adjust your search.</p>
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setEditingBatch(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Edit Collection</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">Update batch information.</p>
              </div>
              <button onClick={() => setEditingBatch(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateBatchSubmit} className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
                  <input required type="text" name="username" value={editingBatch.username || ''} onChange={handleEditChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] text-sm font-medium" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Region</label>
                  <select name="country" value={editingBatch.country || ''} onChange={handleEditChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] text-sm font-medium">
                    {selectableCategories.map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Video Count</label>
                  <input required type="number" name="video_count" value={editingBatch.video_count || ''} onChange={handleEditChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] text-sm font-medium" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size</label>
                  <input required type="text" name="size_file" value={editingBatch.size_file || ''} onChange={handleEditChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] text-sm font-medium" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Downloads</label>
                  <input type="number" name="clicks" value={editingBatch.clicks ?? editingBatch.click_count ?? editingBatch.total_clicks ?? editingBatch.click ?? 0} onChange={handleEditChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] text-sm font-medium" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TikTok Link</label>
                  <input required={!editingBatch.is_banned} type="url" name="tiktok_url" value={editingBatch.tiktok_url || ''} onChange={handleEditChange} disabled={editingBatch.is_banned} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] disabled:opacity-50 text-sm font-medium" />
                  
                  <div className="flex items-center gap-2 mt-3 pl-1">
                    <input type="checkbox" name="is_banned" id="edit_is_banned" checked={editingBatch.is_banned || false} onChange={handleEditChange} className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500 cursor-pointer" />
                    <label htmlFor="edit_is_banned" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                      Mark Account as Banned
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Google Drive Link</label>
                  <input type="url" name="gdrive_url" value={editingBatch.gdrive_url || ''} onChange={handleEditChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] text-sm font-medium" />
                </div>
              </div>

              <div className="mt-8 pt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingBatch(null)} className="px-6 py-3 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdatingBatch} className="px-6 py-3 rounded-full font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors flex items-center gap-2 disabled:opacity-70 shadow-md shadow-purple-500/20 text-xs">
                  {isUpdatingBatch ? "Saving..." : <><Save size={16} /> Save</>}
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