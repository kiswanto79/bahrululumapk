import React, { useState, useMemo } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { AbsensiGuruRecord, AbsensiRecord, Siswa } from '../types';
import { 
  QrCode, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  UserCheck, 
  AlertCircle, 
  Download, 
  Filter, 
  Sparkles,
  RefreshCw,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  Users,
  Check,
  Search,
  BookOpen,
  CalendarDays,
  History,
  FileSpreadsheet,
  ArrowUpDown
} from 'lucide-react';

export const AbsensiView: React.FC = () => {
  const { 
    siswaList, 
    guruList,
    kelasList,
    absensiList, 
    absensiGuruList,
    recordAbsensi, 
    recordBulkAbsensi,
    recordAbsensiGuru,
    activeRole, 
    currentUser, 
    triggerConfetti 
  } = useMadrasah();

  // Helper date functions
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Target category: 'santri' or 'asatidz'
  const [targetCategory, setTargetCategory] = useState<'santri' | 'asatidz'>('santri');
  const [activeTab, setActiveTab] = useState<'kolektif' | 'live' | 'rekap' | 'log'>('kolektif');
  
  // Selected class for Santri filters
  const [selectedKelas, setSelectedKelas] = useState<string>('9A Unggulan');
  const [method, setMethod] = useState<'gps' | 'kamera' | 'qr'>('gps');
  
  // Date filter: 'semua' | todayStr | yesterdayStr | custom YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<string>('semua');

  // Single Santri selection
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>(
    activeRole === 'siswa' ? currentUser.id : siswaList[0]?.id || 'sis-01'
  );
  
  // Asatidz selection
  const [selectedGuruId, setSelectedGuruId] = useState<string>(
    guruList[0]?.id || 'gur-01'
  );

  const [statusSiswa, setStatusSiswa] = useState<'hadir' | 'izin' | 'sakit' | 'alpha'>('hadir');
  const [statusGuru, setStatusGuru] = useState<'hadir' | 'izin' | 'sakit' | 'dinas_luar'>('hadir');
  const [tugasMengajar, setTugasMengajar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Bulk / Kolektif state per kelas
  const [bulkStatusMap, setBulkStatusMap] = useState<Record<string, 'hadir' | 'izin' | 'sakit' | 'alpha'>>({});
  const [bulkCatatanMap, setBulkCatatanMap] = useState<Record<string, string>>({});

  // Simulated camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Search filter in log/rekap
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique dates from attendance lists
  const availableDates = useMemo(() => {
    const dateSet = new Set<string>();
    dateSet.add(todayStr);
    dateSet.add(yesterdayStr);
    absensiList.forEach(a => { if (a.tanggal) dateSet.add(a.tanggal); });
    absensiGuruList.forEach(g => { if (g.tanggal) dateSet.add(g.tanggal); });
    return Array.from(dateSet).sort().reverse();
  }, [absensiList, absensiGuruList, todayStr, yesterdayStr]);

  // Extract unique classes
  const classOptions = useMemo(() => {
    const classSet = new Set<string>();
    kelasList.forEach(k => classSet.add(k.nama));
    siswaList.forEach(s => classSet.add(s.kelas));
    return Array.from(classSet).filter(Boolean);
  }, [kelasList, siswaList]);

  // Filter students based on selected class
  const filteredSiswaByKelas = useMemo(() => {
    if (selectedKelas === 'Semua') return siswaList;
    return siswaList.filter(s => s.kelas.toLowerCase() === selectedKelas.toLowerCase());
  }, [siswaList, selectedKelas]);

  // Selected entities
  const selectedSiswa = siswaList.find(s => s.id === selectedSiswaId) || filteredSiswaByKelas[0] || siswaList[0];
  const selectedGuru = guruList.find(g => g.id === selectedGuruId) || guruList[0];

  // Initialize or get status for a student in bulk mode on the selected date
  const getStudentBulkStatus = (sId: string): 'hadir' | 'izin' | 'sakit' | 'alpha' => {
    if (bulkStatusMap[sId]) return bulkStatusMap[sId];
    // Check if already has attendance on the selectedDate
    const existing = absensiList.find(a => a.siswaId === sId && (selectedDate === 'semua' || a.tanggal === selectedDate));
    return existing ? existing.status : 'hadir';
  };

  const handleSetStudentStatus = (sId: string, status: 'hadir' | 'izin' | 'sakit' | 'alpha') => {
    setBulkStatusMap(prev => ({
      ...prev,
      [sId]: status
    }));
  };

  const handleSetAllPresent = () => {
    const newMap: Record<string, 'hadir' | 'izin' | 'sakit' | 'alpha'> = {};
    filteredSiswaByKelas.forEach(s => {
      newMap[s.id] = 'hadir';
    });
    setBulkStatusMap(prev => ({ ...prev, ...newMap }));
    setSuccessMessage(`Seluruh ${filteredSiswaByKelas.length} santri kelas ${selectedKelas} telah ditandai HADIR.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSaveBulkAttendance = async () => {
    if (filteredSiswaByKelas.length === 0) return;
    setIsProcessing(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const targetDateToSave = selectedDate === 'semua' ? todayStr : selectedDate;

    const records: Omit<AbsensiRecord, 'id'>[] = filteredSiswaByKelas.map(s => {
      const st = getStudentBulkStatus(s.id);
      return {
        siswaId: s.id,
        siswaNama: s.nama,
        kelas: s.kelas,
        tanggal: targetDateToSave,
        waktuMasuk: timeStr,
        status: st,
        metode: 'manual',
        lokasi: `Ruang Kelas ${s.kelas}`,
        catatan: bulkCatatanMap[s.id] || (st === 'hadir' ? 'Hadir di Kelas' : `Keterangan: ${st}`),
      };
    });

    await recordBulkAbsensi(records);
    setIsProcessing(false);
    setSuccessMessage(`Alhamdulillah! Presensi tanggal ${targetDateToSave} kelas ${selectedKelas} (${records.length} santri) berhasil disimpan.`);
    triggerConfetti();

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  const handleStartCamera = () => {
    setCameraActive(true);
    setCapturedPhoto(null);
  };

  const handleCapturePhoto = () => {
    const photoUrl = targetCategory === 'asatidz'
      ? selectedGuru?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      : selectedSiswa?.fotoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
    setCapturedPhoto(photoUrl);
    setCameraActive(false);
  };

  const handleSubmitLivePresensi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const targetDateToSave = selectedDate === 'semua' ? todayStr : selectedDate;

    if (targetCategory === 'asatidz') {
      await recordAbsensiGuru({
        guruId: selectedGuru.id,
        guruNama: `${selectedGuru.nama}, ${selectedGuru.gelar}`,
        nip: selectedGuru.nip,
        jabatan: selectedGuru.status,
        mapel: selectedGuru.mapel,
        tanggal: targetDateToSave,
        waktuMasuk: timeStr,
        status: statusGuru,
        metode: method,
        lokasi: method === 'gps' 
          ? 'Kantor Dewan Asatidz / Kompleks Madrasah Utama (Radius 15m GPS)' 
          : method === 'kamera' 
          ? 'Face Cam Presensi Smart Gate' 
          : 'Terminal Scanner Kartu Digital Asatidz',
        catatan: catatan || (statusGuru === 'hadir' ? 'Tepat Waktu & Siap Mengajar' : catatan),
        fotoBukti: capturedPhoto || undefined,
        tugasMengajarHariIni: tugasMengajar || `Pengampu: ${selectedGuru.mapel}`
      });
      setSuccessMessage(`Alhamdulillah! Presensi Asatidz ${selectedGuru.nama} (${statusGuru.toUpperCase()}) tanggal ${targetDateToSave} terverifikasi.`);
    } else {
      await recordAbsensi({
        siswaId: selectedSiswa.id,
        siswaNama: selectedSiswa.nama,
        kelas: selectedSiswa.kelas,
        tanggal: targetDateToSave,
        waktuMasuk: timeStr,
        status: statusSiswa,
        metode: method,
        lokasi: method === 'gps' ? `Kompleks Madrasah & Gedung Kelas ${selectedSiswa.kelas}` : 'Gerbang Utama Madrasah',
        catatan: catatan || (statusSiswa === 'hadir' ? 'Tepat Waktu' : catatan),
        fotoBukti: capturedPhoto || undefined,
      });
      setSuccessMessage(`Alhamdulillah! Presensi Santri ${selectedSiswa.nama} - Kelas ${selectedSiswa.kelas} (${statusSiswa.toUpperCase()}) tanggal ${targetDateToSave} dicatat.`);
    }

    setIsProcessing(false);
    setCatatan('');
    setTugasMengajar('');
    setCapturedPhoto(null);
    triggerConfetti();

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  // Grouped stats Santri for selected class & selected date
  const santriInScope = selectedKelas === 'Semua' ? siswaList : filteredSiswaByKelas;
  const santriInScopeIds = useMemo(() => new Set(santriInScope.map(s => s.id)), [santriInScope]);
  
  const absensiSantriInScope = useMemo(() => {
    return absensiList.filter(a => {
      const matchSiswa = santriInScopeIds.has(a.siswaId);
      const matchDate = selectedDate === 'semua' || a.tanggal === selectedDate;
      const matchStatus = statusFilter === 'semua' || a.status === statusFilter;
      const matchSearch = searchQuery ? a.siswaNama.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      return matchSiswa && matchDate && matchStatus && matchSearch;
    });
  }, [absensiList, santriInScopeIds, selectedDate, statusFilter, searchQuery]);

  const totalHadirSantri = absensiSantriInScope.filter(a => a.status === 'hadir').length;
  const totalIzinSantri = absensiSantriInScope.filter(a => a.status === 'izin').length;
  const totalSakitSantri = absensiSantriInScope.filter(a => a.status === 'sakit').length;
  const totalAlphaSantri = Math.max(0, santriInScope.length - (totalHadirSantri + totalIzinSantri + totalSakitSantri));

  // Asatidz stats filtered by selected date
  const absensiGuruInScope = useMemo(() => {
    return absensiGuruList.filter(g => {
      const matchDate = selectedDate === 'semua' || g.tanggal === selectedDate;
      const matchStatus = statusFilter === 'semua' || g.status === statusFilter;
      const matchSearch = searchQuery ? g.guruNama.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      return matchDate && matchStatus && matchSearch;
    });
  }, [absensiGuruList, selectedDate, statusFilter, searchQuery]);

  const totalHadirGuru = absensiGuruInScope.filter(g => g.status === 'hadir').length;
  const totalIzinGuru = absensiGuruInScope.filter(g => g.status === 'izin').length;
  const totalSakitGuru = absensiGuruInScope.filter(g => g.status === 'sakit').length;
  const totalDinasGuru = absensiGuruInScope.filter(g => g.status === 'dinas_luar').length;

  // Format date helper
  const formatDateLabel = (dateStrVal: string) => {
    if (dateStrVal === 'semua') return 'Semua Tanggal';
    if (dateStrVal === todayStr) return 'Hari Ini';
    if (dateStrVal === yesterdayStr) return 'Kemarin';
    const [year, month, day] = dateStrVal.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-6">
      {/* Header Banner */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-inner shrink-0">
            <QrCode className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>Presensi Digital & Absensi Per Kelas</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Santri & Asatidz
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Cek presensi hari ini, kemarin, dan tanggal sebelumnya dengan filter tanggal & rekapitulasi rombel
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 glass-panel-subtle rounded-2xl border border-white/10 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'kolektif', label: 'Presensi Per Kelas', icon: Users },
            { id: 'live', label: 'Scan & Live Mandiri', icon: Camera },
            { id: 'rekap', label: 'Rekap Presensi', icon: CheckCircle2 },
            { id: 'log', label: 'Log Riwayat', icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-md border border-emerald-400/40'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Switcher: PRESENSI SANTRI (PER KELAS) VS PRESENSI ASATIDZ */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl glass-panel border border-white/10 bg-slate-900/70 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTargetCategory('santri');
              if (activeTab === 'live' && targetCategory === 'asatidz') {
                setActiveTab('kolektif');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              targetCategory === 'santri'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span>Presensi Santri / Siswa (Per Rombel & Kelas)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetCategory('asatidz');
              if (activeTab === 'kolektif') {
                setActiveTab('live');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              targetCategory === 'asatidz'
                ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-slate-950 shadow-lg font-black ring-1 ring-amber-300/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Presensi Dewan Asatidz / Guru ({guruList.length} Asatidz)</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium px-3 hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sistem Presensi: <strong className="text-emerald-400">{targetCategory === 'santri' ? 'Presensi Terbuka Per Kelas' : 'Biometrik Asatidz Terbuka'}</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GLOBAL DATE FILTER BAR - UNTUK MENGECEK TANGGAL KEMARIN & SEBELUMNYA */}
      {/* ========================================================================= */}
      <div className="glass-panel border border-amber-500/30 rounded-2xl p-3.5 space-y-3 bg-gradient-to-r from-slate-900/90 via-amber-950/20 to-slate-900/90 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <CalendarDays className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Pilih Tanggal Presensi:
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {formatDateLabel(selectedDate)} ({selectedDate === 'semua' ? 'Semua Riwayat' : selectedDate})
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pilih tab cepat (Hari Ini, Kemarin, dsb.) atau gunakan kalender untuk memilih tanggal spesifik sebelumnya
              </p>
            </div>
          </div>

          {/* Quick Date Buttons + Custom Date Picker Input */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Hari Ini */}
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDate === todayStr
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md ring-2 ring-emerald-300 font-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              Hari Ini
            </button>

            {/* Kemarin (H-1) */}
            <button
              type="button"
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDate === yesterdayStr
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md ring-2 ring-amber-300 font-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Kemarin</span>
            </button>

            {/* Semua Tanggal */}
            <button
              type="button"
              onClick={() => setSelectedDate('semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDate === 'semua'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md ring-2 ring-blue-300 font-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              Semua Tanggal
            </button>

            {/* Custom Native Date Input */}
            <div className="flex items-center gap-1.5 bg-slate-950/70 border border-white/10 px-2.5 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <input
                type="date"
                value={selectedDate === 'semua' ? '' : selectedDate}
                onChange={e => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                className="bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer"
                title="Pilih tanggal sebelumnya"
              />
            </div>
          </div>
        </div>

        {/* History Date Pills List from Existing Records */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          <span className="text-[10px] text-slate-400 whitespace-nowrap uppercase tracking-wider font-semibold mr-1">
            Riwayat Tanggal Lain:
          </span>
          {availableDates.map(d => {
            const isSel = selectedDate === d;
            const isToday = d === todayStr;
            const isYest = d === yesterdayStr;
            const label = isToday ? 'Hari Ini' : isYest ? 'Kemarin' : d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSel
                    ? 'bg-amber-400 text-slate-950 font-bold shadow ring-1 ring-amber-300'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5 hover:bg-white/10'
                }`}
              >
                {label} {(!isToday && !isYest) ? '' : `(${d.split('-').slice(1).join('/')})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER KELAS BAR (Shown when targetCategory === 'santri') */}
      {targetCategory === 'santri' && (
        <div className="glass-panel border border-emerald-500/20 rounded-2xl p-3.5 space-y-2.5 bg-emerald-950/20 shadow-lg">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Pilih Rombel / Kelas Santri:</span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium">
              Menampilkan Kelas: <strong className="text-white">{selectedKelas}</strong> ({santriInScope.length} Santri)
            </span>
          </div>

          {/* Class Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedKelas('Semua')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedKelas === 'Semua'
                  ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              Semua Kelas ({siswaList.length})
            </button>

            {classOptions.map(cls => {
              const countInClass = siswaList.filter(s => s.kelas.toLowerCase() === cls.toLowerCase()).length;
              const isSelected = selectedKelas.toLowerCase() === cls.toLowerCase();
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedKelas(cls)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg ring-2 ring-emerald-300 font-black'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span>{cls}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-white/10 text-slate-400'}`}>
                    {countInClass}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Success notification popup banner */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl glass-panel-emerald border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
            Tersimpan
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TAB: PRESENSI KOLEKTIF PER KELAS (ROMBEL) - ONLY FOR SANTRI */}
      {/* ========================================================================= */}
      {activeTab === 'kolektif' && targetCategory === 'santri' && (
        <div className="space-y-4">
          <div className="glass-panel border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Lembar Presensi Harian Kelas {selectedKelas}</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>Tanggal Presensi:</span>
                  <span className="font-bold text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                    {formatDateLabel(selectedDate)} ({selectedDate === 'semua' ? todayStr : selectedDate})
                  </span>
                  {selectedDate !== todayStr && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                      Melihat Arsip Tanggal
                    </span>
                  )}
                </div>
              </div>

              {['admin', 'guru'].includes(activeRole) && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSetAllPresent}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tandai Semua Hadir</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveBulkAttendance}
                    disabled={isProcessing || filteredSiswaByKelas.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isProcessing ? 'Menyimpan...' : `Simpan Presensi Tanggal Ini`}</span>
                  </button>
                </div>
              )}
            </div>

            {/* List / Table of Students in the Selected Class */}
            {filteredSiswaByKelas.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-xs font-medium">Belum ada santri terdaftar di kelas "{selectedKelas}".</p>
                <p className="text-[11px] text-slate-500">Pilih kelas lain pada bar di atas atau tambahkan data siswa di menu Manajemen.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredSiswaByKelas.map((santri, index) => {
                  const currentStatus = getStudentBulkStatus(santri.id);
                  // Check existing record on this specific selected date
                  const existingRecord = absensiList.find(a => a.siswaId === santri.id && (selectedDate === 'semua' ? true : a.tanggal === selectedDate));
                  
                  return (
                    <div
                      key={santri.id}
                      className="p-3.5 sm:p-4 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                    >
                      {/* Santri Info */}
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-mono text-slate-400 font-semibold">
                          {index + 1}.
                        </span>
                        <img
                          src={santri.fotoUrl}
                          alt={santri.nama}
                          className="w-11 h-11 rounded-xl object-cover border border-amber-400/60 shadow-md shrink-0"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">{santri.nama}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                            <span className="text-emerald-400 font-semibold">{santri.kelas}</span>
                            <span>&bull;</span>
                            <span className="font-mono">NISN: {santri.nisn}</span>
                            {existingRecord && (
                              <>
                                <span>&bull;</span>
                                <span className="text-amber-300 font-mono text-[10px]">
                                  Tercatat: {existingRecord.tanggal} ({existingRecord.waktuMasuk})
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Attendance Status Buttons per Santri */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                        {[
                          { id: 'hadir', label: 'Hadir', activeClass: 'bg-emerald-500 text-slate-950 font-black shadow-md border-emerald-400 ring-2 ring-emerald-300/60' },
                          { id: 'izin', label: 'Izin', activeClass: 'bg-amber-500 text-slate-950 font-black shadow-md border-amber-400 ring-2 ring-amber-300/60' },
                          { id: 'sakit', label: 'Sakit', activeClass: 'bg-teal-500 text-slate-950 font-black shadow-md border-teal-400 ring-2 ring-teal-300/60' },
                          { id: 'alpha', label: 'Alpha', activeClass: 'bg-rose-600 text-white font-black shadow-md border-rose-400 ring-2 ring-rose-300/60' },
                        ].map(stBtn => {
                          const isActive = currentStatus === stBtn.id;
                          return (
                            <button
                              key={stBtn.id}
                              type="button"
                              onClick={() => handleSetStudentStatus(santri.id, stBtn.id as any)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                isActive
                                  ? stBtn.activeClass
                                  : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {stBtn.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Bottom Action Footer */}
                {['admin', 'guru'].includes(activeRole) && (
                  <div className="pt-3 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleSaveBulkAttendance}
                      disabled={isProcessing || filteredSiswaByKelas.length === 0}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 text-white text-xs sm:text-sm font-bold shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isProcessing ? 'Menyimpan Presensi...' : `Simpan Semua Presensi Kelas ${selectedKelas} (${formatDateLabel(selectedDate)})`}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: LIVE / SCAN PRESENSI MANDIRI (SANTRI ATAU ASATIDZ) */}
      {/* ========================================================================= */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 glass-panel border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {targetCategory === 'asatidz' ? (
                  <>
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span>Check-In Mandiri Dewan Asatidz</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>Check-In Scanner / Selfie Santri</span>
                  </>
                )}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                  Tanggal: {selectedDate === 'semua' ? todayStr : selectedDate}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
            </div>

            {/* Verification Method Switcher */}
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-2">Metode Verifikasi Presensi</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'gps', label: 'Radius GPS Kompleks', icon: MapPin },
                  { id: 'kamera', label: 'Selfie Biometrik', icon: Camera },
                  { id: 'qr', label: 'Scan ID Card QR', icon: QrCode },
                ].map(m => {
                  const Icon = m.icon;
                  const isSel = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as any)}
                      className={`p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSel
                          ? 'glass-panel-emerald border-emerald-400/60 text-emerald-200 shadow-md ring-1 ring-emerald-400/40'
                          : 'glass-panel-subtle border-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmitLivePresensi} className="space-y-3.5">
              {/* TARGET ASATIDZ FORM */}
              {targetCategory === 'asatidz' ? (
                <>
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Nama Asatidz / Guru Pengampu</label>
                    <select
                      value={selectedGuruId}
                      onChange={e => setSelectedGuruId(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs font-semibold focus:outline-none"
                    >
                      {guruList.map(g => (
                        <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                          {g.nama}, {g.gelar} - ({g.mapel}) &bull; {g.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Asatidz */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Status Kehadiran Asatidz</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'hadir', label: 'Hadir Siap Mengajar', color: 'border-emerald-400 text-emerald-300 glass-panel-emerald ring-1 ring-emerald-400' },
                        { id: 'dinas_luar', label: 'Tugas Luar / Kemenag', color: 'border-blue-400 text-blue-300 bg-blue-500/20 ring-1 ring-blue-400' },
                        { id: 'izin', label: 'Izin Resmi', color: 'border-amber-400 text-amber-300 glass-panel-amber ring-1 ring-amber-400' },
                        { id: 'sakit', label: 'Sakit', color: 'border-teal-400 text-teal-300 bg-teal-500/20 ring-1 ring-teal-400' },
                      ].map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStatusGuru(st.id as any)}
                          className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                            statusGuru === st.id ? st.color : 'glass-panel-subtle border-white/5 text-slate-300'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Agenda / Jam Mengajar Hari Ini</label>
                    <input
                      type="text"
                      value={tugasMengajar}
                      onChange={e => setTugasMengajar(e.target.value)}
                      placeholder={`Contoh: Mengampu ${selectedGuru.mapel} Kelas 9A & 9B`}
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-white text-xs"
                    />
                  </div>
                </>
              ) : (
                /* TARGET SANTRI FORM */
                <>
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Pilih Santri di Kelas <span className="text-emerald-400 font-bold">{selectedKelas}</span>
                    </label>
                    <select
                      value={selectedSiswaId}
                      onChange={e => setSelectedSiswaId(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs font-semibold focus:outline-none"
                    >
                      {filteredSiswaByKelas.map(s => (
                        <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                          {s.nama} ({s.kelas}) - NISN: {s.nisn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Santri */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Status Kehadiran</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'hadir', label: 'Hadir', color: 'border-emerald-400 text-emerald-300 glass-panel-emerald ring-1 ring-emerald-400' },
                        { id: 'izin', label: 'Izin', color: 'border-amber-400 text-amber-300 glass-panel-amber ring-1 ring-amber-400' },
                        { id: 'sakit', label: 'Sakit', color: 'border-teal-400 text-teal-300 bg-teal-500/20 ring-1 ring-teal-400' },
                        { id: 'alpha', label: 'Alpha', color: 'border-rose-400 text-rose-300 bg-rose-500/20 ring-1 ring-rose-400' },
                      ].map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStatusSiswa(st.id as any)}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                            statusSiswa === st.id ? st.color : 'glass-panel-subtle border-white/5 text-slate-300'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Camera Verification Box */}
              {method === 'kamera' && (
                <div className="p-4 rounded-2xl glass-panel-subtle border border-emerald-400/30 text-center space-y-3">
                  {cameraActive ? (
                    <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-400 bg-slate-900 flex items-center justify-center shadow-lg">
                      <img
                        src={targetCategory === 'asatidz' ? selectedGuru.fotoUrl : selectedSiswa.fotoUrl}
                        alt="Face Recognition"
                        className="w-full h-full object-cover animate-pulse opacity-90"
                      />
                      <div className="absolute inset-0 border-2 border-emerald-400 rounded-2xl pointer-events-none animate-ping opacity-25"></div>
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="absolute bottom-2 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow-md cursor-pointer"
                      >
                        Ambil Foto Biometrik
                      </button>
                    </div>
                  ) : capturedPhoto ? (
                    <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md">
                      <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        Terverifikasi
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="px-4 py-2.5 rounded-xl glass-button text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Aktifkan Kamera Biometrik</span>
                    </button>
                  )}
                </div>
              )}

              {/* GPS Geofence Box */}
              {method === 'gps' && (
                <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Lokasi GPS Valid & Terkunci di Kompleks Madrasah & Gedung Kelas</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Radius: 14.8 meter dari Titik Nol Gedung &bull; Akurasi GPS: Tinggi (High Precision) &bull; Status: Sah
                  </p>
                </div>
              )}

              {/* QR Code Scan Box */}
              {method === 'qr' && (
                <div className="p-4 rounded-2xl glass-panel-subtle border border-white/10 text-center space-y-2">
                  <QrCode className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs font-semibold text-white">
                    {targetCategory === 'asatidz' ? 'Tempelkan Kartu Identitas Digital Asatidz ke Scanner' : 'Tempelkan QR Code E-KTS Santri ke Scanner'}
                  </p>
                  <p className="text-[10px] text-slate-400">Barcode otomatis terverifikasi dengan database sistem SIMAT</p>
                </div>
              )}

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Keterangan opsional..."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-white text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? 'Memproses...' : targetCategory === 'asatidz' ? 'Kirim Presensi Asatidz' : 'Kirim Presensi Santri'}</span>
              </button>
            </form>
          </div>

          {/* Right Card: Profile Preview & Stats (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {targetCategory === 'asatidz' ? (
              /* Asatidz Preview Card */
              <div className="glass-panel border border-white/10 rounded-3xl p-5 shadow-xl text-white">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Profil Asatidz Terpilih</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {selectedGuru.status}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={selectedGuru.fotoUrl}
                    alt={selectedGuru.nama}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedGuru.nama}, {selectedGuru.gelar}</h3>
                    <p className="text-xs text-amber-400 font-medium">{selectedGuru.mapel}</p>
                    <p className="text-[11px] text-slate-400 font-mono">NIP: {selectedGuru.nip}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Tugas Tambahan:</span>
                    <strong className="text-emerald-300">{selectedGuru.waliKelas ? `Wali Kelas ${selectedGuru.waliKelas}` : 'Guru Mata Pelajaran'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Kontak / WhatsApp:</span>
                    <strong className="text-slate-200 font-mono">{selectedGuru.phone}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Email Dinas:</span>
                    <span className="text-slate-300 text-[11px]">{selectedGuru.email}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Student Preview Card */
              <div className="glass-panel border border-white/10 rounded-3xl p-5 shadow-xl text-white">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Profil Santri Terpilih
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Kelas {selectedSiswa.kelas}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={selectedSiswa.fotoUrl}
                    alt={selectedSiswa.nama}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedSiswa.nama}</h3>
                    <p className="text-xs text-emerald-400 font-medium">{selectedSiswa.kelas}</p>
                    <p className="text-[11px] text-slate-400 font-mono">NISN: {selectedSiswa.nisn}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Target Hafalan:</span>
                    <strong className="text-amber-300">{selectedSiswa.targetJuz} Juz</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Capaian Terkini:</span>
                    <strong className="text-emerald-400">{selectedSiswa.hafalanTercapai} Juz</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Wali Santri:</span>
                    <span className="text-slate-200">{selectedSiswa.waliNama}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl glass-panel-emerald border border-emerald-400/40 text-center">
                <p className="text-xs text-emerald-300 font-medium">
                  {targetCategory === 'asatidz' ? 'Asatidz Hadir' : `Santri Hadir (${selectedKelas})`}
                </p>
                <p className="text-2xl font-black text-white mt-0.5">
                  {targetCategory === 'asatidz' ? totalHadirGuru : totalHadirSantri}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Tanggal: {formatDateLabel(selectedDate)}</p>
              </div>
              <div className="p-3.5 rounded-2xl glass-panel-amber border border-amber-400/40 text-center">
                <p className="text-xs text-amber-300 font-medium">
                  {targetCategory === 'asatidz' ? 'Izin / Sakit / Dinas' : 'Izin / Sakit / Alpha'}
                </p>
                <p className="text-2xl font-black text-white mt-0.5">
                  {targetCategory === 'asatidz' ? (totalIzinGuru + totalSakitGuru + totalDinasGuru) : (totalIzinSantri + totalSakitSantri + totalAlphaSantri)}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Tanggal: {formatDateLabel(selectedDate)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: REKAP PRESENSI (PER TANGGAL & KELAS ATAU ASATIDZ) */}
      {/* ========================================================================= */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          {targetCategory === 'asatidz' ? (
            /* Rekap Asatidz */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl glass-panel-emerald border border-emerald-400/40 text-white">
                  <span className="text-xs text-emerald-300 font-medium">Asatidz Hadir</span>
                  <p className="text-2xl font-bold mt-1 text-emerald-400">{totalHadirGuru} Asatidz</p>
                  <p className="text-[10px] text-slate-400 mt-1">Tanggal: {formatDateLabel(selectedDate)}</p>
                </div>

                <div className="p-4 rounded-2xl glass-panel-amber border border-amber-400/40 text-white">
                  <span className="text-xs text-amber-300 font-medium">Izin Resmi</span>
                  <p className="text-2xl font-bold mt-1 text-amber-400">{totalIzinGuru} Asatidz</p>
                  <p className="text-[10px] text-slate-400 mt-1">Surat Keterangan</p>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-blue-500/40 text-white">
                  <span className="text-xs text-blue-300 font-medium">Tugas Dinas Luar</span>
                  <p className="text-2xl font-bold mt-1 text-blue-400">{totalDinasGuru} Asatidz</p>
                  <p className="text-[10px] text-slate-400 mt-1">Kemenag / MQK / Diklat</p>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-teal-500/40 text-white">
                  <span className="text-xs text-teal-300 font-medium">Sakit</span>
                  <p className="text-2xl font-bold mt-1 text-teal-400">{totalSakitGuru} Asatidz</p>
                  <p className="text-[10px] text-slate-400 mt-1">Dalam Pemulihan</p>
                </div>
              </div>

              <div className="glass-panel border border-white/10 rounded-3xl p-5 shadow-xl text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Daftar Presensi Dewan Asatidz ({formatDateLabel(selectedDate)})</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                    Total: {guruList.length} Asatidz
                  </span>
                </div>

                <div className="space-y-2">
                  {guruList.map(g => {
                    const rec = absensiGuruList.find(a => a.guruId === g.id && (selectedDate === 'semua' ? true : a.tanggal === selectedDate));
                    return (
                      <div
                        key={g.id}
                        className="p-3.5 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img src={g.fotoUrl} alt={g.nama} className="w-10 h-10 rounded-xl object-cover border border-amber-400" />
                          <div>
                            <p className="text-xs font-bold text-white">{g.nama}, {g.gelar}</p>
                            <p className="text-[11px] text-amber-300">{g.mapel} &bull; <span className="text-slate-400 font-mono">NIP: {g.nip}</span></p>
                            {rec?.tugasMengajarHariIni && (
                              <p className="text-[10px] text-slate-300 mt-0.5">Jadwal: {rec.tugasMengajarHariIni}</p>
                            )}
                            {rec?.tanggal && selectedDate === 'semua' && (
                              <p className="text-[10px] text-amber-400 font-mono">Tercatat pada: {rec.tanggal}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                            rec?.status === 'hadir' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' :
                            rec?.status === 'dinas_luar' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            rec?.status === 'izin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            rec?.status === 'sakit' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {rec?.status ? rec.status.replace('_', ' ') : 'Belum Check-In'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2 py-1 rounded-lg">
                            {rec?.waktuMasuk ? `${rec.waktuMasuk} WIB` : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Rekap Santri Per Kelas */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl glass-panel-emerald border border-emerald-400/40 text-white">
                  <span className="text-xs text-emerald-300 font-medium">Santri Hadir ({selectedKelas})</span>
                  <p className="text-2xl font-bold mt-1 text-emerald-400">{totalHadirSantri} Santri</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tanggal: {formatDateLabel(selectedDate)} &bull; Tingkat Kehadiran: {santriInScope.length > 0 ? Math.round((totalHadirSantri / santriInScope.length) * 100) : 0}%
                  </p>
                </div>

                <div className="p-4 rounded-2xl glass-panel-amber border border-amber-400/40 text-white">
                  <span className="text-xs text-amber-300 font-medium">Izin Resmi</span>
                  <p className="text-2xl font-bold mt-1 text-amber-400">{totalIzinSantri} Santri</p>
                  <p className="text-[10px] text-slate-400 mt-1">Surat / Izin Wali</p>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-teal-500/40 text-white">
                  <span className="text-xs text-teal-300 font-medium">Sakit</span>
                  <p className="text-2xl font-bold mt-1 text-teal-400">{totalSakitSantri} Santri</p>
                  <p className="text-[10px] text-slate-400 mt-1">UKS / Rawat</p>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-rose-500/30 text-white">
                  <span className="text-xs text-rose-300 font-medium">Belum Presensi / Alpha</span>
                  <p className="text-2xl font-bold mt-1 text-rose-400">{totalAlphaSantri} Santri</p>
                  <p className="text-[10px] text-slate-400 mt-1">Total Santri: {santriInScope.length}</p>
                </div>
              </div>

              <div className="glass-panel border border-white/10 rounded-3xl p-5 shadow-xl text-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Status Presensi Santri Kelas {selectedKelas} ({formatDateLabel(selectedDate)})</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    {santriInScope.length} Santri Terdata
                  </span>
                </div>

                <div className="space-y-2">
                  {santriInScope.map(s => {
                    const rec = absensiList.find(a => a.siswaId === s.id && (selectedDate === 'semua' ? true : a.tanggal === selectedDate));
                    return (
                      <div
                        key={s.id}
                        className="p-3 rounded-2xl glass-card border border-white/10 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <img src={s.fotoUrl} alt={s.nama} className="w-9 h-9 rounded-xl object-cover border border-emerald-400/40" />
                          <div>
                            <p className="text-xs font-bold text-white">{s.nama}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{s.kelas} &bull; NISN: {s.nisn}</span>
                              {rec?.tanggal && selectedDate === 'semua' && (
                                <span className="text-amber-300 font-mono text-[10px]">({rec.tanggal})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                            rec?.status === 'hadir' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            rec?.status === 'izin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            rec?.status === 'sakit' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {rec?.status || 'Belum Presensi'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {rec?.waktuMasuk ? `${rec.waktuMasuk} WIB` : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: LOG RIWAYAT PRESENSI (DENGAN FILTER TANGGAL & KELAS) */}
      {/* ========================================================================= */}
      {activeTab === 'log' && (
        <div className="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-xl text-white">
          <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>
                  {targetCategory === 'asatidz' 
                    ? `Log Riwayat Presensi Dewan Asatidz (${formatDateLabel(selectedDate)})` 
                    : `Log Riwayat Presensi Santri (Kelas: ${selectedKelas}, ${formatDateLabel(selectedDate)})`}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Riwayat data absensi lampau, timestamp jam masuk, GPS radius, scanner kartu, dan catatan kehadiran
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="glass-input px-2.5 py-1.5 rounded-xl text-white text-xs focus:outline-none"
              >
                <option value="semua" className="bg-slate-900 text-white">Semua Status</option>
                <option value="hadir" className="bg-slate-900 text-white">Hadir</option>
                <option value="izin" className="bg-slate-900 text-white">Izin</option>
                <option value="sakit" className="bg-slate-900 text-white">Sakit</option>
                {targetCategory === 'asatidz' ? (
                  <option value="dinas_luar" className="bg-slate-900 text-white">Dinas Luar</option>
                ) : (
                  <option value="alpha" className="bg-slate-900 text-white">Alpha</option>
                )}
              </select>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama santri/guru..."
                  className="glass-input pl-8 pr-3 py-1.5 rounded-xl text-white text-xs focus:outline-none w-44 sm:w-56"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {targetCategory === 'asatidz' ? (
              absensiGuruInScope.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Calendar className="w-9 h-9 text-slate-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">Tidak ada riwayat presensi asatidz pada filter ini.</p>
                  <p className="text-[11px] text-slate-500">Coba pilih tanggal "Semua Tanggal" atau hapus kata kunci pencarian.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Nama Asatidz</th>
                      <th className="py-3 px-3">Mata Pelajaran / NIP</th>
                      <th className="py-3 px-3">Tanggal & Waktu</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3">Metode</th>
                      <th className="py-3 px-4">Lokasi & Agenda Mengajar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-200">
                    {absensiGuruInScope.map(a => (
                      <tr key={a.id} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-semibold text-white">{a.guruNama}</td>
                        <td className="py-3 px-3">
                          <span className="text-amber-300 font-medium">{a.mapel}</span>
                          <div className="text-[10px] text-slate-400 font-mono">NIP: {a.nip}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                          <span className="text-amber-400 font-semibold">{a.tanggal}</span>
                          <span className="text-slate-400 text-[10px] block">{a.waktuMasuk} WIB</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            a.status === 'hadir' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            a.status === 'dinas_luar' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            a.status === 'izin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-teal-500/20 text-teal-300'
                          }`}>
                            {a.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 capitalize">{a.metode}</td>
                        <td className="py-3 px-4 text-[11px] text-slate-300">
                          <div>{a.lokasi || '-'}</div>
                          {a.tugasMengajarHariIni && (
                            <div className="text-[10px] text-emerald-300 mt-0.5">{a.tugasMengajarHariIni}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              absensiSantriInScope.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Calendar className="w-9 h-9 text-slate-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">Tidak ada catatan presensi santri pada filter ini.</p>
                  <p className="text-[11px] text-slate-500">Pilih tanggal lain pada bar tanggal di atas atau pilih "Semua Tanggal".</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Santri</th>
                      <th className="py-3 px-3">Kelas / Rombel</th>
                      <th className="py-3 px-3">Tanggal & Waktu</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3">Metode</th>
                      <th className="py-3 px-4">Keterangan / Lokasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-200">
                    {absensiSantriInScope.map(a => (
                      <tr key={a.id} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-semibold text-white">{a.siswaNama}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[11px]">
                            {a.kelas}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                          <span className="text-amber-400 font-semibold">{a.tanggal}</span>
                          <span className="text-slate-400 text-[10px] block">{a.waktuMasuk} WIB</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            a.status === 'hadir' ? 'bg-emerald-500/20 text-emerald-300 font-bold' :
                            a.status === 'izin' ? 'bg-amber-500/20 text-amber-300' : 
                            a.status === 'sakit' ? 'bg-teal-500/20 text-teal-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 capitalize">{a.metode}</td>
                        <td className="py-3 px-4 text-[11px] text-slate-300">{a.lokasi || a.catatan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
