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
  ArrowLeft, 
  TrendingUp, 
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { EmeraldFolderIcon, UserBadge } from '../components/SharedIcons';

interface ProfileProps {
  currentUser: string | null;
  onBack: () => void;
  showToast?: (message: string, type?: string) => void;
}

export default function Profile({ currentUser, onBack, showToast }: ProfileProps) {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBatches, setUserBatches] = useState<any[]>([]);
  const [adminList, setAdminList] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

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

  // Kalkulasi statistik pengguna dengan konversi satuan yang benar
  const stats = useMemo(() => {
    const totalUploads = userBatches.length;
    const totalApproved = userBatches.filter(b => b.status === 'approved').length;
    const totalPending = userBatches.filter(b => b.status === 'pending').length;
    
    const totalVideos = userBatches.reduce((acc, b) => acc + (Number(b.video_count) || 0), 0);
    
    // 1. Hitung total dalam Gigabyte (GB)
    const totalGB = userBatches.reduce((acc, b) => {
      if (b.size_gb) return acc + Number(b.size_gb);
      if (b.size_file) {
        const sizeStr = b.size_file.toString().toUpperCase();
        const val = parseFloat(sizeStr);
        if (isNaN(val)) return acc;
        
        // Konversi berdasarkan string satuan
        if (sizeStr.includes('MB')) return acc + (val / 1024);
        if (sizeStr.includes('KB')) return acc + (val / (1024 * 1024));
        if (sizeStr.includes('TB')) return acc + (val * 1024);
        
        return acc + val; // default fallback ke GB jika tidak ada satuan
      }
      return acc;
    }, 0);

    // 2. Format Tampilan Secara Pintar
    let totalSizeDisplay = '0 GB';
    if (totalGB > 0) {
      if (totalGB < 1) {
        // Jika di bawah 1 GB, konversi dan tampilkan sebagai MB
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-500">Memuat Statistik Profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
        
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:text-emerald-600 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-md transition-all font-bold text-sm border-none"
          >
            <ArrowLeft size={18} />
            Kembali ke Beranda
          </button>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 border-none">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <User size={36} strokeWidth={2.5} />
            </div>
            
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  {userProfile?.username || currentUser || 'Pengguna'}
                </h1>
                <UserBadge 
                  username={userProfile?.username || currentUser || ''} 
                  count={stats.totalUploads} 
                  adminList={adminList} 
                />
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm">
                <span className="text-slate-500 italic">
                  Kontributor Aktif
                </span>
                {userProfile?.is_admin && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                    <ShieldCheck size={14} /> Official Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50/60 px-5 py-3 rounded-2xl border-none">
            <TrendingUp size={24} className="text-emerald-600" />
            <div>
              <div className="text-xs font-semibold text-emerald-800">Status Kontribusi</div>
              <div className="text-sm font-bold text-emerald-600">Level {Math.floor(stats.totalUploads / 3) + 1} Creator</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-4 border-none">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Folder size={28} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Total Folder</span>
              <span className="text-2xl font-black text-slate-800">{stats.totalUploads}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-4 border-none">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Video size={28} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Total Video</span>
              <span className="text-2xl font-black text-slate-800">{stats.totalVideos}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-4 border-none">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <HardDrive size={28} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Total Ukuran</span>
              {/* Teks GB dihapus karena sudah di-handle oleh totalSizeDisplay */}
              <span className="text-2xl font-black text-slate-800">{stats.totalSizeDisplay}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-4 border-none">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
              <BarChart3 size={28} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Disetujui</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-800">{stats.totalApproved}</span>
                <span className="text-xs text-slate-400 font-medium">/ {stats.totalUploads}</span>
                {stats.totalPending > 0 && (
                  <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md ml-1">
                    ({stats.totalPending} pending)
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Koleksi Batch Anda</h2>
              <p className="text-sm text-slate-500 font-medium">Kelola dan pantau status folder video yang telah Anda unggah</p>
            </div>
          </div>

          {userBatches.length > 0 ? (
            <div className="space-y-4">
              {userBatches.map((batch) => (
                <div 
                  key={batch.id} 
                  className="p-5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-none"
                >
                  <div className="flex items-center gap-4">
                    <EmeraldFolderIcon country={batch.country} className="w-10 h-10 flex-shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-slate-800">{batch.username}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                        <span className="text-emerald-600 font-semibold">{batch.country}</span>
                        <span>•</span>
                        <span>{batch.video_count} Video</span>
                        <span>•</span>
                        <span>{batch.size_file || `${batch.size_gb} GB`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    {batch.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={14} /> Disetujui
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        <Clock size={14} /> Menunggu Review
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteBatch(batch.id)}
                      disabled={deletingId === batch.id}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-none"
                      title="Hapus Folder"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Folder size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">Belum Ada Koleksi</h3>
              <p className="text-sm text-slate-500 max-w-sm font-medium">
                Anda belum mengunggah koleksi video apapun. Mulai unggah batch baru melalui tombol Tambah di beranda.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}