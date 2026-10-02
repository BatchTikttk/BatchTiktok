import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { 
  Search, CheckCircle2, Play, XCircle, ChevronLeft, ChevronRight, Check, ShieldCheck,
  Folder, Film, HardDrive, Users
} from 'lucide-react';

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import PostModal from "../components/PostModal";
import PreviewModal from "../components/PreviewModal";
import { EmeraldFolderIcon } from "../components/SharedIcons"; 

export const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

const Toast = ({ message, isVisible, type = 'success' }: any) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 transition-all duration-300 z-[9999] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
    <span className="text-sm font-medium">{message}</span>
  </div>
);

const CreatorCard = ({ data, onOpenPreview, uploaderCount }: any) => {
  const getAchievementBadge = (count: number) => {
    if (data.uploader_is_admin) return null; 
    
    if (count >= 50) return { title: 'Emerald Master', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Advance%20Tier.webp' };
    if (count >= 30) return { title: 'Emerald Pro', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Medium%20Tier.webp' };
    if (count >= 10) return { title: 'Emerald Rookie', url: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/Emerald%20TikTok%20Batch%20Badge%20Low%20Tier.webp' };
    return null;
  };

  const badge = getAchievementBadge(uploaderCount);

  return (
    <div 
      onClick={() => onOpenPreview(data)} 
      className="bg-white p-6 pt-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col items-center text-center group border-none cursor-pointer transform hover:-translate-y-1 relative"
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 w-full justify-center transition-all duration-300 opacity-80 group-hover:opacity-100">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-[11px] font-medium text-slate-500 italic flex items-center gap-1.5">
            Uploaded by <span className="font-semibold text-emerald-600 not-italic">{data.uploaded_by}</span>
          </span>
          
          {data.uploader_is_admin ? (
            <span title="Admin Verified">
              <ShieldCheck 
                size={15} 
                className="text-[#fbbf24] ml-0.5 cursor-help drop-shadow-sm hover:scale-110 transition-transform" 
              />
            </span>
          ) : badge ? (
            <img 
              src={badge.url} 
              alt={badge.title} 
              title={`${badge.title} (${uploaderCount} Uploads)`}
              className="w-5 h-5 object-contain drop-shadow-sm cursor-pointer hover:scale-110 transition-transform ml-0.5"
            />
          ) : null}
        </div>
        
        {data.is_edited && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500" title="Folder has been updated">
            <Check size={12} strokeWidth={3} />
            Updated
          </span>
        )}
      </div>

      <div className="mb-5 mt-2 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
        <EmeraldFolderIcon country={data.country} />
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-1 tracking-tight">
        {data.username}
      </h3>
      
      <span className="text-[11px] font-bold tracking-wider text-white bg-emerald-500 px-3 py-1 rounded-full mb-4 shadow-sm border-none">
        {data.country}
      </span>
      
      <div className="flex w-full justify-between px-5 py-3.5 bg-slate-50/80 rounded-2xl mb-5 border-none">
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Videos</span>
          <span className="text-sm font-bold text-slate-700">{data.video_count}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Size</span>
          <span className="text-sm font-bold text-slate-700">{data.size_file || `${data.size_gb} GB`}</span>
        </div>
      </div>
      
      <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg border-none">
        <Play size={18} className="fill-current" />
        Preview Folder
      </div>
    </div>
  );
};

export default function Home() {
  const [batches, setBatches] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [toastConfig, setToastConfig] = useState({ message: '', isVisible: false, type: 'success' });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchBatches();
    checkUser();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          checkUser();
          fetchBatches(); 
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batches' },
        () => {
          fetchBatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBatches = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_admin');
    
    const { data: batchesData, error } = await supabase
      .from('batches')
      .select('*')
      .eq('status', 'approved') 
      .order('created_at', { ascending: false });
    
    if (error) {
      showToast('Failed to load data from database', 'error');
    } else {
      const realtimeBatches = (batchesData || []).map(batch => {
        const uploaderProfile = profiles?.find(
          p => (batch.user_id && p.id === batch.user_id) ||
               (p.username && batch.uploaded_by && p.username.toLowerCase() === batch.uploaded_by.toLowerCase())
        );
        
        return {
          ...batch,
          uploaded_by: uploaderProfile?.username || batch.uploaded_by,
          avatar_url: uploaderProfile?.avatar_url || null,
          uploader_avatar: uploaderProfile?.avatar_url || null,
          uploader_is_admin: uploaderProfile?.is_admin || false 
        };
      });

      setBatches(realtimeBatches);
      
      setPreviewItem((prev: any) => {
        if (prev) {
          const updatedItem = realtimeBatches.find((b: any) => b.id === prev.id);
          return updatedItem || prev;
        }
        return prev;
      });
    }
  };

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

  const showToast = (message: string, type = 'success') => {
    setToastConfig({ message, isVisible: true, type });
    setTimeout(() => setToastConfig({ message: '', isVisible: false, type }), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    showToast("You have been logged out.", "info");
  };

  const handleDownloadInitiate = async (providerName: string, url: string, batchId?: string) => {
    if (!url) return showToast('Download link is not available', 'error');

    if (batchId) {
      const { error } = await supabase.rpc('increment_download_count', { batch_id: batchId });
      if (error) {
        console.error('Failed to update download count:', error);
      }
    }

    showToast(`Redirecting to ${providerName}...`);
    setTimeout(() => {
      window.open(url, '_blank');
      setPreviewItem(null);
    }, 600);
  };

  const uploaderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    batches.forEach(batch => {
      const user = batch.uploaded_by;
      if (user) {
        counts[user] = (counts[user] || 0) + 1;
      }
    });
    return counts;
  }, [batches]);

  // Real-time Platform Stats Calculation dengan parsing GB & MB yang benar
  const stats = useMemo(() => {
    const totalBatches = batches.length;
    
    const uniqueCreators = new Set(
      batches.map(b => b.uploaded_by || b.username).filter(Boolean)
    ).size;

    const totalVideos = batches.reduce((sum, batch) => {
      const count = parseInt(batch.video_count, 10);
      return sum + (isNaN(count) ? 0 : count);
    }, 0);

    const totalSize = batches.reduce((sum, batch) => {
      let sizeInGB = 0;
      // Mengambil data dari size_file atau size_gb dan mengubah ke huruf besar untuk pengecekan
      const sizeStr = (batch.size_file || `${batch.size_gb} GB` || '').toString().toUpperCase();
      
      // Mengambil hanya angkanya saja (contoh "183 MB" -> 183, "2.4 GB" -> 2.4)
      const numericValue = parseFloat(sizeStr.replace(/[^\d.]/g, ''));

      if (!isNaN(numericValue)) {
        if (sizeStr.includes('MB')) {
          sizeInGB = numericValue / 1024; // Konversi MB ke GB
        } else if (sizeStr.includes('KB')) {
          sizeInGB = numericValue / (1024 * 1024); // Konversi KB ke GB
        } else {
          sizeInGB = numericValue; // Default dianggap GB jika tidak ada MB/KB atau ada teks GB
        }
      }
      return sum + sizeInGB;
    }, 0);

    return { totalBatches, uniqueCreators, totalVideos, totalSize };
  }, [batches]);

  const filteredBatches = batches.filter(batch => {
    const matchesCategory = activeCategory === 'Home' || batch.country === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (batch.username && batch.username.toLowerCase().includes(searchLower)) ||
      (batch.country && batch.country.toLowerCase().includes(searchLower)) ||
      (batch.uploaded_by && batch.uploaded_by.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);
  const paginatedBatches = filteredBatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      
      <div>
        <Navbar 
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          resetSearch={() => setSearchQuery('')}
          CATEGORIES={CATEGORIES}
          currentUser={currentUser}
          handleLogout={handleLogout}
          setShowAddModal={() => setShowAddModal(true)}
          setShowLoginModal={() => setShowLoginModal(true)}
          setShowRulesModal={() => {
            window.history.pushState({}, '', '/rules');
            window.dispatchEvent(new Event('popstate'));
          }} 
          EmeraldFolderIcon={EmeraldFolderIcon}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6 mb-10">
          <div className="bg-slate-900 rounded-[2.5rem] py-12 px-8 sm:py-16 sm:px-14 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              
              <div className="max-w-2xl text-center md:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-5xl font-black mb-5 tracking-tight leading-tight text-white">
                  Curated Creator <br className="hidden md:block"/>
                  <span className="text-emerald-400">Video Collections</span>
                </h1>
                <p className="text-slate-300 text-base md:text-lg font-medium max-w-xl mx-auto md:mx-0">
                  Direct bulk ZIP archives hosted, and share your tiktok archive here exclusively on <strong className="text-white">Google Drive</strong> &amp; <strong className="text-white">TeraBox</strong>.
                </p>
              </div>

              <div className="w-full md:w-96 relative group mx-auto md:mx-0">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search creators, region, uploader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-800/80 text-white rounded-2xl shadow-lg focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-all font-medium placeholder:text-slate-400 border border-slate-700 backdrop-blur-sm"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Live Stats & Platform Counter - Emerald Gradient Theme */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Card 1: Total Folders (Emerald 700) */}
            <div className="bg-emerald-700 rounded-[1.5rem] p-6 text-white shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-medium text-[13px] tracking-wide text-emerald-50">Total Folders</span>
                <div className="p-2 bg-white/20 rounded-[0.75rem]">
                  <Folder size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-[2rem] leading-none font-bold mb-2 text-white">{stats.totalBatches}</h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 opacity-90 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                  Active Regions
                </p>
              </div>
            </div>

            {/* Card 2: Total Videos (Emerald 600) */}
            <div className="bg-emerald-600 rounded-[1.5rem] p-6 text-white shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-medium text-[13px] tracking-wide text-emerald-50">Total Videos</span>
                <div className="p-2 bg-white/20 rounded-[0.75rem]">
                  <Film size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-[2rem] leading-none font-bold mb-2 text-white">{stats.totalVideos}</h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1 opacity-90 font-medium">
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                  Successfully Archived
                </p>
              </div>
            </div>

            {/* Card 3: Total Size (Emerald 500) */}
            <div className="bg-emerald-500 rounded-[1.5rem] p-6 text-white shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-medium text-[13px] tracking-wide text-emerald-50">Total Size</span>
                <div className="p-2 bg-white/20 rounded-[0.75rem]">
                  <HardDrive size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-[2rem] leading-none font-bold mb-2 text-white">
                  {stats.totalSize.toFixed(2)} GB
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 font-medium">
                  Total Uploaded
                </p>
              </div>
            </div>

            {/* Card 4: Total Creators (Emerald 400) */}
            <div className="bg-emerald-400 rounded-[1.5rem] p-6 text-white shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-medium text-[13px] tracking-wide text-emerald-50">Total Creators</span>
                <div className="p-2 bg-white/20 rounded-[0.75rem]">
                  <Users size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-[2rem] leading-none font-bold mb-2 text-white">{stats.uniqueCreators}</h3>
                <p className="text-[11px] text-emerald-50 flex items-center gap-1.5 font-medium">
                  Joined Contributors
                </p>
              </div>
            </div>

          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedBatches.length > 0 ? (
                paginatedBatches.map(batch => (
                  <CreatorCard 
                    key={batch.id} 
                    data={batch} 
                    onOpenPreview={setPreviewItem} 
                    uploaderCount={uploaderCounts[batch.uploaded_by] || 0} 
                  />
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Search size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No collections found</h3>
                  <p className="text-slate-500 max-w-md">Try adjusting your search query or switching categories to find what you're looking for.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12 mb-20">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                        currentPage === i + 1
                          ? 'bg-emerald-500 text-white border-none'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer onSelectCountry={(category) => {
        setActiveCategory(category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      <Toast message={toastConfig.message} isVisible={toastConfig.isVisible} type={toastConfig.type} />
      
      {previewItem && (
        <PreviewModal 
          item={previewItem} 
          onClose={() => setPreviewItem(null)} 
          onDownload={handleDownloadInitiate}
          uploaderCount={uploaderCounts[previewItem.uploaded_by] || 0} 
        />
      )}

      {showAddModal && (
        <PostModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchBatches}
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