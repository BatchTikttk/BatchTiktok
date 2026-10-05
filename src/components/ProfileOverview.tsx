import { Folder, Video, HardDrive, MousePointerClick, TrendingUp, CheckCircle2, Sparkles, Lock } from 'lucide-react';

interface ProfileOverviewProps {
  stats: {
    totalUploads: number;
    totalVideos: number;
    totalSizeDisplay: string;
    totalClicks: number;
  };
  badges: any[];
  unlockedBadges: any[];
}

export default function ProfileOverview({ stats, badges, unlockedBadges }: ProfileOverviewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-[#3b82f6] p-6 rounded-[32px] shadow-[0_12px_24px_-8px_rgba(59,130,246,0.4)] flex flex-col justify-between text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm font-medium text-blue-100">Total Folders</span>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Folder size={18} /></div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.totalUploads}</div>
            <div className="text-[10px] mt-1 text-blue-100 flex items-center gap-1"><TrendingUp size={12} /> Active Progress</div>
          </div>
        </div>

        <div className="bg-[#84cc16] p-6 rounded-[32px] shadow-[0_12px_24px_-8px_rgba(132,204,22,0.4)] flex flex-col justify-between text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm font-medium text-green-100">Total Videos</span>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Video size={18} /></div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.totalVideos}</div>
            <div className="text-[10px] mt-1 text-green-100 flex items-center gap-1"><CheckCircle2 size={12} /> Successfully Uploaded</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500">Total Size</span>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><HardDrive size={18} /></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-800">{stats.totalSizeDisplay}</div>
            <div className="text-[10px] mt-1 text-slate-400">Size Uploaded</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-500">Total Downloads</span>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><MousePointerClick size={18} /></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-800">{stats.totalClicks}</div>
            <div className="text-[10px] mt-1 text-slate-400">Inbound click traffic</div>
          </div>
        </div>
      </div>

      {/* BADGES SECTION */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Achievement Badges</h2>
            <p className="text-xs text-slate-500 mt-1">Badges unlock automatically based on contributions</p>
          </div>
          <span className="text-xs font-bold text-[#10b981] bg-emerald-50 px-4 py-2 rounded-full">
            {unlockedBadges.length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {badges.map((badge) => {
            const unlocked = badge.isUnlocked(stats);
            const progress = badge.getCurrentProgress(stats);
            const percent = Math.min(Math.round((progress / badge.target) * 100), 100);
            const isLegend = badge.id === 'legend';

            return (
              <div 
                key={badge.id}
                className={`relative p-5 rounded-[24px] transition-all duration-300 flex flex-col justify-between h-full ${
                  unlocked 
                    ? (isLegend ? 'bg-gradient-to-b from-yellow-50 to-amber-100/50 border border-amber-200' : 'bg-gradient-to-b from-white to-blue-50/30 border border-blue-100') 
                    : 'bg-slate-50 border border-slate-100 opacity-80'
                } ${isLegend ? 'md:col-span-2 max-w-[380px] mx-auto w-full' : 'w-full'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${unlocked ? (isLegend ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700') : 'bg-slate-200 text-slate-500'}`}>
                    {badge.tier}
                  </span>
                  {unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#84cc16]"><Sparkles size={12} /> Active</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400"><Lock size={12} /> Locked</span>
                  )}
                </div>

                <div className="flex flex-col items-center mb-4 text-center">
                  <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                    <img src={badge.iconUrl} alt={badge.title} className={`w-20 h-20 object-contain ${unlocked ? 'drop-shadow-lg' : 'grayscale opacity-40'}`} />
                  </div>
                  <h3 className="text-sm font-bold mt-2 text-slate-800">{badge.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 px-4">{badge.description}</p>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between items-center text-[10px] font-bold mb-1.5">
                    <span className="text-slate-400">Target</span>
                    <span className={unlocked ? 'text-[#10b981]' : 'text-slate-500'}>{badge.target} {badge.unit}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${unlocked ? 'bg-[#10b981]' : 'bg-slate-300'}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}