import { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  FileVideo, 
  Link2, 
  Scale, 
  DollarSign, 
  ArrowLeft,
  UserCheck,
  Cloud,
  BookOpen,
  Award,
  GitMerge,
  ShieldCheck,
  History,
  Crown,
  Zap,
  Download,
  Globe,
  User,
  Video
} from 'lucide-react';

const RulesPage = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [lang, setLang] = useState<'en' | 'id'>('en');

  const handleGoBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  const T = {
    en: {
      toggleBtn: "ID",
      backBtn: "Return to Home",
      title: "Community Center",
      subtitle: "Guidelines, achievements, and documentation.",
      tabs: {
        rules: "Guidelines & Rules",
        premium: "Premium Benefits",
        badges: "Badges System",
        editing: "Editing Flow"
      },
      premium: {
        title: "Premium Member Benefits",
        subtitle: "Upgrade your account to unlock full access and exclusive customization features.",
        f1_title: "Access to All Exclusive Content",
        f1_desc: "Unlock unrestricted access to our highly curated Premium Collections and folder archives marked with the golden crown.",
        f2_title: "Ad-Free Direct Download Links",
        f2_desc: "Get clean, direct download links for Google Drive & TeraBox files without shortlinks, wait timers, or pop-up advertisements.",
        f3_title: "Priority Queue for Custom Batch Requests",
        f3_desc: "Need a specific TikTok profile archived? Custom VIP requests skip the standard waiting line and are pushed to the top of the queue.",
        f4_title: "Exclusive Border Avatar VIP",
        f4_desc: "Stand out across the platform with an exclusive VIP avatar frame displayed around your profile picture.",
        f5_title: "Premium Card Background for Top Contribution Page",
        f5_desc: "Customize and elevate your contributor profile card with exclusive WebM animated backgrounds and visual effects.",
        pricingTitle: "One-Time Payment",
        pricingDesc: "Pay once of Rp 50,000 for lifetime access. No monthly subscription fees."
      },
      rules: {
        title: "Posting Guidelines & Rules",
        subtitle: "Please read these rules carefully before submitting an archive to maintain community standards.",
        modTitle: "Strict Moderation System",
        modDesc: "Every submission will not appear immediately on the main page. The data will be marked as Pending and undergo admin moderation.",
        exclTitle: "Exclusive Premium Collections",
        exclDesc: "Folders marked with a golden crown represent TikTok Exclusive Collections. Access is strictly restricted to registered members.",
        syncTitle: "Profile Synchronization & Verification",
        syncDesc: "To build trust within the community, we recommend logging in via Google OAuth to receive a verified badge.",
        hostTitle: "Exclusive to Google Drive & TeraBox",
        hostDesc: "The primary archive links must utilize Google Drive or TeraBox. Other platforms will be immediately rejected.",
        mirrorTitle: "Approved Direct Media Hosts (Mirrors)",
        mirrorDesc: "You may use external direct media hosts such as qu.ax or chatbox.moe for video streams or gallery mirrors.",
        mirrorNote: "Important note for qu.ax: You must append the .mp4 extension to the end of the original link.",
        tiktokTitle: "Mandatory TikTok Profile Link",
        tiktokDesc: "You are required to include the original TikTok Profile URL of the creator whose videos you are archiving.",
        previewTitle: "Optional Preview/Tutorial Video Link",
        previewDesc: "If you do not have time to upload a tutorial video, this section can be left blank.",
        accuracyTitle: "Data Accuracy & Content Policy",
        accuracyDesc: "Ensure Video Count and File Size match actual content. Archived content must not contain explicit elements.",
        monetizeTitle: "Monetization & Shortlinks Allowed",
        monetizeDesc: "You are permitted to use shortlink services to monetize your links, provided they are not deceptive."
      },
      badges: {
        title: "Community Badges",
        subtitle: "Recognizing our top contributors. Badges are displayed automatically based on your total approved uploads[cite: 10].",
        adminTitle: "Verified Staff",
        adminBadge: "Admin Verified",
        adminDesc: "Exclusive badge for administrators and moderators who maintain the platform's integrity[cite: 9, 10].",
        activeBadge: "10+ Uploads",
        activeDesc: "Unlocked automatically after uploading at least 10 approved batch archives[cite: 9, 10].",
        supporterBadge: "30+ Uploads",
        supporterDesc: "Unlocked automatically after uploading at least 30 approved batch archives[cite: 9, 10].",
        loyalBadge: "50+ Uploads",
        loyalDesc: "Unlocked automatically after uploading at least 50 approved batch archives[cite: 9, 10].",
        achievementBadge: "100+ Uploads",
        achievementDesc: "Unlocked automatically after uploading at least 100 approved batch archives[cite: 9, 10].",
        topCreatorBadge: "200+ Uploads",
        topCreatorDesc: "Highest Achievement! Unlocked after reaching 200 approved batch archives[cite: 9, 10]."
      },
      editing: {
        title: "Post Editing Flow",
        subtitle: "How to update and manage your previously submitted archives.",
        step1Title: "Locating Your Post",
        step1Desc: "Ensure you are logged in to the account that submitted the archive. Navigate to your dashboard to view your submissions.",
        step2Title: "Updating Links & Information",
        step2Desc: "Click the Edit button on your submission. You can update dead links, add mirrors, or revise video counts.",
        step3Title: "The \"Updated\" Status Flag",
        step3Desc: "Once saved and verified, your post card will receive an Updated badge to let users know content has been refreshed."
      }
    },
    id: {
      toggleBtn: "EN",
      backBtn: "Kembali ke Beranda",
      title: "Pusat Komunitas",
      subtitle: "Panduan, pencapaian, dan dokumentasi platform.",
      tabs: {
        rules: "Panduan & Aturan",
        premium: "Manfaat Premium",
        badges: "Sistem Lencana",
        editing: "Alur Pengeditan"
      },
      premium: {
        title: "Manfaat Anggota Premium",
        subtitle: "Tingkatkan akun Anda untuk membuka akses penuh dan fitur kustomisasi eksklusif.",
        f1_title: "Akses ke Semua Konten Eksklusif",
        f1_desc: "Buka akses tanpa batas ke Koleksi Premium dan arsip folder yang ditandai dengan mahkota emas.",
        f2_title: "Tautan Unduhan Langsung Tanpa Iklan",
        f2_desc: "Dapatkan tautan unduhan langsung Google Drive & TeraBox tanpa iklan shortlink, waktu tunggu, atau pop-up.",
        f3_title: "Antrean Prioritas Permintaan Batch Kustom",
        f3_desc: "Permintaan arsip profil TikTok kustom Anda akan diproses paling awal oleh admin tanpa perlu mengantre.",
        f4_title: "Bingkai Avatar VIP Eksklusif",
        f4_desc: "Tampilkan foto profil Anda dengan bingkai avatar VIP eksklusif yang membedakan akun Anda di seluruh platform.",
        f5_title: "Latar Kartu Premium untuk Halaman Top Contribution",
        f5_desc: "Kustomisasi dan hias kartu profil kontributor Anda dengan animasi latar belakang WebM dan efek visual eksklusif.",
        pricingTitle: "Sekali Pembayaran",
        pricingDesc: "Bayar sekali Rp 50.000 untuk akses seumur hidup. Tanpa biaya berlangganan bulanan."
      },
      rules: {
        title: "Panduan Posting & Aturan",
        subtitle: "Harap baca aturan ini dengan saksama sebelum mengirimkan arsip untuk menjaga standar komunitas.",
        modTitle: "Sistem Moderasi Ketat",
        modDesc: "Setiap postingan tidak akan langsung muncul di halaman utama. Data akan berstatus Pending dan diverifikasi oleh admin.",
        exclTitle: "Koleksi Premium Eksklusif",
        exclDesc: "Folder bermahkota emas merupakan Koleksi Eksklusif TikTok. Akses khusus untuk anggota terdaftar.",
        syncTitle: "Sinkronisasi & Verifikasi Profil",
        syncDesc: "Untuk membangun kepercayaan komunitas, kami menyarankan login via Google OAuth untuk menerima lencana verifikasi.",
        hostTitle: "Khusus Google Drive & TeraBox",
        hostDesc: "Tautan arsip utama wajib menggunakan Google Drive atau TeraBox. Platform lain akan langsung ditolak.",
        mirrorTitle: "Penyedia Media Langsung Resmi (Mirror)",
        mirrorDesc: "Anda dapat menggunakan penyedia media luar seperti qu.ax atau chatbox.moe untuk pratinjau video atau galeri.",
        mirrorNote: "Catatan penting untuk qu.ax: Anda wajib menambahkan ekstensi .mp4 di akhir tautan asli.",
        tiktokTitle: "Wajib Tautan Profil TikTok",
        tiktokDesc: "Anda diwajibkan mencantumkan URL Profil TikTok asli dari kreator yang videonya Anda arsipkan.",
        previewTitle: "Tautan Video Pratinjau / Tutorial (Opsional)",
        previewDesc: "Jika Anda tidak memiliki waktu mengunggah video tutorial, bagian ini dapat dikosongkan.",
        accuracyTitle: "Akurasi Data & Kebijakan Konten",
        accuracyDesc: "Pastikan Jumlah Video dan Ukuran File sesuai dengan konten asli. Arsip tidak boleh mengandung unsur melanggar hukum.",
        monetizeTitle: "Monetisasi & Shortlink Diizinkan",
        monetizeDesc: "Anda diizinkan menggunakan layanan shortlink untuk monetisasi selama tidak menyesatkan."
      },
      badges: {
        title: "Lencana Komunitas",
        subtitle: "Apresiasi untuk kontributor utama. Lencana ditampilkan otomatis berdasarkan total unggahan yang disetujui[cite: 10].",
        adminTitle: "Verified Staff",
        adminBadge: "Admin Terverifikasi",
        adminDesc: "Lencana khusus untuk administrator dan moderator yang menjaga integritas platform[cite: 9, 10].",
        activeBadge: "10+ Unggahan",
        activeDesc: "Terbuka otomatis setelah mengunggah minimal 10 arsip batch yang disetujui[cite: 9, 10].",
        supporterBadge: "30+ Unggahan",
        supporterDesc: "Terbuka otomatis setelah mengunggah minimal 30 arsip batch yang disetujui[cite: 9, 10].",
        loyalBadge: "50+ Unggahan",
        loyalDesc: "Terbuka otomatis setelah mengunggah minimal 50 arsip batch yang disetujui[cite: 9, 10].",
        achievementBadge: "100+ Unggahan",
        achievementDesc: "Terbuka otomatis setelah mengunggah minimal 100 arsip batch yang disetujui[cite: 9, 10].",
        topCreatorBadge: "200+ Unggahan",
        topCreatorDesc: "Pencapaian Tertinggi! Terbuka setelah mencapai 200 arsip batch yang disetujui[cite: 9, 10]."
      },
      editing: {
        title: "Alur Pengeditan Postingan",
        subtitle: "Cara memperbarui dan mengelola arsip yang pernah Anda kirimkan.",
        step1Title: "Menemukan Postingan Anda",
        step1Desc: "Pastikan Anda login ke akun pengirim. Buka dasbor profil Anda untuk melihat semua riwayat unggahan.",
        step2Title: "Memperbarui Tautan & Informasi",
        step2Desc: "Klik tombol Edit pada postingan Anda. Anda dapat memperbarui tautan rusak, menambah mirror, atau memperbarui jumlah video.",
        step3Title: "Lencana Status \"Updated\"",
        step3Desc: "Setelah diedit dan diverifikasi, kartu postingan akan mendapatkan lencana Updated sebagai tanda bahwa folder telah diperbarui."
      }
    }
  };

  const content = T[lang];

  const tabs = [
    { id: 'rules', label: content.tabs.rules, icon: BookOpen },
    { id: 'premium', label: content.tabs.premium, icon: Crown },
    { id: 'badges', label: content.tabs.badges, icon: Award },
    { id: 'editing', label: content.tabs.editing, icon: GitMerge },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] pt-24 pb-16 px-4 sm:px-8 font-sans">
      
      {/* Tombol Toggle Bahasa (Pojok Kanan Atas) */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50 animate-in fade-in duration-500">
        <button 
          onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
          className="flex items-center gap-2 px-4 py-2 bg-white/85 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 transition-all active:scale-95 cursor-pointer"
          title="Ganti Bahasa / Switch Language"
        >
          <Globe size={16} className="text-blue-600" />
          <span>{lang === 'en' ? 'Translate to ID' : 'Switch to EN'}</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto mt-4 sm:mt-0">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm">
              <Scale size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {content.title}
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                {content.subtitle}
              </p>
            </div>
          </div>

          <button 
            onClick={handleGoBack} 
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5 border-none cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft size={18} />
            {content.backBtn}
          </button>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-72 shrink-0">
            <div className="bg-white p-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex md:flex-col overflow-x-auto hide-scrollbar sticky top-28 z-10 border-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-colors whitespace-nowrap md:whitespace-normal text-left cursor-pointer ${
                      isActive 
                        ? (tab.id === 'premium' ? 'bg-amber-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md')
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <Icon 
                      size={20} 
                      className={isActive ? 'text-white' : 'text-slate-400'} 
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none p-6 sm:p-10 min-h-[60vh] animate-in fade-in duration-500">
            
            {/* TAB: RULES */}
            {activeTab === 'rules' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-2">{content.rules.title}</h2>
                  <p className="text-slate-500 font-medium">{content.rules.subtitle}</p>
                </div>

                <div className="grid gap-5">
                  <div className="flex gap-5 p-6 rounded-2xl bg-amber-50/80 border-none">
                    <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-amber-900 text-lg">{content.rules.modTitle}</h3>
                      <p className="text-amber-800/90 mt-2 leading-relaxed font-medium">
                        {content.rules.modDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Crown size={100} />
                    </div>
                    <Crown className="text-amber-500 shrink-0 mt-0.5 fill-amber-400 drop-shadow-sm z-10" size={26} />
                    <div className="z-10">
                      <h3 className="font-bold text-amber-900 text-lg">{content.rules.exclTitle}</h3>
                      <p className="text-amber-800/90 mt-2 leading-relaxed font-medium">
                        {content.rules.exclDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <UserCheck className="text-blue-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.rules.syncTitle}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.rules.syncDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.rules.hostTitle}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.rules.hostDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <Cloud className="text-indigo-400 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.rules.mirrorTitle}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.rules.mirrorDesc}
                      </p>
                      <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border-none">
                        <p className="text-sm text-indigo-800 font-semibold">
                          {content.rules.mirrorNote}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <Link2 className="text-blue-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.rules.tiktokTitle}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.rules.tiktokDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <FileVideo className="text-slate-400 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.rules.previewTitle}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.rules.previewDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.rules.accuracyTitle}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.rules.accuracyDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-slate-50/80 border-none">
                    <DollarSign className="text-emerald-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.rules.monetizeTitle}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.rules.monetizeDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PREMIUM BENEFITS */}
            {activeTab === 'premium' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-amber-600 mb-2">{content.premium.title}</h2>
                  <p className="text-slate-500 font-medium">{content.premium.subtitle}</p>
                </div>

                <div className="grid gap-5">
                  <div className="flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm">
                    <Crown className="text-amber-500 shrink-0 mt-0.5 fill-amber-400 drop-shadow-sm" size={26} />
                    <div>
                      <h3 className="font-bold text-amber-900 text-lg">{content.premium.f1_title}</h3>
                      <p className="text-amber-800/90 mt-2 leading-relaxed font-medium">
                        {content.premium.f1_desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <Download className="text-emerald-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.premium.f2_title}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.premium.f2_desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <Zap className="text-blue-500 shrink-0 mt-0.5 fill-blue-50" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.premium.f3_title}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.premium.f3_desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <User className="text-indigo-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.premium.f4_title}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.premium.f4_desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <Video className="text-purple-500 shrink-0 mt-0.5" size={26} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{content.premium.f5_title}</h3>
                      <p className="text-slate-600 mt-2 leading-relaxed font-medium">
                        {content.premium.f5_desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between p-6 rounded-2xl bg-slate-900 text-white shadow-md">
                    <div>
                      <h3 className="font-bold text-amber-400 text-xl">{content.premium.pricingTitle}</h3>
                      <p className="text-slate-300 mt-1 font-medium text-sm">
                        {content.premium.pricingDesc}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <ShieldCheck size={36} className="text-amber-500" />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: BADGES (Disamakan dengan CreatorPage) */}
            {activeTab === 'badges' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-2">{content.badges.title}</h2>
                  <p className="text-slate-500 font-medium">{content.badges.subtitle}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  
                  {/* Admin Badge */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/Admin.webp" 
                      alt="Verified Staff" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-sm" 
                    />
                    <h3 className="font-bold text-slate-800 text-lg">{content.badges.adminTitle}</h3>
                    <div className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">
                      {content.badges.adminBadge}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {content.badges.adminDesc}
                    </p>
                  </div>

                  {/* Active User (Bronze) */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center hover:bg-slate-100/50 transition-colors">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/ActiveUser.webp" 
                      alt="Active User" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-sm" 
                    />
                    <h3 className="font-bold text-[#b08d6a] text-lg">Active User</h3>
                    <div className="bg-amber-100/80 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">
                      {content.badges.activeBadge}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {content.badges.activeDesc}
                    </p>
                  </div>

                  {/* Supporter (Silver) */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center hover:bg-slate-100/50 transition-colors">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/Supporter.webp" 
                      alt="Supporter" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-sm" 
                    />
                    <h3 className="font-bold text-slate-500 text-lg">Supporter</h3>
                    <div className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">
                      {content.badges.supporterBadge}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {content.badges.supporterDesc}
                    </p>
                  </div>

                  {/* Loyal User (Gold) */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center hover:bg-slate-100/50 transition-colors">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/LoyalUser.webp" 
                      alt="Loyal User" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-sm" 
                    />
                    <h3 className="font-bold text-amber-500 text-lg">Loyal User</h3>
                    <div className="bg-yellow-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">
                      {content.badges.loyalBadge}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {content.badges.loyalDesc}
                    </p>
                  </div>

                  {/* Achievement (Elite) */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border-none flex flex-col items-center text-center hover:bg-slate-100/50 transition-colors">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/Archivement.webp" 
                      alt="Achievement" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-sm" 
                    />
                    <h3 className="font-bold text-blue-500 text-lg">Achievement</h3>
                    <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mt-1.5 mb-2 border-none">
                      {content.badges.achievementBadge}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {content.badges.achievementDesc}
                    </p>
                  </div>

                  {/* Top Creator (Legend) */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50/40 border border-amber-200/60 flex flex-col items-center text-center hover:shadow-md transition-all">
                    <img 
                      src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/NEW%20UPDATE/TopCreator.webp" 
                      alt="Top Creator" 
                      className="w-16 h-16 mb-3 object-contain drop-shadow-md scale-105" 
                    />
                    <h3 className="font-black text-rose-600 text-lg">Top Creator</h3>
                    <div className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-black px-3.5 py-1 rounded-full mt-1.5 mb-2 shadow-xs">
                      {content.badges.topCreatorBadge}
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      {content.badges.topCreatorDesc}
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: EDITING FLOW */}
            {activeTab === 'editing' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-2">{content.editing.title}</h2>
                  <p className="text-slate-500 font-medium">{content.editing.subtitle}</p>
                </div>

                <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 space-y-10 pb-4">
                  
                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-500">
                      <span className="font-bold text-sm">1</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{content.editing.step1Title}</h3>
                    <p className="text-slate-600 font-medium">
                      {content.editing.step1Desc}
                    </p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 w-8 h-8 bg-white border-2 border-emerald-400 rounded-full flex items-center justify-center text-emerald-500">
                      <span className="font-bold text-sm">2</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{content.editing.step2Title}</h3>
                    <p className="text-slate-600 font-medium">
                      {content.editing.step2Desc}
                    </p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 w-8 h-8 bg-white border-2 border-blue-400 rounded-full flex items-center justify-center text-blue-500">
                      <History size={14} strokeWidth={3} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{content.editing.step3Title}</h3>
                    <p className="text-slate-600 font-medium">
                      {content.editing.step3Desc}
                    </p>
                  </div>

                </div>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};

export default RulesPage;