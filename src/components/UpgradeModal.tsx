import { useState } from 'react';
import { Crown, ShieldCheck } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTENT = {
  en: {
    title: 'Upgrade to',
    titleHighlight: 'Premium',
    subtitle: 'One-time payment for unlimited access to all folder collections.',
    planTitle: 'VIP Access',
    price: 'Rp 50,000',
    guarantee: 'Instant activation after verification',
    ctaButton: 'Get Premium Access',
    secureNotice: 'Secure & Verified Payment',
    featuresHeader: 'Member Benefits',
    features: [
      'Full access to all creator archive collections',
      'Direct download links (Google Drive & TeraBox) without ads',
      'Priority queue for custom Batch Requests',
      'VIP profile badge & Global Chat features',
      'Daily archive synchronization updates'
    ]
  },
  id: {
    title: 'Akses',
    titleHighlight: 'Premium',
    subtitle: 'Satu kali bayar untuk akses seluruh koleksi folder tanpa batas.',
    planTitle: 'Akses VIP',
    price: 'Rp 50.000',
    guarantee: 'Akses aktif setelah verifikasi pembayaran',
    ctaButton: 'Beli Akses Premium',
    secureNotice: 'Pembayaran Aman & Terverifikasi',
    featuresHeader: 'Fasilitas Member',
    features: [
      'Akses penuh ke seluruh arsip kreator',
      'Tautan unduh langsung (Google Drive & TeraBox) tanpa iklan',
      'Prioritas antrean untuk Request Batch kreator',
      'Lencana profil VIP & akses fitur Global Chat',
      'Pembaruan sinkronisasi arsip harian'
    ]
  }
};

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const t = CONTENT[lang];

  if (!isOpen) return null;

  const handlePayment = () => {
    window.open('https://wa.me/your_number', '_blank');
  };

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div className="bg-white rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col md:flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Dark Hero Header */}
        <div className="bg-slate-900 px-8 py-10 md:py-12 text-center relative">
          
          {/* Top Bar inside Header (Language & Close) */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/10 p-1 rounded-full flex items-center gap-1 backdrop-blur-md">
            <button
              onClick={() => setLang('id')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${
                lang === 'id' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white bg-transparent'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${
                lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white bg-transparent'
              }`}
            >
              EN
            </button>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight mt-6 md:mt-0">
            {t.title} <span className="text-emerald-400">{t.titleHighlight}</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Content Body (2 Columns) */}
        <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white">
          
          {/* Pricing Section (Left) */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-900 font-extrabold text-xl">{t.planTitle}</h3>
              <span className="bg-amber-50 text-amber-600 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-amber-200/50">
                <Crown size={13} className="text-amber-500 fill-amber-500" /> VIP
              </span>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  {t.price}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-3 font-medium">
                {t.guarantee}
              </p>
            </div>

            <button
              onClick={handlePayment}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-sm border-none cursor-pointer"
            >
              {t.ctaButton}
            </button>
            <p className="text-slate-400 text-xs text-center mt-4 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-500" />
              {t.secureNotice}
            </p>
          </div>

          {/* Features Section (Right) */}
          <div className="flex flex-col justify-center">
            <h3 className="text-slate-900 font-bold text-lg mb-6">
              {t.featuresHeader}
            </h3>
            <ul className="space-y-4">
              {t.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3.5">
                  {/* Crown Gold Icon Tanpa Background Container */}
                  <Crown 
                    size={20} 
                    className="text-amber-500 fill-amber-400 shrink-0 mt-0.5 drop-shadow-sm" 
                  />
                  <span className="text-slate-600 text-sm font-medium leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}