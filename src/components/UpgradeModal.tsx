import { Check, ShieldCheck } from 'lucide-react';

// Import pointing to the supabase.ts file inside the src folder
import { supabase } from '../supabase'; 

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void; // Optional prop to trigger the login modal
}

const CONTENT = {
  title: 'Upgrade to',
  titleHighlight: 'Premium',
  subtitle: 'Pembayaran satu kali untuk akses tanpa batas ke semua koleksi folder.',
  price: 'Rp 50,000',
  guarantee: 'Scan QRIS di bawah ini menggunakan aplikasi e-wallet atau m-banking',
  secureNotice: 'Secure & Verified Payment',
  featuresHeader: 'Member Benefits',
  features: [
    'Access to all Exclusive Content',
    'Priority queue for custom batch requests',
    'Exclusive VIP Avatar Border',
    'Premium card background for the contribution page'
  ]
};

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-zinc-950/80 backdrop-blur-md transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Wrapper to position the Close button outside the card */}
      <div className="relative w-full max-w-xl">
        
        {/* Plain Close Button Without Background Circle */}
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
          
          {/* Header: Solid Gold (Elegant & Soft) */}
          <div className="bg-amber-600 px-8 py-8 md:py-10 text-center relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight mt-2">
              {CONTENT.title} <span className="text-amber-200">{CONTENT.titleHighlight}</span>
            </h2>
            <p className="text-amber-100 text-sm md:text-base max-w-md mx-auto font-medium opacity-90">
              {CONTENT.subtitle}
            </p>
          </div>

          {/* Content Body */}
          <div className="p-8 md:p-10 flex flex-col items-center w-full max-h-[70vh] overflow-y-auto">
            
            {/* Features Section */}
            <div className="w-full flex flex-col items-center mb-6">
              <h3 className="text-zinc-100 font-bold text-lg mb-4 text-center tracking-wide">
                {CONTENT.featuresHeader}
              </h3>
              <ul className="w-full max-w-md space-y-3 flex flex-col items-center text-center mx-auto">
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

            <div className="w-full border-t border-zinc-800/80 mb-6"></div>

            {/* Pricing & QRIS Section */}
            <div className="w-full flex flex-col items-center">
              <div className="mb-4 text-center">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl md:text-4xl font-black text-amber-500 tracking-tight">
                    {CONTENT.price}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-1 font-medium">
                  {CONTENT.guarantee}
                </p>
              </div>

              {/* QRIS Image Container */}
              <div className="bg-white p-4 rounded-2xl shadow-inner mb-6 flex flex-col items-center max-w-[240px] w-full">
                <img 
                  src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Qris/DutaKlipQR.jpeg" 
                  alt="QRIS DutaKlip" 
                  className="w-full h-auto object-contain rounded-xl"
                />
                <span className="text-zinc-600 text-[11px] font-bold mt-2">Scan dengan E-Wallet / M-Banking</span>
              </div>

              {/* Close / Done Button */}
              <button
                onClick={onClose}
                className="w-full max-w-md bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-600/25 text-sm border-none cursor-pointer"
              >
                Selesai / Tutup
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