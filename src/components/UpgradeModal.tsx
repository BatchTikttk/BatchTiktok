import { Check, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void;
}

const CONTENT = {
  title: 'Upgrade to',
  titleHighlight: 'Premium',
  subtitle: 'One-time payment for unlimited access to all exclusive video collections.',
  price: 'Rp 50,000',
  guarantee: 'Instant activation after manual verification',
  secureNotice: 'Secure & Instant Payment Page',
  ctaButton: 'Proceed to Payment',
  featuresHeader: 'Member Benefits',
  features: [
    'Access to all Exclusive Content',
    'Priority queue for custom batch requests',
    'Exclusive VIP Avatar Border',
    'Premium card background for the contribution page'
  ]
};

export default function UpgradeModal({ isOpen, onClose, onOpenLoginModal }: UpgradeModalProps) {
  if (!isOpen) return null;

  const handleProceedToPayment = async () => {
    // Cek apakah user sudah login atau belum melalui Supabase session[cite: 13, 15]
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      onClose(); // Tutup modal upgrade[cite: 13, 15]
      if (onOpenLoginModal) {
        onOpenLoginModal(); // Buka modal login[cite: 13, 15]
      } else {
        window.dispatchEvent(new CustomEvent('openLoginModal'));
      }
      return;
    }

    // Jika sudah login, arahkan ke halaman payment[cite: 13, 15]
    onClose();
    window.history.pushState({}, '', '/pay');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md transition-opacity overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl my-auto">
        <button 
          onClick={onClose}
          className="absolute -top-4 right-1 md:-right-10 md:-top-2 z-[60] text-zinc-400 hover:text-white bg-transparent border-none p-1 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>

        <div className="bg-zinc-900 rounded-[2rem] w-full overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-zinc-800/50 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          <div className="bg-amber-600 px-6 py-6 md:px-8 md:py-10 text-center relative">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-1.5 md:mb-2 tracking-tight mt-1 md:mt-2">
              {CONTENT.title} <span className="text-amber-200">{CONTENT.titleHighlight}</span>
            </h2>
            <p className="text-amber-100 text-xs md:text-base max-w-md mx-auto font-medium opacity-90">
              {CONTENT.subtitle}
            </p>
          </div>

          <div className="p-5 md:p-10 flex flex-col items-center w-full">
            <div className="w-full flex flex-col items-center mb-5 md:mb-8">
              <h3 className="text-zinc-100 font-bold text-base md:text-lg mb-3 md:mb-6 text-center tracking-wide">
                {CONTENT.featuresHeader}
              </h3>
              <ul className="w-full max-w-md space-y-2.5 md:space-y-4 flex flex-col items-center text-center mx-auto">
                {CONTENT.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center justify-center gap-2.5 text-center w-full">
                    <Check size={16} className="text-amber-500 shrink-0 stroke-[2.5] md:w-[18px] md:h-[18px]" />
                    <span className="text-zinc-300 text-xs md:text-sm font-medium leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full border-t border-zinc-800/80 mb-5 md:mb-8"></div>

            <div className="w-full flex flex-col items-center">
              <div className="mb-4 md:mb-6 text-center">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl md:text-5xl font-black text-amber-500 tracking-tight">
                    {CONTENT.price}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] md:text-xs mt-1 md:mt-2 font-medium">
                  {CONTENT.guarantee}
                </p>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full max-w-md bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 md:py-4 rounded-xl transition-all shadow-lg shadow-amber-600/20 text-xs md:text-sm border-none cursor-pointer"
              >
                {CONTENT.ctaButton}
              </button>

              <p className="text-zinc-400 text-[11px] md:text-xs mt-3 md:mt-4 font-medium flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-500 md:w-4 md:h-4" />
                {CONTENT.secureNotice}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}