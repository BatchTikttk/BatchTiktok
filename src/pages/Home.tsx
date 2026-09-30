import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { Search, CheckCircle2, Play, XCircle } from 'lucide-react';

// Import semua komponen dari foldernya
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import PostModal from "../components/PostModal";
import RulesModal from "../components/RulesModal";
import PreviewModal from "../components/PreviewModal";
import { EmeraldFolderIcon, UserBadge } from "../components/SharedIcons"; 

export const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines'];

const Toast = ({ message, isVisible, type = 'success' }: any) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 transition-all duration-300 z-[9999] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
    <span className="text-sm font-medium">{message}</span>
  </div>
);

const CreatorCard = ({ data, onOpenPreview, uploaderCount, adminList }: any) => {
  return (
    <div 
      onClick={() => onOpenPreview(data)} 
      className="bg-white p-6 pt-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col items-center text-center group border-none cursor-pointer transform hover:-translate-y-1 relative"
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 w-full justify-center transition-all duration-300 opacity-80 group-hover:opacity-100">
        <span className="text-[11px] font-medium text-slate-500 italic">
          Uploaded by <span className="font-semibold text-emerald-600 not-italic">{data.uploaded_by}</span>
        </span>
        <div className="flex items-center justify-center">
          <UserBadge username={data.uploaded_by} count={uploaderCount} adminList={adminList} />
        </div>
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
  const [adminList, setAdminList] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false); 
  
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [toastConfig, setToastConfig] = useState({ message: '', isVisible: false, type: 'success' });

  useEffect(() => {
    fetchBatches();
    fetchAdmins();
    checkUser();

    // Supabase Realtime Listener
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          checkUser();
          fetchAdmins();
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

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('is_admin', true);

    if (data) {
      setAdminList(data.map((p: any) => (p.username || '').toLowerCase()));
    }
  };

  const fetchBatches = async () => {
    // 1. Mengambil kolom avatar_url dari tabel profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url');
    
    const { data: batchesData, error } = await supabase
      .from('batches')
      .select('*')
      .eq('status', 'approved') 
      .order('created_at', { ascending: false });
    
    if (error) {
      showToast('Failed to load data from database', 'error');
    } else {
      const realtimeBatches = (batchesData || []).map(batch => {
        // Cocokkan berdasarkan user_id atau username sebagai fallback
        const uploaderProfile = profiles?.find(
          p => (batch.user_id && p.id === batch.user_id) ||
               (p.username && batch.uploaded_by && p.username.toLowerCase() === batch.uploaded_by.toLowerCase())
        );
        
        return {
          ...batch,
          uploaded_by: uploaderProfile?.username || batch.uploaded_by,
          avatar_url: uploaderProfile?.avatar_url || null,        // dimasukkan ke objek batch
          uploader_avatar: uploaderProfile?.avatar_url || null  // alias tambahan untuk kompatibilitas
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

  const handleDownloadInitiate = (providerName: string, url: string) => {
    if (!url) return showToast('Download link is not available', 'error');
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

  const filteredBatches = batches.filter(batch => {
    const matchesCategory = activeCategory === 'Home' || batch.country === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (batch.username && batch.username.toLowerCase().includes(searchLower)) ||
      (batch.country && batch.country.toLowerCase().includes(searchLower)) ||
      (batch.uploaded_by && batch.uploaded_by.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

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
          setShowRulesModal={() => setShowRulesModal(true)} 
          EmeraldFolderIcon={EmeraldFolderIcon}
        />

        <main className="max-w-7xl mx-auto px-6 lg:px-8 mt-10">
          <div className="animate-in fade-in duration-500">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight leading-tight">
                  Curated Creator <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Video Collections</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-xl font-medium">
                  Direct bulk ZIP archives hosted, and share your tiktok archive here exclusively on <strong className="text-slate-700">Google Drive</strong> &amp; <strong className="text-slate-700">TeraBox</strong>.
                </p>
              </div>

              <div className="relative w-full md:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search creators, region, uploader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white text-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] focus:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus:outline-none transition-shadow font-medium placeholder:text-slate-400 border-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredBatches.length > 0 ? (
                filteredBatches.map(batch => (
                  <CreatorCard 
                    key={batch.id} 
                    data={batch} 
                    onOpenPreview={setPreviewItem} 
                    uploaderCount={uploaderCounts[batch.uploaded_by] || 0} 
                    adminList={adminList}
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
          adminList={adminList}
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

      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}
    </div>
  );
}