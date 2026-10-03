import React, { useState } from 'react';
import { 
  Crown, 
  CheckCircle2, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Infinity as InfinityIcon, 
  ArrowLeft, 
  Sparkles 
} from 'lucide-react';

interface ContentDictionary {
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  pricePeriod: string;
  oneTimeLabel: string;
  ctaButton: string;
  guaranteeText: string;
  backHome: string;
  featuresHeader: string;
  features: string[];
  faqHeader: string;
  faqs: { q: string; a: string }[];
}

const CONTENT: Record<'en' | 'id', ContentDictionary> = {
  en: {
    badge: 'LIFETIME ACCESS',
    title: 'Unlock Unlimited Premium Access',
    subtitle: 'Get lifetime access to all exclusive TikTok folder collections with just one single payment. No monthly fees forever.',
    price: 'Rp 50,000',
    pricePeriod: 'one-time payment',
    oneTimeLabel: 'Pay once, enjoy forever',
    ctaButton: 'Get Premium Access Now',
    guaranteeText: 'Instant activation after payment verification',
    backHome: 'Back to Home',
    featuresHeader: 'Premium Membership Benefits',
    features: [
      'Lifetime access to all Exclusive & VIP folders',
      'High-speed batch downloading without limits',
      'Early access to daily content updates & new creators',
      'Ad-free experience with direct download links',
      'Priority customer support via WhatsApp / Telegram',
      'Zero recurring or hidden monthly charges'
    ],
    faqHeader: 'Frequently Asked Questions',
    faqs: [
      {
        q: 'Is this really a one-time payment?',
        a: 'Yes! You only pay Rp 50,000 once and you will get lifetime access without any monthly subscription fees.'
      },
      {
        q: 'How long does activation take?',
        a: 'Your premium status will be activated automatically or within 5-10 minutes after payment verification.'
      },
      {
        q: 'What payment methods are supported?',
        a: 'We accept QRIS, Bank Transfer (BCA, Mandiri, BRI), e-Wallets (Gopay, OVO, Dana, ShopeePay).'
      }
    ]
  },
  id: {
    badge: 'AKSES SEUMUR HIDUP',
    title: 'Akses Semua Koleksi Premium Tanpa Batas',
    subtitle: 'Dapatkan akses seumur hidup ke seluruh folder eksklusif TikTok hanya dengan sekali bayar. Tanpa biaya bulanan selamanya.',
    price: 'Rp 50.000',
    pricePeriod: 'sekali bayar',
    oneTimeLabel: 'Bayar sekali, nikmati selamanya',
    ctaButton: 'Dapatkan Akses Premium Sekarang',
    guaranteeText: 'Akses langsung aktif setelah verifikasi pembayaran',
    backHome: 'Kembali ke Beranda',
    featuresHeader: 'Keuntungan Membership Premium',
    features: [
      'Akses seumur hidup ke semua folder Eksklusif & VIP',
      'Unduh batch kecepatan tinggi tanpa batas',
      'Akses lebih awal untuk pembaruan konten harian & kreator baru',
      'Pengalaman bebas iklan dengan tautan unduhan langsung',
      'Dukungan pelanggan prioritas via WhatsApp / Telegram',
      'Tanpa biaya langganan bulanan atau biaya tersembunyi'
    ],
    faqHeader: 'Pertanyaan Umum (FAQ)',
    faqs: [
      {
        q: 'Apakah ini benar-benar sekali bayar?',
        a: 'Ya! Anda hanya perlu membayar Rp 50.000 satu kali saja dan mendapatkan akses selamanya tanpa biaya langganan bulanan.'
      },
      {
        q: 'Berapa lama proses aktivasi akun?',
        a: 'Status premium Anda akan diaktifkan secara otomatis atau maksimal 5-10 menit setelah verifikasi pembayaran.'
      },
      {
        q: 'Metode pembayaran apa saja yang tersedia?',
        a: 'Kami menerima QRIS, Transfer Bank (BCA, Mandiri, BRI), dan e-Wallet (Gopay, OVO, Dana, ShopeePay).'
      }
    ]
  }
};

export default function UpgradeMembership() {
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const t = CONTENT[lang];

  const handleGoBack = () => {
    window.history.back();
  };

  const handleUpgradePayment = () => {
    // Implementasi integrasi payment gateway / WhatsApp checkout di sini
    alert(lang === 'en' ? 'Redirecting to payment gateway...' : 'Mengarahkan ke halaman pembayaran...');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900 relative overflow-hidden">
      
      {/* Background Glow Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-500/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation & Language Toggle */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer font-semibold text-sm"
        >
          <ArrowLeft size={18} />
          {t.backHome}
        </button>

        {/* Language Toggle Button */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shadow-lg">
          <Globe size={18} className="text-emerald-400 ml-2" />
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('id')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              lang === 'id'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bahasa Indonesia
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-6 pt-6 pb-20 relative z-10 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold tracking-wider mb-6 shadow-sm">
            <Sparkles size={14} />
            {t.badge}
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            {t.title}
          </h1>

          <p className="text-slate-400 text-base sm:text-lg font-normal leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Pricing Card & Features Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* Main Pricing Box (7 cols) */}
          <div className="lg:col-span-7 bg-slate-800/90 rounded-3xl p-8 sm:p-10 border-2 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-400 text-slate-950 text-xs font-black px-6 py-2 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Crown size={16} /> Lifetime VIP
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <InfinityIcon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Lifetime Access Pass</h3>
                  <p className="text-xs text-slate-400 font-medium">{t.oneTimeLabel}</p>
                </div>
              </div>

              {/* Price Display */}
              <div className="my-8 pt-6 border-t border-slate-700/60">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {t.price}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    / {t.pricePeriod}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {t.guaranteeText}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-6">
              <button
                onClick={handleUpgradePayment}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3 border-none"
              >
                <Zap size={20} className="fill-current" />
                {t.ctaButton}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-400">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Encrypted & Verified Secure Payment</span>
              </div>
            </div>
          </div>

          {/* Features Benefit List (5 cols) */}
          <div className="lg:col-span-5 bg-slate-800/40 rounded-3xl p-8 border border-slate-700/60 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Crown size={20} className="text-amber-400" />
                {t.featuresHeader}
              </h3>

              <ul className="space-y-4">
                {t.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300 font-medium leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/60 bg-slate-800/60 -mx-8 -mb-8 p-6 rounded-b-3xl text-center">
              <p className="text-xs text-slate-400">
                Need help? Contact our 24/7 Support Team.
              </p>
            </div>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="w-full max-w-3xl mt-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            {t.faqHeader}
          </h2>

          <div className="space-y-4">
            {t.faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h4 className="text-base font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-400 font-normal leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}