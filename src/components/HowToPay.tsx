import { useState } from 'react';
import { X, QrCode, Smartphone, MessageSquare, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';

interface HowToPayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPay({ isOpen, onClose }: HowToPayProps) {
  const [lang, setLang] = useState<'en' | 'id'>('en');

  if (!isOpen) return null;

  const content = {
    en: {
      badge: 'Help & Tutorial',
      title: 'How to Pay & Upgrade',
      subtitle: 'Follow these simple steps to complete your payment and activate your VIP status.',
      steps: [
        {
          number: '01',
          icon: <QrCode className="w-5 h-5 text-emerald-500" />,
          title: 'Scan or Save QRIS',
          desc: 'Open any mobile banking or e-wallet app (DANA, OVO, GoPay, ShopeePay, BCA, Mandiri, etc.) and scan the QRIS code displayed, or save the QR image to your gallery.'
        },
        {
          number: '02',
          icon: <Smartphone className="w-5 h-5 text-amber-500" />,
          title: 'Complete the Transfer',
          desc: 'Ensure the transfer amount is exactly Rp 50,000 (no administrative fee). Confirm and complete the payment inside your banking app.'
        },
        {
          number: '03',
          icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
          title: 'Send Receipt to Admin',
          desc: 'Click the "Confirm Payment / Contact Admin" button to open WhatsApp. Send the pre-filled message along with your payment screenshot.'
        },
        {
          number: '04',
          icon: <CheckCircle2 className="w-5 h-5 text-amber-500" />,
          title: 'VIP Activation',
          desc: 'Once verified by our admin team, your account will be upgraded to Lifetime VIP Pass instantly!'
        }
      ],
      footerNote: 'Need urgent help? Contact admin directly on WhatsApp.',
      gotItBtn: 'Got it, Close'
    },
    id: {
      badge: 'Bantuan & Panduan',
      title: 'Cara Pembayaran & Upgrade',
      subtitle: 'Ikuti langkah mudah berikut untuk menyelesaikan pembayaran dan mengaktifkan status VIP Anda.',
      steps: [
        {
          number: '01',
          icon: <QrCode className="w-5 h-5 text-emerald-500" />,
          title: 'Pindai atau Simpan QRIS',
          desc: 'Buka aplikasi mobile banking atau e-wallet (DANA, OVO, GoPay, ShopeePay, BCA, Mandiri, dll), lalu scan kode QRIS atau simpan gambar QRIS ke galeri HP Anda.'
        },
        {
          number: '02',
          icon: <Smartphone className="w-5 h-5 text-amber-500" />,
          title: 'Lakukan Transfer',
          desc: 'Pastikan nominal transfer tepat sebesar Rp 50.000 (tanpa biaya admin). Konfirmasi dan selesaikan pembayaran di aplikasi Anda.'
        },
        {
          number: '03',
          icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
          title: 'Kirim Bukti ke Admin',
          desc: 'Klik tombol "Confirm Payment / Contact Admin" untuk membuka WhatsApp. Kirim pesan otomatis beserta foto bukti transfer Anda.'
        },
        {
          number: '04',
          icon: <CheckCircle2 className="w-5 h-5 text-amber-500" />,
          title: 'Aktivasi VIP',
          desc: 'Setelah diverifikasi oleh admin, akun Anda akan langsung di-upgrade ke Lifetime VIP Pass!'
        }
      ],
      footerNote: 'Butuh bantuan mendesak? Hubungi admin langsung melalui WhatsApp.',
      gotItBtn: 'Paham, Tutup'
    }
  };

  const t = content[lang];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto">
        
        {/* Header Section */}
        <div className="p-6 sm:p-8 pb-4 border-b border-slate-100 flex items-start justify-between relative bg-slate-50/50">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-2 border border-amber-200/60">
              <ShieldCheck size={14} /> {t.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="Change Language / Ganti Bahasa"
            >
              <Globe size={14} className="text-emerald-500" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {t.steps.map((step, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100/80 transition-all hover:bg-slate-50"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center font-black text-sm text-slate-700 shadow-2xs">
                {step.number}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {step.icon}
                  <h4 className="text-sm font-bold text-slate-800">{step.title}</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 font-medium text-center sm:text-left">
            {t.footerNote}
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors border-none cursor-pointer"
          >
            {t.gotItBtn}
          </button>
        </div>

      </div>
    </div>
  );
}