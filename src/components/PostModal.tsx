import React, { useState } from "react";
import { X, Upload, Info, Link as LinkIcon, ShieldAlert } from "lucide-react";
import { supabase } from "../supabase";

const PostModal = ({ onClose, onSuccess, currentUser, showToast, CATEGORIES, onOpenRules }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mengeluarkan opsi "Home" dan "All" agar hanya menyisakan region/negara
  const selectableCategories = CATEGORIES.filter((c: string) => c !== 'Home' && c !== 'All');

  const [formData, setFormData] = useState({
    username: "",
    country: selectableCategories[0] || "",
    video_count: "",
    size_file: "", 
    tiktok_url: "",
    video_url: "", 
    gdrive_url: "",
    terabox_url: "",
    is_banned: false, 
    is_exclusive: false // false = Regular Upload, true = Exclusive Upload
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData({ ...formData, [target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- VALIDASI: CEGAH SHORTLINK UNTUK EXCLUSIVE UPLOAD ---
    if (formData.is_exclusive) {
      // Cek GDrive (Harus mengandung drive.google.com)
      if (formData.gdrive_url && !formData.gdrive_url.toLowerCase().includes('drive.google.com')) {
        showToast("Please enter direct link for Google Drive, no shortlink!", "error");
        return; // Hentikan proses submit
      }

      // Cek TeraBox (Harus mengandung kata kunci domain terabox asli)
      const validTeraboxDomains = ['terabox', '1024tera', 'freeterabox', 'teraboxapp'];
      const isTeraboxValid = !formData.terabox_url || validTeraboxDomains.some(domain => formData.terabox_url.toLowerCase().includes(domain));
      
      if (!isTeraboxValid) {
        showToast("Please enter direct link for TeraBox, no shortlink!", "error");
        return; // Hentikan proses submit
      }
    }
    // --------------------------------------------------------

    setIsLoading(true);

    try {
      const { error } = await supabase.from('batches').insert([
        {
          ...formData,
          uploaded_by: currentUser,
          video_count: parseInt(formData.video_count) || 0,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      showToast("Batch successfully submitted! Awaiting admin approval.", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || "Failed to add data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content - Diperlebar menjadi max-w-4xl */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Batch</h2>
            <button 
              type="button" 
              onClick={onOpenRules}
              className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              <Info size={14} />
              Read the rules first
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* TIPE UPLOAD (SELECTOR BESAR DI ATAS) */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-slate-700 block mb-3">Select Upload Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Opsi Reguler */}
              <div 
                onClick={() => setFormData({...formData, is_exclusive: false})}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  !formData.is_exclusive 
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                    : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <LinkIcon size={18} className={!formData.is_exclusive ? 'text-emerald-600' : 'text-slate-400'} />
                  <h3 className={`font-bold ${!formData.is_exclusive ? 'text-emerald-700' : 'text-slate-600'}`}>Regular Upload</h3>
                </div>
                <p className="text-sm text-slate-500">Shortlinks beriklan (safelink) diizinkan untuk digunakan.</p>
              </div>

              {/* Opsi Exclusive */}
              <div 
                onClick={() => setFormData({...formData, is_exclusive: true})}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.is_exclusive 
                    ? 'border-purple-500 bg-purple-50 shadow-sm' 
                    : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert size={18} className={formData.is_exclusive ? 'text-purple-600' : 'text-slate-400'} />
                  <h3 className={`font-bold ${formData.is_exclusive ? 'text-purple-700' : 'text-slate-600'}`}>Exclusive Upload</h3>
                </div>
                <p className="text-sm text-slate-500">WAJIB Direct link. Dilarang menggunakan shortlink (Bypass monetisasi platform).</p>
              </div>
            </div>
          </div>

          {/* PEMBAGIAN 2 KOLOM (KIRI: INFO, KANAN: LINKS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* KOLOM KIRI: Informasi Kreator */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Creator Details</h3>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Creator Username</label>
                <input 
                  required 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  placeholder="Example: jennie_bp" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Country / Region</label>
                <select 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  {selectableCategories.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Video Count</label>
                  <input 
                    required 
                    type="number" 
                    name="video_count" 
                    value={formData.video_count} 
                    onChange={handleChange} 
                    placeholder="Ex: 150" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">File Size</label>
                  <input 
                    required 
                    type="text" 
                    name="size_file" 
                    value={formData.size_file} 
                    onChange={handleChange} 
                    placeholder="Ex: 500 MB" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">TikTok Profile Link</label>
                <input 
                  required={!formData.is_banned} 
                  type="url" 
                  name="tiktok_url" 
                  value={formData.tiktok_url} 
                  onChange={handleChange} 
                  disabled={formData.is_banned} 
                  placeholder={formData.is_banned ? "Link not required for banned accounts" : "https://tiktok.com/@username"} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-60 disabled:bg-slate-100" 
                />
                
                {/* Banned Checkbox */}
                <div className="flex items-start gap-2 mt-3 p-3 bg-red-50/50 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="is_banned" 
                    id="is_banned"
                    checked={formData.is_banned} 
                    onChange={handleChange} 
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-red-500 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="is_banned" className="text-sm font-semibold text-red-600 cursor-pointer select-none">
                    Banned Account
                    <span className="block text-xs font-medium text-red-500/70 mt-0.5">Check this if the TikTok account is suspended</span>
                  </label>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: Tautan / URLs */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Media & Download Links</h3>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Video Preview</label>
                  <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    catbox.moe / qu.ax
                  </span>
                </div>
                <input 
                  type="url" 
                  name="video_url" 
                  value={formData.video_url} 
                  onChange={handleChange} 
                  placeholder="https://files.catbox.moe/..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <label className="text-sm font-semibold text-slate-700">Google Drive Link</label>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                    formData.is_exclusive ? 'text-purple-600 bg-purple-50' : 'text-emerald-600 bg-emerald-50'
                  }`}>
                    {formData.is_exclusive ? 'Direct link required' : 'Monetized shortlinks allowed'}
                  </span>
                </div>
                <input 
                  type="url" 
                  name="gdrive_url" 
                  value={formData.gdrive_url} 
                  onChange={handleChange} 
                  placeholder="https://drive.google.com/..." 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    formData.is_exclusive ? 'focus:ring-purple-500 border-slate-200' : 'focus:ring-emerald-500 border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <label className="text-sm font-semibold text-slate-700">TeraBox Link</label>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                    formData.is_exclusive ? 'text-purple-600 bg-purple-50' : 'text-emerald-600 bg-emerald-50'
                  }`}>
                    {formData.is_exclusive ? 'Direct link required' : 'Monetized shortlinks allowed'}
                  </span>
                </div>
                <input 
                  type="url" 
                  name="terabox_url" 
                  value={formData.terabox_url} 
                  onChange={handleChange} 
                  placeholder="https://terabox.com/..." 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    formData.is_exclusive ? 'focus:ring-purple-500 border-slate-200' : 'focus:ring-emerald-500 border-slate-200'
                  }`}
                />
              </div>

              {/* Tampilan Ringkasan Aturan (Conditional Rendering) */}
              {formData.is_exclusive && (
                <div className="p-4 mt-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-sm text-purple-800 font-medium flex items-start gap-2">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                    <span>Upload Exclusive terpilih. Pastikan Anda tidak memendekkan link menggunakan layanan safelink/iklan apapun!</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`px-8 py-2.5 rounded-xl font-bold text-white transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
                formData.is_exclusive 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {isLoading ? "Saving..." : (
                <>
                  <Upload size={18} />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;