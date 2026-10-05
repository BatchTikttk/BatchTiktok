import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
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
  MousePointerClick,
  Send,
  Crown,
  Link2
} from 'lucide-react';
import { EmeraldFolderIcon } from '../components/SharedIcons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AvatarBorderVip, { VIP_BORDERS } from '../components/AvatarBorderVip';
import AnimationBorder, { ANIMATION_BORDERS } from '../components/AnimationBorder';

// Lazy load heavy components
const PostModal = lazy(() => import('../components/PostModal'));
const LoginModal = lazy(() => import('../components/LoginModal'));
const AvatarModal = lazy(() => import('../components/Avatar'));
const CustomBatchRequest = lazy(() => import('../components/CustomBatchRequest'));

const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

const BADGES = [
  {
    id: 'bronze',
    title: 'Bronze Tier',
    tier: 'Tier 1 Badge',
    description: 'Unlocks automatically after uploading at least 10 video batches.',
    reqText: '10 Uploaded',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Bronze.webp',
    isUnlocked: (stats: any) => stats.totalUploads >= 10,
    getCurrentProgress: (stats: any) => Math.min(stats.totalUploads, 10),
    target: 10,
    unit: 'Uploaded'
  },
  {
    id: 'silver',
    title: 'Silver Tier',
    tier: 'Tier 2 Badge',
    description: 'Unlocks automatically after uploading at least 30 video batches.',
    reqText: '30 Uploaded',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Silver.webp',
    isUnlocked: (stats: any) => stats.totalUploads >= 30,
    getCurrentProgress: (stats: any) => Math.min(stats.totalUploads, 30),
    target: 30,
    unit: 'Uploaded'
  },
  {
    id: 'gold',
    title: 'Gold Tier',
    tier: 'Tier 3 Badge',
    description: 'Unlocks automatically after uploading at least 50 video batches.',
    reqText: '50 Uploaded',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Gold.webp',
    isUnlocked: (stats: any) => stats.totalUploads >= 50,
    getCurrentProgress: (stats: any) => Math.min(stats.totalUploads, 50),
    target: 50,
    unit: 'Uploaded'
  },
  {
    id: 'elite',
    title: 'Elite Tier',
    tier: 'Tier 4 Badge',
    description: 'Unlocks automatically after uploading at least 100 video batches.',
    reqText: '100 Uploaded',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Elite.webp',
    isUnlocked: (stats: any) => stats.totalUploads >= 100,
    getCurrentProgress: (stats: any) => Math.min(stats.totalUploads, 100),
    target: 100,
    unit: 'Uploaded'
  },
  {
    id: 'legend',
    title: 'Legend Tier',
    tier: 'Tier 5 Badge',
    description: 'Highest Achievement! Unlocks after uploading at least 200 video batches.',
    reqText: '200 Uploaded',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Legend.webp',
    isUnlocked: (stats: any) => stats.totalUploads >= 200,
    getCurrentProgress: (stats: any) => Math.min(stats.totalUploads, 200),
    target: 200,
    unit: 'Uploaded'
  }
];

