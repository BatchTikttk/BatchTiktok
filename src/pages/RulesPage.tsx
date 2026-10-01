import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  FileVideo, 
  Link2, 
  Scale, 
  DollarSign, 
  ArrowLeft,
  UserCheck,
  Cloud
} from 'lucide-react';

const RulesPage = () => {
  const handleGoBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-16 px-6 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm mb-5">
            <Scale size={36} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            Posting Guidelines & Rules
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl">
            Please read these rules carefully before submitting an archive. We regularly update these guidelines to maintain community standards and ensure a seamless experience.
          </p>
        </div>
        
        {/* Rules Content */}
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Rule 1: Moderation */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-amber-50/80 border-none shadow-sm hover:shadow-md transition-shadow">
            <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Strict Moderation System (Review Process)</h3>
              <p className="text-amber-800/90 mt-2 leading-relaxed font-medium">
                Every submission will not appear immediately on the main page. The data will be marked as <strong>Pending</strong> and undergo admin moderation. We will verify the authenticity and completeness of the links before publishing.
              </p>
            </div>
          </div>

          {/* Rule 2: Profile Sync */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <UserCheck className="text-blue-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Profile Synchronization & Verification</h3>
              <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                To build trust within the community, we recommend logging in via Google OAuth. Users who sync their authenticated profiles with their submitted TikTok archives will receive a verified badge, prioritizing their submissions in the review queue.
              </p>
            </div>
          </div>

          {/* Rule 3: Cloud Storage */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Exclusive to Google Drive & TeraBox</h3>
              <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                The primary archive links must utilize <strong>Google Drive</strong> or <strong>TeraBox</strong>. If you submit primary links from unapproved platforms, your submission will be <span className="text-rose-600 font-bold">immediately rejected</span>.
              </p>
            </div>
          </div>

          {/* Rule 4: Direct Media Mirrors */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <Cloud className="text-indigo-400 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Approved Direct Media Hosts (Mirrors)</h3>
              <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                If you wish to provide direct video streams or image gallery mirrors alongside your main archive, you may use external direct media hosts such as <strong>qu.ax</strong> or <strong>Goonbok</strong>. These ensure fast, embeddable playback without excessive redirects.
              </p>
            </div>
          </div>

          {/* Rule 5: TikTok Link Mandatory */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <Link2 className="text-blue-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Mandatory TikTok Profile Link</h3>
              <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                To maintain credibility and ease of search, you are <strong>required</strong> to include the original TikTok Profile URL of the creator whose videos you are archiving via the profile modal.
              </p>
            </div>
          </div>

          {/* Rule 6: Video Tutorial */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <FileVideo className="text-slate-400 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Optional Preview/Tutorial Video Link</h3>
              <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                If you do not have the time to upload a preview/tutorial compilation video, this section can be left blank. The main priority remains the archive structure and the database integrity.
              </p>
            </div>
          </div>

          {/* Rule 7: Data Accuracy */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Data Accuracy & Content Policy</h3>
              <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                Ensure the <strong>Video Count</strong> and <strong>File Size (GB)</strong> you input perfectly match the actual content. Archived content must not violate the law, contain explicit elements, and must strictly be a backup of the relevant creator's public work.
              </p>
            </div>
          </div>

          {/* Rule 8: Monetization & Shortlinks */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <DollarSign className="text-emerald-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Monetization & Shortlinks Allowed</h3>
              <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                You are permitted to use shortlink services to monetize your archive links. However, the shortlink process must not be deceptive, trigger malicious pop-ups, or severely inconvenience other users trying to access the files.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex justify-center pb-10">
          <button 
            onClick={handleGoBack} 
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-none hover:-translate-y-0.5 active:translate-y-0"
          >
            <ArrowLeft size={20} />
            Return to Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default RulesPage;