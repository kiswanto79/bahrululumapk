import React, { useState, useRef, useEffect } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { MadrasahInfo, Siswa, Guru, Kelas } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  GraduationCap, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  CheckCircle2,
  Sparkles,
  Upload,
  Globe,
  Award,
  RotateCcw,
  Save,
  Check,
  Printer,
  FileCheck2,
  Database,
  Layers,
  DoorOpen,
  Plus,
  UserCheck,
  BookOpen,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { ImportSiswaModal } from './ImportSiswaModal';

const LOGO_PRESETS = [
  {
    name: 'Logo Resmi Bahrul Ulum',
    url: 'https://lh3.googleusercontent.com/d/1rRwCAUiD0TZsSq30FTVvY9WMBd-LxUIj',
    description: 'Logo Resmi Madrasah Bahrul Ulum'
  },
  {
    name: 'Islamic Green Crest',
    url: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=200&auto=format&fit=crop&q=80',
    description: 'Logo Kubah Hijau Emas'
  },
  {
    name: 'Kemenag Emblem',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=200&auto=format&fit=crop&q=80',
    description: 'Arsitektur Kubah Islami'
  },
  {
    name: 'Qurani Golden Star',
    url: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=200&auto=format&fit=crop&q=80',
    description: 'Bintang Geometris Islami'
  },
  {
    name: 'Modern Madrasah Shield',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&auto=format&fit=crop&q=80',
    description: 'Lambang Pendidikan Modern'
  }
];

const TEMPLATE_PRESETS: { name: string; info: Partial<MadrasahInfo> }[] = [
  {
    name: 'Madrasah Bahrul Ulum (Utama)',
    info: {
      nama: 'Madrasah Bahrul Ulum',
      singkatan: 'Bahrululumku',
      jenjang: 'Madrasah Terpadu & Pondok Pesantren',
      akreditasi: 'A (Unggul / Terakreditasi BAN-SM)',
      nsm: '131233240012',
      npsn: '20364588',
      alamat: 'Jl. Tunggul Sari No.1 Brangsong',
      kota: 'Kendal, Jawa Tengah',
      telepon: '085290826838',
      email: 'bahrululumku@gmail.com',
      website: 'bahrululumku.sch.id',
      kepalaMadrasah: 'King Salman AF',
      nipKepala: '198205142008011015',
      semboyan: 'Membina Generasi Qurani, Berilmu, Beradab & Berakhlakul Karimah',
      logoText: 'BAHRUL ULUM',
      logoUrl: 'https://lh3.googleusercontent.com/d/1rRwCAUiD0TZsSq30FTVvY9WMBd-LxUIj',
    }
  },
  {
    name: 'MAN 1 Unggulan (Aliyah)',
    info: {
      nama: 'Madrasah Aliyah Negeri 1 Unggulan',
      singkatan: 'MAN 1 MODEL',
      jenjang: 'MA / MAK Terakreditasi A (Unggul)',
      akreditasi: 'A (Unggul / BAN-SM)',
      nsm: '131133240001',
      npsn: '20364501',
      alamat: 'Jl. Tentara Pelajar No. 18, Kebondalem',
      kota: 'Kab. Kendal, Jawa Tengah',
      telepon: '(0294) 381-1122',
      email: 'humas@man1kendal.sch.id',
      website: 'www.man1kendal.sch.id',
      kepalaMadrasah: 'Drs. H. Muh. Asrori, M.Ag.',
      nipKepala: '197104121998031002',
      semboyan: 'Mandiri Berprestasi, Religius, Santun & Berkelas Dunia',
      logoText: 'MAN 1',
    }
  },
  {
    name: 'MTs Terpadu Al-Azhar',
    info: {
      nama: 'Madrasah Tsanawiyah Terpadu Al-Azhar',
      singkatan: 'MTS AL-AZHAR',
      jenjang: 'MTs Terakreditasi A (Unggul)',
      akreditasi: 'A (Unggul / BAN-SM)',
      nsm: '121232040088',
      npsn: '20278910',
      alamat: 'Jl. KH. Hasyim Asyari No. 99, Komplek Islamic Center',
      kota: 'Kendal / Semarang, Jawa Tengah',
      telepon: '(0294) 381-2299',
      email: 'info@madrasah-alazhar.sch.id',
      website: 'www.madrasah-alazhar.sch.id',
      kepalaMadrasah: 'Dr. KH. Abdullah Munir, M.Pd.I',
      nipKepala: '197508152002121003',
      semboyan: 'Membina Generasi Qurani, Cerdas, Berakhlaq Mulia & Berwawasan Global',
      logoText: 'AL-AZHAR',
    }
  },
  {
    name: 'Pesantren & MI Tahfidz',
    info: {
      nama: 'Madrasah Ibtidaiyah & Pesantren Tahfidz Darul Quran',
      singkatan: 'MI DARUL QURAN',
      jenjang: 'MI & Pesantren Tahfidz Terpadu',
      akreditasi: 'A (Unggul)',
      nsm: '111233040055',
      npsn: '20311299',
      alamat: 'Jl. Pesantren No. 07, Sukorejo',
      kota: 'Kendal, Jawa Tengah',
      telepon: '0812-3456-7899',
      email: 'sekretariat@darulquran-kendal.sch.id',
      website: 'www.darulquran-kendal.sch.id',
      kepalaMadrasah: 'K.H. Ahmad Syahid, S.Q., M.Pd.',
      nipKepala: '198009182006041008',
      semboyan: 'Menghafal Al-Qur\'an, Beradab, Berilmu, dan Beramal Shalih',
      logoText: 'DARUL QURAN',
    }
  }
];

