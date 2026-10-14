import React, { useState } from "react";
import { X, Upload, Info } from "lucide-react";
import { supabase } from "../supabase";

// Komponen Deretan Ikon Media Sosial untuk ditempatkan di Header Label
const SocialIconsHeader = () => (
  <div className="flex items-center gap-1.5 opacity-80">
    {/* TikTok */}
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 448 512" fill="currentColor" className="text-slate-700">
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
    </svg>
    {/* Instagram */}
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
    {/* Twitter / X */}
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
    {/* OnlyFans */}
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-sky-500">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c3.87 0 7 3.13 7 7s-3.13 7-7 7-7-3.13-7-7 3.13-7 7-7zm0 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"/>
    </svg>
    {/* Telegram */}
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-sky-400">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.22-3.54 3.91-1.63 4.72-1.92 5.25-1.93.12 0 .39.03.56.17.15.12.19.28.21.4-.01.07.01.24 0 .37z"/>
    </svg>
    {/* Tevi */}
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2 14.5v-9l7 4.5z"/>
    </svg>
    {/* Trakteer */}
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-rose-500">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  </div>
);

// Helper untuk menampilkan Ikon Media Sosial yang deteksi otomatis saat input diisi
const getSocialIcon = (url: string) => {
  if (!url) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
        <circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"/>
      </svg>
    );
  }
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('tiktok.com')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor" className="text-slate-800">
        <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('instagram.com')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    );
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('onlyfans.com')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-sky-500">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c3.87 0 7 3.13 7 7s-3.13 7-7 7-7-3.13-7-7 3.13-7 7-7zm0 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-sky-400">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.22-3.54 3.91-1.63 4.72-1.92 5.25-1.93.12 0 .39.03.56.17.15.12.19.28.21.4-.01.07.01.24 0 .37z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('tevi.')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2 14.5v-9l7 4.5z"/>
      </svg>
    );
  }
  if (lowerUrl.includes('trakteer.id')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-rose-500">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
      <circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"/>
    </svg>
  );
};

