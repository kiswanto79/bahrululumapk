import React from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  Home, 
  BookOpen, 
  QrCode, 
  BookmarkCheck, 
  Wallet, 
  CreditCard, 
  BookMarked, 
  Users, 
  RotateCcw,
  Building2,
  X,
  ShieldCheck,
  Bell,
  Sparkles,
  ChevronRight,
  LogOut,
  SlidersHorizontal,
  PiggyBank,
  Store,
  FileSpreadsheet
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoleModal: () => void;
  onOpenNotif: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenRoleModal,
  onOpenNotif
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    activeRole, 
    currentUser, 
    siswaList, 
    guruList, 
    absensiList, 
    tagihanList,
    tabunganAccounts,
    produkKoperasiList,
    madrasahInfo,
    setIsResetModalOpen 
  } = useMadrasah();

  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Beranda & Agenda', icon: Home, desc: 'Ringkasan KBM, amalan & info', badge: null, color: 'from-emerald-500 to-teal-600' },
    { id: 'sheets', label: 'Google Sheets & Cloud', icon: FileSpreadsheet, desc: 'Ekspor 2 arah & sync Google Drive', badge: 'Sync Live', color: 'from-emerald-600 to-teal-700' },
    { id: 'koperasi', label: 'POS Kasir & Koperasi', icon: Store, desc: 'Kasir Mart, Potong Saldo Smart Card & Kitab', badge: `${produkKoperasiList?.length || 17} SKU`, color: 'from-amber-500 to-orange-600' },
    { id: 'tabungan', label: 'Tabungan & Kas Saku', icon: PiggyBank, desc: 'Rekening Wadiah, Uang Saku & Qurban', badge: `${tabunganAccounts.length} Rek`, color: 'from-amber-500 to-emerald-600' },
    { id: 'siakad', label: 'SIAKAD & Raport', icon: BookOpen, desc: 'Kurikulum Kemenag, nilai & raport', badge: 'Kemenag', color: 'from-blue-500 to-cyan-600' },
    { id: 'absensi', label: 'Presensi Digital', icon: QrCode, desc: 'Scan QR Code & Geofencing GPS', badge: `${absensiList.length} Hadir`, color: 'from-emerald-500 to-green-600' },
    { id: 'tahfidz', label: 'Tahfidz & Ibadah', icon: BookmarkCheck, desc: 'Setoran ziyadah & mutabaah', badge: 'Mutabaah', color: 'from-amber-500 to-yellow-600' },
    { id: 'keuangan', label: 'SPP & Baitul Maal', icon: Wallet, desc: 'Tagihan SPP & kwitansi digital', badge: tagihanList.filter(t => t.status === 'belum_lunas').length ? `${tagihanList.filter(t => t.status === 'belum_lunas').length} Pending` : null, color: 'from-teal-500 to-emerald-700' },
    { id: 'kartu', label: 'E-Kartu Santri / Guru', icon: CreditCard, desc: 'Smart Card KTS/KTG barcode resmi', badge: 'Smart QR', color: 'from-purple-500 to-indigo-600' },
    { id: 'doaquran', label: 'Al-Qur\'an & Doa', icon: BookMarked, desc: 'Mushaf 30 juz & dzikir tasbih', badge: 'Tasbih', color: 'from-amber-600 to-orange-600' },
    { id: 'manajemen', label: 'Master Data & Lembaga', icon: Users, desc: 'Edit data santri, guru & profil', badge: `${siswaList.length} Santri`, color: 'from-rose-500 to-red-600' },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  const getRoleBadge = () => {
    switch (activeRole) {
      case 'admin':
        return { label: 'Admin / Kepala', bg: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'guru':
        return { label: 'Ustadz / Guru', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'siswa':
        return { label: 'Santri / Siswa', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'wali':
        return { label: 'Wali Santri', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      default:
        return { label: 'Tamu', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  };

  const role = getRoleBadge();

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-[320px] sm:max-w-sm h-full bg-[#031d17] border-r border-white/10 text-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950/80 backdrop-blur-md rounded-[14px] flex items-center justify-center overflow-hidden">
                  {madrasahInfo.logoUrl ? (
                    <img src={madrasahInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-amber-400" />
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black tracking-tight text-white uppercase truncate">
                  {madrasahInfo.singkatan || madrasahInfo.nama}
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium truncate">
                  {madrasahInfo.akreditasi} &bull; {madrasahInfo.jenjang}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white transition-colors"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User & Role Switch Card */}
          <div className="mt-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-9 h-9 rounded-xl object-cover border border-emerald-400/50 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded-md border ${role.bg}`}>
                  {role.label}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenRoleModal();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold shrink-0 transition-colors"
            >
              Ganti
            </button>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 no-scrollbar">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Semua Fitur Aplikasi
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'doaquran' && activeTab === 'doa-quran');

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-lg border border-emerald-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${item.color} p-0.5 flex items-center justify-center text-white shrink-0 shadow-sm`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-300 truncate">{item.desc}</p>
                  </div>
                </div>

                {item.badge ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 ${
                    isActive 
                      ? 'bg-amber-400 text-slate-950 font-black' 
                      : 'bg-white/10 text-amber-300 border border-white/10'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-4 h-4 opacity-40 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-white/10 bg-slate-950/60 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenNotif();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Pengumuman</span>
            </button>

            <button
              onClick={() => {
                onClose();
                setIsResetModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reset Data</span>
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-400 pt-1">
            {madrasahInfo.nama} &bull; Smart Mobile APK
          </p>
        </div>

      </div>
    </div>
  );
};
