import React, { useState } from "react";
import { X, Upload, Info } from "lucide-react";
import { supabase } from "../supabase";

const PostModal = ({ onClose, onSuccess, currentUser, showToast, CATEGORIES, onOpenRules }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mengeluarkan opsi "Home" dan "All" agar hanya menyisakan region/negara
  const selectableCategories = CATEGORIES.filter((c: string) => c !== 'Home' && c !== 'All');

  const [formData, setFormData] = useState({
    username: "",
    country: selectableCategories[0] || "", // Otomatis memilih region pertama (misal: Indonesia)
    video_count: "",
    size_file: "", 
    tiktok_url: "",
    video_url: "", // Preview Video
    gdrive_url: "",
    terabox_url: "",
    is_banned: false, // Menambahkan state awal untuk status banned
    is_exclusive: false // Menambahkan state awal untuk exclusive status
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    // Logika khusus untuk menangani input bertipe checkbox
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData({ ...formData, [target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from('batches').insert([
        {
          ...formData, // is_banned dan is_exclusive otomatis ikut terkirim dari formData
          uploaded_by: currentUser,
          video_count: parseInt(formData.video_count) || 0,
          status: 'pending' // Sistem moderasi aktif, status diset 'pending'
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
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Creator Username</label>
              <input 
                required 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="Example: jennie_bp" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Country / Region</label>
              <select 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                {selectableCategories.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Video Count</label>
              <input 
                required 
                type="number" 
                name="video_count" 
                value={formData.video_count} 
                onChange={handleChange} 
                placeholder="Example: 150" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
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
                placeholder="Example: 500 MB" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">TikTok Profile Link</label>
              <input 
                required={!formData.is_banned} // Tidak wajib diisi jika akun sudah dibanned
                type="url" 
                name="tiktok_url" 
                value={formData.tiktok_url} 
                onChange={handleChange} 
                disabled={formData.is_banned} // Disable input saat ditandai banned
                placeholder={formData.is_banned ? "Link not required for banned accounts" : "https://tiktok.com/@username"} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-60 disabled:bg-slate-100" 
              />
              
              {/* Checkboxes Container (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {/* Banned Checkbox */}
                <div className="flex items-start gap-2 p-3 bg-red-50/50 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="is_banned" 
                    id="is_banned"
                    checked={formData.is_banned} 
                    onChange={handleChange} 
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-red-500 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="is_banned" className="text-sm font-semibold text-red-600 cursor-pointer select-none leading-tight">
                    Banned Account
                    <span className="block text-xs font-medium text-red-500/70 mt-0.5">Link not required</span>
                  </label>
                </div>

                {/* Exclusive Checkbox */}
                <div className="flex items-start gap-2 p-3 bg-purple-50/50 border border-purple-100 rounded-xl hover:bg-purple-50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="is_exclusive" 
                    id="is_exclusive"
                    checked={formData.is_exclusive} 
                    onChange={handleChange} 
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-purple-500 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="is_exclusive" className="text-sm font-semibold text-purple-700 cursor-pointer select-none leading-tight">
                    TikTok Exclusive
                    <span className="block text-xs font-medium text-purple-600/70 mt-0.5">Content exclusive to TikTok</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-sm font-semibold text-slate-700">Video Preview</label>
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Upload to catbox.moe or use a qu.ax
                </span>
              </div>
              <input 
                type="url" 
                name="video_url" 
                value={formData.video_url} 
                onChange={handleChange} 
                placeholder="https://files.catbox.moe/... or https://qu.ax/..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              />
            </div>

            <div className="space-y-1.5 md:col-span-2 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-sm font-semibold text-slate-700">Google Drive Link</label>
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Monetized shortlinks allowed (Must lead to GDrive)
                </span>
              </div>
              <input 
                type="url" 
                name="gdrive_url" 
                value={formData.gdrive_url} 
                onChange={handleChange} 
                placeholder="https://drive.google.com/..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-sm font-semibold text-slate-700">TeraBox Link</label>
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Monetized shortlinks allowed (Must lead to TeraBox)
                </span>
              </div>
              <input 
                type="url" 
                name="terabox_url" 
                value={formData.terabox_url} 
                onChange={handleChange} 
                placeholder="https://terabox.com/..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              />
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
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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