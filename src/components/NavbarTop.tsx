import React, { useState, useEffect } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  Bell, 
  UserCircle2, 
  Clock, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  LogOut,
  ChevronDown,
  Compass,
  Menu,
  GraduationCap,
  Building2,
  RotateCcw
} from 'lucide-react';

interface NavbarTopProps {
  onOpenRoleModal: () => void;
  onOpenNotificationModal: () => void;
  onToggleSidebar?: () => void;
}

export const NavbarTop: React.FC<NavbarTopProps> = ({
  onOpenRoleModal,
  onOpenNotificationModal,
  onToggleSidebar,
}) => {
  const { currentUser, activeRole, logout, pengumumanList, setActiveTab, madrasahInfo, setIsResetModalOpen } = useMadrasah();
  const [timeStr, setTimeStr] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleLabel = () => {
    switch (activeRole) {
      case 'admin': return { text: 'Kepala / Admin', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'guru': return { text: 'Ustadz / Guru', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'siswa': return { text: 'Santri / Siswa', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'wali': return { text: 'Wali Santri', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
  };

  const roleInfo = getRoleLabel();
  const unreadAnnouncements = pengumumanList.filter(p => p.pin).length;

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-white/10 text-white shadow-xl shadow-slate-950/40">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left branding & title */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl glass-button text-slate-300 hover:text-white shrink-0 active:scale-95 transition-all"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5 text-emerald-400" />
            </button>
          )}

          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-amber-400 p-0.5 shadow-md shadow-emerald-950 flex items-center justify-center relative shrink-0">
              <div className="w-full h-full bg-slate-950/80 backdrop-blur-md rounded-[14px] flex items-center justify-center overflow-hidden">
                {madrasahInfo.logoUrl ? (
                  <img src={madrasahInfo.logoUrl} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-amber-400 border-2 border-slate-900"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center gap-1 truncate">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
                    {madrasahInfo.singkatan || 'SIM MADRASAH'}
                  </span>
                </h1>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  SMART APK
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[280px]">
                {madrasahInfo.nama}
              </p>
            </div>
          </div>
        </div>

        {/* Center Live Ticker (Desktop only) */}
        <div className="hidden md:flex items-center gap-4 glass-panel-subtle px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>1448 H / 2026 M</span>
          </div>
          <div className="w-px h-3.5 bg-white/10" />
          <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeStr || '07:00:00'} WIB</span>
          </div>
          <div className="w-px h-3.5 bg-white/10" />
          <div className="flex items-center gap-1 text-[11px] text-slate-300">
            <Compass className="w-3 h-3 text-amber-400" />
            <span>Kendal &bull; Dzuhur 11:58</span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Notification Button */}
          <button
            onClick={onOpenNotificationModal}
            className="relative p-1.5 sm:p-2 rounded-xl glass-button text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="Pengumuman Madrasah"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            {unreadAnnouncements > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-500 text-white text-[9px] font-bold rounded-full border border-slate-900 animate-pulse">
                {unreadAnnouncements}
              </span>
            )}
          </button>

          {/* Role Switcher Pill */}
          <button
            onClick={onOpenRoleModal}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all shadow-sm backdrop-blur-md active:scale-95 ${roleInfo.bg} hover:brightness-110`}
          >
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Peran:</span>
            <span>{roleInfo.text}</span>
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-1 p-1 rounded-xl glass-button text-slate-200 transition-colors active:scale-95"
            >
              <img
                src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-emerald-400/50"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileDropdown && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel border border-white/15 shadow-2xl p-2.5 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl"
                onClick={() => setShowProfileDropdown(false)}
              >
                <div className="p-2.5 border-b border-white/10 mb-1">
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">{roleInfo.text}</p>
                  <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>

                <button
                  onClick={onOpenRoleModal}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-white/10 text-slate-200 transition-colors"
                >
                  <UserCircle2 className="w-4 h-4 text-emerald-400" />
                  Ganti Peran / Akun
                </button>

                <button
                  onClick={() => setActiveTab('kartu')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-white/10 text-slate-200 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Lihat E-Kartu Digital
                </button>

                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-amber-500/20 text-amber-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  Kelola & Reset Data
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-red-500/20 text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar / Reset Sesi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
