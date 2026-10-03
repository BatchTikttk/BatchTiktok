import React from 'react';

interface UpgradeMembershipProps {
  onBack?: () => void;
}

export default function UpgradeMembership({ onBack }: UpgradeMembershipProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handlePayment = () => {
    window.open('https://wa.me/your_number', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 p-4 md:p-8 font-sans">
      
      {/* Navigasi Kiri Atas & Pilihan Bahasa */}
      <div className="max-w-5xl mx-auto mb-10 flex flex-wrap gap-4 justify-between items-center">
        <button
          onClick={handleBack}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Kembali ke Beranda
        </button>

        {/* Pemilih Bahasa */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-emerald-500 opacity-80 text-lg">🌐</span>
          <button className="text-slate-400 hover:text-white transition-colors">
            English
          </button>
          <button className="bg-emerald-500 text-black px-4 py-1.5 rounded-full hover:bg-emerald-400 transition-colors">
            Bahasa Indonesia
          </button>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="max-w-4xl mx-auto">
        
        {/* Header Teks Tengah */}
        <div className="text-center mb-12">
          <div className="inline-block border border-yellow-600/50 text-yellow-500 text-xs px-3 py-1 rounded-full mb-6 bg-yellow-900/10">
            AKSES SEUMUR HIDUP
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Akses Semua Koleksi <br className="hidden md:block" />
            Premium Tanpa Batas
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Dapatkan akses seumur hidup ke seluruh folder eksklusif tiktok hanya dengan sekali bayar. <br className="hidden md:block" />
            Tanpa biaya bulanan selamanya.
          </p>
        </div>

        {/* Layout 2 Kolom Tanpa Border */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          
          {/* Kolom Kiri: Harga */}
          <div className="flex-1 bg-[#111827] rounded-2xl p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Lifetime Access Pass</h2>
                <p className="text-slate-400 text-xs mt-1">Bayar sekali, nikmati selamanya</p>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded font-medium">
                LIFETIME VIP
              </div>
            </div>

            <div className="mt-8 mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-bold text-white">Rp 50.000</span>
                <span className="text-emerald-400 text-sm font-medium">/ SEKALI BAYAR</span>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Akses langsung aktif setelah verifikasi pembayaran
              </p>
            </div>

            <button
              onClick={handlePayment}
              className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Dapatkan Akses Premium Sekarang
            </button>
            <p className="text-center text-slate-500 text-xs mt-3">
              Encrypted & Verified Secure Payment
            </p>
          </div>

          {/* Kolom Kanan: Benefit */}
          <div className="flex-1 bg-[#111827] rounded-2xl p-6 md:p-8">
            <h2 className="text-white font-semibold text-lg mb-6">
              Keuntungan Membership Premium
            </h2>
            
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">✓</span> 
                Akses seumur hidup ke semua folder Eksklusif & VIP
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">✓</span> 
                Unduh batch kecepatan tinggi tanpa batas
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">✓</span> 
                Akses lebih awal untuk pembaruan konten harian & kreator baru
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">✓</span> 
                Pengalaman bebas iklan dengan tautan unduhan langsung
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">✓</span> 
                Dukungan pelanggan prioritas via WhatsApp / Telegram
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">✓</span> 
                Tanpa biaya langganan bulanan atau biaya tersembunyi
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}