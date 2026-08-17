import React, { useState, useEffect } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  getAccessToken, 
  googleSignIn, 
  setCachedAccessToken,
  initAuth 
} from '../lib/firebase';
import { 
  listDriveSpreadsheets, 
  createMadrasahSpreadsheet, 
  syncToExistingSpreadsheet,
  readSpreadsheetRange,
  getSpreadsheetDetails,
  buildMadrasahSheetsData,
  generateModuleCSV,
  GoogleDriveFile, 
  SpreadsheetDetails 
} from '../lib/googleSheetsService';
import { 
  FileSpreadsheet, 
  Cloud, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  Plus, 
  HardDrive, 
  FileText, 
  Download, 
  Upload, 
  Users, 
  GraduationCap, 
  BookOpen, 
  QrCode, 
  PiggyBank, 
  Store, 
  AlertCircle, 
  Lock, 
  Database,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FolderOpen,
  HelpCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GoogleSheetsView: React.FC = () => {
  const { 
    madrasahInfo,
    siswaList,
    guruList,
    absensiList,
    nilaiList,
    tahfidzList,
    tagihanList,
    tabunganAccounts,
    mutabaahToday,
    produkKoperasiList,
    currentUser
  } = useMadrasah();

  // Local Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast(prev => ({ message, type }));
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<SpreadsheetDetails | null>(null);
  const [previewTab, setPreviewTab] = useState<string>('Data Santri');
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  // Guide Toggle
  const [showGuide, setShowGuide] = useState<boolean>(true);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [lastExportedUrl, setLastExportedUrl] = useState<string | null>(null);
  const [customSheetTitle, setCustomSheetTitle] = useState<string>(
    `[${madrasahInfo.nama}] Master Database Terpadu - ${madrasahInfo.tahunAjaran}`
  );

  // Confirmation Modal for Syncing/Overwriting
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'overwrite' | 'create';
    targetId?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'create',
  });

  // Selected Modules to Export
  const [selectedModules, setSelectedModules] = useState<{ [key: string]: boolean }>({
    lembaga: true,
    siswa: true,
    guru: true,
    nilai: true,
    absensi: true,
    tahfidz: true,
    tagihan: true,
    tabungan: true,
    mutabaah: true,
    koperasi: true,
  });

  // Check auth state on mount
  useEffect(() => {
    getAccessToken().then(token => {
      if (token) {
        setAccessToken(token);
        loadDriveFiles(token);
      }
    });

    const unsubscribe = initAuth(
      (_user, token) => {
        setAccessToken(token);
        loadDriveFiles(token);
      },
      () => {
        // Not signed in
      }
    );

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        showToast(`Berhasil terhubung dengan Google: ${res.user.email || 'Akun Google'}`, 'success');
        loadDriveFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('Gagal login Google. Pastikan memberikan izin akses Google Sheets & Drive.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadDriveFiles = async (token: string) => {
    setIsLoadingFiles(true);
    try {
      const files = await listDriveSpreadsheets(token);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Failed to load drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const buildExportPayload = () => {
    return {
      madrasahInfo: {
        nama: madrasahInfo.nama,
        nsm: madrasahInfo.nsm,
        npsn: madrasahInfo.npsn,
        alamat: madrasahInfo.alamat,
        kepalaMadrasah: madrasahInfo.kepalaMadrasah,
        tahunAjaran: madrasahInfo.tahunAjaran,
        semester: madrasahInfo.semester,
      },
      siswaList: siswaList.map(s => ({
        nisn: s.nisn,
        nis: s.nis,
        nama: s.nama,
        kelas: s.kelas,
        jenisKelamin: s.jenisKelamin,
        namaWali: s.namaWali,
        teleponWali: s.teleponWali,
        status: s.status,
        alamat: s.alamat,
      })),
      guruList: guruList.map(g => ({
        nip: g.nip,
        nama: g.nama,
        mapel: g.mapel,
        jabatan: g.jabatan,
        noHp: g.noHp,
        status: g.status,
      })),
      absensiList: absensiList.map(a => ({
        id: a.id,
        siswaNama: a.siswaNama,
        kelas: a.kelas,
        tanggal: a.tanggal,
        status: a.status,
        waktu: a.waktu,
        lokasi: a.lokasi,
      })),
      nilaiList: nilaiList.map(n => ({
        id: n.id,
        siswaNama: n.siswaNama,
        mapel: n.mapel,
        kelas: n.kelas,
        semester: n.semester,
        tugas: n.tugas,
        uts: n.uts,
        uas: n.uas,
        nilaiAkhir: n.nilaiAkhir,
        predikat: n.predikat,
      })),
      tahfidzList: tahfidzList.map(t => ({
        id: t.id,
        siswaNama: t.siswaNama,
        surah: t.surah,
        ayat: t.ayat,
        juz: t.juz,
        tanggal: t.tanggal,
        predikat: t.predikat,
        status: t.status,
      })),
      tagihanList: tagihanList.map(tg => ({
        id: tg.id,
        siswaNama: tg.siswaNama,
        kelas: tg.kelas,
        jenisTagihan: tg.jenisTagihan,
        bulan: tg.bulan,
        nominal: tg.nominal,
        status: tg.status,
        tanggalBayar: tg.tanggalBayar,
      })),
      tabunganList: tabunganAccounts.map(tb => ({
        id: tb.id,
        noRekening: tb.noRekening,
        namaSantri: tb.namaSantri,
        kelas: tb.kelas,
        saldo: tb.saldo,
        limitHarian: tb.limitHarian,
        status: tb.status,
      })),
      mutabaahList: [
        {
          tanggal: new Date().toISOString().split('T')[0],
          subuh: mutabaahToday.subuh,
          dzuhur: mutabaahToday.dzuhur,
          ashar: mutabaahToday.ashar,
          maghrib: mutabaahToday.maghrib,
          isya: mutabaahToday.isya,
          dhuha: mutabaahToday.dhuha,
          tahajjud: mutabaahToday.tahajjud,
          tilawahJuz: mutabaahToday.tilawahJuz,
          skor: mutabaahToday.skor,
        }
      ],
      koperasiProdukList: (produkKoperasiList || []).map(kp => ({
        sku: kp.sku,
        nama: kp.nama,
        kategori: kp.kategori,
        hargaBeli: kp.hargaBeli,
        hargaJual: kp.hargaJual,
        stok: kp.stok,
        terjual: kp.terjual,
      })),
    };
  };

  const handleCreateNewSpreadsheet = async () => {
    if (!accessToken) {
      showToast('Silakan hubungkan Akun Google terlebih dahulu (Klik tombol di kanan atas).', 'info');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Buat & Ekspor ke Google Spreadsheet Baru',
      description: `Sistem akan membuat file Google Spreadsheet baru di Google Drive Anda berjudul "${customSheetTitle}" dengan ${Object.values(selectedModules).filter(Boolean).length} sheet/tab data lengkap.`,
      actionType: 'create',
    });
  };

  const handleSyncToExisting = (file: GoogleDriveFile) => {
    if (!accessToken) return;
    setConfirmModal({
      isOpen: true,
      title: `Sinkronkan Data ke "${file.name}"`,
      description: `Sistem akan menyinkronkan seluruh database ${madrasahInfo.nama} (${siswaList.length} Santri, ${guruList.length} Guru, ${nilaiList.length} Nilai, ${tabunganAccounts.length} Rekening Tabungan) ke dalam file Google Sheets ini. Lanjutkan?`,
      actionType: 'overwrite',
      targetId: file.id,
    });
  };

  const executeConfirmedAction = async () => {
    const { actionType, targetId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));

    if (!accessToken) return;

    setIsExporting(true);
    setExportProgress(25);

    try {
      const payload = buildExportPayload();
      setExportProgress(50);

      if (actionType === 'create') {
        const result = await createMadrasahSpreadsheet(accessToken, customSheetTitle, payload);
        setExportProgress(90);
        setLastExportedUrl(result.spreadsheetUrl);
        setSelectedSpreadsheet(result);
        showToast(`✓ Berhasil membuat Google Spreadsheet baru!`, 'success');
        loadDriveFiles(accessToken);
      } else if (actionType === 'overwrite' && targetId) {
        await syncToExistingSpreadsheet(accessToken, targetId, payload);
        setExportProgress(90);
        const details = await getSpreadsheetDetails(accessToken, targetId);
        setSelectedSpreadsheet(details);
        setLastExportedUrl(details.spreadsheetUrl);
        showToast(`✓ Berhasil menyinkronkan data ke Google Spreadsheet!`, 'success');
      }
      setExportProgress(100);
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(`Gagal mengekspor data: ${err.message || 'Layanan Google sementara sibuk, silakan coba beberapa saat lagi.'}`, 'error');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  const handleSelectDriveFile = async (file: GoogleDriveFile) => {
    if (!accessToken) return;
    setIsLoadingPreview(true);
    try {
      const details = await getSpreadsheetDetails(accessToken, file.id);
      setSelectedSpreadsheet(details);
      
      // Load first sheet preview
      if (details.sheets.length > 0) {
        const firstTab = details.sheets[0].title;
        setPreviewTab(firstTab);
        const values = await readSpreadsheetRange(accessToken, file.id, `'${firstTab}'!A1:Z25`);
        setPreviewData(values);
      }
    } catch (err: any) {
      console.error('Error fetching sheet details:', err);
      showToast('Gagal membaca preview Google Spreadsheet.', 'error');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSwitchTabPreview = async (tabTitle: string) => {
    if (!accessToken || !selectedSpreadsheet) return;
    setPreviewTab(tabTitle);
    setIsLoadingPreview(true);
    try {
      const values = await readSpreadsheetRange(accessToken, selectedSpreadsheet.spreadsheetId, `'${tabTitle}'!A1:Z25`);
      setPreviewData(values);
    } catch (err) {
      console.warn('Could not read tab range:', err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Direct CSV Downloader helper for zero-failure immediate use
  const handleDownloadCSV = (tabIndex: number) => {
    const payload = buildExportPayload();
    const tabsData = buildMadrasahSheetsData(payload);
    const tab = tabsData[tabIndex] || tabsData[1];
    const csvContent = generateModuleCSV(tab.headers, tab.rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${madrasahInfo.nama}_${tab.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ File CSV "${tab.title}" berhasil diunduh.`, 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold max-w-md ${
              toast.type === 'success' 
                ? 'bg-emerald-800 text-white border-emerald-600' 
                : toast.type === 'error' 
                ? 'bg-rose-800 text-white border-rose-600'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-white/80 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              INTEGRASI GOOGLE SHEETS & DRIVE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Google Sheets & Cloud Sync
            </h1>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Sinkronisasi data santri, guru, raport, absensi, setoran tahfidz, tabungan wadiah, dan POS koperasi langsung ke akun Google Sheets & Google Drive Anda secara terstruktur.
            </p>
          </div>

          {/* Google Auth Status Card */}
          <div className="bg-emerald-900/60 backdrop-blur-md border border-emerald-600/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-medium">Status Akun Google</span>
              {accessToken ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Terhubung
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                  Belum Terhubung
                </span>
              )}
            </div>

            {accessToken ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white uppercase">
                    {currentUser.email ? currentUser.email.charAt(0) : 'G'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-emerald-200/70 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-700/60 flex items-center justify-between text-[11px] text-emerald-300">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Izin: Sheets & Drive Aktif
                  </span>
                  <button 
                    onClick={() => {
                      setCachedAccessToken(null);
                      setAccessToken(null);
                      showToast('Koneksi Google dinonaktifkan.', 'info');
                    }}
                    className="text-emerald-200/70 hover:text-white underline cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-2.5 bg-white text-gray-800 hover:bg-gray-50 active:bg-gray-100 font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  {isAuthenticating ? 'Menghubungkan...' : 'Hubungkan Akun Google'}
                </button>
                <p className="text-[10px] text-emerald-200/70 text-center">
                  Klik untuk otentikasi Google agar file langsung masuk ke Drive Anda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panduan Langkah Mudah: Cara Munculkan Data di Google Sheets */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Cara Agar Data Muncul di Google Sheets:</span>
          </div>
          <button 
            onClick={() => setShowGuide(!showGuide)} 
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            {showGuide ? 'Sembunyikan Panduan' : 'Tampilkan Panduan'}
          </button>
        </div>

        {showGuide && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <h4 className="text-xs font-bold text-slate-800">Hubungkan Akun</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Klik tombol <strong>"Hubungkan Akun Google"</strong> di kanan atas dan pilih akun Google Anda.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <h4 className="text-xs font-bold text-slate-800">Pilih Modul Data</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pilih tab database yang ingin diekspor (Santri, Guru, Nilai, Presensi, Tabungan, POS, dll).
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <h4 className="text-xs font-bold text-slate-800">Klik Ekspor</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Klik tombol hijau <strong>"Ekspor & Buat Google Spreadsheet Baru"</strong> di panel bawah.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <h4 className="text-xs font-bold text-slate-800">Buka di Sheets</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Klik tombol <strong>"Buka File"</strong> untuk melihat dan mengedit data langsung di Google Sheets.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Export Workspace & Drive Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ekspor Baru ke Google Sheets */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Ekspor Database ke Google Sheets</h2>
                  <p className="text-xs text-slate-500">Buat spreadsheet baru di Google Drive Anda</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                10 Modul Lengkap
              </span>
            </div>

            {/* Form Input */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Judul File Google Spreadsheet
                </label>
                <div className="relative">
                  <FileSpreadsheet className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customSheetTitle}
                    onChange={(e) => setCustomSheetTitle(e.target.value)}
                    placeholder="Nama Spreadsheet..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Modul Pilihan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Pilih Sheet / Tab yang Disinkronkan
                  </label>
                  <button
                    onClick={() => {
                      const allSelected = Object.values(selectedModules).every(Boolean);
                      const updated: { [k: string]: boolean } = {};
                      Object.keys(selectedModules).forEach(k => updated[k] = !allSelected);
                      setSelectedModules(updated);
                    }}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                  >
                    {Object.values(selectedModules).every(Boolean) ? 'Batalkan Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'lembaga', label: 'Info Lembaga', count: 'Profil NSM', icon: Database, tabIdx: 0 },
                    { id: 'siswa', label: 'Data Santri', count: `${siswaList.length} Santri`, icon: Users, tabIdx: 1 },
                    { id: 'guru', label: 'Guru & Asatidz', count: `${guruList.length} Asatidz`, icon: GraduationCap, tabIdx: 2 },
                    { id: 'nilai', label: 'Rekap Raport', count: `${nilaiList.length} Mapel`, icon: BookOpen, tabIdx: 3 },
                    { id: 'absensi', label: 'Presensi Digital', count: `${absensiList.length} Log GPS`, icon: QrCode, tabIdx: 4 },
                    { id: 'tahfidz', label: 'Setoran Tahfidz', count: `${tahfidzList.length} Setoran`, icon: BookOpen, tabIdx: 5 },
                    { id: 'tagihan', label: 'SPP & Keuangan', count: `${tagihanList.length} Tagihan`, icon: FileText, tabIdx: 6 },
                    { id: 'tabungan', label: 'Tabungan Wadiah', count: `${tabunganAccounts.length} Rekening`, icon: PiggyBank, tabIdx: 7 },
                    { id: 'mutabaah', label: 'Mutabaah Yaumiyyah', count: 'Amalan Harian', icon: Sparkles, tabIdx: 8 },
                    { id: 'koperasi', label: 'POS & Koperasi', count: `${produkKoperasiList?.length || 17} SKU`, icon: Store, tabIdx: 9 },
                  ].map((mod) => {
                    const IconComp = mod.icon;
                    const isChecked = !!selectedModules[mod.id];
                    return (
                      <div
                        key={mod.id}
                        onClick={() => setSelectedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isChecked 
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                            : 'bg-slate-50 border-slate-200/80 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold truncate">{mod.label}</p>
                            <p className="text-[10px] text-slate-500 truncate">{mod.count}</p>
                          </div>
                        </div>

                        {/* Quick CSV Download Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadCSV(mod.tabIdx);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          title={`Download CSV ${mod.label}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  onClick={handleCreateNewSpreadsheet}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sedang Membuat File di Google Drive ({exportProgress}%)...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      Ekspor & Buat Google Spreadsheet Baru
                    </>
                  )}
                </button>
              </div>

              {/* Success Export Banner */}
              {lastExportedUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-emerald-950 truncate">Google Spreadsheet Berhasil Dibuat!</p>
                      <p className="text-[11px] text-emerald-700 truncate">{lastExportedUrl}</p>
                    </div>
                  </div>
                  <a
                    href={lastExportedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shrink-0 shadow-md cursor-pointer"
                  >
                    Buka File
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Google Drive Spreadsheet Browser */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">File Google Drive</h2>
                  <p className="text-xs text-slate-500">Daftar spreadsheet di Google Drive Anda</p>
                </div>
              </div>
              {accessToken && (
                <button
                  onClick={() => loadDriveFiles(accessToken)}
                  disabled={isLoadingFiles}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Muat Ulang File Drive"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* List Drive Files */}
            <div className="mt-4 flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1">
              {!accessToken ? (
                <div className="py-12 text-center space-y-3">
                  <Lock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Hubungkan akun Google Anda dengan menekan tombol di pojok kanan atas untuk melihat daftar file spreadsheet di Google Drive Anda.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Hubungkan Google Sekarang
                  </button>
                </div>
              ) : isLoadingFiles ? (
                <div className="py-12 text-center space-y-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                  <p className="text-xs">Memuat spreadsheet dari Google Drive...</p>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="py-12 text-center space-y-2 text-slate-400">
                  <FolderOpen className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium text-slate-600">Belum ada file Google Sheet</p>
                  <p className="text-[11px] text-slate-400">Klik 'Ekspor & Buat' di sebelah kiri untuk membuat file pertama Anda.</p>
                </div>
              ) : (
                driveFiles.map((file) => {
                  const isSelected = selectedSpreadsheet?.spreadsheetId === file.id;
                  return (
                    <div
                      key={file.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                        isSelected 
                          ? 'bg-blue-50/80 border-blue-300 shadow-sm' 
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 overflow-hidden">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="overflow-hidden">
                            <h3 className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                              {file.name}
                            </h3>
                            <p className="text-[10px] text-slate-400">
                              Diperbarui: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                            </p>
                          </div>
                        </div>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                            title="Buka di tab baru Google Sheets"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <button
                          onClick={() => handleSelectDriveFile(file)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                        >
                          Lihat Preview
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSyncToExisting(file)}
                          className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Timpa & Sinkronkan
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Data Preview Section */}
      {selectedSpreadsheet && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-800">{selectedSpreadsheet.title}</h2>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                    {selectedSpreadsheet.sheets.length} Sheets
                  </span>
                </div>
                <p className="text-xs text-slate-500">Live Preview Data Range Tab Aktif</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={selectedSpreadsheet.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Buka di Google Sheets
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Sheet Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
            {selectedSpreadsheet.sheets.map((sheet) => (
              <button
                key={sheet.sheetId}
                onClick={() => handleSwitchTabPreview(sheet.title)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  previewTab === sheet.title
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sheet.title}
              </button>
            ))}
          </div>

          {/* Table Preview Grid */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-96">
            {isLoadingPreview ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
                <p className="text-xs">Membaca data tab dari Google Sheets...</p>
              </div>
            ) : previewData.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs">Tidak ada baris data pada tab ini.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-700 text-white font-semibold sticky top-0">
                    {previewData[0]?.map((col: any, idx: number) => (
                      <th key={idx} className="py-2.5 px-3 border-r border-emerald-600 last:border-0 whitespace-nowrap">
                        {col || `Kolom ${idx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.slice(1).map((row: any[], rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                      {row.map((cell: any, cIdx: number) => (
                        <td key={cIdx} className="py-2 px-3 border-r border-slate-100 last:border-0 text-slate-700 whitespace-nowrap">
                          {cell?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal (Destructive / Overwrite Safety) */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center gap-3 text-emerald-700">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{confirmModal.title}</h3>
                  <p className="text-xs text-slate-500">Konfirmasi Ekspor Google Sheets</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {confirmModal.description}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md cursor-pointer"
                >
                  Lanjutkan & Ekspor Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
