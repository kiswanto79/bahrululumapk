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
  Sparkles, 
  FileText,
  RotateCcw,
  Building2,
  CheckCircle2,
  PiggyBank,
  Store,
  FileSpreadsheet
} from 'lucide-react';

interface SidebarDesktopProps {
  onOpenRoleModal: () => void;
}

export const SidebarDesktop: React.FC<SidebarDesktopProps> = ({ onOpenRoleModal }) => {
  const { 
    activeTab, 
    setActiveTab, 
    activeRole, 
    siswaList, 
    guruList, 
    absensiList, 
    tagihanList,
    tabunganAccounts,
    produkKoperasiList,
    madrasahInfo,
    setIsResetModalOpen 
  } = useMadrasah();

  const menuItems = [
    { id: 'dashboard', label: 'Beranda & Agenda', icon: Home, badge: null },
    { id: 'sheets', label: 'Google Sheets & Cloud', icon: FileSpreadsheet, badge: 'Sync Live' },
    { id: 'koperasi', label: 'POS Kasir & Koperasi', icon: Store, badge: `${produkKoperasiList?.length || 17} SKU` },
    { id: 'tabungan', label: 'Tabungan & Kas Saku', icon: PiggyBank, badge: `${tabunganAccounts.length} Rek` },
    { id: 'siakad', label: 'SIAKAD & Raport', icon: BookOpen, badge: 'Kemenag' },
    { id: 'absensi', label: 'Presensi Digital', icon: QrCode, badge: `${absensiList.length} Hadir` },
    { id: 'tahfidz', label: 'Tahfidz & Ibadah', icon: BookmarkCheck, badge: 'Mutabaah' },
    { id: 'keuangan', label: 'SPP & Baitul Maal', icon: Wallet, badge: tagihanList.filter(t => t.status === 'belum_lunas').length ? `${tagihanList.filter(t => t.status === 'belum_lunas').length} Pending` : null },
    { id: 'kartu', label: 'E-Kartu Santri / Guru', icon: CreditCard, badge: 'Smart QR' },
    { id: 'doaquran', label: 'Al-Qur\'an & Doa', icon: BookMarked, badge: 'Tasbih' },
    { id: 'manajemen', label: 'Master Data & Lembaga', icon: Users, badge: `${siswaList.length} Santri` },
  ];

  return (
    <aside className="hidden lg:flex w-72 glass-panel border-r border-white/10 text-slate-200 flex-col h-screen sticky top-0 shrink-0 select-none z-20">
      {/* Header Madrasah */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-amber-400 p-0.5 shadow-lg shadow-emerald-950 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-slate-950/80 backdrop-blur-md rounded-[14px] flex items-center justify-center overflow-hidden">
              {madrasahInfo.logoUrl ? (
                <img src={madrasahInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-amber-400" />
              )}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-white tracking-wide uppercase truncate">
              {madrasahInfo.singkatan || madrasahInfo.nama}
            </h2>
            <p className="text-[11px] text-emerald-400 font-medium truncate">
              {madrasahInfo.akreditasi}
            </p>
          </div>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-4 py-3 mx-4 my-3 rounded-2xl glass-panel-subtle border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Mode Akses</p>
            <p className="text-xs font-bold text-white capitalize">{activeRole === 'admin' ? 'Admin / Kepala' : activeRole === 'guru' ? 'Ustadz / Guru' : activeRole === 'siswa' ? 'Santri / Siswa' : 'Wali Santri'}</p>
          </div>
        </div>
        <button
          onClick={onOpenRoleModal}
          className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
        >
          Ubah
        </button>
      </div>

      {/* Menu List */}
      <div className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto no-scrollbar">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Navigasi Utama
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/80 via-emerald-700/80 to-teal-700/80 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/40 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm' 
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info & Reset */}
      <div className="p-4 border-t border-white/10 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-2">
          <span>Total Siswa: <strong className="text-white">{siswaList.length}</strong></span>
          <span>Asatidz: <strong className="text-white">{guruList.length}</strong></span>
        </div>

        <button
          onClick={() => setIsResetModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl glass-button text-slate-300 hover:text-white text-xs font-medium transition-colors"
          title="Manajemen & Reset database"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset Data Awal</span>
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-2">
          v2.4.0 &bull; {madrasahInfo.jenjang}
        </p>
      </div>
    </aside>
  );
};

