import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface AgeVerificationProps {
  onConfirm: () => void;
  onClose: () => void;
}

export default function AgeVerification({ onConfirm, onClose }: AgeVerificationProps) {
  const handleAccept = () => {
    // Save verification status to localStorage so it only appears once
    localStorage.setItem('age_verified', 'true');
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Icon without background container for a clean look */}
        <div className="flex justify-center mb-4 pt-2">
          <ShieldAlert size={52} className="text-pink-600 drop-shadow-sm" />
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">
          Age Verification (18+)
        </h3>
        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
          This archive or collection contains mature or adult content (18+). You must confirm that you are of legal age to view or download this content.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-sm"
          >
            Go Back
          </button>
          <button 
            type="button"
            onClick={handleAccept}
            className="w-full py-3 rounded-2xl font-bold text-white bg-pink-600 hover:bg-pink-700 transition-colors shadow-lg shadow-pink-500/30 cursor-pointer text-sm"
          >
            I am 18+
          </button>
        </div>

      </div>
    </div>
  );
}