import React, { useState } from "react";
import { X, Upload, Info } from "lucide-react";
import { supabase } from "../supabase";

const PostModal = ({ onClose, onSuccess, currentUser, showToast, CATEGORIES, onOpenRules }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter out "Home" and "All" to leave only region/country options
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

    // 2. VALIDATION: Filter Shortlinks when Exclusive Upload is selected
    if (isExclusive) {
      // Check GDrive direct link
      if (formData.gdrive_url && !formData.gdrive_url.toLowerCase().includes('drive.google.com')) {
        showToast("Please enter direct link for Google Drive, no shortlink allowed!", "error");
        return;
      }

      // Check TeraBox direct link
      const validTeraboxDomains = ['terabox.com', 'terabox.app', '1024tera', 'freeterabox', 'mirrobox', 'neobox'];
      const isTeraboxDirect = !formData.terabox_url || validTeraboxDomains.some(domain => formData.terabox_url.toLowerCase().includes(domain));

      if (!isTeraboxDirect) {
        showToast("Please enter direct link for TeraBox, no shortlink allowed!", "error");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Ambil link utama yang diisi (GDrive atau TeraBox)
      const primaryDownloadLink = formData.gdrive_url || formData.terabox_url || "";

      const { error } = await supabase.from('batches').insert([
        {
          username: formData.username,
          country: formData.country,
          video_count: parseInt(formData.video_count) || 0,
          size_file: formData.size_file,
          tiktok_url: formData.tiktok_url,
          video_url: formData.video_url,
          
          // Data disebar sesuai dengan jenis upload-nya
          gdrive_url: formData.gdrive_url,
          terabox_url: formData.terabox_url,
          exclusive_url: isExclusive ? primaryDownloadLink : null,
          
          is_banned: formData.is_banned,
          is_exclusive: isExclusive,
          uploaded_by: currentUser,
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
                    <span className="text-xs text-slate-500 block mt-0.5">Direct links only (No shortlinks)</span>
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

            {/* TikTok Profile Link */}
            <div className="space-y-1.5 md:col-span-2">
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
              <div className="flex items-start gap-2 mt-2 p-3 bg-red-50/50 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
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
                  <span className="block text-xs font-medium text-red-500/70 mt-0.5">Check if the TikTok account is suspended or removed</span>
                </label>
              </div>
            </div>

            {/* Video Preview Link */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-sm font-semibold text-slate-700">Video Preview</label>
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Upload to catbox.moe or qu.ax
                </span>
              </div>
              <input 
                type="url" 
                name="video_url" 
                value={formData.video_url} 
                onChange={handleChange} 
                placeholder="https://files.catbox.moe/... or https://qu.ax/..." 
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
                  {formData.upload_type === 'exclusive' 
                    ? 'Direct link required' 
                    : 'Monetized shortlinks allowed'}
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
                  {formData.upload_type === 'exclusive' 
                    ? 'Direct link required' 
                    : 'Monetized shortlinks allowed'}
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