const Toast = ({ message, isVisible, type = 'success' }: any) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 transition-all duration-300 z-[9999] border ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${type === 'success' ? 'bg-slate-900/90 text-white border-slate-800' : 'bg-red-600/90 text-white border-red-500'}`}>
    {type === 'success' ? <CheckCircle2 className="text-emerald-400" size={18} /> : <XCircle className="text-white" size={18} />}
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
  
  // State for Custom Batch Requests in Admin Panel
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<'uploads' | 'requests'>('uploads');
  const [requestResultUrls, setRequestResultUrls] = useState<Record<string, string>>({});

  const [, setAdminList] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

  const [usernameInput, setUsernameInput] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);
  
  // Mengubah tab vip-borders menjadi progress
  const [activeTab, setActiveTab] = useState<'overview' | 'collections' | 'request' | 'progress' | 'settings' | 'admin'>('overview');
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
      fetchAllRequests();
    }
  }, [userProfile?.is_admin]);

  const fetchAdmins = async () => {
    const cacheKey = 'swr_admin_list';
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) setAdminList(JSON.parse(cachedData));

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('is_admin', true);

    if (data) {
      const list = data.map((p: any) => (p.username || '').toLowerCase());
      setAdminList(list);
      localStorage.setItem(cacheKey, JSON.stringify(list));
    }
  };

  const fetchUserData = async (isInitial = false) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setUserProfile(null);
      setUserBatches([]);
      setLoading(false);
      return;
    }

    const userId = session.user.id;
    const cacheProfileKey = `swr_profile_${userId}`;
    const cacheBatchesKey = `swr_batches_${userId}`;

    if (isInitial) {
      const cachedProfile = localStorage.getItem(cacheProfileKey);
      const cachedBatches = localStorage.getItem(cacheBatchesKey);
      
      if (cachedProfile) {
        const parsed = JSON.parse(cachedProfile);
        setUserProfile(parsed);
        setUsernameInput(parsed.username || currentUser || '');
      }
      if (cachedBatches) {
        setUserBatches(JSON.parse(cachedBatches));
      }
      
      if (cachedProfile && cachedBatches) {
        setLoading(false); 
      } else {
        setLoading(true);
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setUserProfile(profile);
      setUsernameInput(profile.username || currentUser || '');
      localStorage.setItem(cacheProfileKey, JSON.stringify(profile));
    } else if (currentUser) {
      setUsernameInput(currentUser);
    }

    const { data: batches } = await supabase
      .from('batches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (batches) {
      setUserBatches(batches);
      localStorage.setItem(cacheBatchesKey, JSON.stringify(batches));
    }

    setLoading(false);
  };

  const fetchAllBatches = async () => {
    const cacheKey = 'swr_admin_all_batches';
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) setAllBatches(JSON.parse(cachedData));

    const { data } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setAllBatches(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
  };

  const fetchAllRequests = async () => {
    const cacheKey = 'swr_admin_all_requests';
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) setAdminRequests(JSON.parse(cachedData));

    const { data } = await supabase
      .from('batch_requests')
      .select('*, profiles (username, avatar_url)')
      .order('is_priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) {
      setAdminRequests(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
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

  const handleResultUrlChange = (id: string | number, value: string) => {
    setRequestResultUrls(prev => ({ ...prev, [String(id)]: value }));
  };

  const handleUpdateRequestStatus = async (reqId: string | number, newStatus: string, resultUrl?: string) => {
    setActionLoadingId(`req_${reqId}`);
    
    const updateData: any = { status: newStatus };
    if (resultUrl !== undefined) {
      updateData.result_url = resultUrl;
    }

    const { error } = await supabase
      .from('batch_requests')
      .update(updateData)
      .eq('id', reqId);

    setActionLoadingId(null);

    if (error) {
      handleShowToast(`Failed to update request status: ${error.message}`, "error");
    } else {
      handleShowToast(`Request status successfully changed to ${newStatus}`, "success");
      setAdminRequests(prev => prev.map(req => req.id === reqId ? { ...req, ...updateData } : req));
      
      if (newStatus === 'completed') {
        setRequestResultUrls(prev => {
          const newState = { ...prev };
          delete newState[String(reqId)];
          return newState;
        });
      }
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

  const handleSelectVipBorder = async (borderUrl: string) => {
    if (!userProfile?.is_premium) {
      handleShowToast("This feature is exclusively for Premium VIP users!", "error");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newBorderUrl = userProfile?.vip_border_url === borderUrl ? null : borderUrl;

    const { error } = await supabase
      .from('profiles')
      .update({ vip_border_url: newBorderUrl })
      .eq('id', session.user.id);

    if (error) {
      handleShowToast(`Gagal: ${error.message}`, "error");
    } else {
      setUserProfile((prev: any) => ({ ...prev, vip_border_url: newBorderUrl }));
      handleShowToast(newBorderUrl ? "Bingkai VIP berhasil dipasang!" : "Bingkai VIP dilepas!", "success");
    }
  };

  const handleSelectAnimationBorder = async (borderUrl: string | null) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newBorderUrl = userProfile?.animation_border_url === borderUrl ? null : borderUrl;

    const { error } = await supabase
      .from('profiles')
      .update({ animation_border_url: newBorderUrl })
      .eq('id', session.user.id);

    if (error) {
      handleShowToast(`Gagal: ${error.message}`, "error");
    } else {
      setUserProfile((prev: any) => ({ ...prev, animation_border_url: newBorderUrl }));
      handleShowToast(newBorderUrl ? "Animasi Border berhasil dipasang!" : "Animasi Border dilepas!", "success");
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

  const activeUsername = userProfile?.username || currentUser || '';

  const stats = useMemo(() => {
    const totalUploads = userBatches.length;
    const totalVideos = userBatches.reduce((acc: number, b: any) => acc + (Number(b.video_count) || 0), 0);
    const totalClicks = userBatches.reduce((acc: number, b: any) => {
      const downloadVal = b.download_count ?? 0;
      return acc + (Number(downloadVal) || 0);
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

    return { totalUploads, totalVideos, totalClicks, totalSizeDisplay };
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
    const target = e.target as HTMLInputElement; 
    const value = target.type === 'checkbox' ? target.checked : target.value;
    
    setEditingBatch((prev: any) => ({ ...prev, [target.name]: value }));
  };

  const handleUpdateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    setIsUpdatingBatch(true);
    try {
      const downloadVal = parseInt(editingBatch.download_count) || 0;
      
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
        download_count: downloadVal,
        is_edited: true
      };

      const { error } = await supabase
        .from('batches')
        .update(updateData)
        .eq('id', editingBatch.id);

      if (error) throw error;

      handleShowToast("Batch successfully updated!", "success");
      
      setUserBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...updateData } : b));
      setAllBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...updateData } : b));
      setEditingBatch(null);
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to update batch";
      handleShowToast(errorMsg, "error");
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
          <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-600 tracking-wide">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      <Toast message={toastConfig.message} isVisible={toastConfig.isVisible} type={toastConfig.type} />
      
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
          <div className="bg-white rounded-[40px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-[75vh]">
            
            {/* LEFT SIDEBAR */}
            <div className="w-full lg:w-[260px] shrink-0 space-y-8">
              <div className="flex flex-col items-center text-center">
                
                <div 
                  className="relative group cursor-pointer mb-4 w-[88px] h-[88px]"
                  onClick={() => setShowAvatarModal(true)}
                  title="Click to change avatar"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 border-4 border-white transition-all duration-300 group-hover:scale-105 relative z-10">
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} strokeWidth={2.2} />
                    )}
                  </div>

                  {/* Render VIP Border */}
                  {userProfile?.vip_border_url && (
                    <AvatarBorderVip 
                      isPremium={userProfile?.is_premium} 
                      borderUrl={userProfile?.vip_border_url} 
                      className="absolute top-[-20%] left-1/2 -translate-x-1/2 ml-[1px] w-[110%] h-auto max-w-none object-contain z-20 pointer-events-none"
                    />
                  )}
                  {/* Render Animation Border */}
                  {userProfile?.animation_border_url && (
                    <AnimationBorder 
                      borderUrl={userProfile?.animation_border_url} 
                      className="absolute top-[-20%] left-1/2 -translate-x-1/2 ml-[1px] w-[110%] h-auto max-w-none object-contain z-20 pointer-events-none"
                    />
                  )}
                </div>

                <div className="flex flex-col items-center w-full mt-2">
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

                  <div className="mt-1.5 flex items-center gap-2 flex-wrap justify-center">
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

              {/* Sidebar Navigation */}
              <div className="space-y-2">
                <div className="mb-4">
                  <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold bg-[#10b981] text-white shadow-lg shadow-emerald-500/30 transition-all border-none cursor-default pointer-events-none">
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
                  <LayoutDashboard size={18} className={activeTab === 'overview' ? 'text-[#10b981]' : ''} /> 
                  Statistics
                </button>

                <button
                  onClick={() => setActiveTab('collections')}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
                    activeTab === 'collections' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FolderHeart size={18} className={activeTab === 'collections' ? 'text-[#10b981]' : ''} /> 
                  Collections
                  <div className="ml-auto w-2 h-2 rounded-full bg-[#f97316]"></div>
                </button>
                
                <button
                  onClick={() => setActiveTab('request')}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
                    activeTab === 'request' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Send size={18} className={activeTab === 'request' ? 'text-[#10b981]' : ''} /> 
                  Request Batch
                </button>

                <button
                  onClick={() => setActiveTab('progress')}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
                    activeTab === 'progress' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Crown size={18} className={activeTab === 'progress' ? 'text-[#10b981]' : ''} /> 
                  Progress
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
                    activeTab === 'settings' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Settings size={18} className={activeTab === 'settings' ? 'text-[#10b981]' : ''} /> 
                  Settings
                </button>

                {userProfile?.is_admin && (
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      fetchAllBatches();
                      fetchAllRequests();
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
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

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.06)] flex flex-col justify-between transition-transform hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium text-slate-500">Total Size</span>
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                          <HardDrive size={18} />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalSizeDisplay}</div>
                        <div className="text-[10px] mt-1 text-slate-400">Size Uploaded</div>
                      </div>
                    </div>

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

                  <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Achievement Badges</h2>
                        <p className="text-xs text-slate-500 mt-1">Badges unlock automatically based on contributions</p>
                      </div>
                      <span className="text-xs font-bold text-[#10b981] bg-emerald-50 px-4 py-2 rounded-full">
                        {unlockedBadges.length} / {BADGES.length} Unlocked
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {BADGES.map((badge) => {
                        const unlocked = badge.isUnlocked(stats);
                        const progress = badge.getCurrentProgress(stats);
                        const percent = Math.min(Math.round((progress / badge.target) * 100), 100);
                        const isLegend = badge.id === 'legend';

                        return (
                          <div 
                            key={badge.id}
                            className={`relative p-5 rounded-[24px] transition-all duration-300 flex flex-col justify-between h-full ${
                              unlocked 
                                ? (isLegend 
                                    ? 'bg-gradient-to-b from-yellow-50 to-amber-100/50 border border-amber-200 shadow-[0_8px_24px_-8px_rgba(251,191,36,0.4)] scale-[1.02] hover:-translate-y-1' 
                                    : 'bg-gradient-to-b from-white to-blue-50/30 border border-blue-100 shadow-[0_4px_16px_-8px_rgba(59,130,246,0.2)] hover:-translate-y-1') 
                                : 'bg-slate-50 border border-slate-100 opacity-80'
                            } ${isLegend ? 'md:col-span-2 max-w-[380px] mx-auto w-full' : 'w-full'}`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
                                unlocked 
                                  ? (isLegend ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700') 
                                  : 'bg-slate-200 text-slate-500'
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
                              <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                                <img 
                                  src={badge.iconUrl} 
                                  alt={badge.title} 
                                  className={`w-20 h-20 object-contain transition-all duration-300 ${
                                    unlocked ? (isLegend ? 'drop-shadow-2xl scale-125 hover:scale-150' : 'drop-shadow-lg hover:scale-110') : 'grayscale opacity-40'
                                  }`}
                                />
                              </div>
                              <h3 className={`text-sm font-bold mt-2 ${isLegend && unlocked ? 'text-amber-600 text-base' : 'text-slate-800'}`}>
                                {badge.title}
                              </h3>
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 px-4">
                                {badge.description}
                              </p>
                            </div>

                            <div className="mt-auto">
                              <div className="flex justify-between items-center text-[10px] font-bold mb-1.5">
                                <span className="text-slate-400">Target</span>
                                <span className={unlocked ? (isLegend ? 'text-amber-500' : 'text-[#10b981]') : 'text-slate-500'}>
                                  {badge.target} {badge.unit}
                                </span>
                              </div>
                              
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 rounded-full ${unlocked ? (isLegend ? 'bg-amber-500' : 'bg-[#10b981]') : 'bg-slate-300'}`}
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
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] text-sm font-medium text-slate-700 transition-all"
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
                                <span>{batch.download_count ?? 0} Downloads</span>
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
              
              {activeTab === 'request' && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800">Request Batch</h2>
                    <p className="text-xs text-slate-500 mt-1">Submit a request to archive specific TikTok profiles</p>
                  </div>
                  <Suspense fallback={
                    <div className="py-12 flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-100 text-center shadow-sm">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                      <span className="text-sm font-bold text-slate-600">Loading Form Request...</span>
                    </div>
                  }>
                    <CustomBatchRequest currentUser={userProfile} />
                  </Suspense>
                </div>
              )}

              {/* TAB PROGRESS: Menampilkan VIP Border dan Progress Animation Border */}
              {activeTab === 'progress' && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Crown className="text-amber-500" size={24} /> Progress Borders
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Koleksi bingkai eksklusif dan border animasi dari progres Anda.
                      </p>
                    </div>
                  </div>

                  {/* VIP PREMIUM BORDERS */}
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-700">VIP Premium Borders</h3>
                      {!userProfile?.is_premium && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Lock size={12} /> Requires Premium
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] border border-slate-100">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {VIP_BORDERS.map((url, index) => {
                          const isSelected = userProfile?.vip_border_url === url;
                          const isPremium = !!userProfile?.is_premium;

                          return (
                            <div
                              key={`vip-${index}`}
                              onClick={() => handleSelectVipBorder(url)}
                              className={`relative p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                                isSelected && isPremium
                                  ? 'bg-amber-50/60 border-amber-400 shadow-md scale-105'
                                  : 'bg-white border-slate-200 hover:border-amber-300 hover:-translate-y-1'
                              } ${!isPremium ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3 flex items-center justify-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white relative z-10 shadow-sm">
                                  {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={28} />
                                  )}
                                </div>
                                <AvatarBorderVip 
                                  isPremium={true} 
                                  borderUrl={url} 
                                  className="absolute top-[-20%] left-1/2 -translate-x-1/2 ml-[1px] w-[110%] h-auto max-w-none object-contain z-20 pointer-events-none" 
                                />
                              </div>
                              <span className="text-[11px] md:text-xs font-bold text-slate-700 mt-2 text-center w-full truncate">VIP Border {index + 1}</span>

                              {isSelected && isPremium && (
                                <span className="absolute top-3 right-3 bg-amber-500 text-white rounded-full p-1 shadow-sm">
                                  <Check size={12} />
                                </span>
                              )}
                              {!isPremium && (
                                <span className="absolute top-3 right-3 text-slate-400 bg-slate-100 p-1 rounded-full">
                                  <Lock size={12} />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS ANIMATION BORDERS (UNTUK UMUM) */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-700">Progress Animation Borders</h3>
                      <span className="text-[10px] font-bold text-[#10b981] bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        {stats.totalUploads} Uploads
                      </span>
                    </div>
                    <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] border border-slate-100">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {ANIMATION_BORDERS?.map((url, index) => {
                          const requiredUploads = (index + 1) * 10;
                          const isUnlocked = stats.totalUploads >= requiredUploads;
                          const isSelected = userProfile?.animation_border_url === url;

                          return (
                            <div
                              key={`anim-${index}`}
                              onClick={() => handleSelectAnimationBorder(isUnlocked ? url : null)}
                              className={`relative p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                                isSelected && isUnlocked
                                  ? 'bg-emerald-50/60 border-[#10b981] shadow-md scale-105'
                                  : 'bg-white border-slate-200 hover:border-[#10b981] hover:-translate-y-1'
                              } ${!isUnlocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3 flex items-center justify-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white relative z-10 shadow-sm">
                                  {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={28} />
                                  )}
                                </div>
                                <AnimationBorder 
                                  borderUrl={url} 
                                  className="absolute top-[-20%] left-1/2 -translate-x-1/2 ml-[1px] w-[110%] h-auto max-w-none object-contain z-20 pointer-events-none" 
                                />
                              </div>

                              <span className="text-[11px] md:text-xs font-bold text-slate-700 mt-2 text-center w-full truncate">Unlock at {requiredUploads}</span>

                              {isSelected && isUnlocked && (
                                <span className="absolute top-3 right-3 bg-[#10b981] text-white rounded-full p-1 shadow-sm">
                                  <Check size={12} />
                                </span>
                              )}

                              {!isUnlocked && (
                                <span className="absolute top-3 right-3 text-slate-400 bg-slate-100 p-1 rounded-full">
                                  <Lock size={12} />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-300 max-w-2xl">
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Profile Settings</h2>
                  <p className="text-xs text-slate-500 mb-8">Customize your appearance and account information</p>

                  <div className="p-6 bg-slate-50 rounded-[32px] flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <div className="relative w-[88px] h-[88px] flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white shadow-md relative z-10">
                        {userProfile?.avatar_url ? (
                          <img src={userProfile.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User size={36} />
                        )}
                      </div>
                      
                      {/* Avatar Border Preview VIP */}
                      {userProfile?.vip_border_url && (
                        <AvatarBorderVip 
                          isPremium={userProfile?.is_premium} 
                          borderUrl={userProfile?.vip_border_url} 
                          className="absolute top-[-20%] left-1/2 -translate-x-1/2 ml-[1px] w-[110%] h-auto max-w-none object-contain z-20 pointer-events-none"
                        />
                      )}
                      
                      {/* Avatar Border Preview Animation */}
                      {userProfile?.animation_border_url && (
                        <AnimationBorder 
                          borderUrl={userProfile?.animation_border_url} 
                          className="absolute top-[-20%] left-1/2 -translate-x-1/2 ml-[1px] w-[110%] h-auto max-w-none object-contain z-20 pointer-events-none"
                        />
                      )}
                    </div>

                    <div className="text-center sm:text-left space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Character Avatar</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Choose an avatar to represent yourself.</p>
                      </div>
                      <button
                        onClick={() => setShowAvatarModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-white text-slate-700 text-xs font-bold rounded-full shadow-sm border border-slate-200 hover:border-[#10b981] hover:text-[#10b981] transition-all"
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
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:bg-white transition-all"
                        />
                        <button
                          onClick={handleUpdateUsername}
                          disabled={updatingUsername || usernameInput.trim() === activeUsername}
                          className="px-6 py-3.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white text-sm font-bold rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex-shrink-0 flex items-center justify-center min-w-[100px]"
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="text-[#fbbf24]" size={24} /> Moderation Panel
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Manage uploads and user requests</p>
                    </div>

                    <button
                      onClick={() => {
                        if (adminTab === 'uploads') fetchAllBatches();
                        else fetchAllRequests();
                      }}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-full transition-all flex items-center gap-2"
                    >
                      <Loader2 size={14} className={actionLoadingId ? "animate-spin" : ""} /> Reload
                    </button>
                  </div>

                  <div className="flex gap-3 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
                    <button
                      onClick={() => setAdminTab('uploads')}
                      className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                        adminTab === 'uploads' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Creator Uploads
                    </button>
                    <button
                      onClick={() => setAdminTab('requests')}
                      className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                        adminTab === 'requests' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      User Requests
                    </button>
                  </div>

                  {/* ===== TAB: CREATOR UPLOADS ===== */}
                  {adminTab === 'uploads' && (
                    <>
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
                                      {batch.video_count} Videos • {batch.size_file || `${batch.size_gb || 0} GB`} • {batch.download_count ?? 0} Downloads
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
                                  <a href={batch.terabox_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-slate-600 hover:text-teal-600 transition-colors shadow-sm">
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
                    </>
                  )}

                  {/* ===== TAB: USER REQUESTS ===== */}
                  {adminTab === 'requests' && (
                    <div className="space-y-4">
                      {adminRequests.length > 0 ? adminRequests.map((req: any) => (
                        <div key={req.id} className="p-5 rounded-[24px] bg-white border border-slate-100 shadow-[0_4px_16px_-10px_rgba(0,0,0,0.05)] flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                                {req.profiles?.avatar_url ? (
                                  <img src={req.profiles.avatar_url} className="w-full h-full object-cover" alt="User" />
                                ) : (
                                  <User size={20} className="text-slate-400" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-slate-800">{req.profiles?.username || 'Unknown User'}</h3>
                                  {req.is_priority && (
                                    <span title="VIP Request" className="flex">
                                      <Crown size={14} className="text-yellow-500" />
                                    </span>
                                  )}
                                </div>
                                <a href={req.target_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                  <Link2 size={12} /> {req.target_url}
                                </a>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              {req.status === 'completed' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#84cc16]/10 text-[#84cc16]">
                                  <CheckCircle2 size={13} /> Completed
                                </span>
                              )}
                              {req.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-50 text-red-500">
                                  <XCircle size={13} /> Rejected
                                </span>
                              )}
                              {(req.status === 'pending' || req.status === 'processing') && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-500">
                                  <Clock size={13} /> {req.status === 'processing' ? 'Processing' : 'Pending'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3 pt-3 border-t border-slate-50">
                            {req.result_url && (
                              <a href={req.result_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#10b981] hover:underline flex items-center gap-1 w-fit bg-emerald-50 px-2 py-1 rounded">
                                <ExternalLink size={12} /> Result: {req.result_url}
                              </a>
                            )}
                            
                            {req.status !== 'completed' && req.status !== 'rejected' && (
                              <input 
                                type="url"
                                placeholder="Enter Result URL (required to Complete)"
                                value={requestResultUrls[String(req.id)] || ''}
                                onChange={(e) => handleResultUrlChange(req.id, e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                              />
                            )}

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateRequestStatus(req.id, 'processing')}
                                disabled={actionLoadingId === `req_${req.id}` || req.status === 'processing'}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-[11px] font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5"
                              >
                                Process
                              </button>
                              <button
                                onClick={() => {
                                  if (!requestResultUrls[String(req.id)] && !req.result_url) {
                                    handleShowToast("Please enter a result URL first", "error");
                                    return;
                                  }
                                  handleUpdateRequestStatus(req.id, 'completed', requestResultUrls[String(req.id)])
                                }}
                                disabled={actionLoadingId === `req_${req.id}` || req.status === 'completed'}
                                className="px-4 py-2 bg-[#84cc16] hover:bg-[#65a30d] disabled:opacity-50 text-white text-[11px] font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5"
                              >
                                {actionLoadingId === `req_${req.id}` ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Complete
                              </button>
                              <button
                                onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                                disabled={actionLoadingId === `req_${req.id}` || req.status === 'rejected'}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-[11px] font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5"
                              >
                                {actionLoadingId === `req_${req.id}` ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="py-16 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                          <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
                          <p className="text-sm font-bold text-slate-600">No requests found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

      {/* MODALS */}
      {showAvatarModal && (
        <Suspense fallback={null}>
          <AvatarModal
            onClose={() => setShowAvatarModal(false)}
            currentAvatar={userProfile?.avatar_url}
            onSelect={handleUpdateAvatar}
          />
        </Suspense>
      )}

      {showAddModal && (
        <Suspense fallback={null}>
          <PostModal
            onClose={() => setShowAddModal(false)}
            currentUser={activeUsername}
            onSuccess={() => {
              fetchUserData(false);
              if (userProfile?.is_admin) fetchAllBatches();
            }}
          />
        </Suspense>
      )}

      {showLoginModal && (
        <Suspense fallback={null}>
          <LoginModal onClose={() => setShowLoginModal(false)} />
        </Suspense>
      )}
    </div>
  );
}