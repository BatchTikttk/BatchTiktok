import { ShieldCheck, FolderHeart, Scale, Shield } from 'lucide-react';
import { EmeraldFolderIcon } from './SharedIcons';

interface FooterProps {
  onSelectCountry?: (country: string) => void;
}

export default function Footer({ onSelectCountry }: FooterProps) {
  // Menambahkan 'Taiwan' ke dalam daftar kategori
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
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigateTo('/')}>
              <EmeraldFolderIcon className="w-8 h-8 flex-shrink-0" />
              <span className="font-extrabold text-xl text-slate-800 tracking-tight">
                Batch<span className="text-emerald-600">TikTok</span>
              </span>
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
                    className="hover:text-emerald-600 transition-colors border-none bg-transparent p-0 text-left cursor-pointer"
                  >
                    {country}
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