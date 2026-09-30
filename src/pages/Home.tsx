import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { Search, Download, CheckCircle2, X, Play, Cloud, Box, XCircle, User, Crown, Award } from 'lucide-react';

// Import Komponen dari folder components
import Navbar from "../components/Navbar";
import LoginModal from "../components/LoginModal";
import PostModal from "../components/PostModal";
import RulesModal from "../components/RulesModal";

const MOCK_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";
export const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines'];

// Komponen Badge User (Admin dinamis dari database, Crown untuk 30+, Award untuk 10-29)
const UserBadge = ({ username, count, adminList = [] }: { username: string, count: number, adminList: string[] }) => {
  if (!username) return null;
  
  const isAdmin = adminList.includes(username.toLowerCase());

  if (isAdmin) {
    return (
      <div title="Official Admin" className="bg-emerald-100 p-0.5 rounded-full ml-0.5 flex-shrink-0">
        <CheckCircle2 size={12} className="text-emerald-600" />
      </div>
    );
  }
  
  if (count >= 30) {
    return (
      <div title={`King Contributor (${count} uploads)`} className="bg-yellow-100 p-0.5 rounded-full ml-0.5 flex-shrink-0">
        <Crown size={12} className="text-yellow-600" />
      </div>
    );
  }
  
  if (count >= 10) {
    return (
      <div title={`Active Contributor (${count} uploads)`} className="bg-blue-100 p-0.5 rounded-full ml-0.5 flex-shrink-0">
        <Award size={12} className="text-blue-600" />
      </div>
    );
  }

  return null;
};

export const EmeraldFolderIcon = ({ className = "w-24 h-24", country }: { className?: string, country?: string }) => {
  const clipId = country ? `flag-clip-${country.toLowerCase()}` : '';

  const renderFlag = () => {
    if (!country || country === 'Home') return null;

    let flagContent = null;
    switch (country) {
      case 'Indonesia':
        flagContent = (
          <>
            <rect x="13" y="13" width="10" height="5" fill="#EF4444" />
            <rect x="13" y="18" width="10" height="5" fill="#FFFFFF" />
          </>
        );
        break;
      case 'Thailand':
        flagContent = (
          <>
            <rect x="13" y="13" width="10" height="10" fill="#EF4444" />
            <rect x="13" y="14.8" width="10" height="6.4" fill="#FFFFFF" />
            <rect x="13" y="16.2" width="10" height="3.6" fill="#1E3A8A" />
          </>
        );
        break;
      case 'Vietnam':
        flagContent = (
          <>
            <rect x="13" y="13" width="10" height="10" fill="#EF4444" />
            <polygon points="18,14.2 19.2,16.2 21.5,16.2 19.6,17.6 20.3,19.8 18,18.4 15.7,19.8 16.4,17.6 14.5,16.2 16.8,16.2" fill="#FACC15" />
          </>
        );
        break;
      case 'Philippines':
        flagContent = (
          <>
            <rect x="13" y="13" width="10" height="5" fill="#1D4ED8" />
            <rect x="13" y="18" width="10" height="5" fill="#EF4444" />
            <polygon points="13,13 13,23 18.5,18" fill="#FFFFFF" />
            <circle cx="14.8" cy="18" r="1.5" fill="#FACC15" />
          </>
        );
        break;
      default:
        return null;
    }

    return (
      <g>
        <circle cx="18" cy="18" r="5.5" fill="#FFFFFF" />
        <clipPath id={clipId}>
          <circle cx="18" cy="18" r="5" />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          {flagContent}
        </g>
      </g>
    );
  };

  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4Z" fill="#10b981" />
      {renderFlag()}
    </svg>
  );
};

const Toast = ({ message, isVisible, type = 'success' }: any) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 transition-all duration-300 z-[9999] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
    <span className="text-sm font-medium">{message}</span>
  </div>
);

