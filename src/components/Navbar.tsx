import React, { useState } from 'react';
import { Menu, X, Plus, LogIn, LogOut, User, ChevronDown, Scale } from 'lucide-react';

export default function Navbar({ 
  activeCategory, 
  setActiveCategory, 
  resetSearch,
  CATEGORIES, 
  currentUser, 
  handleLogout, 
  setShowAddModal, 
  setShowLoginModal,
  setShowRulesModal,
  EmeraldFolderIcon
}: any) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-white/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Bagian Logo - Mengarah ke Home */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { setActiveCategory('Home'); resetSearch(); }}
          >
            <div className="w-10 h-10 flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <EmeraldFolderIcon className="w-8 h-8 drop-shadow-md" />
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">
              Batch<span className="text-emerald-500">Tiktok</span>
            </span>
          </div>

          {/* Navigasi Kategori Desktop */}
          <div className="hidden md:flex items-center gap-2 bg-white p-1.5 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none">
            {CATEGORIES.map((category: string) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {category === 'All' ? 'Home' : category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            
            {/* Tombol Rules Desktop */}
            <button 
              onClick={() => setShowRulesModal(true)}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-sm font-bold text-slate-600 flex items-center gap-2 transition-all border-none"
              title="Posting Rules"
            >
              <Scale size={16} className="text-emerald-500" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            {currentUser ? (
              <div className="hidden sm:relative sm:block">
                {/* Tombol Profil Dropdown Desktop */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2.5 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-sm font-bold text-slate-600 flex items-center gap-2.5 transition-all border-none"
                >
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                    <User size={16} />
                  </div>
                  <span>@{currentUser}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Menu Dropdown Desktop */}
                {isDropdownOpen && (
                  <>
                    {/* Backdrop tak terlihat untuk menutup dropdown jika klik di luar */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={() => {
                          setShowAddModal(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors border-b border-slate-50 text-left"
                      >
                        <Plus size={18} /> Add Collection
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2.5 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-sm font-bold text-slate-600 flex items-center gap-2 transition-all border-none"
              >
                <LogIn size={16} className="text-emerald-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Tombol Hamburger Mobile */}
            <button 
              className="md:hidden p-2.5 text-slate-500 hover:text-slate-800 bg-white rounded-xl shadow-sm border-none z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Kategori Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white mx-4 mt-2 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-2 border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {CATEGORIES.map((category: string) => (
            <button
              key={category}
              onClick={() => { setActiveCategory(category); setIsMobileMenuOpen(false); }}
              className={`px-4 py-3 rounded-2xl text-left text-sm font-bold transition-all border-none ${
                activeCategory === category ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {category === 'All' ? 'Home' : category}
            </button>
          ))}
          <div className="border-t border-slate-100 mt-2 pt-2 flex flex-col gap-2">
            
            {/* Menu Rules di Mobile */}
            <button 
              onClick={() => {setShowRulesModal(true); setIsMobileMenuOpen(false);}} 
              className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors rounded-2xl"
            >
              <Scale size={18} className="text-emerald-500" /> Posting Rules
            </button>

            {currentUser ? (
              <>
                <div className="px-4 py-2 mb-1">
                  <span className="block text-xs font-semibold text-slate-400">Signed in as</span>
                  <span className="block text-sm font-bold text-slate-800">@{currentUser}</span>
                </div>
                <button onClick={() => {setShowAddModal(true); setIsMobileMenuOpen(false);}} className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-2xl">
                  <Plus size={18} /> Add New Collection
                </button>
                <button onClick={() => {handleLogout(); setIsMobileMenuOpen(false);}} className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 transition-colors rounded-2xl">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <button onClick={() => {setShowLoginModal(true); setIsMobileMenuOpen(false);}} className="px-4 py-3 flex items-center gap-2 text-left text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors">
                <LogIn size={18} /> Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}