import React, { useState, useMemo } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { TabunganAccount, TabunganTransaksi, JenisAkadTabungan } from '../types';
import { 
  PiggyBank, 
  Wallet, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Plus, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Building2, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  Receipt,
  FileText,
  Clock,
  QrCode,
  Tag,
  BadgePercent,
  SlidersHorizontal,
  ChevronRight,
  Filter
} from 'lucide-react';

export const TabunganView: React.FC = () => {
  const { 
    tabunganAccounts, 
    tabunganTransaksi, 
    addTabunganAccount, 
    updateTabunganAccount,
    deleteTabunganAccount,
    setorTabungan, 
    tarikTabungan, 
    bayarSPPDenganTabungan,
    siswaList, 
    guruList, 
    kelasList, 
    tagihanList,
    activeRole, 
    currentUser,
    madrasahInfo,
    triggerConfetti 
  } = useMadrasah();

  // Tab State: 'santri' | 'asatidz' | 'mutasi' | 'rencana'
  const [activeSubTab, setActiveSubTab] = useState<'santri' | 'asatidz' | 'mutasi' | 'rencana'>('santri');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('semua');
  const [filterAkad, setFilterAkad] = useState('semua');
  const [filterTrxJenis, setFilterTrxJenis] = useState<'semua' | 'setor' | 'tarik' | 'autodebet_spp'>('semua');

  // Modals
  const [showBukaRekeningModal, setShowBukaRekeningModal] = useState(false);
  const [showSetorModal, setShowSetorModal] = useState(false);
  const [showTarikModal, setShowTarikModal] = useState(false);
  const [showBukuTabunganModal, setShowBukuTabunganModal] = useState(false);
  const [showBayarSPPModal, setShowBayarSPPModal] = useState(false);
  const [showEditRekeningModal, setShowEditRekeningModal] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<TabunganAccount | null>(null);
  const [selectedKwitansiTrx, setSelectedKwitansiTrx] = useState<TabunganTransaksi | null>(null);

  // Form State: Buka Rekening
  const [formOwnerType, setFormOwnerType] = useState<'siswa' | 'guru'>('siswa');
  const [formSelectedOwnerId, setFormSelectedOwnerId] = useState('');
  const [formAkad, setFormAkad] = useState<JenisAkadTabungan>('Wadiah Yad Dhamanah');
  const [formSaldoAwal, setFormSaldoAwal] = useState<number>(50000);
  const [formLimitHarian, setFormLimitHarian] = useState<number>(50000);
  const [formCatatan, setFormCatatan] = useState('');

  // Form State: Setor Tabungan
  const [setorAccId, setSetorAccId] = useState('');
  const [setorNominal, setSetorNominal] = useState<number>(50000);
  const [setorKategori, setSetorKategori] = useState('Uang Saku Santri');
  const [setorMetode, setSetorMetode] = useState('Tunai Teller Baitul Maal');
  const [setorKeterangan, setSetorKeterangan] = useState('');

  // Form State: Tarik Tabungan
  const [tarikAccId, setTarikAccId] = useState('');
  const [tarikNominal, setTarikNominal] = useState<number>(20000);
  const [tarikKategori, setTarikKategori] = useState('Uang Saku Santri');
  const [tarikMetode, setTarikMetode] = useState('Smart Card E-KTS QR');
  const [tarikKeterangan, setTarikKeterangan] = useState('');
  const [tarikError, setTarikError] = useState('');

  // Form State: Bayar SPP
  const [sppAccId, setSppAccId] = useState('');
  const [selectedTagihanId, setSelectedTagihanId] = useState('');
  const [sppFeedback, setSppFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Form State: Edit Rekening
  const [editLimitHarian, setEditLimitHarian] = useState(50000);
  const [editStatus, setEditStatus] = useState<'aktif' | 'dibekukan' | 'tutup'>('aktif');
  const [editCatatan, setEditCatatan] = useState('');

  // Calculations for Stats Bento
  const santriAccounts = useMemo(() => tabunganAccounts.filter(a => a.ownerType === 'siswa'), [tabunganAccounts]);
  const asatidzAccounts = useMemo(() => tabunganAccounts.filter(a => a.ownerType === 'guru'), [tabunganAccounts]);

  const totalSaldoSantri = useMemo(() => santriAccounts.reduce((sum, a) => sum + a.saldo, 0), [santriAccounts]);
  const totalSaldoAsatidz = useMemo(() => asatidzAccounts.reduce((sum, a) => sum + a.saldo, 0), [asatidzAccounts]);
  const grandTotalSimpanan = totalSaldoSantri + totalSaldoAsatidz;

  const totalSetoranBulanIni = useMemo(() => {
    return tabunganTransaksi
      .filter(t => t.jenis === 'setor')
      .reduce((sum, t) => sum + t.nominal, 0);
  }, [tabunganTransaksi]);

  const totalPenarikanBulanIni = useMemo(() => {
    return tabunganTransaksi
      .filter(t => t.jenis === 'tarik' || t.jenis === 'autodebet_spp')
      .reduce((sum, t) => sum + t.nominal, 0);
  }, [tabunganTransaksi]);

  // Filtered Accounts
  const filteredSantriAccounts = useMemo(() => {
    return santriAccounts.filter(acc => {
      const matchSearch = acc.ownerNama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          acc.nomorRekening.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKelas = filterKelas === 'semua' || acc.kelasOrJabatan === filterKelas;
      const matchAkad = filterAkad === 'semua' || acc.jenisAkad === filterAkad;
      return matchSearch && matchKelas && matchAkad;
    });
  }, [santriAccounts, searchQuery, filterKelas, filterAkad]);

  const filteredAsatidzAccounts = useMemo(() => {
    return asatidzAccounts.filter(acc => {
      const matchSearch = acc.ownerNama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          acc.nomorRekening.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAkad = filterAkad === 'semua' || acc.jenisAkad === filterAkad;
      return matchSearch && matchAkad;
    });
  }, [asatidzAccounts, searchQuery, filterAkad]);

  const filteredTransaksi = useMemo(() => {
    return tabunganTransaksi.filter(t => {
      const matchSearch = t.ownerNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.nomorRekening.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.nomorKwitansi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.keterangan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchJenis = filterTrxJenis === 'semua' || t.jenis === filterTrxJenis;
      return matchSearch && matchJenis;
    });
  }, [tabunganTransaksi, searchQuery, filterTrxJenis]);

  // Open Setor Modal for specific account
  const handleOpenSetor = (acc?: TabunganAccount) => {
    if (acc) {
      setSetorAccId(acc.id);
      setSelectedAccount(acc);
    } else if (tabunganAccounts.length > 0) {
      setSetorAccId(tabunganAccounts[0].id);
      setSelectedAccount(tabunganAccounts[0]);
    }
    setSetorNominal(50000);
    setSetorKeterangan('');
    setShowSetorModal(true);
  };

  // Open Tarik Modal for specific account
  const handleOpenTarik = (acc?: TabunganAccount) => {
    const target = acc || tabunganAccounts[0];
    if (target) {
      setTarikAccId(target.id);
      setSelectedAccount(target);
      setTarikNominal(Math.min(target.saldo, target.ownerType === 'siswa' && target.limitHarianTarik ? target.limitHarianTarik : 50000));
    }
    setTarikError('');
    setTarikKeterangan('');
    setShowTarikModal(true);
  };

  // Open Buku Tabungan / Mutasi Print
  const handleOpenBukuTabungan = (acc: TabunganAccount) => {
    setSelectedAccount(acc);
    setShowBukuTabunganModal(true);
  };

  // Open SPP Modal
  const handleOpenBayarSPP = (acc: TabunganAccount) => {
    setSelectedAccount(acc);
    setSppAccId(acc.id);
    const pendingTagihan = tagihanList.filter(t => t.siswaId === acc.ownerId && t.status === 'belum_lunas');
    if (pendingTagihan.length > 0) {
      setSelectedTagihanId(pendingTagihan[0].id);
    } else {
      setSelectedTagihanId('');
    }
    setSppFeedback(null);
    setShowBayarSPPModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (acc: TabunganAccount) => {
    setSelectedAccount(acc);
    setEditLimitHarian(acc.limitHarianTarik || 0);
    setEditStatus(acc.status);
    setEditCatatan(acc.catatan || '');
    setShowEditRekeningModal(true);
  };

  // Submit Buka Rekening
  const handleSubmitBukaRekening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formOwnerType === 'siswa') {
      const siswa = siswaList.find(s => s.id === formSelectedOwnerId) || siswaList[0];
      if (!siswa) return;
      await addTabunganAccount({
        ownerType: 'siswa',
        ownerId: siswa.id,
        ownerNama: siswa.nama,
        kelasOrJabatan: siswa.kelas,
        jenisAkad: formAkad,
        limitHarianTarik: Number(formLimitHarian),
        status: 'aktif',
        catatan: formCatatan || `Tabungan ${formAkad} Santri ${siswa.nama}`,
        nomorRekening: ''
      }, formSaldoAwal);
    } else {
      const guru = guruList.find(g => g.id === formSelectedOwnerId) || guruList[0];
      if (!guru) return;
      await addTabunganAccount({
        ownerType: 'guru',
        ownerId: guru.id,
        ownerNama: `${guru.nama}${guru.gelar ? ', ' + guru.gelar : ''}`,
        kelasOrJabatan: guru.mapel || 'Asatidz Madrasah',
        jenisAkad: formAkad,
        limitHarianTarik: 0,
        status: 'aktif',
        catatan: formCatatan || `Simpanan ${formAkad} Dewan Asatidz`,
        nomorRekening: ''
      }, formSaldoAwal);
    }

    setShowBukaRekeningModal(false);
  };

  // Submit Setor
  const handleSubmitSetor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setorAccId || setorNominal <= 0) return;
    const trx = await setorTabungan(setorAccId, setorNominal, setorKategori, setorKeterangan, setorMetode);
    if (trx) {
      setSelectedKwitansiTrx(trx);
      setShowSetorModal(false);
    }
  };

  // Submit Tarik
  const handleSubmitTarik = async (e: React.FormEvent) => {
    e.preventDefault();
    setTarikError('');
    if (!tarikAccId || tarikNominal <= 0) return;

    const res = await tarikTabungan(tarikAccId, tarikNominal, tarikKategori, tarikKeterangan, tarikMetode);
    if (res.success && res.transaksi) {
      setSelectedKwitansiTrx(res.transaksi);
      setShowTarikModal(false);
    } else {
      setTarikError(res.message);
    }
  };

  // Submit Bayar SPP
  const handleSubmitBayarSPP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sppAccId || !selectedTagihanId) return;
    const res = await bayarSPPDenganTabungan(sppAccId, selectedTagihanId);
    if (res.success) {
      setSppFeedback({ type: 'success', msg: res.message });
      setTimeout(() => {
        setShowBayarSPPModal(false);
      }, 1800);
    } else {
      setSppFeedback({ type: 'error', msg: res.message });
    }
  };

  // Submit Edit Rekening
  const handleSubmitEditRekening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    await updateTabunganAccount(selectedAccount.id, {
      limitHarianTarik: Number(editLimitHarian),
      status: editStatus,
      catatan: editCatatan,
    });
    setShowEditRekeningModal(false);
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-8">
      {/* 🌟 HEADER BAITUL MAAL & TABUNGAN */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-6 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        {/* Background Aura Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-amber-400 p-0.5 shadow-lg shadow-emerald-950/60 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950/80 backdrop-blur-md rounded-[14px] flex items-center justify-center text-amber-400">
              <PiggyBank className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                Tabungan Santri & Dewan Asatidz
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Baitul Maal Syariah
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Pengelolaan Rekening Wadiah, Uang Saku Smart Card, Simpanan Qurban & Kesejahteraan Asatidz
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => {
              setFormSelectedOwnerId(siswaList[0]?.id || '');
              setFormOwnerType('siswa');
              setShowBukaRekeningModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Buka Rekening</span>
          </button>

          <button
            onClick={() => handleOpenSetor()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-white" />
            <span>Setor Tunai / Kiriman</span>
          </button>

          <button
            onClick={() => handleOpenTarik()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-950/50 transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            <span>Tarik Uang Saku</span>
          </button>
        </div>
      </div>

      {/* 📊 STATS BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Saldo Santri */}
        <div className="p-4 rounded-3xl glass-panel-emerald border border-emerald-400/40 shadow-xl text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Tabungan Santri</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2 font-mono text-emerald-200">
            Rp {totalSaldoSantri.toLocaleString('id-ID')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-300 mt-2 pt-2 border-t border-emerald-500/20">
            <span>{santriAccounts.length} Rekening Santri</span>
            <span className="text-emerald-400 font-semibold">Wadiah & Saku</span>
          </div>
        </div>

        {/* Card 2: Total Saldo Asatidz */}
        <div className="p-4 rounded-3xl glass-panel-amber border border-amber-400/40 shadow-xl text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Tabungan Asatidz</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2 font-mono text-amber-200">
            Rp {totalSaldoAsatidz.toLocaleString('id-ID')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-300 mt-2 pt-2 border-t border-amber-500/20">
            <span>{asatidzAccounts.length} Rekening Guru</span>
            <span className="text-amber-400 font-semibold">Mudharabah & Qurban</span>
          </div>
        </div>

        {/* Card 3: Total Kas Terhimpun */}
        <div className="p-4 rounded-3xl glass-panel border border-white/10 shadow-xl text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">Total Dana Simpanan</span>
            <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2 font-mono text-white">
            Rp {grandTotalSimpanan.toLocaleString('id-ID')}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-white/10">
            <span>Total Likuiditas Aman</span>
            <span className="text-teal-400 font-semibold">Bank BSI Syariah</span>
          </div>
        </div>

        {/* Card 4: Arus Masuk & Keluar */}
        <div className="p-4 rounded-3xl glass-panel border border-white/10 shadow-xl text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Mutasi Bulan Ini</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <ArrowDownLeft className="w-3 h-3" /> Rp {totalSetoranBulanIni.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 flex items-center gap-1 font-bold">
                <ArrowUpRight className="w-3 h-3" /> Rp {totalPenarikanBulanIni.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 pt-1.5 border-t border-white/10">
            {tabunganTransaksi.length} Total Catatan Transaksi
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 p-1.5 glass-panel-subtle rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'santri', label: 'Tabungan Santri', count: santriAccounts.length, icon: GraduationCap },
          { id: 'asatidz', label: 'Tabungan Asatidz & Karyawan', count: asatidzAccounts.length, icon: Users },
          { id: 'mutasi', label: 'Buku Jurnal & Mutasi', count: tabunganTransaksi.length, icon: FileText },
          { id: 'rencana', label: 'Program Qurban & Wisuda', count: 3, icon: Sparkles },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                isActive ? 'bg-black/30 text-amber-300' : 'bg-white/5 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 🔍 SEARCH & FILTER BAR */}
      <div className="glass-panel border border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'santri' 
                ? 'Cari nama santri, nomor rekening...' 
                : activeSubTab === 'asatidz' 
                ? 'Cari nama ustadz/guru...' 
                : 'Cari riwayat transaksi, nomor kwitansi, keterangan...'
            }
            className="w-full pl-9 pr-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'santri' && (
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-input text-xs text-white"
            >
              <option value="semua" className="bg-slate-900">Semua Rombel / Kelas</option>
              {kelasList.map(k => (
                <option key={k.id} value={k.nama} className="bg-slate-900">{k.nama}</option>
              ))}
            </select>
          )}

          {(activeSubTab === 'santri' || activeSubTab === 'asatidz') && (
            <select
              value={filterAkad}
              onChange={(e) => setFilterAkad(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-input text-xs text-white"
            >
              <option value="semua" className="bg-slate-900">Semua Akad Tabungan</option>
              <option value="Wadiah Yad Dhamanah" className="bg-slate-900">Wadiah Yad Dhamanah</option>
              <option value="Mudharabah (Bagi Hasil)" className="bg-slate-900">Mudharabah (Bagi Hasil)</option>
              <option value="Tabungan Qurban" className="bg-slate-900">Tabungan Qurban</option>
              <option value="Tabungan Wisuda & Rihlah" className="bg-slate-900">Tabungan Wisuda & Rihlah</option>
              <option value="Tabungan Uang Saku" className="bg-slate-900">Tabungan Uang Saku</option>
            </select>
          )}

          {activeSubTab === 'mutasi' && (
            <div className="flex items-center gap-1">
              {(['semua', 'setor', 'tarik', 'autodebet_spp'] as const).map(j => (
                <button
                  key={j}
                  onClick={() => setFilterTrxJenis(j)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    filterTrxJenis === j
                      ? 'bg-emerald-600 text-white'
                      : 'glass-panel-subtle text-slate-400 hover:text-white'
                  }`}
                >
                  {j === 'autodebet_spp' ? 'Autodebet SPP' : j}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🧒 SUB-TAB 1: TABUNGAN SANTRI */}
      {/* ======================================================== */}
      {activeSubTab === 'santri' && (
        <div className="space-y-3">
          {filteredSantriAccounts.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-white/10 space-y-3">
              <PiggyBank className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Belum ada rekening santri yang sesuai pencarian</p>
              <button
                onClick={() => {
                  setFormOwnerType('siswa');
                  setShowBukaRekeningModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                + Buka Rekening Santri Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSantriAccounts.map(acc => {
                const pendingSPP = tagihanList.filter(t => t.siswaId === acc.ownerId && t.status === 'belum_lunas');
                return (
                  <div
                    key={acc.id}
                    className="p-5 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all text-white flex flex-col justify-between space-y-4 shadow-xl group relative overflow-hidden"
                  >
                    {/* Top status bar */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                          {acc.nomorRekening}
                        </span>
                        <h4 className="text-sm font-black text-white mt-1.5 group-hover:text-emerald-300 transition-colors">
                          {acc.ownerNama}
                        </h4>
                        <p className="text-xs text-slate-300">
                          Kelas: <strong className="text-emerald-400">{acc.kelasOrJabatan}</strong>
                        </p>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        acc.status === 'aktif'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {acc.status}
                      </span>
                    </div>

                    {/* Saldo Display Box */}
                    <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Saldo Tabungan</span>
                        <span className="text-[10px] text-teal-300 font-semibold">{acc.jenisAkad}</span>
                      </div>
                      <p className="text-xl font-black font-mono text-emerald-300">
                        Rp {acc.saldo.toLocaleString('id-ID')}
                      </p>
                      
                      {acc.limitHarianTarik && acc.limitHarianTarik > 0 ? (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                          <span>Limit Saku Harian:</span>
                          <span className="text-amber-300 font-mono font-semibold">
                            Rp {acc.limitHarianTarik.toLocaleString('id-ID')}/hari
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Pending SPP badge alert */}
                    {pendingSPP.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-amber-300">
                          <Receipt className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[11px] font-semibold">{pendingSPP.length} Tagihan SPP Pending</span>
                        </div>
                        <button
                          onClick={() => handleOpenBayarSPP(acc)}
                          className="px-2 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold shadow-sm"
                        >
                          Autodebet
                        </button>
                      </div>
                    )}

                    {/* Actions Grid */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        onClick={() => handleOpenSetor(acc)}
                        className="py-2 px-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                        title="Setor uang saku atau tabungan"
                      >
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>Setor</span>
                      </button>

                      <button
                        onClick={() => handleOpenTarik(acc)}
                        className="py-2 px-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                        title="Tarik uang saku santri"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Tarik</span>
                      </button>

                      <button
                        onClick={() => handleOpenBukuTabungan(acc)}
                        className="py-2 px-2 rounded-xl glass-panel-subtle hover:bg-white/10 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 border border-white/10 transition-all"
                        title="Lihat & cetak buku tabungan digital"
                      >
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span>Buku</span>
                      </button>
                    </div>

                    {/* Footer gear & open date */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <span>Buka: {acc.tanggalBuka}</span>
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Kelola</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 👳‍♂️ SUB-TAB 2: TABUNGAN ASATIDZ */}
      {/* ======================================================== */}
      {activeSubTab === 'asatidz' && (
        <div className="space-y-3">
          {filteredAsatidzAccounts.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-white/10 space-y-3">
              <Users className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Belum ada rekening asatidz yang sesuai</p>
              <button
                onClick={() => {
                  setFormOwnerType('guru');
                  setShowBukaRekeningModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
              >
                + Buka Rekening Asatidz Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredAsatidzAccounts.map(acc => (
                <div
                  key={acc.id}
                  className="p-5 rounded-3xl glass-card border border-amber-500/30 hover:border-amber-400/50 transition-all text-white flex flex-col justify-between space-y-4 shadow-xl group relative overflow-hidden"
                >
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                        {acc.nomorRekening}
                      </span>
                      <h4 className="text-sm font-black text-white mt-1.5 group-hover:text-amber-300 transition-colors">
                        {acc.ownerNama}
                      </h4>
                      <p className="text-xs text-slate-300">
                        Jabatan/Mapel: <strong className="text-amber-300">{acc.kelasOrJabatan}</strong>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Asatidz
                    </span>
                  </div>

                  {/* Saldo Display Box */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Saldo Simpanan</span>
                      <span className="text-[10px] text-amber-300 font-semibold">{acc.jenisAkad}</span>
                    </div>
                    <p className="text-xl font-black font-mono text-amber-300">
                      Rp {acc.saldo.toLocaleString('id-ID')}
                    </p>
                    {acc.catatan && (
                      <p className="text-[10px] text-slate-400 italic pt-1 border-t border-white/5 truncate">
                        {acc.catatan}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => handleOpenSetor(acc)}
                      className="py-2 px-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>Setor</span>
                    </button>

                    <button
                      onClick={() => handleOpenTarik(acc)}
                      className="py-2 px-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Tarik</span>
                    </button>

                    <button
                      onClick={() => handleOpenBukuTabungan(acc)}
                      className="py-2 px-2 rounded-xl glass-panel-subtle hover:bg-white/10 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 border border-white/10 transition-all"
                    >
                      <FileText className="w-3 h-3 text-amber-400" />
                      <span>Mutasi</span>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                    <span>Terdaftar: {acc.tanggalBuka}</span>
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Opsi</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 📜 SUB-TAB 3: JURNAL & MUTASI TRANSAKSI */}
      {/* ======================================================== */}
      {activeSubTab === 'mutasi' && (
        <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Buku Jurnal Kas & Mutasi Tabungan</span>
              </h3>
              <p className="text-xs text-slate-400">Catatan kronologis debit, kredit, dan nomor referensi transaksi</p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl glass-button text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 no-print"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak Jurnal</span>
            </button>
          </div>

          {filteredTransaksi.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada catatan mutasi yang cocok dengan filter pencarian.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTransaksi.map(trx => {
                const isSetor = trx.jenis === 'setor';
                return (
                  <div
                    key={trx.id}
                    className="p-3.5 sm:p-4 rounded-2xl glass-panel-subtle border border-white/5 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSetor
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : trx.jenis === 'autodebet_spp'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isSetor ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                            isSetor 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : trx.jenis === 'autodebet_spp'
                              ? 'bg-teal-500/20 text-teal-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {trx.jenis === 'autodebet_spp' ? 'Autodebet SPP' : isSetor ? 'Setor Dana' : 'Penarikan'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {trx.nomorKwitansi}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {trx.tanggal} &bull; {trx.waktu} WIB
                          </span>
                        </div>

                        <h5 className="font-bold text-white truncate">
                          {trx.ownerNama} <span className="text-[11px] font-mono text-slate-400 font-normal">({trx.nomorRekening})</span>
                        </h5>
                        <p className="text-slate-300 text-[11px] truncate">
                          {trx.kategori} &bull; {trx.keterangan}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block">Nominal Mutasi</span>
                        <strong className={`font-mono text-sm font-bold ${isSetor ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isSetor ? '+ ' : '- '}Rp {trx.nominal.toLocaleString('id-ID')}
                        </strong>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Saldo Akhir: Rp {trx.saldoSetelah.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedKwitansiTrx(trx)}
                        className="px-2.5 py-1.5 rounded-lg glass-button text-amber-300 hover:text-amber-200 text-[11px] font-semibold flex items-center gap-1 border border-amber-400/20"
                        title="Lihat & Cetak Slip Transaksi"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Slip</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 🎯 SUB-TAB 4: PROGRAM TABUNGAN RENCANA */}
      {/* ======================================================== */}
      {activeSubTab === 'rencana' && (
        <div className="space-y-4">
          <div className="glass-panel border border-white/10 rounded-3xl p-5 text-white">
            <h3 className="text-base font-bold flex items-center gap-2 text-amber-300 mb-1">
              <Sparkles className="w-5 h-5" />
              <span>Program Tabungan Rencana & Ibadah Kolektif</span>
            </h3>
            <p className="text-xs text-slate-300">
              Fasilitasi santri dan asatidz untuk menabung target ibadah Qurban Idul Adha, Khotmil Qur'an & Rihlah Ilmiah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target 1: Qurban Kambing Santri */}
            <div className="p-5 rounded-3xl glass-panel-emerald border border-emerald-500/40 text-white space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Target: Rp 3.500.000
                </span>
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Tabungan Qurban Kambing (Santri)</h4>
                <p className="text-xs text-slate-300 mt-0.5">Program cicilan berkah Idul Adha santri teladan</p>
              </div>

              {/* Progress Simulation */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Terkumpul Rata-rata</span>
                  <span className="text-emerald-300 font-mono font-bold">85% (Rp 2.975.000)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <button
                onClick={() => {
                  setSetorKategori('Tabungan Qurban');
                  handleOpenSetor();
                }}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
              >
                + Setor Tabungan Qurban
              </button>
            </div>

            {/* Target 2: Qurban Sapi Asatidz (1/7 Bagian) */}
            <div className="p-5 rounded-3xl glass-panel-amber border border-amber-500/40 text-white space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Target: Rp 4.500.000
                </span>
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Qurban Sapi Kolektif (1/7 Asatidz)</h4>
                <p className="text-xs text-slate-300 mt-0.5">Program gotong royong sapi qurban dewan asatidz</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Terkumpul Rata-rata</span>
                  <span className="text-amber-300 font-mono font-bold">92% (Rp 4.140.000)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <button
                onClick={() => {
                  setSetorKategori('Tabungan Qurban');
                  handleOpenSetor();
                }}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-all"
              >
                + Setor Tabungan Asatidz
              </button>
            </div>

            {/* Target 3: Wisuda Tahfidz & Rihlah Ilmiah */}
            <div className="p-5 rounded-3xl glass-panel border border-white/10 text-white space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Target: Rp 1.500.000
                </span>
                <GraduationCap className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Wisuda Tahfidz & Ziarah Ilmiah</h4>
                <p className="text-xs text-slate-300 mt-0.5">Tabungan persiapan haflah khotmil & rihlah</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Terkumpul Rata-rata</span>
                  <span className="text-teal-300 font-mono font-bold">65% (Rp 975.000)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <button
                onClick={() => {
                  setSetorKategori('Tabungan Wisuda');
                  handleOpenSetor();
                }}
                className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow transition-all"
              >
                + Setor Tabungan Wisuda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📥 MODAL 1: BUKA REKENING TABUNGAN BARU */}
      {/* ======================================================== */}
      {showBukaRekeningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel border border-emerald-500/40 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Buka Buku Tabungan Syariah Baru</h3>
                  <p className="text-[11px] text-slate-400">Pendaftaran rekening tabungan santri atau dewan asatidz</p>
                </div>
              </div>
              <button
                onClick={() => setShowBukaRekeningModal(false)}
                className="w-7 h-7 rounded-lg glass-panel-subtle flex items-center justify-center text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBukaRekening} className="space-y-3.5">
              {/* Pemilik Type Switch */}
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Tipe Pemilik Rekening</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormOwnerType('siswa');
                      setFormSelectedOwnerId(siswaList[0]?.id || '');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      formOwnerType === 'siswa'
                        ? 'bg-emerald-600 text-white border-emerald-400/50'
                        : 'glass-panel-subtle text-slate-400 border-white/10'
                    }`}
                  >
                    Santri / Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormOwnerType('guru');
                      setFormSelectedOwnerId(guruList[0]?.id || '');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      formOwnerType === 'guru'
                        ? 'bg-amber-600 text-white border-amber-400/50'
                        : 'glass-panel-subtle text-slate-400 border-white/10'
                    }`}
                  >
                    Ustadz / Guru
                  </button>
                </div>
              </div>

              {/* Select Santri or Guru */}
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Pilih {formOwnerType === 'siswa' ? 'Santri' : 'Asatidz'} <span className="text-red-400">*</span>
                </label>
                <select
                  value={formSelectedOwnerId}
                  onChange={(e) => setFormSelectedOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                  required
                >
                  {formOwnerType === 'siswa' ? (
                    siswaList.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900">
                        {s.nama} - ({s.kelas}) [NISN: {s.nisn}]
                      </option>
                    ))
                  ) : (
                    guruList.map(g => (
                      <option key={g.id} value={g.id} className="bg-slate-900">
                        {g.nama} {g.gelar} - {g.mapel}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Jenis Akad Tabungan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">Akad Simpanan</label>
                  <select
                    value={formAkad}
                    onChange={(e) => setFormAkad(e.target.value as JenisAkadTabungan)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                  >
                    <option value="Wadiah Yad Dhamanah" className="bg-slate-900">Wadiah Yad Dhamanah (Titipan Aman)</option>
                    <option value="Tabungan Uang Saku" className="bg-slate-900">Tabungan Uang Saku Santri</option>
                    <option value="Tabungan Qurban" className="bg-slate-900">Tabungan Qurban Idul Adha</option>
                    <option value="Tabungan Wisuda & Rihlah" className="bg-slate-900">Tabungan Wisuda & Rihlah</option>
                    <option value="Mudharabah (Bagi Hasil)" className="bg-slate-900">Mudharabah (Bagi Hasil Syariah)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">Setoran Awal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formSaldoAwal}
                    onChange={(e) => setFormSaldoAwal(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white font-mono font-bold"
                    placeholder="50000"
                  />
                </div>
              </div>

              {/* Limit Tarik Harian for santri */}
              {formOwnerType === 'siswa' && (
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Limit Penarikan / Jajan Harian Santri (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formLimitHarian}
                    onChange={(e) => setFormLimitHarian(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white font-mono"
                    placeholder="50000"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Membatasi penarikan uang saku harian santri di kantin & koperasi madrasah (0 = tanpa limit).
                  </p>
                </div>
              )}

              {/* Catatan / Keterangan */}
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Catatan Khusus</label>
                <input
                  type="text"
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Contoh: Rekening titipan wali santri untuk uang saku bulanan"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBukaRekeningModal(false)}
                  className="flex-1 py-2.5 rounded-xl glass-button text-xs text-slate-400 hover:text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs text-white font-bold shadow-lg shadow-emerald-950/40"
                >
                  Terbitkan Rekening Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 💰 MODAL 2: SETOR TUNAI / TRANSFER MASUK */}
      {/* ======================================================== */}
      {showSetorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleSubmitSetor} className="glass-panel border border-emerald-500/40 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                <span>Setor Tabungan / Kiriman Uang Saku</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSetorModal(false)}
                className="w-7 h-7 rounded-lg glass-panel-subtle flex items-center justify-center text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Pilih Rekening Tujuan</label>
              <select
                value={setorAccId}
                onChange={(e) => setSetorAccId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                required
              >
                {tabunganAccounts.map(a => (
                  <option key={a.id} value={a.id} className="bg-slate-900">
                    [{a.nomorRekening}] {a.ownerNama} ({a.kelasOrJabatan}) - Saldo: Rp {a.saldo.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Nominal Setoran (Rp)</label>
              <input
                type="number"
                min="5000"
                step="5000"
                value={setorNominal}
                onChange={(e) => setSetorNominal(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-emerald-300 font-mono font-black"
                required
              />

              {/* Fast Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[20000, 50000, 100000, 200000, 500000, 1000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSetorNominal(val)}
                    className="px-2 py-1 rounded-lg glass-panel-subtle hover:bg-emerald-600/30 text-[10px] font-mono text-slate-300 border border-white/10"
                  >
                    + Rp {val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Kategori</label>
                <select
                  value={setorKategori}
                  onChange={(e) => setSetorKategori(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                >
                  <option value="Uang Saku Santri" className="bg-slate-900">Uang Saku Santri</option>
                  <option value="Tabungan Rutin / Wajib" className="bg-slate-900">Tabungan Rutin / Wajib</option>
                  <option value="Tabungan Qurban" className="bg-slate-900">Tabungan Qurban</option>
                  <option value="Tabungan Wisuda" className="bg-slate-900">Tabungan Wisuda</option>
                  <option value="Gaji & Insentif Guru" className="bg-slate-900">Gaji & Insentif Guru</option>
                  <option value="Infaq / Sedekah" className="bg-slate-900">Infaq / Sedekah</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Kanal Pembayaran</label>
                <select
                  value={setorMetode}
                  onChange={(e) => setSetorMetode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                >
                  <option value="Tunai Teller Baitul Maal" className="bg-slate-900">Tunai Kasir Teller</option>
                  <option value="Transfer Bank Syariah (BSI)" className="bg-slate-900">Transfer BSI Virtual Account</option>
                  <option value="QRIS Baitul Maal" className="bg-slate-900">QRIS Baitul Maal</option>
                  <option value="Smart Card E-KTS" className="bg-slate-900">Smart Card E-KTS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Keterangan / Pengirim</label>
              <input
                type="text"
                value={setorKeterangan}
                onChange={(e) => setSetorKeterangan(e.target.value)}
                placeholder="Contoh: Kiriman uang saku bulanan dari Ayah / Ustadz"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSetorModal(false)}
                className="flex-1 py-2 rounded-xl glass-button text-xs text-slate-400"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg"
              >
                Simpan Setoran
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 💸 MODAL 3: PENARIKAN TABUNGAN / UANG SAKU SANTRI */}
      {/* ======================================================== */}
      {showTarikModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleSubmitTarik} className="glass-panel border border-amber-500/40 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>Penarikan Tabungan / Uang Saku</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTarikModal(false)}
                className="w-7 h-7 rounded-lg glass-panel-subtle flex items-center justify-center text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {tarikError && (
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center gap-2 text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{tarikError}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Rekening Sumber</label>
              <select
                value={tarikAccId}
                onChange={(e) => setTarikAccId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                required
              >
                {tabunganAccounts.map(a => (
                  <option key={a.id} value={a.id} className="bg-slate-900">
                    [{a.nomorRekening}] {a.ownerNama} ({a.kelasOrJabatan}) - Saldo: Rp {a.saldo.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Nominal Penarikan (Rp)</label>
              <input
                type="number"
                min="1000"
                step="5000"
                value={tarikNominal}
                onChange={(e) => setTarikNominal(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-amber-300 font-mono font-black"
                required
              />

              {/* Fast Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[10000, 20000, 30000, 50000, 100000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTarikNominal(val)}
                    className="px-2 py-1 rounded-lg glass-panel-subtle hover:bg-amber-600/30 text-[10px] font-mono text-slate-300 border border-white/10"
                  >
                    Rp {val / 1000}rb
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Kategori Tarik</label>
                <select
                  value={tarikKategori}
                  onChange={(e) => setTarikKategori(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                >
                  <option value="Uang Saku Santri" className="bg-slate-900">Uang Saku / Jajan</option>
                  <option value="Beli Kitab & ATK" className="bg-slate-900">Beli Kitab & ATK</option>
                  <option value="Biaya Medis / Sakit" className="bg-slate-900">Biaya Medis / Sakit</option>
                  <option value="Kebutuhan Asrama" className="bg-slate-900">Kebutuhan Asrama</option>
                  <option value="Penarikan Guru" className="bg-slate-900">Penarikan Guru</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Metode Penarikan</label>
                <select
                  value={tarikMetode}
                  onChange={(e) => setTarikMetode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                >
                  <option value="Smart Card E-KTS QR" className="bg-slate-900">Smart Card E-KTS QR</option>
                  <option value="Tunai Teller Baitul Maal" className="bg-slate-900">Tunai Kasir Teller</option>
                  <option value="Kantin & Koperasi" className="bg-slate-900">Kasir Kantin Halal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Catatan Penarikan</label>
              <input
                type="text"
                value={tarikKeterangan}
                onChange={(e) => setTarikKeterangan(e.target.value)}
                placeholder="Contoh: Jajan sore & beli buku tulis santri"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTarikModal(false)}
                className="flex-1 py-2 rounded-xl glass-button text-xs text-slate-400"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-xs font-bold text-white shadow-lg"
              >
                Konfirmasi Penarikan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 💳 MODAL 4: AUTODEBET PEMBAYARAN SPP DARI TABUNGAN */}
      {/* ======================================================== */}
      {showBayarSPPModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleSubmitBayarSPP} className="glass-panel border border-teal-500/40 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-400" />
                <span>Autodebet Pembayaran SPP</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBayarSPPModal(false)}
                className="w-7 h-7 rounded-lg glass-panel-subtle flex items-center justify-center text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {sppFeedback && (
              <div className={`p-3 rounded-2xl flex items-center gap-2 text-xs ${
                sppFeedback.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {sppFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{sppFeedback.msg}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/10 space-y-1 text-xs">
              <p className="text-slate-400">Santri: <strong className="text-white">{selectedAccount.ownerNama}</strong></p>
              <p className="text-slate-400">No. Rekening: <span className="text-amber-400 font-mono font-bold">{selectedAccount.nomorRekening}</span></p>
              <p className="text-slate-400">Saldo Tabungan: <strong className="text-emerald-300 font-mono text-sm">Rp {selectedAccount.saldo.toLocaleString('id-ID')}</strong></p>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Pilih Tagihan SPP Pending</label>
              {tagihanList.filter(t => t.siswaId === selectedAccount.ownerId && t.status === 'belum_lunas').length === 0 ? (
                <p className="text-xs text-emerald-400 font-medium p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  🎉 Alhamdulillah, semua tagihan SPP santri ini telah lunas!
                </p>
              ) : (
                <select
                  value={selectedTagihanId}
                  onChange={(e) => setSelectedTagihanId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                  required
                >
                  {tagihanList.filter(t => t.siswaId === selectedAccount.ownerId && t.status === 'belum_lunas').map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-900">
                      {t.judulTagihan} ({t.bulan}) - Rp {t.nominal.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBayarSPPModal(false)}
                className="flex-1 py-2 rounded-xl glass-button text-xs text-slate-400"
              >
                Tutup
              </button>
              {tagihanList.filter(t => t.siswaId === selectedAccount.ownerId && t.status === 'belum_lunas').length > 0 && (
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-xs font-bold text-white shadow-lg"
                >
                  Proses Autodebet
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📖 MODAL 5: DIGITAL PASSBOOK / BUKU TABUNGAN RESMI PRINT */}
      {/* ======================================================== */}
      {showBukuTabunganModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200">
            {/* Header Cetak Buku */}
            <div className="border-b-2 border-emerald-900 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                  {madrasahInfo.logoUrl ? (
                    <img src={madrasahInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    'MA'
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide text-emerald-950 uppercase">
                    {madrasahInfo.nama}
                  </h3>
                  <p className="text-[11px] text-slate-600">BAITUL MAAL & BUKU TABUNGAN SYARIAH</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded">
                  BUKU TABUNGAN DIGITAL
                </span>
                <p className="text-[10px] font-mono text-slate-600 mt-1 font-bold">
                  NO. REK: {selectedAccount.nomorRekening}
                </p>
              </div>
            </div>

            {/* Account Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Nama Nasabah</span>
                <strong className="text-slate-900 font-bold">{selectedAccount.ownerNama}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Rombel / Jabatan</span>
                <strong className="text-slate-900">{selectedAccount.kelasOrJabatan}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Akad Simpanan</span>
                <strong className="text-emerald-800">{selectedAccount.jenisAkad}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Saldo Saat Ini</span>
                <strong className="text-emerald-900 font-mono font-black text-sm">
                  Rp {selectedAccount.saldo.toLocaleString('id-ID')}
                </strong>
              </div>
            </div>

            {/* Table of Transactions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Catatan Mutasi Rekening Terakhir
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Tanggal</th>
                      <th className="p-2.5">Keterangan / Ref</th>
                      <th className="p-2.5 text-right">Debit (+)</th>
                      <th className="p-2.5 text-right">Kredit (-)</th>
                      <th className="p-2.5 text-right">Saldo (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {tabunganTransaksi.filter(t => t.rekeningId === selectedAccount.id).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 font-sans text-xs">
                          Belum ada catatan mutasi transaksi pada rekening ini.
                        </td>
                      </tr>
                    ) : (
                      tabunganTransaksi.filter(t => t.rekeningId === selectedAccount.id).map(trx => {
                        const isSetor = trx.jenis === 'setor';
                        return (
                          <tr key={trx.id} className="hover:bg-slate-50">
                            <td className="p-2.5 text-slate-600 whitespace-nowrap">{trx.tanggal}</td>
                            <td className="p-2.5 font-sans">
                              <span className="font-semibold text-slate-800 block">{trx.kategori}</span>
                              <span className="text-[10px] text-slate-500">{trx.keterangan} ({trx.metode})</span>
                            </td>
                            <td className="p-2.5 text-right text-emerald-700 font-bold">
                              {isSetor ? `Rp ${trx.nominal.toLocaleString('id-ID')}` : '-'}
                            </td>
                            <td className="p-2.5 text-right text-rose-700 font-bold">
                              {!isSetor ? `Rp ${trx.nominal.toLocaleString('id-ID')}` : '-'}
                            </td>
                            <td className="p-2.5 text-right font-black text-slate-900">
                              Rp {trx.saldoSetelah.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div>
                <p>Dicetak secara digital oleh sistem Madrasah</p>
                <p className="text-[9px] font-mono">Baitul Maal Verified &bull; {new Date().toLocaleDateString('id-ID')}</p>
              </div>

              <div className="flex gap-2 no-print">
                <button
                  type="button"
                  onClick={() => setShowBukuTabunganModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Buku Tabungan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🧾 MODAL 6: SLIP KWITANSI RESMI TRANSAKSI */}
      {/* ======================================================== */}
      {selectedKwitansiTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="border-b-2 border-emerald-900 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
                  BM
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-950 uppercase">{madrasahInfo.nama}</h4>
                  <p className="text-[10px] text-slate-600">SLIP TRANSAKSI TABUNGAN SYARIAH</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">{selectedKwitansiTrx.nomorKwitansi}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Nasabah:</span>
                <strong className="text-slate-900">{selectedKwitansiTrx.ownerNama}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nomor Rekening:</span>
                <span className="font-mono font-bold text-slate-800">{selectedKwitansiTrx.nomorRekening}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Jenis Transaksi:</span>
                <span className="font-bold uppercase text-emerald-800">{selectedKwitansiTrx.jenis} ({selectedKwitansiTrx.kategori})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Waktu Transaksi:</span>
                <span className="text-slate-700">{selectedKwitansiTrx.tanggal} {selectedKwitansiTrx.waktu} WIB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Kanal / Metode:</span>
                <span className="text-slate-700">{selectedKwitansiTrx.metode}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-emerald-950 font-bold">Nominal Transaksi:</span>
                  <strong className="font-mono text-base font-black text-emerald-950">
                    Rp {selectedKwitansiTrx.nominal.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 font-mono pt-1 border-t border-emerald-200">
                  <span>Sisa Saldo Buku:</span>
                  <span className="font-bold text-slate-900">Rp {selectedKwitansiTrx.saldoSetelah.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 italic">
                Keterangan: "{selectedKwitansiTrx.keterangan}"
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] no-print">
              <span className="text-slate-400 font-mono text-[10px]">Petugas: {selectedKwitansiTrx.petugas}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedKwitansiTrx(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ⚙️ MODAL 7: EDIT PENGATURAN REKENING */}
      {/* ======================================================== */}
      {showEditRekeningModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleSubmitEditRekening} className="glass-panel border border-white/20 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span>Pengaturan Rekening: {selectedAccount.ownerNama}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditRekeningModal(false)}
                className="w-7 h-7 rounded-lg glass-panel-subtle flex items-center justify-center text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Status Rekening</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
              >
                <option value="aktif" className="bg-slate-900">Aktif (Bisa Setor & Tarik)</option>
                <option value="dibekukan" className="bg-slate-900">Dibekukan (Hanya Setor)</option>
                <option value="tutup" className="bg-slate-900">Tutup Rekening (Nonaktif)</option>
              </select>
            </div>

            {selectedAccount.ownerType === 'siswa' && (
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Limit Saku Harian (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={editLimitHarian}
                  onChange={(e) => setEditLimitHarian(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Catatan</label>
              <input
                type="text"
                value={editCatatan}
                onChange={(e) => setEditCatatan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditRekeningModal(false)}
                className="flex-1 py-2 rounded-xl glass-button text-xs text-slate-400"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