const CreatorCard = ({ data, onOpenPreview, uploaderCount, adminList }: any) => {
  return (
    <div onClick={() => onOpenPreview(data)} className="bg-white p-6 pt-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col items-center text-center group border-none cursor-pointer transform hover:-translate-y-1 relative">
      <div className="absolute top-4 right-4 bg-slate-50/80 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100/50">
        <User size={10} className="text-slate-400 mr-0.5" />
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[80px]">
          {data.uploaded_by}
        </span>
        <UserBadge username={data.uploaded_by} count={uploaderCount} adminList={adminList} />
      </div>

      <div className="mb-5 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
        <EmeraldFolderIcon country={data.country} />
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-1 tracking-tight">
        {data.username}
      </h3>
      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-4">
        {data.country}
      </span>
      
      <div className="flex w-full justify-between px-5 py-3.5 bg-slate-50/80 rounded-2xl mb-5">
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Videos</span>
          <span className="text-sm font-bold text-slate-700">{data.video_count}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Size</span>
          <span className="text-sm font-bold text-slate-700">{data.size_file || `${data.size_gb} GB`}</span>
        </div>
      </div>
      
      <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 bg-slate-50 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:shadow-[0_4px_14px_0_rgba(16,185,129,0.15)]">
        <Play size={18} className="fill-current" />
        Preview Folder
      </div>
    </div>
  );
};

const PreviewModal = ({ item, onClose, onDownload, uploaderCount, adminList }: any) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all shadow-sm">
          <X size={20} />
        </button>

        <div className="w-full md:w-5/12 bg-black relative flex-shrink-0 flex items-center justify-center min-h-[320px] md:min-h-[500px]">
          <video src={item.video_url || MOCK_VIDEO_URL} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
            <h4 className="font-bold text-lg">{item.username}</h4>
            <p className="text-xs text-white/80 line-clamp-2 mt-1">
              Sample preview from {item.country} TikTok batch archive. Watermark-free HD quality. ⚡
            </p>
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-8 flex flex-col bg-slate-50/50 overflow-y-auto">
          <div className="mb-6 flex items-start gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
               <EmeraldFolderIcon className="w-10 h-10 drop-shadow-sm" country={item.country} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{item.username}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                  {item.country} Batch
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  <User size={12} /> 
                  Uploaded by {item.uploaded_by}
                  <UserBadge username={item.uploaded_by} count={uploaderCount} adminList={adminList} />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border-none">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Videos</span>
              <span className="text-xl font-bold text-slate-700">{item.video_count} files</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border-none">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Archive Size</span>
              <span className="text-xl font-bold text-emerald-600">{item.size_file || `${item.size_gb} GB`}</span>
            </div>
          </div>

          <div className="mb-8">
            <a 
              href={item.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white hover:bg-slate-100 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] border-none text-slate-700 hover:text-black font-bold text-sm transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor" className="text-slate-800 group-hover:text-black transition-colors">
                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
              </svg>
              <span>{item.username}</span>
            </a>
          </div>

          <div className="mt-auto">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Official Download Mirrors</h3>
            <div className="space-y-3">
              <button onClick={() => onDownload('Google Drive', item.gdrive_url)} className="w-full p-4 bg-white hover:bg-blue-50/50 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-md transition-all flex items-center justify-between group border-none">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Cloud size={22} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Google Drive</div>
                    <div className="text-xs text-slate-400">High Speed • Single ZIP Archive</div>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Download size={18} />
                </div>
              </button>

              <button onClick={() => onDownload('TeraBox', item.terabox_url)} className="w-full p-4 bg-white hover:bg-cyan-50/50 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-md transition-all flex items-center justify-between group border-none">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <Box size={22} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">TeraBox Cloud</div>
                    <div className="text-xs text-slate-400">Unlimited Cloud Mirror • Free Download</div>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                  <Download size={18} />
                </div>
              </button>
            </div>
          </div>
        </div>
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
  }, []);

  // Mengambil daftar username yang memiliki is_admin = true dari Supabase
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
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('status', 'approved') 
      .order('created_at', { ascending: false });
    
    if (error) {
      showToast('Gagal memuat data dari database', 'error');
    } else {
      setBatches(data || []);
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
    showToast("Anda telah keluar.", "info");
  };

  const handleDownloadInitiate = (providerName: string, url: string) => {
    if (!url) return showToast('Link unduhan tidak tersedia', 'error');
    showToast(`Mengalihkan ke ${providerName}...`);
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      
      <Navbar 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        resetSearch={() => setSearchQuery('')}
        CATEGORIES={CATEGORIES}
        currentUser={currentUser}
        handleLogout={handleLogout}
        setShowAddModal={setShowAddModal}
        setShowLoginModal={setShowLoginModal}
        setShowRulesModal={setShowRulesModal} 
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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