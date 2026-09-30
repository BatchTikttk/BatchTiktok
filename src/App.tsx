import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Profile from './pages/Profile'; 

export default function App() {
  // Menggunakan pathname (/profile) dari URL, bukan hash (#)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Pengecekan ekstra: Jika pengguna terlanjur membuka link dengan hash lama, 
    // kita bersihkan otomatis dan ubah ke URL bersih (path)
    if (window.location.hash === '#profile') {
      window.history.replaceState({}, '', '/profile');
      setCurrentPath('/profile');
    } else if (window.location.hash === '#') {
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
    }

    // Mendengarkan tombol back/forward pada browser
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fungsi navigasi kustom untuk mengganti URL tanpa reload halaman
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    // Memicu event agar komponen lain tahu URL berubah (jika diperlukan)
    window.dispatchEvent(new Event('popstate'));
  };

  // Jika URL saat ini adalah /profile, render halaman Profile
  if (currentPath === '/profile') {
    return (
      <Profile 
        currentUser={null} 
        onBack={() => navigateTo('/')} // Kembali ke halaman utama dengan URL bersih (/)
      />
    );
  }

  // Default render halaman Home
  return <Home />;
}