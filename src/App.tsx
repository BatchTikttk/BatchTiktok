import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Profile from './pages/Profile';
import RulesPage from './pages/RulesPage';
import LegalPage from './pages/LegalPage';
import TopContributors from './pages/TopContributors';
import CreatorPage from './pages/CreatorPage'; 
import UpgradeModal from './components/UpgradeModal';
import ChatGroup from './components/ChatGroup';
import LoginModal from './components/LoginModal';
import { supabase } from './supabase';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // State untuk mengontrol Modal Upgrade
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Fungsi untuk mengecek user yang sedang login di Supabase
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Coba ambil username dan status premium
      const { data, error } = await supabase
        .from('profiles')
        .select('username, is_premium')
        .eq('id', session.user.id)
        .single();
        
      if (data && !error) {
        setCurrentUser(data.username);
        setIsPremiumUser(data.is_premium || false);
      } else {
        // Fallback aman: jika kolom is_premium belum ada di database, cegah aplikasi crash
        const { data: fallbackData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
          
        if (fallbackData) {
          setCurrentUser(fallbackData.username);
          setIsPremiumUser(false);
        }
      }
    } else {
      setCurrentUser(null);
      setIsPremiumUser(false);
    }
  };

  useEffect(() => {
    checkUser();

    // Listener realtime untuk perubahan status autentikasi Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Manajemen Routing Utama
  useEffect(() => {
    // Normalisasi fallback URL berbasis hash (#) dan Upgrade routing
    const hash = window.location.hash;
    const path = window.location.pathname;

    if (hash === '#upgrade' || path === '/upgrade') {
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
      if (!currentUser) {
        setShowLoginModal(true);
      } else {
        setIsUpgradeModalOpen(true);
      }
    } else if (hash === '#profile') {
      window.history.replaceState({}, '', '/profile');
      setCurrentPath('/profile');
    } else if (hash === '#rules') {
      window.history.replaceState({}, '', '/rules');
      setCurrentPath('/rules');
    } else if (hash === '#legal') {
      window.history.replaceState({}, '', '/legal');
      setCurrentPath('/legal');
    } else if (hash === '#top-contributors') {
      window.history.replaceState({}, '', '/top-contributors');
      setCurrentPath('/top-contributors');
    } else if (hash.startsWith('#creator/')) { 
      const targetPath = hash.replace('#', '/');
      window.history.replaceState({}, '', targetPath);
      setCurrentPath(targetPath);
    } else if (hash === '#') {
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
    }

    const handlePopState = () => {
      const currentLoc = window.location.pathname;
      if (currentLoc === '/upgrade' || window.location.hash === '#upgrade') {
        if (!currentUser) {
          setShowLoginModal(true);
        } else {
          setIsUpgradeModalOpen(true);
        }
        window.history.replaceState({}, '', '/');
        setCurrentPath('/');
      } else {
        setCurrentPath(currentLoc);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]); // Tambahkan currentUser sebagai dependency agar nilainya selalu up-to-date

  // Tambahan: Global Event Listener agar modal bisa dipanggil dari komponen manapun dengan CustomEvent
  useEffect(() => {
    const handleOpenModal = () => {
      if (!currentUser) {
        setShowLoginModal(true);
      } else {
        setIsUpgradeModalOpen(true);
      }
    };
    window.addEventListener('openUpgradeModal', handleOpenModal);
    return () => window.removeEventListener('openUpgradeModal', handleOpenModal);
  }, [currentUser]);

  // Tambahan: Global Event Listener untuk memanggil Login Modal jika dibutuhkan dari komponen lain
  useEffect(() => {
    const handleOpenLogin = () => setShowLoginModal(true);
    window.addEventListener('openLoginModal', handleOpenLogin as EventListener);
    return () => window.removeEventListener('openLoginModal', handleOpenLogin as EventListener);
  }, []);

  const navigateTo = (path: string) => {
    // Intercept path upgrade agar memunculkan modal alih-alih berpindah halaman
    if (path === '/upgrade' || path === '#upgrade') {
      if (!currentUser) {
        setShowLoginModal(true);
      } else {
        setIsUpgradeModalOpen(true);
      }
      return;
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.dispatchEvent(new Event('popstate'));
  };

  // ---------------------------------------------------------
  // LOGIKA GLOBAL: Penjaga Akses untuk Konten Eksklusif
  // ---------------------------------------------------------
  // Kita menggunakan `any` pada interface fungsi untuk bypass Type Error di Vercel
  // karena CreatorPage mungkin masih mengirimkan 2 argumen sedangkan Home mengirim 3.
  const handleExclusiveAccess: any = (
    isExclusive: boolean, 
    arg2: string | (() => void), 
    arg3?: () => void
  ) => {
    // Menentukan letak variabel karena jumlah argumen yang masuk bisa berbeda
    const uploadedBy = typeof arg2 === 'string' ? arg2 : '';
    const onSuccessCallback = typeof arg2 === 'function' ? arg2 : arg3;

    // 1. Jika bukan eksklusif
    if (!isExclusive) {
      onSuccessCallback?.(); 
      return;
    }

    // 2. Jika belum login sama sekali
    if (!currentUser) {
      setShowLoginModal(true); 
      return;
    }

    // 3. Pengecualian: User yang login adalah uploader asli (Bypass Premium)
    if (uploadedBy && currentUser.toLowerCase() === uploadedBy.toLowerCase()) {
      onSuccessCallback?.();
      return;
    }

    // 4. Pengecualian: User memiliki akses Premium aktif
    if (isPremiumUser) {
      onSuccessCallback?.();
      return;
    }

    // 5. User biasa (sudah login tapi bukan premium dan bukan pemilik konten)
    setIsUpgradeModalOpen(true);
  };

  const renderPage = () => {
    if (currentPath === '/profile') {
      return (
        <Profile 
          currentUser={currentUser} 
          onBack={() => navigateTo('/')}
        />
      );
    }

    if (currentPath === '/rules') {
      return <RulesPage />;
    }

    if (currentPath === '/legal') {
      return <LegalPage />;
    }

    if (currentPath === '/top-contributors') {
      return <TopContributors />;
    }

    if (currentPath.startsWith('/creator/')) {
      const username = decodeURIComponent(currentPath.split('/creator/')[1] || '');
      return (
        <CreatorPage 
          username={username} 
          onCheckAccess={handleExclusiveAccess} 
        />
      );
    }

    return (
      <Home 
        onCheckAccess={handleExclusiveAccess}
        isUserPremium={isPremiumUser}
        onOpenUpgradeModal={() => {
          if (!currentUser) {
            setShowLoginModal(true);
          } else {
            setIsUpgradeModalOpen(true);
          }
        }}
      />
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Halaman aktif */}
      {renderPage()}

      {/* Floating Chat Group yang muncul di semua halaman */}
      <ChatGroup 
        currentUser={currentUser} 
        setShowLoginModal={() => setShowLoginModal(true)} 
      />

      {/* Modal Login jika user mencoba kirim pesan dari Chat Group saat belum login */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSuccess={checkUser}
          showToast={(msg: string) => console.log(msg)}
        />
      )}

      {/* Modal Upgrade Membership */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        onOpenLoginModal={() => setShowLoginModal(true)}
      />
    </div>
  );
}