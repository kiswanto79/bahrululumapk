import React, { useState, useEffect } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  BookOpen, 
  QrCode, 
  BookmarkCheck, 
  Wallet, 
  CreditCard, 
  BookMarked, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Flame, 
  Award, 
  Compass, 
  Volume2, 
  Sun, 
  Moon, 
  Star,
  Layers,
  ArrowUpRight,
  TrendingUp,
  HeartHandshake,
  PiggyBank,
  Store,
  FileSpreadsheet,
  MapPin,
  Pin
} from 'lucide-react';

interface DashboardViewProps {
  onOpenRoleModal: () => void;
  onOpenNotificationModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenRoleModal, onOpenNotificationModal }) => {
  const { 
    currentUser, 
    activeRole, 
    setActiveTab, 
    siswaList, 
    guruList, 
    absensiList, 
    tahfidzList, 
    tagihanList, 
    tabunganAccounts,
    produkKoperasiList,
    pengumumanList,
    mutabaahToday,
    updateMutabaah,
    madrasahInfo,
    triggerConfetti 
  } = useMadrasah();

  const [activePrayer, setActivePrayer] = useState('Dzuhur');
  const [countdownPrayer, setCountdownPrayer] = useState('02:14:35');

  const prayerTimes = [
    { name: 'Subuh', time: '04:28', icon: Moon },
    { name: 'Terbit', time: '05:42', icon: Sun },
    { name: 'Dzuhur', time: '11:58', icon: Sun, active: true },
    { name: 'Ashar', time: '15:18', icon: Sun },
    { name: 'Maghrib', time: '17:52', icon: Moon },
    { name: 'Isya', time: '19:03', icon: Moon },
  ];

  const quickActions = [
    { id: 'sheets', label: 'Google Sheets Sync', desc: 'Ekspor 2 Arah & Drive Cloud', icon: FileSpreadsheet, color: 'from-emerald-600 to-teal-700', badge: 'Cloud Sync' },
    { id: 'koperasi', label: 'POS Kasir Koperasi', desc: 'Mart & Smart Card Debet', icon: Store, color: 'from-amber-500 to-orange-600', badge: `${produkKoperasiList?.length || 17} SKU` },
    { id: 'tabungan', label: 'Tabungan & Kas Saku', desc: 'Wadiah Santri & Asatidz', icon: PiggyBank, color: 'from-amber-500 to-emerald-600', badge: `${tabunganAccounts.length} Rek` },
    { id: 'absensi', label: 'Presensi Digital', desc: 'Selfie & GPS / QR Code', icon: QrCode, color: 'from-emerald-500 to-teal-600', badge: 'Live' },
    { id: 'siakad', label: 'SIAKAD & Nilai', desc: 'Jadwal & E-Raport', icon: BookOpen, color: 'from-blue-600 to-indigo-700', badge: 'Merdeka' },
    { id: 'tahfidz', label: 'Buku Tahfidz', desc: 'Mutaba\'ah & Ziyadah', icon: BookmarkCheck, color: 'from-amber-500 to-yellow-600', badge: 'Qurani' },
    { id: 'keuangan', label: 'SPP & Keuangan', desc: 'Infaq, Kas & Kwitansi', icon: Wallet, color: 'from-emerald-600 to-green-700', badge: 'VA/QRIS' },
    { id: 'kartu', label: 'E-Kartu Santri', desc: 'Smart ID Card Barcode', icon: CreditCard, color: 'from-purple-600 to-fuchsia-700', badge: 'E-KTS' },
    { id: 'doaquran', label: 'Al-Qur\'an & Doa', desc: 'Tasbih & Doa Harian', icon: BookMarked, color: 'from-teal-500 to-cyan-600', badge: 'Ibadah' },
    { id: 'manajemen', label: 'Master Santri', desc: 'Data Siswa & Asatidz', icon: Users, color: 'from-slate-700 to-slate-900', badge: 'Admin' },
  ];

  // Stats calculations
  const totalSiswa = siswaList.length;
  const hadirHariIni = absensiList.filter(a => a.status === 'hadir').length;
  const persenHadir = totalSiswa ? Math.round((hadirHariIni / totalSiswa) * 100) : 100;
  const pendingSPP = tagihanList.filter(t => t.status === 'belum_lunas').length;

  return (
    <div className="space-y-5 pb-16 lg:pb-6">
      {/* 1. Islamic Luxury Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-emerald border border-emerald-400/30 shadow-2xl p-5 sm:p-7 text-white">
        {/* Background Islamic Pattern Accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Ahlan wa Sahlan
              </span>
              <span className="text-xs text-slate-300">
                &bull; 26 Safar 1448 H
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Selamat Datang, <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300">{currentUser.name}</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {madrasahInfo.nama} &bull; {madrasahInfo.semboyan}
            </p>

            {/* Arabic Quranic Verse of the day */}
            <div className="pt-2 flex items-center gap-2 text-amber-200/90 text-xs sm:text-sm">
              <span className="font-arabic text-base sm:text-lg">يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ</span>
            </div>
          </div>

          {/* Quick Action in Banner */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('absensi')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/60 transition-all transform active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Presensi Sekarang</span>
            </button>

            <button
              onClick={onOpenRoleModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-2xl glass-button text-slate-200 text-xs font-semibold transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulasi Peran</span>
            </button>

            {activeRole === 'admin' && (
              <button
                onClick={() => setActiveTab('manajemen')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                title="Edit Nama, Semboyan, Logo & Profil Madrasah"
              >
                <span>⚙️ Edit Beranda & Profil</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Jadwal Sholat & Waktu Ibadah Bar */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Jadwal Sholat & Waktu Ibadah</h3>
              <p className="text-[11px] text-slate-400">Wilayah Kendal & Sekitarnya (Kemenag RI)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Menuju Dzuhur: 11:58 WIB</span>
          </div>
        </div>

        {/* Prayer Pills Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {prayerTimes.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  p.active
                    ? 'glass-panel-amber border-amber-400/60 shadow-md'
                    : 'glass-panel-subtle border-white/5'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-300">
                  <Icon className={`w-3 h-3 ${p.active ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{p.name}</span>
                </div>
                <p className={`text-xs sm:text-sm font-bold font-mono mt-1 ${p.active ? 'text-amber-300 font-extrabold' : 'text-slate-200'}`}>
                  {p.time}
                </p>
                {p.active && (
                  <span className="text-[9px] font-bold text-emerald-400 block mt-0.5">Berikutnya</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Quick Action Launcher Grid (APK Mobile Style) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Layanan Utama Madrasah
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              APK Menu
            </span>
          </div>
          <span className="text-xs text-slate-400">Klik untuk membuka</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                className="group relative text-left p-3.5 sm:p-4 rounded-2xl glass-card border border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${action.color} p-0.5 shadow-md flex items-center justify-center text-white`}>
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10">
                    {action.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {action.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {action.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Bento Analytics & Live Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Presensi Hari Ini */}
        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Kehadiran Hari Ini</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{hadirHariIni}</span>
            <span className="text-xs text-slate-400">/ {totalSiswa} Santri</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${persenHadir}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1.5 flex items-center justify-between">
            <span>Tingkat Presensi</span>
            <strong>{persenHadir}%</strong>
          </p>
        </div>

        {/* Card 2: Setoran Tahfidz */}
        <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Setoran Tahfidz</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{tahfidzList.length}</span>
            <span className="text-xs text-slate-400">Catatan Ziyadah</span>
          </div>
          <p className="text-[11px] text-amber-300 font-medium mt-3 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>Predikat Mumtaz: 95%</span>
          </p>
        </div>

        {/* Card 3: Baitul Maal / SPP */}
        <div className="p-4 rounded-2xl glass-panel border border-teal-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Kas & Tagihan SPP</span>
            <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {tagihanList.filter(t => t.status === 'lunas').length}
            </span>
            <span className="text-xs text-slate-400">Lunas Bulan Ini</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-3 flex items-center justify-between">
            <span>Sisa Belum Bayar:</span>
            <strong className="text-amber-400 font-bold">{pendingSPP} Santri</strong>
          </p>
        </div>

        {/* Card 4: Tenaga Pendidik */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Dewan Asatidz</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{guruList.length}</span>
            <span className="text-xs text-slate-400">Ustadz & Ustadzah</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>KBM Aktif Pagi & Sore</span>
          </p>
        </div>
      </div>

      {/* 5. Split Section: Mutaba'ah Ibadah Santri & Latest Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Mutaba'ah Yaumiyah Tracker */}
        <div className="glass-panel border border-white/10 rounded-3xl p-5 shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Mutaba'ah Ibadah Yaumiyah</h3>
                <p className="text-[11px] text-slate-400">Checklist amalan harian santri</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('tahfidz')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sholat Wajib Checkboxes */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Sholat Fardhu Berjamaah:
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { key: 'subuh', label: 'Subuh' },
                { key: 'dzuhur', label: 'Dzuhur' },
                { key: 'ashar', label: 'Ashar' },
                { key: 'maghrib', label: 'Maghrib' },
                { key: 'isya', label: 'Isya' },
              ].map(item => {
                const checked = mutabaahToday.sholatWajib[item.key as keyof typeof mutabaahToday.sholatWajib];
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      updateMutabaah({
                        sholatWajib: {
                          ...mutabaahToday.sholatWajib,
                          [item.key]: !checked
                        }
                      });
                      triggerConfetti();
                    }}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      checked
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                        : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] block">{item.label}</span>
                    <span className="text-xs mt-0.5 block">{checked ? '✓' : '○'}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider pt-2">
              Amalan Sunnah & Tilawah:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  updateMutabaah({
                    sholatSunnah: {
                      ...mutabaahToday.sholatSunnah,
                      dhuha: !mutabaahToday.sholatSunnah.dhuha
                    }
                  });
                }}
                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                  mutabaahToday.sholatSunnah.dhuha
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'glass-panel-subtle border-white/5 text-slate-400'
                }`}
              >
                Sholat Dhuha {mutabaahToday.sholatSunnah.dhuha ? '✓' : ''}
              </button>

              <button
                onClick={() => {
                  updateMutabaah({
                    sholatSunnah: {
                      ...mutabaahToday.sholatSunnah,
                      tahajjud: !mutabaahToday.sholatSunnah.tahajjud
                    }
                  });
                }}
                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                  mutabaahToday.sholatSunnah.tahajjud
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'glass-panel-subtle border-white/5 text-slate-400'
                }`}
              >
                Qiyamul Lail {mutabaahToday.sholatSunnah.tahajjud ? '✓' : ''}
              </button>

              <button
                onClick={() => {
                  updateMutabaah({
                    dzikirPagi: !mutabaahToday.dzikirPagi
                  });
                }}
                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                  mutabaahToday.dzikirPagi
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'glass-panel-subtle border-white/5 text-slate-400'
                }`}
              >
                Al-Ma'tsurat {mutabaahToday.dzikirPagi ? '✓' : ''}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Latest Announcements & Agenda */}
        <div className="glass-panel border border-white/10 rounded-3xl p-5 shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Maklumat & Pengumuman</h3>
                <p className="text-[11px] text-slate-400">Informasi terpusat madrasah</p>
              </div>
            </div>

            <button
              onClick={onOpenNotificationModal}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Kelola, Edit, atau Tambah Pengumuman & Agenda Madrasah"
            >
              <span>Kelola & Edit ({pengumumanList.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pengumumanList.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={onOpenNotificationModal}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  item.pin 
                    ? 'glass-panel-amber border-amber-400/40 shadow-md' 
                    : 'glass-card border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {item.pin && (
                      <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        <Pin className="w-2.5 h-2.5" /> Pin
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.kategori}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">
                    Target: <strong className="text-white">{item.target}</strong>
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 mb-1">{item.judul}</h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2.5">
                  {item.isi}
                </p>

                {/* Tanggal & Waktu Banner */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-[10px] text-slate-300 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 text-amber-300 font-medium">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>{item.tanggal || '16 Agustus 2026'}</span>
                    </div>
                    <span className="text-slate-500">•</span>
                    <div className="flex items-center gap-1 text-emerald-300 font-semibold">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{item.waktu || '08:00 WIB'}</span>
                    </div>
                  </div>

                  {item.lokasi && (
                    <div className="flex items-center gap-1 text-rose-300 font-medium truncate max-w-[140px]">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">{item.lokasi}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
