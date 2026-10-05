import React, { useState, useEffect, Suspense, lazy } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Loader2, 
  ShieldCheck, 
  X,
  Upload,
  FolderPlus
} from 'lucide-react';

// Import Komponen Moduler yang Telah Dibuat
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileOverview from '../components/ProfileOverview';
import ProfileCollections from '../components/ProfileCollections';
import ProfileSettings from '../components/ProfileSettings';

// Lazy load untuk komponen berat/tambahan
const CustomBatchRequest = lazy(() => import('../components/CustomBatchRequest'));

// Definisi Badge / Achievement System
export const BADGES = [
  {
    id: 'bronze',
    title: 'Bronze Contributor',
    tier: 'Tier 1',
    description: 'Upload your first 3 batches to unlock.',
    target: 3,
    unit: 'batches',
    iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80', // Contoh URL icon
    isUnlocked: (stats: any) => stats.totalUploads >= 3,
    getCurrentProgress: (stats: any) => stats.totalUploads
  },
  {
    id: 'silver',
    title: 'Silver Creator',
    tier: 'Tier 2',
    description: 'Reach 10 total batch uploads.',
    target: 10,
    unit: 'batches',
    iconUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=80',
    isUnlocked: (stats: any) => stats.totalUploads >= 10,
    getCurrentProgress: (stats: any) => stats.totalUploads
  },
  {
    id: 'gold',
    title: 'Gold Master',
    tier: 'Tier 3',
    description: 'Achieve 25 successful batch uploads.',
    target: 25,
    unit: 'batches',
    iconUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
    isUnlocked: (stats: any) => stats.totalUploads >= 25,
    getCurrentProgress: (stats: any) => stats.totalUploads
  },
  {
    id: 'elite',
    title: 'Elite Publisher',
    tier: 'Tier 4',
    description: 'Contribute 50 batches to the platform.',
    target: 50,
    unit: 'batches',
    iconUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=150&auto=format&fit=crop&q=80',
    isUnlocked: (stats: any) => stats.totalUploads >= 50,
    getCurrentProgress: (stats: any) => stats.totalUploads
  },
  {
    id: 'legend',
    title: 'Legendary Archiver',
    tier: 'Tier 5',
    description: 'Reach the pinnacle with 100 uploads!',
    target: 100,
    unit: 'batches',
    iconUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80',
    isUnlocked: (stats: any) => stats.totalUploads >= 100,
    getCurrentProgress: (stats: any) => stats.totalUploads
  }
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'collections' | 'request' | 'settings' | 'admin'>('overview');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBatches, setUserBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States untuk fitur interaktif & form
  const [usernameInput, setUsernameInput] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [collectionSearchQuery, setCollectionSearchQuery] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<any>(null);

  // Admin panel states
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ambil profil pengguna
      let { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
        setUsernameInput(profileData.username || '');
      }

      // Ambil daftar batch milik user
      const { data: batchesData } = await supabase
        .from('batches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (batchesData) {
        setUserBatches(batchesData);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBatches = async () => {
    const { data } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
    if (data) setAllBatches(data);
  };

  const fetchAllRequests = async () => {
    const { data } = await supabase.from('batch_requests').select('*').order('created_at', { ascending: false });
    if (data) setAllRequests(data);
  };

  // Handler Update Username
  const handleUpdateUsername = async () => {
    if (!usernameInput.trim() || !userProfile) return;
    try {
      setUpdatingUsername(true);
      const { error } = await supabase
        .from('profiles')
        .update({ username: usernameInput.trim() })
        .eq('id', userProfile.id);

      if (error) throw error;
      setUserProfile({ ...userProfile, username: usernameInput.trim() });
      alert('Username updated successfully!');
    } catch (error: any) {
      alert('Error updating username: ' + error.message);
    } finally {
      setUpdatingUsername(false);
    }
  };

  // Handler Pilih VIP Border
  const handleSelectVipBorder = async (url: string) => {
    if (!userProfile?.is_premium) {
      alert('VIP Avatar borders are exclusive to Premium accounts.');
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ vip_border_url: url })
        .eq('id', userProfile.id);

      if (error) throw error;
      setUserProfile({ ...userProfile, vip_border_url: url });
    } catch (error: any) {
      alert('Error updating VIP border: ' + error.message);
    }
  };

  // Handler Hapus Batch
  const handleDeleteBatch = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this batch collection?')) return;
    try {
      setDeletingId(id);
      const { error } = await supabase.from('batches').delete().eq('id', id);
      if (error) throw error;
      setUserBatches(userBatches.filter(b => b.id !== id));
    } catch (error: any) {
      alert('Failed to delete batch: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogoutAction = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Hitung Statistik
  const stats = {
    totalUploads: userBatches.length,
    totalVideos: userBatches.reduce((acc, curr) => acc + (curr.video_count || 0), 0),
    totalSizeDisplay: `${(userBatches.reduce((acc, curr) => acc + (curr.size_gb || 0), 0)).toFixed(1)} GB`,
    totalClicks: userBatches.reduce((acc, curr) => acc + (curr.download_count || 0), 0)
  };

  const unlockedBadges = BADGES.filter(b => b.isUnlocked(stats));
  const filteredBatches = userBatches.filter(b => 
    b.username?.toLowerCase().includes(collectionSearchQuery.toLowerCase()) ||
    b.country?.toLowerCase().includes(collectionSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#10b981]" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-[#10b981]/20 selection:text-[#10b981]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* SIDEBAR NAVIGATION & USER INFO */}
          <ProfileSidebar 
            userProfile={userProfile}
            activeUsername={userProfile?.username || 'User'}
            unlockedBadges={unlockedBadges}
            stats={stats}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setShowAvatarModal={setShowAvatarModal}
            handleLogoutAction={handleLogoutAction}
            fetchAllBatches={fetchAllBatches}
            fetchAllRequests={fetchAllRequests}
          />

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 w-full lg:pl-6 space-y-8">
            {activeTab === 'overview' && (
              <ProfileOverview 
                stats={stats} 
                badges={BADGES} 
                unlockedBadges={unlockedBadges} 
              />
            )}

            {activeTab === 'collections' && (
              <ProfileCollections 
                filteredBatches={filteredBatches}
                collectionSearchQuery={collectionSearchQuery}
                setCollectionSearchQuery={setCollectionSearchQuery}
                setEditingBatch={setEditingBatch}
                handleDeleteBatch={handleDeleteBatch}
                deletingId={deletingId}
              />
            )}
            
            {activeTab === 'request' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-800">Request Batch</h2>
                  <p className="text-xs text-slate-500 mt-1">Submit a request to archive specific TikTok profiles</p>
                </div>
                <Suspense fallback={<div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#10b981]" size={28} /></div>}>
                  <CustomBatchRequest currentUser={userProfile} />
                </Suspense>
              </div>
            )}

            {activeTab === 'settings' && (
              <ProfileSettings 
                userProfile={userProfile}
                stats={stats}
                usernameInput={usernameInput}
                setUsernameInput={setUsernameInput}
                handleUpdateUsername={handleUpdateUsername}
                updatingUsername={updatingUsername}
                activeUsername={userProfile?.username || ''}
                setShowAvatarModal={setShowAvatarModal}
                handleSelectVipBorder={handleSelectVipBorder}
              />
            )}

            {activeTab === 'admin' && userProfile?.is_admin && (
              <div className="animate-in fade-in duration-300 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="text-amber-500" size={24} /> Admin Control Panel
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Manage platform submissions and user requests</p>
                </div>

                <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">All Uploaded Batches ({allBatches.length})</h3>
                  <div className="space-y-3">
                    {allBatches.map(b => (
                      <div key={b.id} className="bg-white p-4 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{b.username}</span>
                          <span className="text-slate-400 ml-2">({b.country})</span>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold rounded-full">{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL PILIH / UBAH AVATAR (Jika diperlukan) */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Change Avatar</h3>
            <p className="text-xs text-slate-500 mb-6">Masukkan link gambar avatar baru Anda (URL langsung gambar).</p>
            
            <input 
              type="text" 
              placeholder="https://example.com/avatar.jpg"
              id="avatarUrlInput"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium mb-4 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20"
            />
            
            <button 
              onClick={async () => {
                const inputVal = (document.getElementById('avatarUrlInput') as HTMLInputElement)?.value;
                if (!inputVal) return;
                try {
                  const { error } = await supabase.from('profiles').update({ avatar_url: inputVal }).eq('id', userProfile.id);
                  if (error) throw error;
                  setUserProfile({ ...userProfile, avatar_url: inputVal });
                  setShowAvatarModal(false);
                  alert('Avatar updated successfully!');
                } catch (err: any) {
                  alert('Failed to update avatar: ' + err.message);
                }
              }}
              className="w-full py-3.5 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-emerald-500/20"
            >
              Save Avatar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}