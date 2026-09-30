import { X, Cloud, Box, Download, User } from 'lucide-react';
import { EmeraldFolderIcon, UserBadge } from './SharedIcons'; 

const MOCK_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

const PreviewModal = ({ item, onClose, onDownload, uploaderCount, adminList }: any) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-[850px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all shadow-sm">
          <X size={20} />
        </button>

        <div className="w-full md:w-[300px] bg-black relative flex-shrink-0 flex items-center justify-center min-h-[320px] md:min-h-[540px]">
          <video src={item.video_url || MOCK_VIDEO_URL} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
            <h4 className="font-bold text-lg">{item.username}</h4>
            <p className="text-xs text-white/80 line-clamp-2 mt-1">
              Sample preview from {item.country} TikTok batch archive. Watermark-free HD quality. ⚡
            </p>
          </div>
        </div>

        {/* Background diubah menjadi putih solid (bg-white) agar lebih bersih dan jelas */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col bg-white overflow-y-auto">
          <div className="mb-6 flex items-start gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-100/50">
               <EmeraldFolderIcon className="w-10 h-10 drop-shadow-sm" country={item.country} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{item.username}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Menghapus uppercase pada label */}
                <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
                  {item.country} Batch
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  <User size={12} /> 
                  Uploaded by {item.uploaded_by}
                  <UserBadge username={item.uploaded_by} count={uploaderCount} adminList={adminList} />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {/* Huruf kapital dihapus, diganti menggunakan font-semibold biasa */}
              <span className="text-xs font-semibold text-slate-500 block mb-1">Total Videos</span>
              <span className="text-lg font-bold text-slate-700">{item.video_count} files</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Archive Size</span>
              <span className="text-lg font-bold text-emerald-600">{item.size_file || `${item.size_gb} GB`}</span>
            </div>
          </div>

          <div className="mb-8">
            <a 
              href={item.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 text-slate-700 hover:text-black font-bold text-sm transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor" className="text-slate-800 group-hover:text-black transition-colors">
                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
              </svg>
              <span>{item.username}</span>
            </a>
          </div>

          <div className="mt-auto">
            {/* Huruf kapital dihapus */}
            <h3 className="text-sm font-bold text-slate-700 mb-3">Official Download Mirrors</h3>
            <div className="space-y-3">
              <button onClick={() => onDownload('Google Drive', item.gdrive_url)} className="w-full p-4 bg-white hover:bg-blue-50/50 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-md transition-all flex items-center justify-between group border border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Cloud size={22} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Google Drive</div>
                    <div className="text-xs text-slate-400 font-medium">High Speed • Single ZIP Archive</div>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Download size={18} />
                </div>
              </button>

              <button onClick={() => onDownload('TeraBox', item.terabox_url)} className="w-full p-4 bg-white hover:bg-cyan-50/50 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-md transition-all flex items-center justify-between group border border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <Box size={22} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">TeraBox Cloud</div>
                    <div className="text-xs text-slate-400 font-medium">Unlimited Cloud Mirror • Free Download</div>
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

export default PreviewModal;