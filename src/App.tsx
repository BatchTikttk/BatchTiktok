import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Profile from './pages/Profile';
import RulesPage from './pages/RulesPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    if (window.location.hash === '#profile') {
      window.history.replaceState({}, '', '/profile');
      setCurrentPath('/profile');
    } else if (window.location.hash === '#rules') {
      window.history.replaceState({}, '', '/rules');
      setCurrentPath('/rules');
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
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.dispatchEvent(new Event('popstate'));
  };

  if (currentPath === '/profile') {
    return (
      <Profile 
        currentUser={null} 
        onBack={() => navigateTo('/')}
      />
    );
  }

  if (currentPath === '/rules') {
    return <RulesPage />;
  }

  return <Home />;
}