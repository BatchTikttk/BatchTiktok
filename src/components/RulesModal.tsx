import { X, ShieldAlert, CheckCircle2, AlertCircle, FileVideo, Link2, Scale, DollarSign } from 'lucide-react';

const RulesModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Posting Guidelines & Rules</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Please read these rules carefully before submitting an archive</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-slate-200"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body - Scrollbar Hidden via Tailwind classes */}
        <div className="p-6 overflow-y-auto bg-slate-50/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-5">
            
            {/* Rule 1: Moderation */}
            <div className="flex gap-4 p-5 rounded-2xl bg-amber-50/80 border border-amber-100/80 hover:shadow-md transition-shadow">
              <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-amber-900 text-base">Strict Moderation System (Review Process)</h3>
                <p className="text-sm text-amber-700/90 mt-1.5 leading-relaxed font-medium">
                  Every submission will not appear immediately on the main page. The data will be marked as <strong>Pending</strong> and undergo admin moderation. We will verify the authenticity and completeness of the links before publishing.
                </p>
              </div>
            </div>

            {/* Rule 2: Cloud Storage */}
            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Exclusive to Google Drive & TeraBox</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
                  This platform only accepts storage links from <strong>Google Drive</strong> and <strong>TeraBox</strong>. If you submit links from other platforms (such as MediaFire, Mega, etc.), your submission will be <span className="text-rose-600 font-bold">immediately rejected</span>.
                </p>
              </div>
            </div>

            {/* Rule 3: TikTok Link Mandatory */}
            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
              <Link2 className="text-blue-500 shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Mandatory TikTok Profile Link</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
                  To maintain credibility and ease of search, you are <strong>required</strong> to include the original TikTok Profile URL of the creator whose videos you are archiving.
                </p>
              </div>
            </div>

            {/* Rule 4: Video Tutorial */}
            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
              <FileVideo className="text-slate-400 shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Optional Preview/Tutorial Video Link</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
                  If you do not have the time or are reluctant to upload a preview/tutorial compilation video to a third-party platform, this section does not need to be filled (it can be left blank). The main priority is the archive link itself.
                </p>
              </div>
            </div>

            {/* Rule 5: Data Accuracy */}
            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Data Accuracy & Content Policy</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
                  Ensure the <strong>Video Count</strong> and <strong>File Size (GB)</strong> you input match the actual content. Archived content must not violate the law, contain explicit elements, and must strictly be an archive of the relevant creator's public work.
                </p>
              </div>
            </div>

            {/* Rule 6: Monetization & Shortlinks */}
            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
              <DollarSign className="text-indigo-500 shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Monetization & Shortlinks Allowed</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
                  You are permitted to use your favorite shortlink services to monetize your archive links. However, the shortlink process must not be overly complicated, deceptive, or severely inconvenience other users trying to download the files.
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end">
            <button 
              onClick={onClose} 
              className="px-8 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5 active:translate-y-0"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;