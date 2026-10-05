import { 
  User, 
  ShieldCheck,
  LayoutDashboard,
  FolderHeart,
  Settings,
  LogOut,
  Sparkles,
  Send
} from 'lucide-react';
import AvatarBorderVip from './AvatarBorderVip';

interface ProfileSidebarProps {
  userProfile: any;
  activeUsername: string;
  unlockedBadges: any[];
  stats: { totalUploads: number };
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setShowAvatarModal: (show: boolean) => void;
  handleLogoutAction: () => void;
  fetchAllBatches: () => void;
  fetchAllRequests: () => void;
}

export default function ProfileSidebar({
  userProfile,
  activeUsername,
  unlockedBadges,
  stats,
  activeTab,
  setActiveTab,
  setShowAvatarModal,
  handleLogoutAction,
  fetchAllBatches,
  fetchAllRequests
}: ProfileSidebarProps) {
  return (
    <div className="w-full lg:w-[260px] shrink-0 space-y-8">
      <div className="flex flex-col items-center text-center">
        <div 
          className="relative group cursor-pointer mb-4 w-[88px] h-[88px]"
          onClick={() => setShowAvatarModal(true)}
          title="Click to change avatar"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 border-4 border-white transition-all duration-300 group-hover:scale-105 relative z-10">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={40} strokeWidth={2.2} />
            )}
          </div>
          {userProfile?.is_premium && (
            <AvatarBorderVip 
              isPremium={userProfile?.is_premium} 
              borderUrl={userProfile?.vip_border_url}
              progress={stats.totalUploads}
            />
          )}
        </div>

        <div className="flex flex-col items-center w-full mt-2">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {activeUsername || 'User'}
            {unlockedBadges.length > 0 && (
              <img 
                src={unlockedBadges[unlockedBadges.length - 1].iconUrl} 
                alt={unlockedBadges[unlockedBadges.length - 1].title} 
                title={unlockedBadges[unlockedBadges.length - 1].title}
                className="w-6 h-6 object-contain drop-shadow-sm cursor-pointer hover:scale-110 transition-transform"
              />
            )}
          </h1>

          <div className="mt-1.5 flex items-center gap-2 flex-wrap justify-center">
            {userProfile?.is_admin && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-[#fbbf24] px-3 py-1 rounded-full shadow-sm">
                <ShieldCheck size={12} /> Admin
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">
              Level {Math.floor(stats.totalUploads / 3) + 1}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
            activeTab === 'overview' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard size={18} className={activeTab === 'overview' ? 'text-[#10b981]' : ''} /> 
          Statistics
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
            activeTab === 'collections' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FolderHeart size={18} className={activeTab === 'collections' ? 'text-[#10b981]' : ''} /> 
          Collections
        </button>
        
        <button
          onClick={() => setActiveTab('request')}
          className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
            activeTab === 'request' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Send size={18} className={activeTab === 'request' ? 'text-[#10b981]' : ''} /> 
          Request Batch
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
            activeTab === 'settings' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Settings size={18} className={activeTab === 'settings' ? 'text-[#10b981]' : ''} /> 
          Settings
        </button>

        {userProfile?.is_admin && (
          <button
            onClick={() => {
              setActiveTab('admin');
              fetchAllBatches();
              fetchAllRequests();
            }}
            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all border-none cursor-pointer ${
              activeTab === 'admin' ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={18} className={activeTab === 'admin' ? 'text-[#fbbf24]' : ''} /> 
            Admin Panel
          </button>
        )}

        <div className="pt-4 mt-2 border-t border-slate-100">
          <button
            onClick={handleLogoutAction}
            className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all border-none cursor-pointer"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}