import { useState } from 'react';
import { supabase } from '../utils/supabaseClient'; // Sesuaikan dengan path file supabase Anda
import { Crown, Clock, Send, Link as LinkIcon } from 'lucide-react';

// Props currentUser berisi data dari tabel profiles
export default function CustomBatchRequest({ currentUser }) {
  const [targetUrl, setTargetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Cek apakah user adalah VIP berdasarkan kolom is_premium dari tabel profiles
  const isVip = currentUser?.is_premium || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl || !currentUser) {
      setMessage('Error: Anda harus login untuk melakukan request.');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');

    // Insert data ke tabel batch_requests yang baru dibuat
    const { error } = await supabase
      .from('batch_requests')
      .insert([
        {
          user_id: currentUser.id,
          target_url: targetUrl,
          is_priority: isVip, // Otomatis true jika user adalah VIP
          status: 'pending'
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      setMessage('Gagal mengirim request. Silakan coba lagi.');
      console.error(error);
    } else {
      setTargetUrl('');
      setMessage(isVip ? 'Berhasil! Request prioritas Anda masuk antrean teratas. ⚡' : 'Berhasil! Request Anda telah masuk antrean standar.');
    }
  };

  if (!currentUser) return null; // Sembunyikan form jika belum login

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className={`p-6 text-white ${isVip ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gray-600'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Request Batch Kustom</h2>
            <p className="text-gray-300 text-sm">
              Minta admin untuk mengarsipkan profil TikTok pilihan Anda.
            </p>
          </div>
          {isVip && <Crown className="text-yellow-400" size={32} />}
        </div>
      </div>

      <div className="p-6">
        <div className={`flex gap-3 p-4 rounded-xl mb-6 ${isVip ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
          {isVip ? <Crown className="shrink-0 text-yellow-500 mt-1" size={20} /> : <Clock className="shrink-0 text-gray-400 mt-1" size={20} />}
          <div>
            <h4 className="font-semibold">{isVip ? 'Jalur VIP Aktif' : 'Antrean Standar'}</h4>
            <p className="text-sm">
              {isVip ? 'Request Anda diprioritaskan dan akan dikerjakan lebih cepat oleh admin.' : 'Estimasi proses 3-7 hari. Upgrade ke VIP untuk pengerjaan instan.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="url" 
              placeholder="Masukkan link profil TikTok..." 
              value={targetUrl} 
              onChange={(e) => setTargetUrl(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              required 
            />
          </div>
          
          {message && (
            <p className={`text-sm ${message.includes('Error') || message.includes('Gagal') ? 'text-red-500' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'} ${isVip ? 'bg-yellow-500' : 'bg-blue-600'}`}
          >
            {isSubmitting ? 'Memproses...' : 'Kirim Request'}
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}