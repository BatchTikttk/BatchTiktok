import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, User, HardDrive, FolderOpen, Video, 
  MousePointerClick, Play, ShieldCheck, Check 
} from 'lucide-react';
import { supabase } from "../supabase";

// Import komponen yang digunakan di Home_2.tsx
import PreviewModal from "../components/PreviewModal";
import { EmeraldFolderIcon } from "../components/SharedIcons";

// 1. Definisikan Interface TypeScript untuk mencegah error TS2322
interface BatchItem {
  id: string;
  username: string;
  country: string;
  video_count: number | string;
  size_file: string;
  size_gb: number | string;
  uploaded_by?: string;
  uploader_is_admin?: boolean;
  is_edited?: boolean;
  [key: string]: any; // Fallback untuk kolom tambahan dari Supabase
}

interface CreatorCardProps {
  data: BatchItem;
  onOpenPreview: (item: BatchItem) => void;
  uploaderCount: number;
}

// 2. Komponen CreatorCard (diambil persis dari Home_2.tsx dengan tipe yang benar)
const CreatorCard: React.FC<CreatorCardProps> = ({ data, onOpenPreview, uploaderCount }) => {
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
            Uploaded by <span className="font-semibold text-emerald-600 not-italic">{data.uploaded_by || data.username}</span>
          </span>
          
          {data.uploader_is_admin ? (
            <span title="Admin Verified">
              <ShieldCheck size={15} className="text-[#fbbf24] ml-0.5 cursor-help drop-shadow-sm hover:scale-110 transition-transform" />
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
            <Check size={12} strokeWidth={3} /> Updated
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
        {data.country || 'Unknown'}
      </span>
      
      <div className="flex w-full justify-between px-5 py-3.5 bg-slate-50/80 rounded-2xl mb-5 border-none">
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Videos</span>
          <span className="text-sm font-bold text-slate-700">{data.video_count || 0}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Size</span>
          <span className="text-sm font-bold text-slate-700">{data.size_file || `${data.size_gb || 0} GB`}</span>
        </div>
      </div>
      
      <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg border-none">
        <Play size={18} className="fill-current" />
        Preview Folder
      </div>
    </div>
  );
};

export default function CreatorPage({ username }: { username: string }) {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk modal preview
  const [previewItem, setPreviewItem] = useState<BatchItem | null>(null);

  const handleGoBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  useEffect(() => {
    const fetchCreatorData = async () => {
      setLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', username)
          .maybeSingle();

        if (profileData) {
          setCreatorProfile(profileData);
          const { data: batchData } = await supabase
            .from('batches')
            .select('*')
            .or(`user_id.eq.${profileData.id},username.ilike.${username}`)
            .order('created_at', { ascending: false });

          if (batchData) {
            // Memetakan data agar cocok dengan ekspektasi CreatorCard
            const mappedBatches = batchData.map(b => ({
              ...b,
              uploaded_by: profileData.username,
              uploader_is_admin: profileData.is_admin
            }));
            setBatches(mappedBatches);
          }
        } else {
          const { data: batchData } = await supabase
            .from('batches')
            .select('*')
            .ilike('username', username)
            .order('created_at', { ascending: false });

          if (batchData) {
            const mappedBatches = batchData.map(b => ({
              ...b,
              uploaded_by: b.uploaded_by || username,
              uploader_is_admin: false
            }));
            setBatches(mappedBatches);
          }
        }
      } catch (err) {
        console.error("Error fetching creator data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchCreatorData();
  }, [username]);

  // Fungsi saat tombol download di dalam modal ditekan
  const handleDownloadInitiate = async (providerName: string, url: string, batchId?: string) => {
    if (!url) {
      alert("Download link is not available");
      return;
    }
    if (batchId) {
      const { error } = await supabase.rpc('increment_download_count', { batch_id: batchId });
      if (error) console.error('Failed to update download count:', error);
    }
    // Redirect ke link
    setTimeout(() => {
      window.open(url, '_blank');
      setPreviewItem(null);
    }, 600);
  };

  const stats = useMemo(() => {
    const totalFolders = batches.length;
    const totalVideos = batches.reduce((acc, b) => acc + (Number(b.video_count) || 0), 0);
    const totalClicks = batches.reduce((acc, b) => {
      const clickVal = b.clicks ?? b.click_count ?? b.total_clicks ?? b.click ?? b.views ?? 0;
      return acc + (Number(clickVal) || 0);
    }, 0);
    const totalGB = batches.reduce((acc, b) => {
      if (b.size_gb !== undefined && b.size_gb !== null && b.size_gb !== '') return acc + Number(b.size_gb);
      if (b.size_file) {
        const sizeStr = b.size_file.toString().toUpperCase();
        const val = parseFloat(sizeStr.replace(/[^\d.]/g, ''));
        if (isNaN(val)) return acc;
        if (sizeStr.includes('MB')) return acc + (val / 1024);
        if (sizeStr.includes('KB')) return acc + (val / (1024 * 1024));
        return acc + val;
      }
      return acc;
    }, 0);

    let totalSizeDisplay = '0 GB';
    if (totalGB > 0) {
      totalSizeDisplay = totalGB < 1 ? (totalGB * 1024).toFixed(1) + ' MB' : totalGB.toFixed(1) + ' GB';
    }

    return { totalFolders, totalVideos, totalClicks, totalSizeDisplay };
  }, [batches]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-16 px-6 sm:px-8 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <main className="max-w-7xl mx-auto w-full flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <button 
          onClick={handleGoBack} 
          className="flex items-center gap-2 px-6 py-3 mb-8 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm hover:shadow-md border border-slate-100 w-max cursor-pointer"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* Profil Kreator */}
        <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 border-4 border-white flex-shrink-0">
            {creatorProfile?.avatar_url ? (
              <img src={creatorProfile.avatar_url} alt={username} className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="sm:w-16 sm:h-16" />
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
              {creatorProfile?.username || username}
            </h1>
            <p className="text-slate-500 font-medium mb-6">Creator Portfolio & Archives</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6">
              {[
                { icon: FolderOpen, label: "Total Batches", val: stats.totalFolders },
                { icon: Video, label: "Total Videos", val: stats.totalVideos },
                { icon: HardDrive, label: "Total Size", val: stats.totalSizeDisplay },
                { icon: MousePointerClick, label: "Total Downloads", val: stats.totalClicks }
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#F8FAFC] px-5 py-3 rounded-2xl flex items-center gap-3 border border-slate-50">
                  <stat.icon className="text-emerald-500" size={20} />
                  <div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                    <div className="font-bold text-slate-700">{stat.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            Collection by {creatorProfile?.username || username}
          </h2>
        </div>

        {/* Grid Card Menyamai Halaman Utama */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 text-slate-500">
            No collections found for this creator.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {batches.map((batch) => (
              <CreatorCard 
                key={batch.id} 
                data={batch} 
                onOpenPreview={setPreviewItem}
                // Karena ini halaman kreator spesifik, jumlah upload-nya adalah total batch yang dia punya
                uploaderCount={batches.length} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Render Modal Preview jika ada item yang diklik */}
      {previewItem && (
        <PreviewModal 
          item={previewItem} 
          onClose={() => setPreviewItem(null)} 
          onDownload={handleDownloadInitiate}
          uploaderCount={batches.length} 
        />
      )}
    </div>
  );
}