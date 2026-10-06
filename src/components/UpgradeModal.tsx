import { useEffect, useState } from 'react';
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
  subtitle: 'One-time payment for unlimited access to all folder collections.',
  price: 'Rp 50,000',
  guarantee: 'Instant activation after payment verification',
  ctaButton: 'Get Premium Access',
  secureNotice: 'Secure & Verified Payment',
  featuresHeader: 'Member Benefits',
  features: [
    'Access to all Exclusive Content',
    'Priority queue for custom batch requests',
    'Exclusive VIP Avatar Border',
    'Premium card background for the contribution page'
  ]
};

// Global declaration for the window object so TypeScript doesn't throw an error when calling window.snap
declare global {
  interface Window {
    snap: any;
  }
}

export default function UpgradeModal({ isOpen, onClose, onOpenLoginModal }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Load Midtrans Snap.js script when the modal is opened
  useEffect(() => {
    if (!isOpen) return;

    // Midtrans Sandbox URL
    const snapScriptUrl = 'https://app.midtrans.com/snap/snap.js';
    
    // Call Client Key from the Vite .env file
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY; 

    // Check to ensure the script is not loaded repeatedly
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
      // 1. Get the currently logged-in user data from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // SMART LOGIC: If the user is NOT LOGGED IN
      if (userError || !user) {
        onClose(); // Close the upgrade modal
        if (onOpenLoginModal) {
          onOpenLoginModal(); // Open the login modal
        } else {
          // Fallback event if the prop is not explicitly passed
          window.dispatchEvent(new CustomEvent('openLoginModal'));
        }
        return;
      }

      // 2. If the user IS LOGGED IN: Call the Supabase Edge Function 'midtrans-payment'
      const { data, error } = await supabase.functions.invoke('midtrans-payment', {
        body: { 
          amount: 50000,
          user_id: user.id // Send the active user ID so the webhook can read its destination
        }
      });

      if (error) {
        console.error('Supabase Error:', error);
        throw new Error('Failed to invoke function from Supabase');
      }

      if (!data?.token) {
        throw new Error('Payment token not found');
      }

      // 3. Show the Midtrans UI popup
      window.snap.pay(data.token, {
        onSuccess: function (result: any) {
          console.log('Sandbox Payment SUCCESS:', result);
          alert('Payment Successful! Your account status will be updated shortly.');
          onClose(); // Auto-close the modal upon success
        },
        onPending: function (result: any) {
          console.log('Sandbox Payment PENDING:', result);
          alert('Waiting for the payment to be completed.');
        },
        onError: function (result: any) {
          console.log('Sandbox Payment FAILED:', result);
          alert('Payment failed.');
        },
        onClose: function () {
          console.log('User closed the popup without completing the payment');
        }
      });
    } catch (error: any) {
      console.error('An error occurred:', error);
      alert(error.message || 'Failed to process payment. Check the browser console for details.');
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

              {/* CTA Button with Loading State */}
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full max-w-md bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-600/20 text-sm border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connecting to Midtrans...' : CONTENT.ctaButton}
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