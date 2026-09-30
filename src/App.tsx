import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Profile from './pages/Profile'; 
export default function App() {
  // Menggunakan hash dari URL untuk sistem routing sederhana (tanpa library tambahan)
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  useEffect(() => {
    // Mendengarkan setiap perubahan pada URL Hash (contoh: domain.com/#profile)
    const handleRouteChange = () => {
      setCurrentRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  // Jika URL mengandung #profile, render halaman Profile
  if (currentRoute === '#profile') {
    return (
      <Profile 
        currentUser={null} // Profile.tsx sudah mandiri mengambil data session dari Supabase
        onBack={() => { window.location.hash = ''; }} // Kembali ke halaman utama (menghapus hash)
      />
    );
  }

  // Default render halaman Home
  return <Home />;
}