import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Profile from './pages/Profile';
import RulesPage from './pages/RulesPage';
import LegalPage from './pages/LegalPage';
import TopContributors from './pages/TopContributors';
import CreatorPage from './pages/CreatorPage'; 
import PreviewPage from './pages/PreviewPage';
import Pay from './pages/Pay';
import ChatGroup from './components/ChatGroup';
import LoginModal from './components/LoginModal';
import UpgradeModal from './components/UpgradeModal';
import CsModal from './components/CsModal';
import { supabase } from './supabase';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCsModal, setShowCsModal] = useState(false);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, is_premium')
        .eq('id', session.user.id)
        .single();
        
      if (data && !error) {
        setCurrentUser(data.username);
        setIsPremiumUser(data.is_premium || false);
      } else {
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

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;

    if (hash === '#upgrade' || path === '/upgrade' || hash === '#pay' || path === '/pay') {
      window.history.replaceState({}, '', '/pay');
      setCurrentPath('/pay');
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
    } else if (hash.startsWith('#preview/')) {
      const targetPath = hash.replace('#', '/');
      window.history.replaceState({}, '', targetPath);
      setCurrentPath(targetPath);
    } else if (hash === '#') {
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
    }

    const handlePopState = () => {
      const currentLoc = window.location.pathname;
      if (currentLoc === '/upgrade' || window.location.hash === '#upgrade' || currentLoc === '/pay' || window.location.hash === '#pay') {
        window.history.replaceState({}, '', '/pay');
        setCurrentPath('/pay');
      } else {
        setCurrentPath(currentLoc);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); 

  // Event listener untuk memunculkan UpgradeModal
  useEffect(() => {
    const handleOpenModal = () => {
      setShowUpgradeModal(true);
    };
    window.addEventListener('openUpgradeModal', handleOpenModal);
    return () => window.removeEventListener('openUpgradeModal', handleOpenModal);
  }, []);

  // Event listener untuk memunculkan LoginModal
  useEffect(() => {
    const handleOpenLogin = () => setShowLoginModal(true);
    window.addEventListener('openLoginModal', handleOpenLogin as EventListener);
    return () => window.removeEventListener('openLoginModal', handleOpenLogin as EventListener);
  }, []);

  // Event listener untuk memunculkan CsModal
  useEffect(() => {
    const handleOpenCs = () => setShowCsModal(true);
    window.addEventListener('openCsModal', handleOpenCs as EventListener);
    return () => window.removeEventListener('openCsModal', handleOpenCs as EventListener);
  }, []);

  const navigateTo = (path: string) => {
    const targetPath = (path === '/upgrade' || path === '#upgrade') ? '/pay' : path;
    window.history.pushState({}, '', targetPath);
    setCurrentPath(targetPath);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleExclusiveAccess: any = (
    isExclusive: boolean, 
    arg2: string | (() => void), 
    arg3?: () => void
  ) => {
    const uploadedBy = typeof arg2 === 'string' ? arg2 : '';
    const onSuccessCallback = typeof arg2 === 'function' ? arg2 : arg3;

    if (uploadedBy && currentUser && currentUser.toLowerCase() === uploadedBy.toLowerCase()) {
      onSuccessCallback?.();
      return;
    }

    if (!isExclusive) {
      onSuccessCallback?.(); 
      return;
    }

    if (!currentUser) {
      setShowLoginModal(true); 
      return;
    }

    if (isPremiumUser) {
      onSuccessCallback?.();
      return;
    }

    setShowUpgradeModal(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsPremiumUser(false);
    navigateTo('/');
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

    if (currentPath === '/pay') {
      return (
        <Pay 
          currentUser={currentUser} 
          handleLogout={handleLogout}
        />
      );
    }

    if (currentPath.startsWith('/creator/')) {
      const username = decodeURIComponent(currentPath.split('/creator/')[1] || '');
      return (
        <CreatorPage 
          username={username} 
          isUserPremium={isPremiumUser}
          currentUser={currentUser}
          onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        />
      );
    }

    if (currentPath.startsWith('/preview/')) {
      const itemId = currentPath.split('/preview/')[1];
      const itemData = window.history.state?.item || null;

      return (
        <PreviewPage 
          itemId={itemId}
          itemData={itemData}
          isUserPremium={isPremiumUser}
          currentUser={currentUser}
          onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        />
      );
    }

    return (
      <Home 
        onCheckAccess={handleExclusiveAccess}
        isUserPremium={isPremiumUser}
        currentUser={currentUser}
        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
      />
    );
  };

  return (
    <div className="relative min-h-screen">
      {renderPage()}

      <ChatGroup 
        currentUser={currentUser} 
        setShowLoginModal={() => setShowLoginModal(true)} 
      />

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSuccess={checkUser}
          showToast={(msg: string) => console.log(msg)}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal 
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onOpenLoginModal={() => setShowLoginModal(true)}
        />
      )}

      {showCsModal && (
        <CsModal 
          isOpen={showCsModal}
          onClose={() => setShowCsModal(false)}
          currentUser={currentUser}
          onOpenLoginModal={() => setShowLoginModal(true)}
        />
      )}
    </div>
  );
}