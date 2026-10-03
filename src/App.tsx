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
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // State untuk mengontrol Modal Upgrade
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Fungsi untuk mengecek user yang sedang login di Supabase
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
        
      if (data) setCurrentUser(data.username);
    } else {
      setCurrentUser(null);
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

  useEffect(() => {
    // Normalisasi fallback URL berbasis hash (#)
    if (window.location.hash === '#profile') {
      window.history.replaceState({}, '', '/profile');
      setCurrentPath('/profile');
    } else if (window.location.hash === '#rules') {
      window.history.replaceState({}, '', '/rules');
      setCurrentPath('/rules');
    } else if (window.location.hash === '#legal') {
      window.history.replaceState({}, '', '/legal');
      setCurrentPath('/legal');
    } else if (window.location.hash === '#top-contributors') {
      window.history.replaceState({}, '', '/top-contributors');
      setCurrentPath('/top-contributors');
    } else if (window.location.hash === '#upgrade' || window.location.pathname === '/upgrade') { 
      // Jika mengakses URL upgrade, buka modal dan arahkan ke beranda
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
      setIsUpgradeModalOpen(true);
    } else if (window.location.hash.startsWith('#creator/')) { 
      const targetPath = window.location.hash.replace('#', '/');
      window.history.replaceState({}, '', targetPath);
      setCurrentPath(targetPath);
    } else if (window.location.hash === '#') {
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
    }

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    // Intercept navigasi ke upgrade agar membuka modal
    if (path === '/upgrade' || path === '#upgrade') {
      setIsUpgradeModalOpen(true);
      return;
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.dispatchEvent(new Event('popstate'));
  };

  // ---------------------------------------------------------
  // LOGIKA GLOBAL: Penjaga Akses untuk Konten Eksklusif
  // ---------------------------------------------------------
  const handleExclusiveAccess = (isExclusive: boolean, onSuccessCallback: () => void) => {
    if (isExclusive && !currentUser) {
      // Jika konten eksklusif dan user belum login, paksa buka modal login
      setShowLoginModal(true); 
    } else {
      // Jika bukan eksklusif ATAU user sudah login, izinkan aksi berjalan
      onSuccessCallback(); 
    }
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
      />
    </div>
  );
}