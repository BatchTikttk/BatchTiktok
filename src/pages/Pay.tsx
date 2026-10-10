import { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Download, ExternalLink, Copy, Check, QrCode } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { EmeraldFolderIcon } from '../components/SharedIcons';
import { supabase } from '../supabase';

const CATEGORIES = ['Home', 'Indonesia', 'Thailand', 'Taiwan', 'Philippines', 'Vietnam'];

interface PayProps {
  currentUser?: string | null;
  handleLogout?: () => void;
}

export default function Pay({ currentUser, handleLogout }: PayProps) {
  const [copied, setCopied] = useState(false);
  const qrisImageUrl = 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Qris/DutaKlipQR.jpeg';

  // Proteksi Halaman: Wajib Login sebelum mengakses /pay
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.history.replaceState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
        window.dispatchEvent(new Event('openLoginModal'));
      }
    };
    checkAuth();
  }, []);

  // --- Konfigurasi WhatsApp Bisnis ---
  const whatsappNumber = '6281234567890'; // Ganti dengan nomor WhatsApp Bisnis kamu
  const whatsappMessage = encodeURIComponent(
    `Halo Admin DutaKlip, akun saya @${currentUser || 'User'} sudah melakukan pembayaran Rp 50.000 untuk Upgrade Premium. Berikut adalah bukti transfernya:`
  );
  const whatsappCheckoutUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const handleCopyAmount = () => {
    navigator.clipboard.writeText('50000');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <div>
        <Navbar 
          activeCategory="" 
          setActiveCategory={(category: string) => {
            window.location.href = category === 'Home' ? '/' : `/?category=${category}`;
          }}
          resetSearch={() => {}}
          CATEGORIES={CATEGORIES}
          EmeraldFolderIcon={EmeraldFolderIcon}
          currentUser={currentUser}
          handleLogout={handleLogout || (() => {})}
          setShowAddModal={() => {}}
          setShowLoginModal={() => {
            window.dispatchEvent(new Event('openLoginModal'));
          }}
          setShowRulesModal={() => {
            window.history.pushState({}, '', '/rules');
            window.dispatchEvent(new Event('popstate'));
          }}
        />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Complete Your <span className="text-amber-500">Premium Upgrade</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-lg mx-auto font-medium leading-relaxed">
              Scan the official QRIS code below using any mobile banking or e-wallet app to unlock lifetime VIP privileges instantly.
            </p>
          </div>

          {/* Balanced 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT COLUMN: QRIS DISPLAY (col-span-6) */}
            <div className="lg:col-span-6 bg-white border border-slate-100/80 rounded-[2.5rem] p-8 shadow-[0_10px_30px_rgb(0,0,0,0.03)] flex flex-col items-center justify-between text-center">
              
              <div className="w-full">
                <div className="flex items-center justify-center gap-2 text-slate-700 font-bold text-xs tracking-wider uppercase mb-6">
                  <QrCode size={16} className="text-emerald-500" />
                  <span>Official QRIS Payment</span>
                </div>

                {/* QR Image */}
                <div className="mx-auto flex justify-center my-2">
                  <img 
                    src={qrisImageUrl} 
                    alt="DutaKlip Official QRIS Payment" 
                    className="max-w-[240px] w-full h-auto object-contain rounded-xl shadow-md transition-transform hover:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="w-full mt-6">
                {/* Action Buttons for Image */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <a 
                    href={qrisImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200/70 px-4 py-2.5 rounded-xl transition-all no-underline"
                  >
                    <ExternalLink size={14} /> Open Fullsize
                  </a>
                  <a 
                    href={qrisImageUrl} 
                    download="DutaKlip_QRIS.jpeg" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200/70 px-4 py-2.5 rounded-xl transition-all no-underline"
                  >
                    <Download size={14} /> Save Image
                  </a>
                </div>

                {/* Supported E-Wallets */}
                <div className="pt-5 border-t border-slate-100 w-full text-center">
                  <p className="text-[11px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                    Supported E-Wallets & Banks
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    DANA, OVO, GoPay, ShopeePay, BCA, Mandiri, BRI, BNI, and all QRIS apps.
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: ORDER DETAILS & CONFIRMATION (col-span-6) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              
              {/* Order Summary Box */}
              <div className="bg-white border border-slate-100/80 rounded-[2.5rem] p-8 shadow-[0_10px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3 flex items-center justify-between">
                    <span>Order Summary</span>
                    <span className="text-xs font-bold text-emerald-600">Verified</span>
                  </h3>

                  <div className="space-y-3.5 text-sm mb-6">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Package Name</span>
                      <span className="font-bold text-slate-800">Lifetime VIP Pass</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Access Level</span>
                      <span className="font-bold text-amber-500">Unlimited Content</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Processing Fee</span>
                      <span className="font-bold text-emerald-600">Rp 0 (Free)</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                      <span className="text-slate-700 font-bold">Total Amount</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-amber-500">Rp 50,000</span>
                        <button 
                          onClick={handleCopyAmount}
                          className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors border-none cursor-pointer"
                          title="Copy Amount"
                        >
                          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Benefits Check List */}
                  <div className="space-y-2.5 mb-8 bg-slate-50/80 p-4 rounded-2xl border border-slate-100/80">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                      <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0" />
                      <span>Instant access to exclusive folders</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                      <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0" />
                      <span>Exclusive VIP border badge</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                      <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0" />
                      <span>Priority for custom request queues</span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Confirm Payment Link (WhatsApp) */}
                  <a 
                    href={whatsappCheckoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-emerald-500/20 text-sm flex items-center justify-center gap-2 no-underline"
                  >
                    <ShieldCheck size={18} />
                    <span>Confirm Payment / Contact Admin</span>
                  </a>

                  <p className="text-[11px] text-slate-400 font-medium text-center mt-3 leading-snug">
                    After completing the transfer, send your transaction screenshot to speed up verification.
                  </p>
                </div>
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