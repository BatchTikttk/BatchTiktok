import { useEffect, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';

// Import mengarah ke file supabase.ts di dalam folder src
import { supabase } from '../supabase'; 

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void; // Prop opsional untuk memicu modal login
}

const CONTENT = {
  title: 'Upgrade to',
  titleHighlight: 'Premium',
  subtitle: 'One-time payment for unlimited access to all folder collections.',
  price: 'Rp 50,000',
  guarantee: 'Instant activation after payment verification',
  ctaButton: 'Get Premium Access',
  secureNotice: 'Secure & Verified Payment',
  featuresHeader: 'Member Benefits',
  features: [
    'Akses to all Exclusive Konten',
    'Direct download links (Google Drive & TeraBox) without ads',
    'Priority queue for custom batch requests',
    'Exclusive Border Aavtar VIP',
    'Premium card background for the contribution page'
  ]
};

// Deklarasi global object window untuk TypeScript agar tidak error saat memanggil window.snap
declare global {
  interface Window {
    snap: any;
  }
}

export default function UpgradeModal({ isOpen, onClose, onOpenLoginModal }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Load Midtrans Snap.js script ketika modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    // URL Sandbox Midtrans
    const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    
    // Memanggil Client Key dari file .env Vite
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY; 

    // Cek agar script tidak di-load berulang kali
    let scriptTag = document.querySelector(`script[src="${snapScriptUrl}"]`) as HTMLScriptElement;
    
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.src = snapScriptUrl;
      scriptTag.setAttribute('data-client-key', clientKey);
      scriptTag.async = true;
      document.body.appendChild(scriptTag);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil data user yang sedang login saat ini di Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // LOGIKA CERDAS: Jika user BELUM LOGIN
      if (userError || !user) {
        onClose(); // Tutup modal upgrade
        if (onOpenLoginModal) {
          onOpenLoginModal(); // Buka modal login
        } else {
          // Fallback event jika prop tidak ditransfer secara eksplisit
          window.dispatchEvent(new CustomEvent('openLoginModal'));
        }
        return;
      }

      // 2. Jika user SUDAH LOGIN: Memanggil Supabase Edge Function 'midtrans-payment'
      const { data, error } = await supabase.functions.invoke('midtrans-payment', {
        body: { 
          amount: 50000,
          user_id: user.id // Mengirim ID user aktif agar webhook bisa membaca tujuannya
        }
      });

      if (error) {
        console.error('Error dari Supabase:', error);
        throw new Error('Gagal memanggil fungsi dari Supabase');
      }

      if (!data?.token) {
        throw new Error('Token pembayaran tidak ditemukan');
      }

      // 3. Munculkan popup UI Midtrans
      window.snap.pay(data.token, {
        onSuccess: function (result: any) {
          console.log('Pembayaran Sandbox SUKSES:', result);
          alert('Pembayaran Berhasil! Status akun Anda akan segera diperbarui.');
          onClose(); // Tutup modal otomatis setelah berhasil
        },
        onPending: function (result: any) {
          console.log('Pembayaran Sandbox PENDING:', result);
          alert('Menunggu pembayaran diselesaikan.');
        },
        onError: function (result: any) {
          console.log('Pembayaran Sandbox GAGAL:', result);
          alert('Pembayaran gagal.');
        },
        onClose: function () {
          console.log('User menutup popup tanpa menyelesaikan pembayaran');
        }
      });
    } catch (error: any) {
      console.error('Terjadi kesalahan:', error);
      alert(error.message || 'Gagal memproses pembayaran. Cek console browser untuk detailnya.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-zinc-950/80 backdrop-blur-md transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Wrapper untuk mengatur posisi tombol Close di luar kartu */}
      <div className="relative w-full max-w-xl">
        
        {/* Tombol Close Polos Tanpa Bulatan Background */}
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 md:-right-10 md:-top-2 z-[60] text-zinc-400 hover:text-white bg-transparent border-none p-1 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>

        {/* Modal Container: Dark Mode Card */}
        <div className="bg-zinc-900 rounded-[2rem] w-full overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-zinc-800/50">
          
          {/* Header: Solid Gold (Elegan & Soft) */}
          <div className="bg-amber-600 px-8 py-8 md:py-10 text-center relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight mt-2">
              {CONTENT.title} <span className="text-amber-200">{CONTENT.titleHighlight}</span>
            </h2>
            <p className="text-amber-100 text-sm md:text-base max-w-md mx-auto font-medium opacity-90">
              {CONTENT.subtitle}
            </p>
          </div>

          {/* Content Body */}
          <div className="p-8 md:p-10 flex flex-col items-center w-full">
            
            {/* Features Section */}
            <div className="w-full flex flex-col items-center mb-8">
              <h3 className="text-zinc-100 font-bold text-lg mb-6 text-center tracking-wide">
                {CONTENT.featuresHeader}
              </h3>
              <ul className="w-full max-w-md space-y-4 flex flex-col items-center text-center mx-auto">
                {CONTENT.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center justify-center gap-2.5 text-center w-full">
                    <Check 
                      size={18} 
                      className="text-amber-500 shrink-0 stroke-[2.5]" 
                    />
                    <span className="text-zinc-300 text-sm font-medium leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full border-t border-zinc-800/80 mb-8"></div>

            {/* Pricing Section */}
            <div className="w-full flex flex-col items-center">
              <div className="mb-6 text-center">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl md:text-5xl font-black text-amber-500 tracking-tight">
                    {CONTENT.price}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-2 font-medium">
                  {CONTENT.guarantee}
                </p>
              </div>

              {/* Tombol CTA Update dengan Loading State */}
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full max-w-md bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-600/20 text-sm border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Menghubungkan ke Midtrans...' : CONTENT.ctaButton}
              </button>
              <p className="text-zinc-400 text-xs mt-4 font-medium flex items-center justify-center gap-1.5">
                <ShieldCheck size={16} className="text-amber-500" />
                {CONTENT.secureNotice}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}