export const ManajemenView: React.FC = () => {
  const { 
    siswaList, 
    guruList, 
    kelasList,
    addSiswa, 
    updateSiswa,
    deleteSiswa, 
    addGuru, 
    updateGuru,
    deleteGuru, 
    addKelas,
    updateKelas,
    deleteKelas,
    activeRole, 
    madrasahInfo,
    updateMadrasahInfo,
    resetMadrasahInfo,
    setIsResetModalOpen,
    triggerConfetti 
  } = useMadrasah();

  const [activeTab, setActiveTab] = useState<'madrasah' | 'kelas' | 'siswa' | 'guru'>('madrasah');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportSiswaModal, setShowImportSiswaModal] = useState(false);
  const [isEditingMadrasah, setIsEditingMadrasah] = useState(true);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Edit Siswa & Guru States
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);

  // Kelas Management States
  const [selectedTingkatFilter, setSelectedTingkatFilter] = useState<string>('Semua');
  const [showKelasModal, setShowKelasModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [kelasForm, setKelasForm] = useState<{
    nama: string;
    tingkat: string;
    jurusan: string;
    waliKelasNama: string;
    ruangan: string;
    kapasitas: number;
  }>({
    nama: '',
    tingkat: '7',
    jurusan: 'Tahfidz Al-Qur\'an',
    waliKelasNama: guruList[0]?.nama || 'Ustadz Ahmad Fauzi, Lc.',
    ruangan: 'Gedung Umar Lt. 1',
    kapasitas: 32
  });

  // Institution Form State
  const [editForm, setEditForm] = useState<MadrasahInfo>(madrasahInfo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditForm(madrasahInfo);
  }, [madrasahInfo]);

  // Form states for new siswa
  const [namaSiswa, setNamaSiswa] = useState('');
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState(kelasList[0]?.nama || '7A Tahfidz');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [namaWali, setNamaWali] = useState('');
  const [noHp, setNoHp] = useState('0812-3344-5566');

  // Form states for new guru
  const [namaGuru, setNamaGuru] = useState('');
  const [nip, setNip] = useState('');
  const [mapelUtama, setMapelUtama] = useState('Tahfidz Al-Qur\'an');
  const [pendidikan, setPendidikan] = useState('S1 Pendidikan Islam');

  const filteredKelas = kelasList.filter(k => {
    const matchesTingkat = selectedTingkatFilter === 'Semua' || k.tingkat === selectedTingkatFilter;
    const matchesSearch = 
      k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.jurusan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.waliKelasNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.ruangan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTingkat && matchesSearch;
  });

  const filteredSiswa = siswaList.filter(s => 
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery) ||
    s.kelas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuru = guruList.filter(g =>
    g.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.mapelUtama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kelas Actions
  const openAddKelas = () => {
    setEditingKelas(null);
    setKelasForm({
      nama: '',
      tingkat: '7',
      jurusan: 'Tahfidz Al-Qur\'an',
      waliKelasNama: guruList[0]?.nama || 'Ustadz Ahmad Fauzi, Lc.',
      ruangan: 'Gedung A Lt. 1',
      kapasitas: 32
    });
    setShowKelasModal(true);
  };

  const openEditKelas = (k: Kelas) => {
    setEditingKelas(k);
    setKelasForm({
      nama: k.nama,
      tingkat: k.tingkat,
      jurusan: k.jurusan,
      waliKelasNama: k.waliKelasNama,
      ruangan: k.ruangan,
      kapasitas: k.kapasitas
    });
    setShowKelasModal(true);
  };

  const handleKelasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasForm.nama.trim()) return;

    if (editingKelas) {
      await updateKelas(editingKelas.id, kelasForm);
    } else {
      await addKelas(kelasForm);
    }

    setShowKelasModal(false);
    setEditingKelas(null);
    triggerConfetti();
  };

  const handleDeleteKelas = async (k: Kelas) => {
    const studentCount = siswaList.filter(s => s.kelas === k.nama).length;
    const confirmMessage = studentCount > 0 
      ? `Perhatian: Terdapat ${studentCount} santri terdaftar di kelas "${k.nama}". Anda yakin ingin menghapus kelas ini?`
      : `Yakin ingin menghapus kelas "${k.nama}"?`;
    
    if (window.confirm(confirmMessage)) {
      await deleteKelas(k.id);
    }
  };

  const handleAddSiswaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSiswa || !nisn) return;

    await addSiswa({
      nisn,
      nis,
      nama: namaSiswa,
      kelas,
      jenisKelamin,
      namaWali,
      noHp,
      alamat: 'Kabupaten Kendal, Jawa Tengah',
      status: 'Aktif',
      foto: jenisKelamin === 'L' 
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      hafalanJuz: 1,
      targetJuz: 30
    });

    setNamaSiswa('');
    setNisn('');
    setNis('');
    setShowAddModal(false);
    triggerConfetti();
  };

  const handleAddGuruSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaGuru) return;

    await addGuru({
      nip: nip || `1990${Date.now().toString().slice(-8)}`,
      nuptk: `8899${Date.now().toString().slice(-8)}`,
      nama: namaGuru,
      mapelUtama,
      pendidikanTerakhir: pendidikan,
      email: `${namaGuru.toLowerCase().replace(/\s+/g, '')}@madrasah-alazhar.sch.id`,
      noHp: '0813-9988-7766',
      status: 'Aktif',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    });

    setNamaGuru('');
    setNip('');
    setShowAddModal(false);
    triggerConfetti();
  };

  const handleUpdateSiswaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSiswa) return;

    await updateSiswa(editingSiswa.id, editingSiswa);
    setEditingSiswa(null);
    triggerConfetti();
  };

  const handleUpdateGuruSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuru) return;

    await updateGuru(editingGuru.id, editingGuru);
    setEditingGuru(null);
    triggerConfetti();
  };

  // Handle Institution Profile Update
  const handleSaveMadrasah = (e: React.FormEvent) => {
    e.preventDefault();
    updateMadrasahInfo(editForm);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  // Handle Logo File Upload (converting to Base64)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditForm(prev => ({ ...prev, logoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyTemplate = (template: typeof TEMPLATE_PRESETS[0]) => {
    const updated = { ...editForm, ...template.info };
    setEditForm(updated);
    updateMadrasahInfo(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel-emerald rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-400 p-0.5 shadow-lg shadow-emerald-950 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center overflow-hidden">
                {madrasahInfo.logoUrl ? (
                  <img src={madrasahInfo.logoUrl} alt="Logo Madrasah" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-7 h-7 text-amber-400" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{madrasahInfo.nama}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {madrasahInfo.akreditasi}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                {madrasahInfo.jenjang} &bull; NSM: {madrasahInfo.nsm} &bull; NPSN: {madrasahInfo.npsn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs border border-red-500/40 transition-all transform active:scale-95"
              title="Cadangkan dan Reset Database"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Kelola &</span> Reset Data
            </button>

            {activeTab === 'madrasah' ? (
              <button
                onClick={() => setIsEditingMadrasah(!isEditingMadrasah)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition-all transform active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditingMadrasah ? 'Sembunyikan Form Edit' : 'Edit Profil & Logo'}</span>
              </button>
            ) : activeTab === 'kelas' ? (
              activeRole === 'admin' && (
                <button
                  onClick={openAddKelas}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kelas Baru</span>
                </button>
              )
            ) : activeTab === 'siswa' ? (
              activeRole === 'admin' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowImportSiswaModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-lg transition-all transform active:scale-95 cursor-pointer"
                    title="Import Data Santri dari Excel / CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Import Data Santri</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Tambah Santri</span>
                  </button>
                </div>
              )
            ) : (
              activeRole === 'admin' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all transform active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Guru / Asatidz</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Navigation and Search Controls */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab switch */}
        <div className="flex flex-wrap items-center p-1 rounded-xl bg-slate-900/80 border border-slate-700/80 w-fit gap-1">
          <button
            onClick={() => setActiveTab('madrasah')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'madrasah'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Profil & Logo</span>
          </button>
          <button
            onClick={() => setActiveTab('kelas')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'kelas'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rombel & Kelas ({kelasList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('siswa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'siswa'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Santri / Siswa ({siswaList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guru')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'guru'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guru & Staf / Asatidz ({guruList.length})</span>
          </button>
        </div>

        {/* Search Input */}
        {activeTab !== 'madrasah' && (
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, atau kelas..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none placeholder:text-slate-500"
            />
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {saveSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Profil & Logo Madrasah Berhasil Disimpan!</p>
              <p className="text-[11px] text-emerald-300">Perubahan langsung diterapkan pada Navbar, Sidebar, E-Kartu, SIAKAD Raport, dan Kwitansi.</p>
            </div>
          </div>
          <button 
            onClick={() => setSaveSuccessNotice(false)}
            className="text-xs text-slate-400 hover:text-white font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* TAB 1: PROFIL & IDENTITAS MADRASAH */}
      {activeTab === 'madrasah' && (
        <div className="space-y-6">
          {/* Preset Templates Quick Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Template Cepat Profil Lembaga:
              </span>
              <button
                onClick={resetMadrasahInfo}
                className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                title="Reset ke data bawaan sistem"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Bawaan</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {TEMPLATE_PRESETS.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyTemplate(t)}
                  className="px-3 py-1.5 rounded-xl glass-button text-xs font-medium text-slate-200 hover:border-amber-400/50 hover:text-amber-300 transition-all flex items-center gap-1.5"
                >
                  <Building2 className="w-3 h-3 text-emerald-400" />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Edit & Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Edit Profil & Logo */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSaveMadrasah} className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Formulir Identitas & Profil Lembaga</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Tersimpan Otomatis di Browser</span>
                </div>

                {/* 1. Nama & Singkatan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Nama Lengkap Madrasah / Lembaga <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.nama}
                      onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                      placeholder="Contoh: Madrasah Aliyah Negeri 1 Kendal"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Singkatan / Brand
                    </label>
                    <input
                      type="text"
                      value={editForm.singkatan}
                      onChange={(e) => setEditForm({ ...editForm, singkatan: e.target.value })}
                      placeholder="MAN 1 KENDAL"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono uppercase focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* 2. Logo Madrasah (Upload & URL) */}
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/70 space-y-3">
                  <label className="text-[11px] text-amber-300 block font-bold flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Logo Madrasah (Upload Gambar / URL / Preset)
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Preview Thumbnail */}
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-amber-500/40 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                      {editForm.logoUrl ? (
                        <img src={editForm.logoUrl} alt="Logo Preview" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className="w-8 h-8 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih File Logo (PNG/JPG)</span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={editForm.logoUrl || ''}
                          onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                          placeholder="Atau tempelkan URL Logo Online (https://...)"
                          className="w-full px-3 py-1.5 rounded-lg glass-input text-[11px] text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Logos to pick */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Pilihan Cepat Logo Islami:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {LOGO_PRESETS.map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, logoUrl: preset.url })}
                          className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            editForm.logoUrl === preset.url
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-7 h-7 rounded-lg object-cover" />
                          <span className="text-[10px] truncate font-medium">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Jenjang & Akreditasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Jenjang Pendidikan
                    </label>
                    <input
                      type="text"
                      value={editForm.jenjang}
                      onChange={(e) => setEditForm({ ...editForm, jenjang: e.target.value })}
                      placeholder="MI - MTs - MA Terpadu"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Status Akreditasi
                    </label>
                    <input
                      type="text"
                      value={editForm.akreditasi}
                      onChange={(e) => setEditForm({ ...editForm, akreditasi: e.target.value })}
                      placeholder="A (Unggul / BAN-SM)"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-amber-300 font-bold"
                      required
                    />
                  </div>
                </div>

                {/* 4. NSM & NPSN */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Nomor Statistik Madrasah (NSM)
                    </label>
                    <input
                      type="text"
                      value={editForm.nsm}
                      onChange={(e) => setEditForm({ ...editForm, nsm: e.target.value })}
                      placeholder="131232040088"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      NPSN Kemenag / Kemendikbud
                    </label>
                    <input
                      type="text"
                      value={editForm.npsn}
                      onChange={(e) => setEditForm({ ...editForm, npsn: e.target.value })}
                      placeholder="20278910"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                      required
                    />
                  </div>
                </div>

                {/* 5. Alamat & Kota */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Alamat Lengkap Madrasah
                    </label>
                    <input
                      type="text"
                      value={editForm.alamat}
                      onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                      placeholder="Jl. KH. Hasyim Asyari No. 99"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Kabupaten / Kota & Provinsi
                    </label>
                    <input
                      type="text"
                      value={editForm.kota}
                      onChange={(e) => setEditForm({ ...editForm, kota: e.target.value })}
                      placeholder="Kendal, Jawa Tengah"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                      required
                    />
                  </div>
                </div>

                {/* 6. Kontak, Email & Website */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={editForm.telepon}
                      onChange={(e) => setEditForm({ ...editForm, telepon: e.target.value })}
                      placeholder="(0294) 381-2299"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Email Resmi
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="info@madrasah.sch.id"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Website Lembaga
                    </label>
                    <input
                      type="text"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      placeholder="www.madrasah.sch.id"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-emerald-400"
                    />
                  </div>
                </div>

                {/* 7. Kepala Madrasah & NIP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      Nama Kepala Madrasah (Gelar)
                    </label>
                    <input
                      type="text"
                      value={editForm.kepalaMadrasah}
                      onChange={(e) => setEditForm({ ...editForm, kepalaMadrasah: e.target.value })}
                      placeholder="Dr. KH. Abdullah Munir, M.Pd.I"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                      NIP / NPK Kepala Madrasah
                    </label>
                    <input
                      type="text"
                      value={editForm.nipKepala || ''}
                      onChange={(e) => setEditForm({ ...editForm, nipKepala: e.target.value })}
                      placeholder="197508152002121003"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* 8. Visi & Semboyan */}
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                    Visi & Semboyan Lembaga
                  </label>
                  <textarea
                    value={editForm.semboyan}
                    onChange={(e) => setEditForm({ ...editForm, semboyan: e.target.value })}
                    rows={2}
                    placeholder="Membina Generasi Qurani, Cerdas, Berakhlaq Mulia..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/60 flex items-center gap-2 transition-all transform active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Profil Lembaga</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Live Kop Surat & Card Badges Preview */}
            <div className="lg:col-span-5 space-y-4">
              {/* Preview Kop Surat Resmi */}
              <div className="bg-white text-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                    Pratinjau Kop Surat Resmi & E-Raport:
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    LIVE PREVIEW
                  </span>
                </div>

                <div className="border-b-2 border-double border-emerald-900 pb-3 mb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-lg font-display shadow shrink-0 overflow-hidden">
                    {editForm.logoUrl ? (
                      <img src={editForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      editForm.nama.charAt(0) || 'M'
                    )}
                  </div>
                  <div className="text-center flex-1 min-w-0">
                    <h4 className="text-xs font-black tracking-wider text-emerald-950 uppercase leading-tight truncate">
                      {editForm.nama}
                    </h4>
                    <p className="text-[10px] font-semibold text-emerald-800">{editForm.jenjang}</p>
                    <p className="text-[9px] text-slate-600 truncate">{editForm.alamat}, {editForm.kota}</p>
                    <p className="text-[8px] text-slate-500 font-mono">NSM: {editForm.nsm} | NPSN: {editForm.npsn}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <p className="text-[10px] text-slate-500 font-serif italic">"{editForm.semboyan}"</p>
                  <div className="pt-2 flex items-center justify-between text-[9px] text-slate-700">
                    <span>Kepala: <strong>{editForm.kepalaMadrasah}</strong></span>
                    <span className="text-emerald-700 font-bold">{editForm.akreditasi}</span>
                  </div>
                </div>
              </div>

              {/* Preview Kartu Tanda Santri (Badge) */}
              <div className="glass-panel rounded-3xl p-5 border border-emerald-400/30 text-white space-y-3">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Pratinjau Header Kartu Pelajar Digital (E-KTS):
                </span>

                <div className="rounded-2xl p-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 flex items-center justify-center shrink-0">
                      {editForm.logoUrl ? (
                        <img src={editForm.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-[10px]" />
                      ) : (
                        <Building2 className="w-5 h-5 text-slate-950" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-white uppercase">{editForm.singkatan || editForm.nama}</h5>
                      <p className="text-[9px] text-emerald-300">{editForm.akreditasi}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    SMART ID
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROMBEL & KELAS */}
      {activeTab === 'kelas' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Rombel / Kelas</p>
                <h4 className="text-base sm:text-lg font-black text-white">{kelasList.length} <span className="text-xs font-normal text-slate-400">Kelas Aktif</span></h4>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Santri Terdaftar</p>
                <h4 className="text-base sm:text-lg font-black text-white">{siswaList.length} <span className="text-xs font-normal text-slate-400">Santri</span></h4>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Kapasitas Maksimal</p>
                <h4 className="text-base sm:text-lg font-black text-white">
                  {kelasList.reduce((acc, curr) => acc + curr.kapasitas, 0)} <span className="text-xs font-normal text-slate-400">Kursi</span>
                </h4>
              </div>
            </div>
          </div>

          {/* Filter & Quick Actions */}
          <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tingkat Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-xs text-slate-400 font-semibold mr-1 shrink-0">Tingkat:</span>
              {['Semua', '7', '8', '9', '10', '11', '12'].map((tingkat) => (
                <button
                  key={tingkat}
                  onClick={() => setSelectedTingkatFilter(tingkat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    selectedTingkatFilter === tingkat
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/40'
                      : 'glass-panel-subtle text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {tingkat === 'Semua' ? 'Semua Tingkat' : `Kelas ${tingkat}`}
                </button>
              ))}
            </div>

            {/* Tambah Kelas Button */}
            {activeRole === 'admin' && (
              <button
                onClick={openAddKelas}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shrink-0 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kelas Baru</span>
              </button>
            )}
          </div>

          {/* Classes Cards Grid */}
          {filteredKelas.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center border border-white/10 text-slate-400 space-y-2">
              <Layers className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">Tidak ada kelas / rombel yang cocok.</p>
              <p className="text-[11px] text-slate-500">Silakan ubah filter tingkat atau klik Tambah Kelas Baru di atas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredKelas.map((k) => {
                const countSiswa = siswaList.filter(s => s.kelas === k.nama).length;
                const percentage = Math.min(100, Math.round((countSiswa / k.kapasitas) * 100));

                return (
                  <div 
                    key={k.id} 
                    className="glass-card rounded-2xl p-4.5 flex flex-col justify-between space-y-4 border border-white/10 hover:border-emerald-500/40 transition-all group shadow-lg"
                  >
                    <div>
                      {/* Top Header badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            Tingkat {k.tingkat}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            {k.jurusan}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <DoorOpen className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[110px]">{k.ruangan}</span>
                        </span>
                      </div>

                      {/* Class Title */}
                      <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                        {k.nama}
                      </h4>

                      {/* Wali Kelas */}
                      <div className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400">Wali Kelas / Pembina:</p>
                          <p className="text-xs font-semibold text-slate-200 truncate">{k.waliKelasNama}</p>
                        </div>
                      </div>

                      {/* Capacity & Student Count Progress Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Kapasitas Terisi</span>
                          <span className="font-semibold text-slate-200 font-mono">
                            <span className="text-emerald-400 font-bold">{countSiswa}</span> / {k.kapasitas} Santri ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              percentage >= 90 
                                ? 'bg-amber-500' 
                                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-700/60">
                      <button
                        onClick={() => {
                          setSearchQuery(k.nama);
                          setActiveTab('siswa');
                        }}
                        className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Lihat Santri ({countSiswa})</span>
                      </button>

                      {activeRole === 'admin' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditKelas(k)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                            title="Edit data rombel/kelas"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteKelas(k)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                            title="Hapus kelas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SANTRI / SISWA */}
      {activeTab === 'siswa' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Quick Info & Action Header */}
          <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Data Santri & Siswa Aktif</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {filteredSiswa.length} dari {siswaList.length} Santri
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Kelola data santri, identitas wali, nomor kontak, target juz, dan rombel kelas
                </p>
              </div>
            </div>

            {activeRole === 'admin' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowImportSiswaModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Import Excel / CSV</span>
                </button>
              </div>
            )}
          </div>

          {filteredSiswa.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center border border-white/10 text-slate-400 space-y-3">
              <GraduationCap className="w-10 h-10 text-slate-500 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-300">Tidak ada data santri yang sesuai.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Silakan gunakan pencarian lain atau import data santri kolektif.</p>
              </div>
              {activeRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => setShowImportSiswaModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Import Data Santri Sekarang</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSiswa.map((siswa) => (
                <div key={siswa.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-3 border border-white/10 hover:border-emerald-500/40 transition-all shadow-lg">
                  <div className="flex items-start gap-3">
                    <img
                      src={siswa.foto}
                      alt={siswa.nama}
                      className="w-12 h-14 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{siswa.nama}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {siswa.kelas}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-300 font-mono">NISN: {siswa.nisn}</p>
                      <p className="text-[10px] text-slate-400">Wali: {siswa.namaWali}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{siswa.noHp}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px]">
                    <span className="text-emerald-400 font-medium">Hafalan: {(siswa as any).hafalanJuz ?? siswa.hafalanTercapai} Juz</span>
                    {activeRole === 'admin' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingSiswa(siswa)}
                          className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                          title="Edit data santri"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSiswa(siswa.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Hapus data siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASATIDZ / GURU */}
      {activeTab === 'guru' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGuru.map((guru) => (
            <div key={guru.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={guru.foto}
                  alt={guru.nama}
                  className="w-12 h-14 rounded-xl object-cover border border-amber-500/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{guru.nama}</h4>
                  <p className="text-[11px] text-emerald-400 font-medium">{guru.mapelUtama}</p>
                  <p className="text-[10px] text-slate-400 font-mono">NIP: {guru.nip}</p>
                  <p className="text-[10px] text-slate-400 truncate">{guru.pendidikanTerakhir}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-amber-400" />
                  <span className="truncate max-w-[140px]">{guru.email}</span>
                </span>
                {activeRole === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingGuru(guru)}
                      className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                      title="Edit data asatidz"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGuru(guru.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Hapus data guru"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Siswa Modal */}
      {editingSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-3xl p-6 w-full max-w-md border border-emerald-500/40 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Edit Data Santri: {editingSiswa.nama}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingSiswa(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSiswaSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Nama Lengkap Santri</label>
                <input
                  type="text"
                  value={editingSiswa.nama}
                  onChange={(e) => setEditingSiswa({ ...editingSiswa, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">NISN</label>
                  <input
                    type="text"
                    value={editingSiswa.nisn}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, nisn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">NIS</label>
                  <input
                    type="text"
                    value={editingSiswa.nis || ''}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, nis: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Kelas</label>
                  <select
                    value={editingSiswa.kelas}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, kelas: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  >
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.nama} className="bg-slate-900">
                        {k.nama} ({k.jurusan})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Target Hafalan (Juz)</label>
                  <input
                    type="number"
                    value={editingSiswa.targetJuz || 30}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, targetJuz: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    min="1"
                    max="30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Nama Wali Santri</label>
                <input
                  type="text"
                  value={editingSiswa.waliNama || (editingSiswa as any).namaWali || ''}
                  onChange={(e) => setEditingSiswa({ ...editingSiswa, waliNama: e.target.value, namaWali: e.target.value } as any)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">No. WhatsApp / HP Wali</label>
                <input
                  type="text"
                  value={editingSiswa.waliPhone || (editingSiswa as any).noHp || ''}
                  onChange={(e) => setEditingSiswa({ ...editingSiswa, waliPhone: e.target.value, noHp: e.target.value } as any)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  value={editingSiswa.alamat || ''}
                  onChange={(e) => setEditingSiswa({ ...editingSiswa, alamat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSiswa(null)}
                  className="flex-1 py-2 rounded-xl glass-button text-xs text-slate-400 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guru Modal */}
      {editingGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-3xl p-6 w-full max-w-md border border-amber-500/40 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Edit Data Asatidz: {editingGuru.nama}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingGuru(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateGuruSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={editingGuru.nama}
                  onChange={(e) => setEditingGuru({ ...editingGuru, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">NIP / NUPTK</label>
                <input
                  type="text"
                  value={editingGuru.nip}
                  onChange={(e) => setEditingGuru({ ...editingGuru, nip: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Mata Pelajaran Utama</label>
                <input
                  type="text"
                  value={(editingGuru as any).mapelUtama || editingGuru.mapel || ''}
                  onChange={(e) => setEditingGuru({ ...editingGuru, mapelUtama: e.target.value, mapel: e.target.value } as any)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Pendidikan Terakhir / Gelar</label>
                <input
                  type="text"
                  value={(editingGuru as any).pendidikanTerakhir || editingGuru.gelar || ''}
                  onChange={(e) => setEditingGuru({ ...editingGuru, pendidikanTerakhir: e.target.value, gelar: e.target.value } as any)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={editingGuru.email || ''}
                  onChange={(e) => setEditingGuru({ ...editingGuru, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGuru(null)}
                  className="flex-1 py-2 rounded-xl glass-button text-xs text-slate-400 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs text-white font-bold shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-3xl p-6 w-full max-w-md border border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Tambah Data {activeTab === 'siswa' ? 'Santri / Siswa Baru' : 'Dewan Asatidz'}
            </h3>

            {activeTab === 'siswa' ? (
              <form onSubmit={handleAddSiswaSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Nama Lengkap Santri</label>
                  <input
                    type="text"
                    value={namaSiswa}
                    onChange={(e) => setNamaSiswa(e.target.value)}
                    placeholder="Contoh: Muhammad Rayhan"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">NISN</label>
                    <input
                      type="text"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      placeholder="0089123456"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">NIS</label>
                    <input
                      type="text"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      placeholder="2026-905"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Kelas</label>
                    <select
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    >
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.nama} className="bg-slate-900">
                          {k.nama} ({k.jurusan})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Jenis Kelamin</label>
                    <select
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    >
                      <option value="L" className="bg-slate-900">Laki-laki (Ikhwan)</option>
                      <option value="P" className="bg-slate-900">Perempuan (Akhwat)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Nama Wali Santri</label>
                  <input
                    type="text"
                    value={namaWali}
                    onChange={(e) => setNamaWali(e.target.value)}
                    placeholder="Bapak / Ibu Wali"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 rounded-xl glass-button text-xs text-slate-400 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold shadow-md"
                  >
                    Simpan Santri
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddGuruSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={namaGuru}
                    onChange={(e) => setNamaGuru(e.target.value)}
                    placeholder="Contoh: Ustadz Dr. H. M. Zain, M.Ag."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Mata Pelajaran Utama</label>
                  <input
                    type="text"
                    value={mapelUtama}
                    onChange={(e) => setMapelUtama(e.target.value)}
                    placeholder="Tahfidz / Fiqih / Bahasa Arab"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={pendidikan}
                    onChange={(e) => setPendidikan(e.target.value)}
                    placeholder="S1 / S2 Universitas..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 rounded-xl glass-button text-xs text-slate-400 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs text-white font-bold shadow-md"
                  >
                    Simpan Asatidz
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT KELAS (ROMBEL) */}
      {showKelasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-3xl p-6 w-full max-w-lg border border-emerald-500/40 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {editingKelas ? `Edit Kelas: ${editingKelas.nama}` : 'Tambah Rombongan Belajar (Kelas) Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Konfigurasi tingkatan, program kejuruan, kapasitas kursi, dan wali kelas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKelasModal(false)}
                className="w-7 h-7 rounded-lg glass-panel-subtle flex items-center justify-center text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleKelasSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Nama Rombel / Kelas <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={kelasForm.nama}
                    onChange={(e) => setKelasForm({ ...kelasForm, nama: e.target.value })}
                    placeholder="Contoh: 7A Tahfidz, 10 IPA 1"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500 focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Tingkat <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={kelasForm.tingkat}
                    onChange={(e) => setKelasForm({ ...kelasForm, tingkat: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                  >
                    <option value="7" className="bg-slate-900">Kelas 7 (MTs/SMP)</option>
                    <option value="8" className="bg-slate-900">Kelas 8 (MTs/SMP)</option>
                    <option value="9" className="bg-slate-900">Kelas 9 (MTs/SMP)</option>
                    <option value="10" className="bg-slate-900">Kelas 10 (MA/SMA)</option>
                    <option value="11" className="bg-slate-900">Kelas 11 (MA/SMA)</option>
                    <option value="12" className="bg-slate-900">Kelas 12 (MA/SMA)</option>
                    <option value="1" className="bg-slate-900">Kelas 1 (MI/SD)</option>
                    <option value="2" className="bg-slate-900">Kelas 2 (MI/SD)</option>
                    <option value="3" className="bg-slate-900">Kelas 3 (MI/SD)</option>
                    <option value="4" className="bg-slate-900">Kelas 4 (MI/SD)</option>
                    <option value="5" className="bg-slate-900">Kelas 5 (MI/SD)</option>
                    <option value="6" className="bg-slate-900">Kelas 6 (MI/SD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Program / Jurusan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={kelasForm.jurusan}
                    onChange={(e) => setKelasForm({ ...kelasForm, jurusan: e.target.value })}
                    placeholder="Contoh: Tahfidz Al-Qur'an / Unggulan Riset"
                    list="jurusan-presets"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500"
                    required
                  />
                  <datalist id="jurusan-presets">
                    <option value="Tahfidz Al-Qur'an" />
                    <option value="Unggulan Riset" />
                    <option value="Sains & Matematika" />
                    <option value="Keagamaan Islam" />
                    <option value="Bahasa & Humaniora" />
                    <option value="Reguler" />
                    <option value="MIPA" />
                    <option value="IPS" />
                  </datalist>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Kapasitas Kursi Santri <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={kelasForm.kapasitas}
                    onChange={(e) => setKelasForm({ ...kelasForm, kapasitas: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Wali Kelas / Guru Pembina
                </label>
                <div className="relative">
                  <select
                    value={kelasForm.waliKelasNama}
                    onChange={(e) => setKelasForm({ ...kelasForm, waliKelasNama: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                  >
                    {guruList.map((g) => (
                      <option key={g.id} value={g.nama} className="bg-slate-900">
                        {g.nama} - {g.mapelUtama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Ruangan / Lokasi Gedung
                </label>
                <input
                  type="text"
                  value={kelasForm.ruangan}
                  onChange={(e) => setKelasForm({ ...kelasForm, ruangan: e.target.value })}
                  placeholder="Contoh: Gedung Umar Lt. 1, Ruang 101"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowKelasModal(false)}
                  className="flex-1 py-2.5 rounded-xl glass-button text-xs text-slate-400 hover:text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs text-white font-bold shadow-lg shadow-emerald-950/40"
                >
                  {editingKelas ? 'Simpan Perubahan Kelas' : 'Tambah Kelas Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Santri Kolektif (Excel / CSV) */}
      <ImportSiswaModal
        isOpen={showImportSiswaModal}
        onClose={() => setShowImportSiswaModal(false)}
      />
    </div>
  );
};
