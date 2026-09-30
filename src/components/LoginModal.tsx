import React, { useState } from 'react';
import { User, Mail, Lock, X, Loader2, Folder, Eye, EyeOff, Check } from 'lucide-react';
import { supabase } from '../supabase';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Masukkan Client ID dari dashboard Google Cloud / Supabase Anda
const GOOGLE_CLIENT_ID = "1067355347912-mvrekrrcgai9sbibseamcbtq4e65ce4v.apps.googleusercontent.com";

// Wrapper Provider agar GoogleLogin berfungsi
export default function LoginModalWrapper(props: any) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginModal {...props} />
    </GoogleOAuthProvider>
  );
}

function LoginModal({ onClose, onSuccess, showToast, EmeraldFolderIcon }: any) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    
    if (isRegistering) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`, 
        }
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
          showToast('Gagal membuat profil: ' + profileError.message, 'error');
          setIsLoading(false);
          return;
        }
        
        setIsLoading(false);
        setIsSuccess(true);
        showToast('Registrasi berhasil! Email verifikasi telah dikirim.', 'success');
        
        setTimeout(() => {
          setIsSuccess(false);
          setIsRegistering(false);
          setAuthPassword(''); 
        }, 3000);
        return;
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
      showToast('Berhasil masuk!', 'success');
    }
    
    setIsLoading(false);
  };

  // Fungsi khusus untuk menangani ID Token dari Google
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });
      
      if (error) throw error;
      
      if (data.session) {
        await onSuccess();
        onClose();
        showToast('Berhasil masuk dengan Google!', 'success');
      }
    } catch (err: any) {
      showToast('Gagal memproses Google Login: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading && !isSuccess ? onClose : undefined}
      ></div>
      
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={onClose} 
          disabled={isLoading || isSuccess}
          className="absolute top-5 right-5 z-20 p-2 bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all border-none"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
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
                  disabled={isLoading || isSuccess}
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
                disabled={isLoading || isSuccess}
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Password (Min. 6 characters)" 
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                disabled={isLoading || isSuccess}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isSuccess}
                className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center bg-transparent border-none outline-none text-slate-400 hover:text-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || isSuccess}
              className={`w-full py-3.5 mt-2 rounded-2xl ${isSuccess ? 'bg-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700'} text-white font-bold shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.35)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border-none disabled:opacity-80 disabled:pointer-events-none`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> 
                  <span>Memproses...</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check size={20} className="animate-in zoom-in duration-300" />
                  <span>Verifikasi Terkirim!</span>
                </>
              ) : (
                <span>{isRegistering ? 'Sign Up' : 'Sign In'}</span>
              )}
            </button>
          </form>
          
          {/* Garis Pemisah & Tombol Login Google */}
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2">
              <span className="h-px w-full bg-slate-200"></span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">ATAU</span>
              <span className="h-px w-full bg-slate-200"></span>
            </div>

            <div className="relative w-full mt-5 h-[52px] rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer overflow-hidden">
              {/* Desain UI Tombol */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 text-slate-700 font-bold pointer-events-none">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In With Google
              </div>

              {/* Komponen Asli Google (Transparan) */}
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.01] z-10 cursor-pointer flex items-center justify-center transform scale-[3]">
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={() => showToast('Login Google dibatalkan', 'error')} 
                  useOneTap={false} 
                />
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              <button 
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setIsSuccess(false);
                }}
                disabled={isLoading || isSuccess}
                className="ml-1.5 font-bold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-4 bg-transparent border-none p-0 transition-colors cursor-pointer"
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