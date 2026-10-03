import { useState } from 'react';

interface UpgradeMembershipProps {
  onBack?: () => void;
}

const CONTENT = {
  en: {
    backHome: 'Back to Home',
    badge: 'LIFETIME ACCESS',
    title: 'Unlock Unlimited',
    titleHighlight: 'Premium Access',
    subtitle: 'Get lifetime access to all exclusive TikTok folder collections with just one single payment. No monthly fees forever.',
    planTitle: 'Lifetime Access Pass',
    planSubtitle: 'Pay once, enjoy forever',
    price: 'Rp 50,000',
    pricePeriod: '/ ONE-TIME',
    guarantee: 'Instant activation after payment verification',
    ctaButton: 'Get Premium Access Now',
    secureNotice: 'Encrypted & Verified Secure Payment',
    featuresHeader: 'Premium Membership Benefits',
    features: [
      'Lifetime access to all Exclusive & VIP folders',
      'High-speed batch downloading without limits',
      'Early access to daily content updates & new creators',
      'Ad-free experience with direct download links',
      'Priority customer support via WhatsApp / Telegram',
      'Zero recurring or hidden monthly charges'
    ]
  },
  id: {
    backHome: 'Kembali ke Beranda',
    badge: 'AKSES SEUMUR HIDUP',
    title: 'Akses Semua Koleksi',
    titleHighlight: 'Premium Tanpa Batas',
    subtitle: 'Dapatkan akses seumur hidup ke seluruh folder eksklusif TikTok hanya dengan sekali bayar. Tanpa biaya bulanan selamanya.',
    planTitle: 'Lifetime Access Pass',
    planSubtitle: 'Bayar sekali, nikmati selamanya',
    price: 'Rp 50.000',
    pricePeriod: '/ SEKALI BAYAR',
    guarantee: 'Akses langsung aktif setelah verifikasi pembayaran',
    ctaButton: 'Dapatkan Akses Premium Sekarang',
    secureNotice: 'Pembayaran Aman & Terverifikasi',
    featuresHeader: 'Keuntungan Membership Premium',
    features: [
      'Akses seumur hidup ke semua folder Eksklusif & VIP',
      'Unduh batch kecepatan tinggi tanpa batas',
      'Akses lebih awal untuk pembaruan konten harian & kreator baru',
      'Pengalaman bebas iklan dengan tautan unduhan langsung',
      'Dukungan pelanggan prioritas via WhatsApp / Telegram',
      'Tanpa biaya langganan bulanan atau biaya tersembunyi'
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
        
        {/* Dark Hero Banner matching Main App Theme */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm text-center mb-8 relative overflow-hidden">
          <div className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-extrabold px-3.5 py-1 rounded-full mb-4 uppercase tracking-wider">
            {t.badge}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
            {t.title} <span className="text-emerald-400">{t.titleHighlight}</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
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
                  LIFETIME VIP
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
                🔒 {t.secureNotice}
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

            <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
              Dukungan langsung via Telegram / WhatsApp untuk semua member VIP.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}