const PostModal = ({ 
  onClose, 
  onSuccess, 
  currentUser, 
  showToast, 
  CATEGORIES, 
  onOpenRules,
  isAdmin = false 
}: any) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter out "Home" and "All" to leave only region/country options
  const selectableCategories = CATEGORIES.filter((c: string) => c !== 'Home' && c !== 'All');

  const [formData, setFormData] = useState({
    username: "",
    country: selectableCategories[0] || "",
    video_count: "",
    size_file: "", 
    social_url: "",
    video_url: "", 
    gdrive_url: "",
    terabox_url: "",
    is_banned: false, 
    is_adult: false,
    upload_type: "" // 'regular' | 'exclusive' | ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData({ ...formData, [target.name]: value });
  };

  const handleSelectType = (type: 'regular' | 'exclusive') => {
    setFormData(prev => ({
      ...prev,
      upload_type: prev.upload_type === type ? "" : type
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. VALIDATION: Mandatory Upload Type Selection
    if (!formData.upload_type) {
      showToast("Please select an Upload Type (Regular or Exclusive) before submitting!", "error");
      return;
    }

    const isExclusive = formData.upload_type === 'exclusive';

    setIsLoading(true);

    try {
      // Get the primary link filled (GDrive or TeraBox)
      const primaryDownloadLink = formData.gdrive_url || formData.terabox_url || "";

      const { error } = await supabase.from('batches').insert([
        {
          username: formData.username,
          country: formData.country,
          video_count: parseInt(formData.video_count) || 0,
          size_file: formData.size_file,
          social_url: formData.social_url,
          tiktok_url: formData.social_url, // Backward compatibility
          video_url: formData.video_url,
          
          // Data is spread according to the upload type
          gdrive_url: formData.gdrive_url,
          terabox_url: formData.terabox_url,
          exclusive_url: isExclusive ? primaryDownloadLink : null,
          
          is_banned: formData.is_banned,
          is_adult: formData.is_adult,
          is_exclusive: isExclusive,
          uploaded_by: currentUser,
          // Set status: If admin, directly 'approved', if normal user, 'pending'
          status: isAdmin ? 'approved' : 'pending'
        }
      ]);

      if (error) throw error;

      // Customized toast notification
      const successMessage = isAdmin 
        ? "Batch successfully submitted and approved!" 
        : "Batch successfully submitted! Awaiting admin approval.";

      showToast(successMessage, "success");
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
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Batch</h2>
            {onOpenRules && (
              <button 
                type="button" 
                onClick={onOpenRules}
                className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
              >
                <Info size={14} />
                Read the rules first
              </button>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* UPLOAD TYPE CHECKBOXES (MANDATORY SELECTION) */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <label className="text-sm font-bold text-slate-700 block mb-2">
                Upload Type <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Regular Upload Checkbox */}
                <div 
                  onClick={() => handleSelectType('regular')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.upload_type === 'regular' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={formData.upload_type === 'regular'} 
                    onChange={() => {}} 
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                  />
                  <div>
                    <span className="text-sm font-bold block leading-tight">Regular Upload</span>
                    <span className="text-xs text-slate-500 block mt-0.5">Monetized shortlinks allowed</span>
                  </div>
                </div>

                {/* Exclusive Upload Checkbox */}
                <div 
                  onClick={() => handleSelectType('exclusive')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.upload_type === 'exclusive' 
                      ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={formData.upload_type === 'exclusive'} 
                    onChange={() => {}} 
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 pointer-events-none"
                  />
                  <div>
                    <span className="text-sm font-bold block leading-tight">Exclusive Upload</span>
                    <span className="text-xs text-slate-500 block mt-0.5">Monetized shortlinks allowed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Username */}
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
            
            {/* Country / Region */}
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

            {/* Video Count */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Video Count</label>
              <input 
                required 
                type="number" 
                name="video_count" 
                value={formData.video_count} 
                onChange={handleChange} 
                placeholder="Example: 150" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>

            {/* File Size */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">File Size</label>
              <input 
                required 
                type="text" 
                name="size_file" 
                value={formData.size_file} 
                onChange={handleChange} 
                placeholder="Example: 500 MB" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>

            {/* Social Media Profile Link with Icons Next to Title */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-700">Social Media Profile Link</label>
                <SocialIconsHeader />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {getSocialIcon(formData.social_url)}
                </div>
                <input 
                  required={!formData.is_banned} 
                  type="url" 
                  name="social_url" 
                  value={formData.social_url} 
                  onChange={handleChange} 
                  disabled={formData.is_banned} 
                  placeholder={formData.is_banned ? "Link not required for banned accounts" : "https://instagram.com/... or https://tiktok.com/@..."} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-60 disabled:bg-slate-100" 
                />
              </div>
              
              {/* Checkboxes: Banned & 18+ / Adult Post */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
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
                    <span className="block text-xs font-medium text-red-500/70 mt-0.5">Account suspended or removed</span>
                  </label>
                </div>

                {/* 18+ / Adult Post Checkbox */}
                <div className="flex items-start gap-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl hover:bg-amber-50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="is_adult" 
                    id="is_adult"
                    checked={formData.is_adult} 
                    onChange={handleChange} 
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="is_adult" className="text-sm font-semibold text-amber-700 cursor-pointer select-none leading-tight">
                    18+ / Adult Post
                    <span className="block text-xs font-medium text-amber-600/70 mt-0.5">Contains mature or adult content</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Video Preview Link (Mandatory & Supports Vidara/Catbox/Qu.ax) */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-sm font-semibold text-slate-700">
                  Video Preview <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Supports Vidara embed, catbox.moe, or qu.ax
                </span>
              </div>
              <input 
                required
                type="url" 
                name="video_url" 
                value={formData.video_url} 
                onChange={handleChange} 
                placeholder="https://vidara... or https://files.catbox.moe/... or https://qu.ax/..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>

            {/* Google Drive Link */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-sm font-semibold text-slate-700">Google Drive Link</label>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  formData.upload_type === 'exclusive' 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-emerald-600 bg-emerald-50'
                }`}>
                  Monetized shortlinks allowed
                </span>
              </div>
              <input 
                type="url" 
                name="gdrive_url" 
                value={formData.gdrive_url} 
                onChange={handleChange} 
                placeholder="https://drive.google.com/..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>

            {/* TeraBox Link */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-sm font-semibold text-slate-700">TeraBox Link</label>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  formData.upload_type === 'exclusive' 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-emerald-600 bg-emerald-50'
                }`}>
                  Monetized shortlinks allowed
                </span>
              </div>
              <input 
                type="url" 
                name="terabox_url" 
                value={formData.terabox_url} 
                onChange={handleChange} 
                placeholder="https://terabox.com/..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>
          </div>

          {/* Form Actions */}
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