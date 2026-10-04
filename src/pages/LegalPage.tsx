import { useState } from 'react';
import { ShieldAlert, BookOpen, UserCheck, Mail, ArrowLeft, RefreshCcw, Globe } from 'lucide-react';

const LegalPage = () => {
  const [lang, setLang] = useState<'en' | 'id'>('en');

  const handleGoBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  const T = {
    en: {
      toggleBtn: "ID", // Dibuat lebih singkat agar rapi di pojok
      title: "Legal, Terms & Disclaimer",
      subtitle: "Please read this information carefully. By accessing or using BatchTikTok, you agree to comply with the terms stated below.",
      t1_title: "1. Platform Purpose & Disclaimer",
      t1_p1: "BatchTikTok is a community-driven archiving tool designed to curate and structure publicly available links to regional content (specifically TikTok videos).",
      t1_p2: "We do not host, store, or upload any video files on our servers. All content remains on the original hosting platforms (e.g., Google Drive, Terabox, MediaFire). The platform merely acts as a directory or catalog of links submitted by users.",
      t2_title: "2. User Responsibility",
      t2_p1: "Users who submit links to BatchTikTok are solely responsible for ensuring they have the legal right to share those links.",
      t2_l1: "Do not post links containing illegal, explicit (NSFW), or malicious content.",
      t2_l2: "Do not use the platform for copyright infringement.",
      t2_l3: "We reserve the right to remove any link, collection, or user account that violates these terms without prior notice.",
      t3_title: "3. Copyright & DMCA Takedowns",
      t3_p1: "BatchTikTok respects the intellectual property rights of others. Because we do not host the actual files, we cannot remove the content from its original hosting service.",
      t3_p2: "However, if you are a copyright owner and find a link to your content indexed on our platform without authorization, you may request the link's removal from our directory. Please provide sufficient proof of ownership when submitting a takedown request.",
      t4_title: "4. Refund Policy (VIP Access)",
      t4_p1: "All purchases for VIP Access (Premium Membership) are final and non-refundable.",
      t4_p2: "Because our product is a digital service providing immediate access to premium features (such as ad-free downloads and global chat), we do not offer refunds once a transaction is completed and the account is upgraded. If you experience technical issues or accidental double-billing, please contact our support team immediately.",
      t5_title: "5. Contact Information",
      t5_p1: "If you have any questions, legal concerns, billing issues, or wish to submit a removal request, please contact the administrators directly via the platform or our support email: moekzigzag777@gmail.com",
      backBtn: "Return to Home"
    },
    id: {
      toggleBtn: "EN",
      title: "Legal, Syarat & Penafian",
      subtitle: "Harap baca informasi ini dengan saksama. Dengan mengakses atau menggunakan BatchTikTok, Anda setuju untuk mematuhi ketentuan yang tercantum di bawah ini.",
      t1_title: "1. Tujuan Platform & Penafian",
      t1_p1: "BatchTikTok adalah alat pengarsipan berbasis komunitas yang dirancang untuk mengkurasi dan menyusun tautan publik ke konten regional (khususnya video TikTok).",
      t1_p2: "Kami tidak meng-host, menyimpan, atau mengunggah file video apa pun di server kami. Semua konten tetap berada di platform hosting aslinya (mis. Google Drive, Terabox, MediaFire). Platform ini murni bertindak sebagai direktori atau katalog tautan yang dikirimkan oleh pengguna.",
      t2_title: "2. Tanggung Jawab Pengguna",
      t2_p1: "Pengguna yang mengirimkan tautan ke BatchTikTok bertanggung jawab penuh untuk memastikan mereka memiliki hak hukum untuk membagikan tautan tersebut.",
      t2_l1: "Jangan memposting tautan yang mengandung konten ilegal, eksplisit (NSFW), atau berbahaya.",
      t2_l2: "Jangan gunakan platform ini untuk pelanggaran hak cipta.",
      t2_l3: "Kami berhak menghapus tautan, koleksi, atau akun pengguna apa pun yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.",
      t3_title: "3. Hak Cipta & Takedown DMCA",
      t3_p1: "BatchTikTok menghormati hak kekayaan intelektual orang lain. Karena kami tidak meng-host file yang sebenarnya, kami tidak dapat menghapus konten dari layanan hosting aslinya.",
      t3_p2: "Namun, jika Anda adalah pemilik hak cipta dan menemukan tautan ke konten Anda diindeks di platform kami tanpa izin, Anda dapat meminta penghapusan tautan tersebut dari direktori kami. Harap berikan bukti kepemilikan yang memadai saat mengirimkan permintaan penghapusan.",
      t4_title: "4. Kebijakan Pengembalian Dana (Akses VIP)",
      t4_p1: "Semua pembelian untuk Akses VIP (Keanggotaan Premium) bersifat final dan tidak dapat dikembalikan (non-refundable).",
      t4_p2: "Karena produk kami adalah layanan digital yang memberikan akses langsung ke fitur premium (seperti unduhan tanpa iklan dan obrolan global), kami tidak menawarkan pengembalian dana setelah transaksi selesai dan akun ditingkatkan. Jika Anda mengalami masalah teknis atau penagihan ganda yang tidak disengaja, harap segera hubungi tim dukungan kami.",
      t5_title: "5. Informasi Kontak",
      t5_p1: "Jika Anda memiliki pertanyaan, masalah hukum, masalah penagihan, atau ingin mengirimkan permintaan penghapusan, silakan hubungi administrator langsung melalui platform atau email dukungan kami: moekzigzag777@gmail.com",
      backBtn: "Kembali ke Beranda"
    }
  };

  const content = T[lang];

  return (
    // Menambahkan class "relative" pada container utama layar
    <div className="relative min-h-screen bg-[#F8FAFC] pt-24 pb-16 px-6 sm:px-8 font-sans">
      
      {/* Tombol Toggle Bahasa: Sekarang menggunakan absolute positioning agar melayang di pojok kanan atas */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50 animate-in fade-in duration-500">
        <button 
          onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 transition-all active:scale-95 cursor-pointer"
          title="Ganti Bahasa / Switch Language"
        >
          <Globe size={16} className="text-blue-600" />
          <span>{lang === 'en' ? 'Translate to ID' : 'Switch to EN'}</span>
        </button>
      </div>

      {/* Kontainer Utama Konten - Sekarang bebas dari tombol */}
      <div className="max-w-4xl mx-auto mt-4 sm:mt-0">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm mb-5">
            <ShieldAlert size={36} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            {content.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl">
            {content.subtitle}
          </p>
        </div>

        {/* Legal Content */}
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          
          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <BookOpen className="text-blue-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{content.t1_title}</h3>
              <div className="text-slate-600 mt-2 leading-relaxed font-medium space-y-3">
                <p><strong>BatchTikTok</strong> {content.t1_p1.replace('BatchTikTok ', '')}</p>
                <p>{content.t1_p2}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <UserCheck className="text-emerald-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{content.t2_title}</h3>
              <div className="text-slate-600 mt-2 leading-relaxed font-medium space-y-3">
                <p>{content.t2_p1}</p>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>{content.t2_l1}</li>
                  <li>{content.t2_l2}</li>
                  <li>{content.t2_l3}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-rose-50/50 border-none shadow-sm hover:shadow-md transition-shadow">
            <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-rose-900 text-lg">{content.t3_title}</h3>
              <div className="text-rose-800/90 mt-2 leading-relaxed font-medium space-y-3">
                <p>{content.t3_p1}</p>
                <p>{content.t3_p2}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <RefreshCcw className="text-orange-500 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{content.t4_title}</h3>
              <div className="text-slate-600 mt-2 leading-relaxed font-medium space-y-3">
                <p className="font-bold">{content.t4_p1}</p>
                <p>{content.t4_p2}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 p-6 sm:p-8 rounded-3xl bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <Mail className="text-indigo-400 shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{content.t5_title}</h3>
              <div className="text-slate-600 mt-2 leading-relaxed font-medium space-y-3">
                <p>{content.t5_p1}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex justify-center pb-10">
          <button 
            onClick={handleGoBack} 
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-none hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <ArrowLeft size={20} />
            {content.backBtn}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LegalPage;