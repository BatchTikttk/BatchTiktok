import { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Download, ExternalLink, QrCode, Copy, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { EmeraldFolderIcon } from '../components/SharedIcons';

const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

export default function Pay() {
  const [copied, setCopied] = useState(false);
  const qrisImageUrl = 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Qris/DutaKlipQR.jpeg';

  const handleCopyAmount = () => {
    navigator.clipboard.writeText('50000');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <div>
        <Navbar 
          activeCategory="" 
          setActiveCategory={(category: string) => {
            window.location.href = category === 'Home' ? '/' : `/?category=${category}`;
          }}
          resetSearch={() => {}}
          CATEGORIES={CATEGORIES}
          EmeraldFolderIcon={EmeraldFolderIcon}
          currentUser={null}
          handleLogout={() => {}}
          setShowAddModal={() => {}}
          setShowLoginModal={() => {}}
          setShowRulesModal={() => {
            window.history.pushState({}, '', '/rules');
            window.dispatchEvent(new Event('popstate'));
          }}
        />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
          {/* Back Navigation */}
          <button 
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-8 transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>

          {/* Page Title Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
              Checkout & Payment
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
              Complete Your <span className="text-amber-500">Premium Upgrade</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
              Scan the official QRIS code below using any mobile banking or e-wallet app to unlock lifetime VIP privileges.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: QRIS DISPLAY */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-6 bg-amber-500/10 px-4 py-2 rounded-xl">
                <QrCode size={18} />
                <span>National QRIS Merchant</span>
              </div>

              {/* QR Image Box */}
              <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-xs w-full transition-transform hover:scale-[1.02] border border-slate-200">
                <img 
                  src={qrisImageUrl} 
                  alt="DutaKlip Official QRIS Payment" 
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>

              {/* Action Buttons for Image */}
              <div className="flex items-center gap-3 mt-6">
                <a 
                  href={qrisImageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-all no-underline border border-slate-700"
                >
                  <ExternalLink size={14} /> Open Fullsize
                </a>
                <a 
                  href={qrisImageUrl} 
                  download="DutaKlip_QRIS.jpeg" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-all no-underline border border-slate-700"
                >
                  <Download size={14} /> Save Image
                </a>
              </div>

              {/* Supported E-Wallets */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 w-full">
                <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">
                  Supported E-Wallets & Banks
                </p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                  DANA, OVO, GoPay, ShopeePay, LinkAja, BCA, Mandiri, BRI, BNI, CIMB, and all QRIS-compatible mobile banking apps.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER DETAILS & CONFIRMATION */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Summary Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>Package Name</span>
                    <span className="font-bold text-white">Lifetime VIP Pass</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Access Level</span>
                    <span className="font-bold text-amber-400">Unlimited Content</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Processing Fee</span>
                    <span className="font-bold text-emerald-400">Rp 0 (Free)</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="text-slate-300 font-bold">Total Amount</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-amber-500">Rp 50,000</span>
                      <button 
                        onClick={handleCopyAmount}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors border-none cursor-pointer"
                        title="Copy Amount"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Benefits Check List */}
                <div className="space-y-2.5 mb-8 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                    <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0" />
                    <span>Instant access to exclusive folders</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                    <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0" />
                    <span>Exclusive VIP border badge</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                    <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0" />
                    <span>Priority for custom request queues</span>
                  </div>
                </div>

                {/* Confirm Payment Link */}
                <a 
                  href="https://www.tiktok.com/@dutaklip_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 no-underline"
                >
                  <ShieldCheck size={18} />
                  <span>Confirm Payment / Contact Admin</span>
                </a>

                <p className="text-[11px] text-slate-400 text-center mt-3 leading-snug">
                  After completing the transfer, send your transaction screenshot to speed up verification.
                </p>
              </div>

            </div>

          </div>
        </main>
      </div>

      <Footer onSelectCountry={(category: string) => {
        window.location.href = category === 'Home' ? '/' : `/?category=${category}`;
      }} />
    </div>
  );
}