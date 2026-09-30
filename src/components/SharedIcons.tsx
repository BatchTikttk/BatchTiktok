import { CheckCircle2, Crown, Award } from 'lucide-react';

export const UserBadge = ({ username, count, adminList = [] }: { username: string, count: number, adminList: string[] }) => {
  if (!username) return null;
  
  const isAdmin = adminList.includes(username.toLowerCase());

  if (isAdmin) {
    return (
      <div title="Official Admin" className="bg-emerald-100 p-0.5 rounded-full ml-0.5 flex-shrink-0">
        <CheckCircle2 size={12} className="text-emerald-600" />
      </div>
    );
  }
  
  if (count >= 30) {
    return (
      <div title={`King Contributor (${count} uploads)`} className="bg-yellow-100 p-0.5 rounded-full ml-0.5 flex-shrink-0">
        <Crown size={12} className="text-yellow-600" />
      </div>
    );
  }
  
  if (count >= 10) {
    return (
      <div title={`Active Contributor (${count} uploads)`} className="bg-blue-100 p-0.5 rounded-full ml-0.5 flex-shrink-0">
        <Award size={12} className="text-blue-600" />
      </div>
    );
  }

  return null;
};

export const EmeraldFolderIcon = ({ className = "w-24 h-24", country }: { className?: string, country?: string }) => {
  const clipId = country ? `flag-clip-${country.toLowerCase()}` : '';

  const renderFlag = () => {
    if (!country || country === 'Home') return null;

    let flagContent = null;
    switch (country) {
      case 'Indonesia':
        flagContent = (
          <>
            <rect x="13" y="13" width="10" height="5" fill="#EF4444" />
            <rect x="13" y="18" width="10" height="5" fill="#FFFFFF" />
          </>
        );
        break;
      case 'Thailand':
        flagContent = (
          <>
            <rect x="13" y="13" width="10" height="10" fill="#EF4444" />
            <rect x="13" y="14.8" width="10" height="6.4" fill="#FFFFFF" />
            <rect x="13" y="16.2" width="10" height="3.6" fill="#1E3A8A" />
          </>
        );
        break;
      case 'Vietnam':
        flagContent = (
          <>
            <rect x="13" y="13" width="10" height="10" fill="#EF4444" />
            <polygon points="18,14.2 19.2,16.2 21.5,16.2 19.6,17.6 20.3,19.8 18,18.4 15.7,19.8 16.4,17.6 14.5,16.2 16.8,16.2" fill="#FACC15" />
          </>
        );
        break;
      case 'Philippines':
        flagContent = (
          <>
            <rect x="13" y="13" width="10" height="5" fill="#1D4ED8" />
            <rect x="13" y="18" width="10" height="5" fill="#EF4444" />
            <polygon points="13,13 13,23 18.5,18" fill="#FFFFFF" />
            <circle cx="14.8" cy="18" r="1.5" fill="#FACC15" />
          </>
        );
        break;
      default:
        return null;
    }

    return (
      <g>
        <circle cx="18" cy="18" r="5.5" fill="#FFFFFF" />
        <clipPath id={clipId}>
          <circle cx="18" cy="18" r="5" />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          {flagContent}
        </g>
      </g>
    );
  };

  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4Z" fill="#10b981" />
      {renderFlag()}
    </svg>
  );
};