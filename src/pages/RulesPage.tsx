import { useState } from 'react';
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
  Cloud,
  BookOpen,
  Award,
  GitMerge,
  ShieldCheck,
  History,
  Crown
} from 'lucide-react';

const RulesPage = () => {
  const [activeTab, setActiveTab] = useState('rules');

  const handleGoBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  const tabs = [
    { id: 'rules', label: 'Guidelines & Rules', icon: BookOpen },
    { id: 'badges', label: 'Badges System', icon: Award },
    { id: 'editing', label: 'Editing Flow', icon: GitMerge },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-16 px-4 sm:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm">
              <Scale size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Community Center
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Guidelines, achievements, and documentation.
              </p>
            </div>
          </div>

          <button 
            onClick={handleGoBack} 
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5 border-none cursor-pointer"
          >
            <ArrowLeft size={18} />
            Return to Home
          </button>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-72 shrink-0">
            <div className="bg-white p-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex md:flex-col overflow-x-auto hide-scrollbar sticky top-28 z-10 border-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-colors whitespace-nowrap md:whitespace-normal text-left cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-500 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <Icon 
                      size={20} 
                      className={isActive ? 'text-white' : 'text-slate-400'} 
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none p-6 sm:p-10 min-h-[60vh] animate-in fade-in duration-500">
            
            {/* TAB: RULES */}
            {activeTab === 'rules' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-2">Posting Guidelines & Rules</h2>
                  <p className="text-slate-500 font-medium">Please read these rules carefully before submitting an archive to maintain community standards.</p>
                </div>

                <div className="grid gap-5">
                  <div className="flex gap-5 p-6 rounded-2xl bg-amber-50/80 border-none">
                    <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-amber-900 text-lg">Strict Moderation System</h3>
                      <p className="text-amber-800/90 mt-2 leading-relaxed font-medium">
                        Every submission will not appear immediately on the main page. The data will be marked as <strong>Pending</strong> and undergo admin moderation. We will verify the authenticity and completeness of the links before publishing.
                      </p>
                    </div>
                  </div>

                  {/* Exclusive Folder Information Card */}
                  <div className="flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Crown size={100} />
                    </div>
                    <Crown className="text-amber-500 shrink-0 mt-0.5 fill-amber-400 drop-shadow-sm z-10" size={26} />
                    <div className="z-10">
                      <h3 className="font-bold text-amber-900 text-lg">Exclusive Premium Collections</h3>
                      <p className="text-amber-800/90 mt-2 leading-relaxed font-medium">
                        Folders marked with a golden crown represent <strong>TikTok Exclusive Collections</strong>. These are highly curated, premium archives. To protect this exclusive content and ensure bandwidth sustainability, access is strictly restricted to registered members. You <strong>must be logged in</strong> to preview and download these exclusive archives.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <UserCheck className="text-blue-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Profile Synchronization & Verification</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        To build trust within the community, we recommend logging in via Google OAuth. Users who sync their authenticated profiles with their submitted TikTok archives will receive a verified badge, prioritizing their submissions in the review queue.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Exclusive to Google Drive & TeraBox</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        The primary archive links must utilize <strong>Google Drive</strong> or <strong>TeraBox</strong>. If you submit primary links from unapproved platforms, your submission will be <span className="text-rose-600 font-bold">immediately rejected</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <Cloud className="text-indigo-400 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Approved Direct Media Hosts (Mirrors)</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        If you wish to provide direct video streams or image gallery mirrors alongside your main archive, you may use external direct media hosts such as <strong>qu.ax</strong> or <strong>chatbox.moe</strong>. 
                      </p>
                      <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border-none">
                        <p className="text-sm text-indigo-800 font-semibold">
                          <span className="text-rose-500 font-bold">Important note for qu.ax:</span> You must append the <code className="bg-white px-1.5 py-0.5 rounded text-rose-600 shadow-sm">.mp4</code> extension to the end of the original link to ensure proper video playback.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <Link2 className="text-blue-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Mandatory TikTok Profile Link</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        To maintain credibility and ease of search, you are <strong>required</strong> to include the original TikTok Profile URL of the creator whose videos you are archiving.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <FileVideo className="text-slate-400 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Optional Preview/Tutorial Video Link</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        If you do not have the time to upload a preview/tutorial compilation video, this section can be left blank. The main priority remains the archive structure.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Data Accuracy & Content Policy</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        Ensure the <strong>Video Count</strong> and <strong>File Size (GB)</strong> perfectly match the actual content. Archived content must not violate the law or contain explicit elements.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <DollarSign className="text-emerald-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Monetization & Shortlinks Allowed</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        You are permitted to use shortlink services to monetize your archive links, provided they are not deceptive and do not trigger malicious pop-ups.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BADGES (Bagian yang diperbarui dengan 5 Tier Badge terbaru) */}
            {activeTab === 'badges' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-2">Community Badges</h2>
                  <p className="text-slate-500 font-medium">Recognizing our top contributors. Badges are displayed automatically based on your total approved uploads.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Admin Badge */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center">
                    <ShieldCheck size={48} className="text-[#fbbf24] mb-4 drop-shadow-sm" />
                    <h3 className="font-bold text-slate-800 text-lg">Admin Verified</h3>
                    <div className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">Official Admin</div>
                    <p className="text-sm text-slate-500 font-medium">
                      Exclusive badge for administrators and moderators who maintain the platform's integrity.
                    </p>
                  </div>

                  {/* Tier 1: Bronze */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center hover:bg-slate-100/50 transition-colors">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Bronze.webp" 
                      alt="Bronze Tier" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-sm" 
                    />
                    <h3 className="font-bold text-slate-800 text-lg">Bronze Tier</h3>
                    <div className="bg-amber-100/80 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">10+ Uploads</div>
                    <p className="text-sm text-slate-500 font-medium">
                      Unlocked automatically after uploading at least 10 approved batch archives.
                    </p>
                  </div>

                  {/* Tier 2: Silver */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center hover:bg-slate-100/50 transition-colors">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Silver.webp" 
                      alt="Silver Tier" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-sm" 
                    />
                    <h3 className="font-bold text-slate-800 text-lg">Silver Tier</h3>
                    <div className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">30+ Uploads</div>
                    <p className="text-sm text-slate-500 font-medium">
                      Unlocked automatically after uploading at least 30 approved batch archives.
                    </p>
                  </div>

                  {/* Tier 3: Gold */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center hover:bg-slate-100/50 transition-colors">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Gold.webp" 
                      alt="Gold Tier" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-sm" 
                    />
                    <h3 className="font-bold text-amber-600 text-lg">Gold Tier</h3>
                    <div className="bg-yellow-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">50+ Uploads</div>
                    <p className="text-sm text-slate-500 font-medium">
                      Unlocked automatically after uploading at least 50 approved batch archives.
                    </p>
                  </div>

                  {/* Tier 4: Elite */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center hover:bg-slate-100/50 transition-colors">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Elite.webp" 
                      alt="Elite Tier" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-sm" 
                    />
                    <h3 className="font-bold text-emerald-600 text-lg">Elite Tier</h3>
                    <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">100+ Uploads</div>
                    <p className="text-sm text-slate-500 font-medium">
                      Unlocked automatically after uploading at least 100 approved batch archives.
                    </p>
                  </div>

                  {/* Tier 5: Legend */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50/40 border border-amber-200/60 flex flex-col items-center text-center hover:shadow-md transition-all">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Legend.webp" 
                      alt="Legend Tier" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-md scale-105" 
                    />
                    <h3 className="font-black text-amber-700 text-lg">Legend Tier</h3>
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black px-3.5 py-1 rounded-full mt-1.5 mb-2 shadow-xs">200+ Uploads</div>
                    <p className="text-sm text-slate-600 font-medium">
                      Highest Achievement! Unlocked after reaching 200 approved batch archives.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EDITING FLOW */}
            {activeTab === 'editing' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-2">Post Editing Flow</h2>
                  <p className="text-slate-500 font-medium">How to update and manage your previously submitted archives.</p>
                </div>

                <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 space-y-10 pb-4">
                  
                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-500">
                      <span className="font-bold text-sm">1</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Locating Your Post</h3>
                    <p className="text-slate-600 font-medium">
                      Ensure you are logged in to the account that originally submitted the archive. Click on your profile picture in the navigation bar and navigate to your dashboard to view all your submissions.
                    </p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 w-8 h-8 bg-white border-2 border-emerald-400 rounded-full flex items-center justify-center text-emerald-500">
                      <span className="font-bold text-sm">2</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Updating Links & Information</h3>
                    <p className="text-slate-600 font-medium">
                      Click the <strong className="text-emerald-600">Edit</strong> button on your submission. You can update dead links, add new mirrors, or revise the video count if you've added new files to your Google Drive/TeraBox folder.
                    </p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 w-8 h-8 bg-white border-2 border-blue-400 rounded-full flex items-center justify-center text-blue-500">
                      <History size={14} strokeWidth={3} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">The "Updated" Status Flag</h3>
                    <p className="text-slate-600 font-medium">
                      Once your edit is saved and verified, your post card on the home page will receive an <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded ml-1"><CheckCircle2 size={12} strokeWidth={3}/> Updated</span> badge. This lets users know that the folder has been refreshed with new content or fixed links.
                    </p>
                  </div>

                </div>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};

export default RulesPage;