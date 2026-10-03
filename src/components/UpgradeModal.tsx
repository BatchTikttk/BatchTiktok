import { Crown, ShieldCheck } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTENT = {
  title: 'Upgrade to',
  titleHighlight: 'Premium',
  subtitle: 'One-time payment for unlimited access to all folder collections.',
  planTitle: 'VIP Access',
  price: 'Rp 50,000',
  guarantee: 'Instant activation after payment verification',
  ctaButton: 'Get Premium Access',
  secureNotice: 'Secure & Verified Payment',
  featuresHeader: 'Member Benefits',
  features: [
    'Full access to all creator archive collections',
    'Direct download links (Google Drive & TeraBox) without ads',
    'Priority queue for custom batch requests',
    'Exclusive VIP profile badge & global chat access',
    'Daily archive synchronization updates'
  ]
};

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  const handlePayment = () => {
    window.open('https://wa.me/your_number', '_blank');
  };

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container: Borderless Dark Mode Card */}
      <div className="bg-zinc-900 rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-200 border-none">
        
        {/* Header: Solid Emerald Gradient */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-8 md:py-10 text-center relative shadow-inner">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-emerald-50 hover:text-white transition-colors bg-black/10 hover:bg-black/20 rounded-full cursor-pointer p-2 backdrop-blur-sm border-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight mt-2 drop-shadow-sm">
            {CONTENT.title} <span className="text-zinc-900">{CONTENT.titleHighlight}</span>
          </h2>
          <p className="text-emerald-50 text-sm md:text-base max-w-md mx-auto font-medium">
            {CONTENT.subtitle}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-10 flex flex-col w-full">
          
          {/* Features Section (Benefit VIP di atas) */}
          <div className="w-full flex flex-col mb-8">
            <h3 className="text-zinc-100 font-bold text-lg mb-6 text-center">
              {CONTENT.featuresHeader}
            </h3>
            <ul className="w-full max-w-md space-y-4 flex flex-col mx-auto">
              {CONTENT.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3.5 text-left w-full">
                  <Crown 
                    size={20} 
                    className="text-emerald-400 fill-emerald-400/20 shrink-0 mt-0.5" 
                  />
                  <span className="text-zinc-300 text-sm font-medium leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full border-t border-zinc-800/80 mb-8"></div>

          {/* Plan & Pricing Section (Nominal di bawah) */}
          <div className="w-full flex flex-col items-center">
            <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider mb-2">
              {CONTENT.planTitle}
            </h3>

            <div className="mb-6 text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight">
                  {CONTENT.price}
                </span>
              </div>
              <p className="text-zinc-500 text-xs mt-2 font-medium">
                {CONTENT.guarantee}
              </p>
            </div>

            <button
              onClick={handlePayment}
              className="w-full max-w-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm border-none cursor-pointer"
            >
              {CONTENT.ctaButton}
            </button>
            <p className="text-zinc-500 text-xs mt-4 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-500" />
              {CONTENT.secureNotice}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}