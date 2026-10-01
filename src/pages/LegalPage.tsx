import { ShieldAlert, BookOpen, UserCheck, Mail, ArrowLeft } from 'lucide-react';

const LegalPage = () => {
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
            <ShieldAlert size={36} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            Legal & Disclaimer
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl">
            Please read this information carefully. By accessing or using BatchTikTok, you agree to comply with the terms stated below.
          </p>
        </div>

        {/* Legal Content */}
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Card 1: Platform Purpose */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <BookOpen className="text-blue-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">1. Platform Purpose & Disclaimer</h3>
              <div className="text-slate-600 mt-2 leading-relaxed font-medium space-y-3">
                <p>
                  <strong>BatchTikTok</strong> is a community-driven archiving tool designed to curate and structure publicly available links to regional content (specifically TikTok videos). 
                </p>
                <p>
                  We do <strong>not</strong> host, store, or upload any video files on our servers. All content remains on the original hosting platforms (e.g., Google Drive, Terabox, MediaFire). The platform merely acts as a directory or catalog of links submitted by users.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: User Responsibility */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <UserCheck className="text-emerald-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">2. User Responsibility</h3>
              <div className="text-slate-600 mt-2 leading-relaxed font-medium space-y-3">
                <p>
                  Users who submit links to BatchTikTok are solely responsible for ensuring they have the legal right to share those links.
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>Do not post links containing illegal, explicit (NSFW), or malicious content.</li>
                  <li>Do not use the platform for copyright infringement.</li>
                  <li>We reserve the right to remove any link, collection, or user account that violates these terms without prior notice.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 3: Copyright & DMCA (Diberi highlight merah muda agar lebih menonjol) */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-rose-50/50 border-none shadow-sm hover:shadow-md transition-shadow">
            <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-rose-900 text-lg">3. Copyright & DMCA Takedowns</h3>
              <div className="text-rose-800/90 mt-2 leading-relaxed font-medium space-y-3">
                <p>
                  BatchTikTok respects the intellectual property rights of others. Because we do not host the actual files, we cannot remove the content from its original hosting service.
                </p>
                <p>
                  However, if you are a copyright owner and find a link to your content indexed on our platform without authorization, you may request the link's removal from our directory. Please provide sufficient proof of ownership when submitting a takedown request.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Contact */}
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <Mail className="text-indigo-400 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">4. Contact Information</h3>
              <div className="text-slate-600 mt-2 leading-relaxed font-medium space-y-3">
                <p>
                  If you have any questions, legal concerns, or wish to submit a removal request, please contact the administrators directly via the platform or relevant community channels.
                </p>
              </div>
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

export default LegalPage;