import { useState } from 'react';

interface UpgradeMembershipProps {
  onBack?: () => void;
}

const CONTENT = {
  en: {
    backHome: 'Back to Home',
    title: 'Upgrade to',
    titleHighlight: 'Premium',
    subtitle: 'One-time payment for unlimited access to all folder collections.',
    planTitle: 'VIP Access',
    planSubtitle: 'Pay once, no subscription',
    price: 'Rp 50,000',
    pricePeriod: '/ ONE-TIME',
    guarantee: 'Instant activation after payment',
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
    backHome: 'Kembali ke Beranda',
    title: 'Akses',
    titleHighlight: 'Premium',
    subtitle: 'Satu kali bayar untuk akses seluruh koleksi folder tanpa batas.',
    planTitle: 'Akses VIP',
    planSubtitle: 'Sekali bayar, tanpa langganan',
    price: 'Rp 50.000',
    pricePeriod: '/ SEKALI BAYAR',
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

export default function UpgradeMembership({ onBack }: UpgradeMembershipProps) {
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const t = CONTENT[lang];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handlePayment = () => {
    window.open('https://wa.me/your_number', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-4 md:p-8">
      
      {/* Top Bar Navigation & Language Switcher */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-wrap gap-4 justify-between items-center">
        <button
          onClick={handleBack}
          className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-full shadow-sm transition-colors text-sm flex items-center gap-2 border-none cursor-pointer"
        >
          ← {t.backHome}
        </button>

        {/* Language Switcher */}
        <div className="bg-white p-1 rounded-full shadow-sm flex items-center gap-1 border-none">
          <button
            onClick={() => setLang('id')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
              lang === 'id'
                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            Bahasa Indonesia
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
              lang === 'en'
                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto">
        
        {/* Clean Hero Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-center mb-8 relative overflow-hidden">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            {t.title} <span className="text-emerald-400">{t.titleHighlight}</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Pricing Box */}
          <div className="md:col-span-5 bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-slate-900 font-extrabold text-xl">{t.planTitle}</h2>
                  <p className="text-slate-500 text-xs mt-1">{t.planSubtitle}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-600 font-bold text-[11px] px-2.5 py-1 rounded-full">
                  VIP
                </span>
              </div>

              <div className="my-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    {t.price}
                  </span>
                  <span className="text-emerald-600 font-bold text-xs">
                    {t.pricePeriod}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-2 font-medium">
                  {t.guarantee}
                </p>
              </div>
            </div>

            <div>
              <button
                onClick={handlePayment}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-colors shadow-sm text-sm border-none cursor-pointer"
              >
                {t.ctaButton}
              </button>
              <p className="text-slate-400 text-[11px] text-center mt-3 font-medium">
                {t.secureNotice}
              </p>
            </div>
          </div>

          {/* Benefits Feature List */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-slate-900 font-extrabold text-xl mb-6">
                {t.featuresHeader}
              </h2>

              <ul className="space-y-4">
                {t.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-slate-700 text-sm font-medium leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}