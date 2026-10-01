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
  BarChart3,
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
  Save
} from 'lucide-react';
import { EmeraldFolderIcon, UserBadge } from '../components/SharedIcons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PostModal from '../components/PostModal';
import LoginModal from '../components/LoginModal';
import AvatarModal from '../components/Avatar';

const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

// Komponen Toast lokal agar serasi dengan Homepage
const Toast = ({ message, isVisible, type = 'success' }: any) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 transition-all duration-300 z-[9999] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
    <span className="text-sm font-medium">{message}</span>
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
  const [adminList, setAdminList] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const [usernameInput, setUsernameInput] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'collections' | 'settings'>('overview');
  const [collectionSearchQuery, setCollectionSearchQuery] = useState('');

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [isUpdatingBatch, setIsUpdatingBatch] = useState(false);

  // State Toast Notifikasi
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
      handleShowToast("Avatar updated successfully!", "success");
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
      handleShowToast("Username updated successfully!", "success");
    }
  };

  const activeUsername = userProfile?.username || currentUser;

  const stats = useMemo(() => {
    const totalUploads = userBatches.length;
    const totalApproved = userBatches.filter(b => b.status === 'approved').length;
    const totalPending = userBatches.filter(b => b.status === 'pending').length;
    
    const totalVideos = userBatches.reduce((acc: number, b: any) => acc + (Number(b.video_count) || 0), 0);
    
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
      handleShowToast("Failed to delete folder", "error");
    } else {
      setUserBatches(prev => prev.filter(b => b.id !== batchId));
      handleShowToast("Folder deleted successfully", "success");
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setEditingBatch({ ...editingBatch, [target.name]: value });
  };

  const handleUpdateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    setIsUpdatingBatch(true);
    try {
      const { error } = await supabase
        .from('batches')
        .update({
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
        })
        .eq('id', editingBatch.id);

      if (error) throw error;

      handleShowToast("Batch updated successfully!", "success");
      
      setUserBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...editingBatch, is_edited: true } : b));
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
          setShowRulesModal={() => {
            window.history.pushState({}, '', '/rules');
            window.dispatchEvent(new Event('popstate'));
          }}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setShowAvatarModal(true)}
                  title="Click to change avatar"
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

                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">
                      {activeUsername || 'User'}
                    </h1>
                    <UserBadge 
                      username={activeUsername || ''} 
                      adminList={adminList} 
                      count={stats.totalUploads} 
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

              {/* Sidebar Nav Tabs */}
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
                  <FolderHeart size={18} /> My Batch Collections
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Settings size={18} /> Account Settings
                </button>

                <hr className="my-2 border-slate-100" />

                <button
                  onClick={handleLogoutAction}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all border-none cursor-pointer"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>

            {/* RIGHT CONTENT AREA */}
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
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Approved Status</span>
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

                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Collections</h2>
                        <p className="text-xs text-slate-400 font-medium">Overview of your latest uploaded video folders</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('collections')}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 border-none bg-transparent cursor-pointer"
                      >
                        View All →
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
                              <EmeraldFolderIcon className="w-10 h-10 flex-shrink-0" country={batch.country} />
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
                      <p className="text-xs text-slate-400 text-center py-6">No collections uploaded yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: BATCH COLLECTIONS */}
              {activeTab === 'collections' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 animate-in fade-in duration-200">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 tracking-tight">My Batch Collections</h2>
                      <p className="text-xs text-slate-400 font-medium">Full list of video folders you have uploaded</p>
                    </div>
                    
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search collections..." 
                        value={collectionSearchQuery}
                        onChange={(e) => setCollectionSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  {filteredBatches.length > 0 ? (
                    <div className="space-y-3">
                      {filteredBatches.map((batch) => (
                        <div 
                          key={batch.id} 
                          className="p-4 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-100/50"
                        >
                          <div className="flex items-center gap-3.5">
                            <EmeraldFolderIcon className="w-10 h-10 flex-shrink-0" country={batch.country} />
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">{batch.username}</h3>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                                <span className="text-emerald-600 font-bold">{batch.country}</span>
                                <span>•</span>
                                <span>{batch.video_count} Videos</span>
                                <span>•</span>
                                <span>{batch.size_file || `${batch.size_gb || 0} GB`}</span>
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

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingBatch(batch)}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                title="Edit Folder"
                              >
                                <Edit2 size={16} />
                              </button>

                              <button
                                onClick={() => handleDeleteBatch(batch.id)}
                                disabled={deletingId === batch.id}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer disabled:opacity-50"
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
                    <div className="py-14 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                        <Folder size={28} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700 mb-1">No Collections Found</h3>
                      <p className="text-xs text-slate-400 max-w-xs font-medium">
                        {collectionSearchQuery ? 'No batches match your search.' : "You haven't uploaded any video collections yet."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ACCOUNT SETTINGS */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Account Settings</h2>
                    <p className="text-xs text-slate-400 font-medium">Manage your profile avatar and account details</p>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Avatar Settings Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500 overflow-hidden flex items-center justify-center text-white shadow-md flex-shrink-0">
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} />
                      )}
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <h3 className="text-sm font-bold text-slate-800">Character Avatar</h3>
                      <p className="text-xs text-slate-400">Select from our official character avatar collection to personalize your profile.</p>
                      <button
                        onClick={() => setShowAvatarModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all border-none cursor-pointer"
                      >
                        <Sparkles size={14} /> Change Avatar
                      </button>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="Enter your username"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                        />
                        <button
                          onClick={handleUpdateUsername}
                          disabled={updatingUsername || usernameInput.trim() === activeUsername}
                          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all border-none cursor-pointer flex-shrink-0 flex items-center justify-center min-w-[90px]"
                        >
                          {updatingUsername ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            'Save'
                          )}
                        </button>
                      </div>
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

      {/* Edit Batch Modal Inline */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setEditingBatch(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Edit Batch Collection</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">Update your previously submitted batch information.</p>
              </div>
              <button onClick={() => setEditingBatch(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateBatchSubmit} className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Creator Username</label>
                  <input required type="text" name="username" value={editingBatch.username || ''} onChange={handleEditChange} placeholder="Example: jennie_bp" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Country / Region</label>
                  <select name="country" value={editingBatch.country || ''} onChange={handleEditChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                    {selectableCategories.map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Video Count</label>
                  <input required type="number" name="video_count" value={editingBatch.video_count || ''} onChange={handleEditChange} placeholder="Example: 150" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">File Size</label>
                  <input required type="text" name="size_file" value={editingBatch.size_file || ''} onChange={handleEditChange} placeholder="Example: 500 MB" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">TikTok Profile Link</label>
                  <input required={!editingBatch.is_banned} type="url" name="tiktok_url" value={editingBatch.tiktok_url || ''} onChange={handleEditChange} disabled={editingBatch.is_banned} placeholder={editingBatch.is_banned ? "Link not required for banned accounts" : "https://tiktok.com/@username"} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-60 disabled:bg-slate-100" />
                  
                  <div className="flex items-center gap-2 mt-3 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                    <input type="checkbox" name="is_banned" id="edit_is_banned" checked={editingBatch.is_banned || false} onChange={handleEditChange} className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500 cursor-pointer" />
                    <label htmlFor="edit_is_banned" className="text-sm font-semibold text-red-600 cursor-pointer select-none">
                      Mark as Banned Account
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <label className="text-sm font-semibold text-slate-700">Video Preview</label>
                  </div>
                  <input type="url" name="video_url" value={editingBatch.video_url || ''} onChange={handleEditChange} placeholder="https://files.catbox.moe/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>

                <div className="space-y-1.5 md:col-span-2 mt-2">
                  <label className="text-sm font-semibold text-slate-700">Google Drive Link</label>
                  <input type="url" name="gdrive_url" value={editingBatch.gdrive_url || ''} onChange={handleEditChange} placeholder="https://drive.google.com/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">TeraBox Link</label>
                  <input type="url" name="terabox_url" value={editingBatch.terabox_url || ''} onChange={handleEditChange} placeholder="https://terabox.com/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingBatch(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdatingBatch} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                  {isUpdatingBatch ? "Saving..." : <><Save size={18} /> Save Changes</>}
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

      {/* Render Toast Notifikasi */}
      <Toast message={toastConfig.message} isVisible={toastConfig.isVisible} type={toastConfig.type} />

    </div>
  );
}