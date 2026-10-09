import { ShieldCheck, FolderHeart, Scale, Shield, Globe } from 'lucide-react';

// Komponen helper bendera untuk footer (serasi dengan Navbar)
const FooterFlag = ({ country, className = "w-4 h-4" }: { country: string, className?: string }) => {
  const clipId = `footer-flag-${country.toLowerCase().replace(/\s+/g, '-')}`;
  
  let flagContent = null;
  switch (country) {
    case 'Indonesia':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="12" fill="#EF4444" />
          <rect x="0" y="12" width="24" height="12" fill="#FFFFFF" />
        </>
      );
      break;
    case 'Thailand':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="24" fill="#EF4444" />
          <rect x="0" y="4.3" width="24" height="15.4" fill="#FFFFFF" />
          <rect x="0" y="7.7" width="24" height="8.6" fill="#1E3A8A" />
        </>
      );
      break;
    case 'Taiwan':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="24" fill="#EF4444" />
          <rect x="0" y="0" width="12" height="12" fill="#1E3A8A" />
          <circle cx="6" cy="6" r="3.5" fill="#FFFFFF" />
        </>
      );
      break;
    case 'Philippines':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="12" fill="#1D4ED8" />
          <rect x="0" y="12" width="24" height="12" fill="#EF4444" />
          <polygon points="0,0 0,24 13.2,12" fill="#FFFFFF" />
          <circle cx="4.3" cy="12" r="3.6" fill="#FACC15" />
        </>
      );
      break;
    case 'Vietnam':
      flagContent = (
        <>
          <rect x="0" y="0" width="24" height="24" fill="#EF4444" />
          <polygon 
            points="12,4.8 13.6,9.4 18.8,9.4 14.6,12.4 16.2,17.8 12,14.7 7.8,17.8 9.4,12.4 5.2,9.4 10.4,9.4" 
            fill="#FACC15" 
          />
        </>
      );
      break;
    default:
      return <Globe className={className} />;
  }

  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`${className} rounded-full overflow-hidden flex-shrink-0 drop-shadow-sm`}>
      <circle cx="12" cy="12" r="12" fill="#FFFFFF" />
      <clipPath id={clipId}>
        <circle cx="12" cy="12" r="11.5" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {flagContent}
      </g>
      <circle cx="12" cy="12" r="11.5" fill="none" stroke="#E2E8F0" strokeWidth="1" />
    </svg>
  );
};

interface FooterProps {
  onSelectCountry?: (country: string) => void;
}

export default function Footer({ onSelectCountry }: FooterProps) {
  // Daftar kategori negara
  const categories = ['Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <footer className="bg-white border-t border-slate-100 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2 space-y-3">
            {/* Logo DutaKlip (serasi dengan Navbar) */}
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigateTo('/')}>
              <img 
                src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/DutaKlip2.webp" 
                alt="DutaKlip Logo" 
                className="h-10 w-auto object-contain transform group-hover:scale-105 transition-transform"
              />
            </div>
            <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
              A structured, clean, and distraction-free platform for archiving and sharing regional TikTok video collections.
            </p>
            <p className="text-xs font-semibold text-slate-400 pt-1">
              © {new Date().getFullYear()} BatchTikTok. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-3 tracking-wide">
              Regional Categories
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-slate-600">
              {categories.map((country) => (
                <li key={country}>
                  <button 
                    onClick={() => onSelectCountry && onSelectCountry(country)}
                    className="hover:text-emerald-600 transition-colors border-none bg-transparent p-0 text-left cursor-pointer flex items-center gap-2.5"
                  >
                    <FooterFlag country={country} className="w-[18px] h-[18px]" />
                    <span>{country}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-3 tracking-wide">
              Resources & Info
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-slate-600">
              <li>
                <button 
                  onClick={() => navigateTo('/rules')}
                  className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors border-none bg-transparent p-0 cursor-pointer"
                >
                  <Scale size={16} className="text-emerald-500" />
                  <span>Rules</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('/legal')}
                  className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors border-none bg-transparent p-0 cursor-pointer"
                >
                  <Shield size={16} className="text-emerald-500" />
                  <span>Legal</span>
                </button>
              </li>
              <li className="flex items-center gap-2 text-slate-500 mt-4 pt-4 border-t border-slate-50">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Verified Links</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <FolderHeart size={16} className="text-emerald-500" />
                <span>Community Contribution</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}