import React, { useState } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { NilaiMapel, JadwalPelajaran } from '../types';
import { 
  BookOpen, 
  Calendar, 
  Award, 
  Printer, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  User, 
  GraduationCap, 
  Filter,
  FileCheck2,
  Sparkles,
  Building2,
  Edit3,
  Trash2,
  X
} from 'lucide-react';

export const SiakadView: React.FC = () => {
  const { 
    siswaList, 
    guruList,
    kelasList,
    jadwalList, 
    nilaiList, 
    saveNilai, 
    addJadwal,
    updateJadwal,
    deleteJadwal,
    activeRole, 
    madrasahInfo,
    triggerConfetti 
  } = useMadrasah();

  const [activeSubTab, setActiveSubTab] = useState<'jadwal' | 'nilai' | 'raport'>('jadwal');
  const [selectedHari, setSelectedHari] = useState<string>('Semua');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState<string>('Semua');
  const [searchMapel, setSearchMapel] = useState<string>('');
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>(siswaList[0]?.id || 'sis-01');

  // Modal State for Add & Edit Jadwal / Mapel
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<JadwalPelajaran | null>(null);
  const [jadwalForm, setJadwalForm] = useState<{
    hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
    jamMulai: string;
    jamSelesai: string;
    mapel: string;
    guruNama: string;
    kelas: string;
    ruangan: string;
  }>({
    hari: 'Senin',
    jamMulai: '07:00',
    jamSelesai: '08:30',
    mapel: 'Tahfidz Al-Qur\'an',
    guruNama: guruList[0]?.nama || 'Ustadz Ahmad Fauzi, Lc.',
    kelas: '9A Unggulan',
    ruangan: 'Masjid Utama'
  });

  // Input Nilai Form State
  const [showInputNilai, setShowInputNilai] = useState(false);
  const [targetSiswa, setTargetSiswa] = useState(siswaList[0]?.id || 'sis-01');
  const [mapel, setMapel] = useState('Tahfidz Al-Qur\'an');
  const [kategoriMapel, setKategoriMapel] = useState<'Diniyah / Kepesantrenan' | 'Umum / Kemenag'>('Diniyah / Kepesantrenan');
  const [tugas, setTugas] = useState(90);
  const [uts, setUts] = useState(92);
  const [uas, setUas] = useState(95);
  const [catatanGuru, setCatatanGuru] = useState('Sangat baik dan istiqomah.');

  const openAddJadwal = () => {
    setEditingJadwal(null);
    setJadwalForm({
      hari: selectedHari !== 'Semua' ? (selectedHari as any) : 'Senin',
      jamMulai: '07:00',
      jamSelesai: '08:30',
      mapel: 'Tahfidz Al-Qur\'an',
      guruNama: guruList[0]?.nama || 'Ustadz Ahmad Fauzi, Lc.',
      kelas: selectedKelasFilter !== 'Semua' ? selectedKelasFilter : '9A Unggulan',
      ruangan: 'Ruang Kelas 9A'
    });
    setShowJadwalModal(true);
  };

  const openEditJadwal = (item: JadwalPelajaran) => {
    setEditingJadwal(item);
    setJadwalForm({
      hari: item.hari,
      jamMulai: item.jamMulai,
      jamSelesai: item.jamSelesai,
      mapel: item.mapel,
      guruNama: item.guruNama,
      kelas: item.kelas,
      ruangan: item.ruangan
    });
    setShowJadwalModal(true);
  };

  const handleSaveJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJadwal) {
      await updateJadwal(editingJadwal.id, jadwalForm);
    } else {
      await addJadwal(jadwalForm);
    }
    setShowJadwalModal(false);
    setEditingJadwal(null);
  };

  const filteredJadwal = jadwalList.filter(j => {
    const matchHari = selectedHari === 'Semua' || j.hari === selectedHari;
    const matchKelas = selectedKelasFilter === 'Semua' || j.kelas === selectedKelasFilter;
    const matchSearch = searchMapel === '' || 
      j.mapel.toLowerCase().includes(searchMapel.toLowerCase()) ||
      j.guruNama.toLowerCase().includes(searchMapel.toLowerCase()) ||
      j.ruangan.toLowerCase().includes(searchMapel.toLowerCase());
    return matchHari && matchKelas && matchSearch;
  });

  const selectedSiswa = siswaList.find(s => s.id === selectedSiswaId) || siswaList[0];
  const siswaNilaiList = nilaiList.filter(n => n.siswaId === selectedSiswa?.id);

  const calculateFinal = (t: number, u: number, a: number) => {
    const finalVal = (t * 0.3) + (u * 0.3) + (a * 0.4);
    let pred: 'A' | 'B' | 'C' | 'D' = 'A';
    if (finalVal < 70) pred = 'D';
    else if (finalVal < 80) pred = 'C';
    else if (finalVal < 90) pred = 'B';
    return { finalVal: Number(finalVal.toFixed(1)), pred };
  };

  const handleSaveNilai = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = siswaList.find(s => s.id === targetSiswa);
    const { finalVal, pred } = calculateFinal(tugas, uts, uas);

    await saveNilai({
      siswaId: targetSiswa,
      siswaNama: st?.nama || 'Santri',
      kelas: st?.kelas || '9A Unggulan',
      semester: 'Ganjil',
      tahunAjaran: '2025/2026',
      mapel,
      kategori: kategoriMapel,
      tugas: Number(tugas),
      uts: Number(uts),
      uas: Number(uas),
      nilaiAkhir: finalVal,
      predikat: pred,
      catatan: catatanGuru
    });

    setShowInputNilai(false);
  };

  const rataRataNilai = siswaNilaiList.length 
    ? (siswaNilaiList.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / siswaNilaiList.length).toFixed(1)
    : '0.0';

  const mapelSuggestions = [
    'Tahfidz Al-Qur\'an',
    'Fiqih Ibadah',
    'Akidah Akhlak',
    'Al-Qur\'an Hadits',
    'Bahasa Arab & Nahwu',
    'Kajian Kitab Kuning',
    'Matematika',
    'IPA Terpadu',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Sejarah Kebudayaan Islam (SKI)',
    'Ziyadah & Murojaah Akbar'
  ];

  return (
    <div className="space-y-5 pb-16 lg:pb-6">
      {/* Top Header Navigation */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold">SIAKAD & Akademik Terpadu</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola Mata Pelajaran, Jam Pelajaran, Penilaian & Raport Digital
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex items-center gap-1.5 p-1 glass-panel-subtle rounded-2xl border border-white/10 self-start sm:self-auto">
          {[
            { id: 'jadwal', label: 'Jadwal & Jam Pelajaran' },
            { id: 'nilai', label: 'Buku Nilai' },
            { id: 'raport', label: 'E-Raport Digital' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-md border border-emerald-400/40'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Sub-Tab: Jadwal Pelajaran */}
      {activeSubTab === 'jadwal' && (
        <div className="space-y-4">
          {/* Controls Bar: Filter & Add Button */}
          <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 sm:flex-none">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchMapel}
                    onChange={e => setSearchMapel(e.target.value)}
                    placeholder="Cari mapel, guru, ruangan..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                {/* Filter Kelas */}
                <select
                  value={selectedKelasFilter}
                  onChange={e => setSelectedKelasFilter(e.target.value)}
                  className="glass-input px-3 py-2 rounded-xl text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="Semua" className="bg-slate-900">Semua Kelas</option>
                  {kelasList.map(k => (
                    <option key={k.id} value={k.nama} className="bg-slate-900">{k.nama}</option>
                  ))}
                </select>
              </div>

              {/* Action Button for Admin/Guru */}
              {['admin', 'guru'].includes(activeRole) && (
                <button
                  onClick={openAddJadwal}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Mata & Jam Pelajaran</span>
                </button>
              )}
            </div>

            {/* Day Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(hari => (
                <button
                  key={hari}
                  onClick={() => setSelectedHari(hari)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                    selectedHari === hari
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 shadow-md shadow-emerald-950/40'
                      : 'glass-panel-subtle text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {hari === 'Semua' ? 'Semua Hari' : hari}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Cards Grid */}
          {filteredJadwal.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center border border-white/10 text-slate-400 space-y-2">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">Tidak ada jadwal pelajaran yang cocok.</p>
              <p className="text-[11px] text-slate-500">Silakan ubah filter hari/kelas atau klik tombol Tambah di atas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredJadwal.map(j => (
                <div
                  key={j.id}
                  className="p-4 rounded-3xl glass-card border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {j.jamMulai} - {j.jamSelesai}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {j.ruangan}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider block mb-0.5">
                          {j.hari} • {j.kelas}
                        </span>
                        <h4 className="text-sm font-bold text-white mb-1.5">{j.mapel}</h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                      <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{j.guruNama}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Kelas: <strong className="text-slate-200">{j.kelas}</strong></span>

                    {/* Action buttons for admin / guru */}
                    {['admin', 'guru'].includes(activeRole) ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditJadwal(j)}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                          title="Edit Mata Pelajaran & Jam Ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteJadwal(j.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-colors"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Tatap Muka</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Form: Tambah / Edit Mata Pelajaran & Jam Pelajaran */}
          {showJadwalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
              <div className="glass-panel rounded-3xl p-6 w-full max-w-lg border border-emerald-500/40 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                      {editingJadwal ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      {editingJadwal ? 'Edit Mata Pelajaran & Jam Pelajaran' : 'Tambah Mata Pelajaran & Jam Baru'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowJadwalModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveJadwal} className="space-y-3.5">
                  {/* Nama Mapel */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                      Nama Mata Pelajaran
                    </label>
                    <input
                      type="text"
                      value={jadwalForm.mapel}
                      onChange={e => setJadwalForm({ ...jadwalForm, mapel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                      placeholder="Contoh: Fiqih Ibadah, Nahwu Shorof, Matematika"
                      required
                    />
                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {mapelSuggestions.slice(0, 6).map(sug => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setJadwalForm({ ...jadwalForm, mapel: sug })}
                          className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] text-slate-300 border border-white/10 transition-colors"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hari & Kelas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">Hari</label>
                      <select
                        value={jadwalForm.hari}
                        onChange={e => setJadwalForm({ ...jadwalForm, hari: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                      >
                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => (
                          <option key={h} value={h} className="bg-slate-900 text-white">{h}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">Kelas</label>
                      <select
                        value={jadwalForm.kelas}
                        onChange={e => setJadwalForm({ ...jadwalForm, kelas: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                      >
                        {kelasList.map(k => (
                          <option key={k.id} value={k.nama} className="bg-slate-900">{k.nama}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Jam Pelajaran (Mulai - Selesai) */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <label className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Alokasi Jam Pelajaran</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Jam Mulai</span>
                        <input
                          type="time"
                          value={jadwalForm.jamMulai}
                          onChange={e => setJadwalForm({ ...jadwalForm, jamMulai: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Jam Selesai</span>
                        <input
                          type="time"
                          value={jadwalForm.jamSelesai}
                          onChange={e => setJadwalForm({ ...jadwalForm, jamSelesai: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono font-bold"
                          required
                        />
                      </div>
                    </div>
                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: 'Sesi 1 (07:00-08:30)', start: '07:00', end: '08:30' },
                        { label: 'Sesi 2 (08:45-10:15)', start: '08:45', end: '10:15' },
                        { label: 'Sesi 3 (10:30-12:00)', start: '10:30', end: '12:00' },
                        { label: 'Sesi Siang (13:00-14:30)', start: '13:00', end: '14:30' },
                      ].map(p => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setJadwalForm({ ...jadwalForm, jamMulai: p.start, jamSelesai: p.end })}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[10px] text-amber-300 border border-amber-500/20 transition-colors"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guru & Ruangan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">Guru / Asatidz Pengampu</label>
                      <input
                        type="text"
                        list="guru-options"
                        value={jadwalForm.guruNama}
                        onChange={e => setJadwalForm({ ...jadwalForm, guruNama: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                        placeholder="Pilih atau ketik nama guru"
                        required
                      />
                      <datalist id="guru-options">
                        {guruList.map(g => (
                          <option key={g.id} value={g.nama}>{g.mapel}</option>
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">Ruangan / Tempat</label>
                      <input
                        type="text"
                        value={jadwalForm.ruangan}
                        onChange={e => setJadwalForm({ ...jadwalForm, ruangan: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                        placeholder="Contoh: Ruang Kelas 9A, Lab Komputer"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowJadwalModal(false)}
                      className="flex-1 py-2.5 rounded-xl glass-button text-xs text-slate-400 font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs text-white font-bold shadow-lg"
                    >
                      {editingJadwal ? 'Simpan Perubahan' : 'Tambah ke Jadwal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Sub-Tab: Buku Nilai */}
      {activeSubTab === 'nilai' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <select
                value={selectedSiswaId}
                onChange={e => setSelectedSiswaId(e.target.value)}
                className="glass-input px-3 py-2 rounded-xl text-white text-xs font-semibold focus:outline-none"
              >
                {siswaList.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.nama} ({s.kelas})
                  </option>
                ))}
              </select>
            </div>

            {['admin', 'guru'].includes(activeRole) && (
              <button
                onClick={() => setShowInputNilai(!showInputNilai)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{showInputNilai ? 'Tutup Form' : 'Input Nilai Baru'}</span>
              </button>
            )}
          </div>

          {/* Form Input Nilai */}
          {showInputNilai && (
            <form onSubmit={handleSaveNilai} className="p-5 rounded-2xl glass-panel border border-emerald-500/40 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Formulir Penilaian Siswa</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Nama Siswa</label>
                  <select
                    value={targetSiswa}
                    onChange={e => setTargetSiswa(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                  >
                    {siswaList.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.nama} - {s.kelas}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={mapel}
                    onChange={e => setMapel(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                    placeholder="Contoh: Fiqih Ibadah"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Nilai Tugas (30%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tugas}
                    onChange={e => setTugas(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Nilai UTS (30%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={uts}
                    onChange={e => setUts(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Nilai UAS (40%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={uas}
                    onChange={e => setUas(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Catatan Perkembangan / Ustadz</label>
                <input
                  type="text"
                  value={catatanGuru}
                  onChange={e => setCatatanGuru(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                  placeholder="Catatan kemajuan belajar santri..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md hover:brightness-110"
              >
                Simpan Penilaian Siswa
              </button>
            </form>
          )}

          {/* Table Nilai */}
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-300 border-b border-white/10 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-3 text-center">Tugas</th>
                    <th className="py-3 px-3 text-center">UTS</th>
                    <th className="py-3 px-3 text-center">UAS</th>
                    <th className="py-3 px-3 text-center">Nilai Akhir</th>
                    <th className="py-3 px-3 text-center">Predikat</th>
                    <th className="py-3 px-4">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {siswaNilaiList.map(n => (
                    <tr key={n.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div>{n.mapel}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{n.kategori}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{n.tugas}</td>
                      <td className="py-3 px-3 text-center font-mono">{n.uts}</td>
                      <td className="py-3 px-3 text-center font-mono">{n.uas}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">{n.nilaiAkhir}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          n.predikat === 'A' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {n.predikat}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{n.catatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sub-Tab: E-Raport Digital Resmi */}
      {activeSubTab === 'raport' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 no-print">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Pilih Santri:</span>
              <select
                value={selectedSiswaId}
                onChange={e => setSelectedSiswaId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {siswaList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.kelas})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Download Raport</span>
            </button>
          </div>

          {/* Printable Report Sheet */}
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 max-w-4xl mx-auto">
            {/* Kop Surat Madrasah */}
            <div className="border-b-4 border-double border-emerald-900 pb-4 mb-6 flex items-center justify-between gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-2xl font-display shadow-md shrink-0 overflow-hidden">
                {madrasahInfo.logoUrl ? (
                  <img src={madrasahInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  madrasahInfo.nama.charAt(0) || 'M'
                )}
              </div>
              <div className="text-center flex-1">
                <h3 className="text-base sm:text-lg font-black tracking-wider text-emerald-950 uppercase">
                  {madrasahInfo.nama}
                </h3>
                <p className="text-xs font-semibold text-emerald-800">{madrasahInfo.jenjang}</p>
                <p className="text-[11px] text-slate-600">{madrasahInfo.alamat}, {madrasahInfo.kota}</p>
                <p className="text-[10px] text-slate-500">NSM: {madrasahInfo.nsm} | NPSN: {madrasahInfo.npsn} | Email: {madrasahInfo.email}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl border-2 border-emerald-800 p-1 flex items-center justify-center text-center text-[10px] font-bold text-emerald-900 shrink-0">
                TERAKREDITASI<br/>{madrasahInfo.akreditasi}
              </div>
            </div>

            <h4 className="text-center font-bold text-sm tracking-wider uppercase underline mb-6 text-slate-900">
              LAPORAN HASIL BELAJAR SANTRI (E-RAPORT)
            </h4>

            {/* Biodata Santri */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 inline-block w-28">Nama Santri:</span>
                <strong className="text-slate-900">{selectedSiswa.nama}</strong>
              </div>
              <div>
                <span className="text-slate-500 inline-block w-28">Tahun Pelajaran:</span>
                <strong className="text-slate-900">2025/2026 (Ganjil)</strong>
              </div>
              <div>
                <span className="text-slate-500 inline-block w-28">NISN / NIS:</span>
                <span className="font-mono text-slate-800">{selectedSiswa.nisn} / {selectedSiswa.nis}</span>
              </div>
              <div>
                <span className="text-slate-500 inline-block w-28">Kelas / Rombel:</span>
                <strong className="text-slate-900">{selectedSiswa.kelas}</strong>
              </div>
              <div>
                <span className="text-slate-500 inline-block w-28">Capaian Tahfidz:</span>
                <strong className="text-emerald-700">{selectedSiswa.hafalanTercapai} Juz (Target {selectedSiswa.targetJuz} Juz)</strong>
              </div>
              <div>
                <span className="text-slate-500 inline-block w-28">Peringkat Kelas:</span>
                <strong className="text-amber-700">Peringkat 1 dari 32 Santri</strong>
              </div>
            </div>

            {/* Table Raport */}
            <table className="w-full text-left text-xs border border-slate-300 mb-6">
              <thead className="bg-emerald-900 text-white font-bold">
                <tr>
                  <th className="py-2.5 px-3 border border-emerald-800 text-center w-8">No</th>
                  <th className="py-2.5 px-3 border border-emerald-800">Mata Pelajaran</th>
                  <th className="py-2.5 px-3 border border-emerald-800 text-center w-16">KKM</th>
                  <th className="py-2.5 px-3 border border-emerald-800 text-center w-20">Nilai Akhir</th>
                  <th className="py-2.5 px-3 border border-emerald-800 text-center w-16">Predikat</th>
                  <th className="py-2.5 px-3 border border-emerald-800">Deskripsi Kemajuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {siswaNilaiList.map((n, idx) => (
                  <tr key={n.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="py-2 px-3 border border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 border border-slate-300 font-semibold">{n.mapel}</td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-mono">75</td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-mono font-bold text-emerald-900">{n.nilaiAkhir}</td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-bold">{n.predikat}</td>
                    <td className="py-2 px-3 border border-slate-300 text-[11px] text-slate-700">{n.catatan}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 border border-slate-300 text-right">Rata-Rata Nilai Akhir:</td>
                  <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-emerald-900 text-sm">{rataRataNilai}</td>
                  <td className="py-2.5 px-3 border border-slate-300 text-center text-emerald-800">Amat Baik</td>
                  <td className="py-2.5 px-3 border border-slate-300 text-[11px]">Istiqomah dipertahankan</td>
                </tr>
              </tfoot>
            </table>

            {/* Signature Area */}
            <div className="grid grid-cols-3 text-center text-xs mt-10 gap-4">
              <div>
                <p className="text-slate-600">Orang Tua / Wali Santri,</p>
                <div className="h-16 flex items-center justify-center font-script text-slate-400 italic">
                  (Tanda Tangan)
                </div>
                <p className="font-bold underline text-slate-900">{selectedSiswa.waliNama}</p>
              </div>

              <div>
                <p className="text-slate-600">Wali Kelas,</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                    Tervalidasi Digital
                  </span>
                </div>
                <p className="font-bold underline text-slate-900">Ustadz Ahmad Fauzi, Lc.</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. 198205142008011005</p>
              </div>

              <div>
                <p className="text-slate-600">{madrasahInfo.kota.split(',')[0] || 'Kendal'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-slate-600">Kepala Madrasah,</p>
                <div className="h-16 flex items-center justify-center relative">
                  <div className="w-12 h-12 rounded-full border border-emerald-800 text-emerald-800 flex items-center justify-center text-[8px] font-bold transform -rotate-12 opacity-80">
                    CAP RESMI
                  </div>
                </div>
                <p className="font-bold underline text-slate-900">{madrasahInfo.kepalaMadrasah}</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. {madrasahInfo.nipKepala || '197508152002121003'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
