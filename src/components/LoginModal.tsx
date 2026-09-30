import React, { useState } from 'react';
import { User, Mail, Lock, X, Loader2, Folder } from 'lucide-react';
import { supabase } from '../supabase';

export default function LoginModal({ onClose, onSuccess, showToast, EmeraldFolderIcon }: any) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (isRegistering) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });

      if (authError) {
        showToast(authError.message, 'error');
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { id: authData.user.id, username: authUsername }
          ]);
          
        if (profileError) {
          showToast('Failed to create profile', 'error');
          setIsLoading(false);
          return;
        }
        
        showToast('Registration successful! Please sign in.', 'success');
        setIsRegistering(false);
        setAuthPassword(''); 
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        showToast(error.message, 'error');
        setIsLoading(false);
        return;
      }
      
      await onSuccess();
      onClose();
      showToast('Successfully signed in!', 'success');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          disabled={isLoading}
          className="absolute top-5 right-5 z-20 p-2 bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all border-none"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            
            {/* Logo & Judul persis seperti Navbar */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center">
                {EmeraldFolderIcon ? (
                  <EmeraldFolderIcon className="w-8 h-8 drop-shadow-md" />
                ) : (
                  <Folder className="w-8 h-8 text-emerald-500 fill-emerald-500 drop-shadow-md" />
                )}
              </div>
              <span className="text-xl font-extrabold text-slate-800 tracking-tight">
                Batch<span className="text-emerald-500">Tiktok</span>
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {isRegistering 
                ? 'Join us to start sharing your collections.' 
                : 'Enter your credentials to access your account.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            
            {isRegistering && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Username (Max 15 characters)" 
                  value={authUsername}
                  onChange={e => setAuthUsername(e.target.value)}
                  maxLength={15}
                  disabled={isLoading}
                  className="w-full pl-12 pr-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input 
                type="email" 
                required
                placeholder="Email Address" 
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input 
                type="password" 
                required
                minLength={6}
                placeholder="Password (Min. 6 characters)" 
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.35)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border-none disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> 
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isRegistering ? 'Sign Up' : 'Sign In'}</span>
              )}
            </button>
          </form>
          
          {/* Footer Toggle */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                disabled={isLoading}
                className="ml-1.5 font-bold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-4 bg-transparent border-none p-0 transition-colors"
              >
                {isRegistering ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}