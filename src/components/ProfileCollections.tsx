import { Search, Folder, CheckCircle2, XCircle, Clock, Edit2, Trash2, Loader2 } from 'lucide-react';
import { EmeraldFolderIcon } from './SharedIcons';

interface ProfileCollectionsProps {
  filteredBatches: any[];
  collectionSearchQuery: string;
  setCollectionSearchQuery: (q: string) => void;
  setEditingBatch: (batch: any) => void;
  handleDeleteBatch: (id: string | number) => void;
  deletingId: string | number | null;
}

export default function ProfileCollections({
  filteredBatches,
  collectionSearchQuery,
  setCollectionSearchQuery,
  setEditingBatch,
  handleDeleteBatch,
  deletingId
}: ProfileCollectionsProps) {
  return (
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
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 text-sm font-medium"
          />
        </div>
      </div>

      {filteredBatches.length > 0 ? (
        <div className="space-y-4">
          {filteredBatches.map((batch) => (
            <div key={batch.id} className="p-5 rounded-[24px] bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                {batch.status === 'approved' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#84cc16]/10 text-[#84cc16]">
                    <CheckCircle2 size={14} /> Approved
                  </span>
                )}
                {batch.status === 'rejected' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-50 text-red-500">
                    <XCircle size={14} /> Rejected
                  </span>
                )}
                {batch.status === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-500">
                    <Clock size={14} /> Pending
                  </span>
                )}

                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => setEditingBatch(batch)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteBatch(batch.id)} disabled={deletingId === batch.id} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50">
                    {deletingId === batch.id ? <Loader2 className="animate-spin text-red-500" size={16} /> : <Trash2 size={16} />}
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
          <p className="text-xs text-slate-400">Folders you upload will appear here.</p>
        </div>
      )}
    </div>
  );
}