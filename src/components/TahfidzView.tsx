import React, { useState } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { TahfidzRecord } from '../types';
import { 
  BookmarkCheck, 
  BookOpen, 
  Plus, 
  Award, 
  Calendar, 
  User, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Star,
  Layers,
  Heart
} from 'lucide-react';

export const TahfidzView: React.FC = () => {
  const { 
    siswaList, 
    tahfidzList, 
    recordTahfidz, 
    activeRole, 
    mutabaahToday, 
    updateMutabaah, 
    triggerConfetti 
  } = useMadrasah();

  const [activeSubTab, setActiveSubTab] = useState<'setoran' | 'mutabaah' | 'leaderboard'>('setoran');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [selectedSiswaId, setSelectedSiswaId] = useState(siswaList[0]?.id || 'sis-01');
  const [juz, setJuz] = useState(30);
  const [surah, setSurah] = useState('An-Naba\'');
  const [ayatMulai, setAyatMulai] = useState(1);
  const [ayatSelesai, setAyatSelesai] = useState(40);
  const [jenis, setJenis] = useState<'ziyadah' | 'murojaah'>('ziyadah');
  const [kelancaran, setKelancaran] = useState<'mumtaz' | 'jayyid_jiddan' | 'jayyid' | 'maqbul'>('mumtaz');
  const [nilaiTajwid, setNilaiTajwid] = useState(95);
  const [ustadzNama, setUstadzNama] = useState('Ustadz Ahmad Fauzi, Lc.');
  const [catatan, setCatatan] = useState('Makharijul huruf fasih dan lancar.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = siswaList.find(s => s.id === selectedSiswaId);

    await recordTahfidz({
      siswaId: selectedSiswaId,
      siswaNama: st?.nama || 'Santri',
      kelas: st?.kelas || '9A Unggulan',
      tanggal: new Date().toISOString().split('T')[0],
      juz: Number(juz),
      surah,
      ayatMulai: Number(ayatMulai),
      ayatSelesai: Number(ayatSelesai),
      jenis,
      kelancaran,
      nilaiTajwid: Number(nilaiTajwid),
      ustadzNama,
      catatan,
    });

    setShowAddForm(false);
  };

  const getKelancaranBadge = (k: string) => {
    switch (k) {
      case 'mumtaz': return { label: 'Mumtaz (Istimewa)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'jayyid_jiddan': return { label: 'Jayyid Jiddan (Sangat Baik)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'jayyid': return { label: 'Jayyid (Baik)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default: return { label: 'Maqbul (Cukup)', color: 'bg-slate-700 text-slate-300' };
    }
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-6">
      {/* Top Bar */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-950/40">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Mutaba'ah Tahfidz & Ibadah</h2>
            <p className="text-xs text-slate-400">Monitoring Ziyadah, Muroja'ah 30 Juz & Amalan Yaumiyah</p>
          </div>
        </div>

        {/* SubTab switcher */}
        <div className="flex items-center gap-1 p-1 glass-panel-subtle rounded-2xl border border-white/10 self-start sm:self-auto">
          {[
            { id: 'setoran', label: 'Buku Setoran' },
            { id: 'mutabaah', label: 'Mutaba\'ah Ibadah' },
            { id: 'leaderboard', label: 'Progres Juz Santri' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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

      {/* 1. Buku Setoran */}
      {activeSubTab === 'setoran' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 glass-panel p-4 rounded-2xl border border-white/10">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Catatan Setoran Terkini
              </h3>
              <p className="text-[11px] text-slate-400">Total {tahfidzList.length} riwayat setoran tahfidz</p>
            </div>

            {['admin', 'guru'].includes(activeRole) && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-950/40 hover:brightness-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? 'Tutup Form' : 'Input Setoran Baru'}</span>
              </button>
            )}
          </div>

          {/* Form Input Setoran */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-5 rounded-2xl glass-panel border border-amber-400/40 space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Formulir Setoran Tahfidz Santri
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Pilih Santri</label>
                  <select
                    value={selectedSiswaId}
                    onChange={e => setSelectedSiswaId(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                  >
                    {siswaList.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.nama} - {s.kelas}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Jenis Setoran</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setJenis('ziyadah')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        jenis === 'ziyadah' ? 'glass-panel-amber border-amber-400/60 text-amber-200 shadow-md' : 'glass-panel-subtle text-slate-300 border-white/5'
                      }`}
                    >
                      Ziyadah (Hafalan Baru)
                    </button>
                    <button
                      type="button"
                      onClick={() => setJenis('murojaah')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        jenis === 'murojaah' ? 'glass-panel-emerald border-emerald-400/60 text-emerald-200 shadow-md' : 'glass-panel-subtle text-slate-300 border-white/5'
                      }`}
                    >
                      Muroja'ah (Pengulangan)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Juz</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={juz}
                    onChange={e => setJuz(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Nama Surah</label>
                  <input
                    type="text"
                    value={surah}
                    onChange={e => setSurah(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Ayat Mulai</label>
                  <input
                    type="number"
                    min="1"
                    value={ayatMulai}
                    onChange={e => setAyatMulai(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Ayat Selesai</label>
                  <input
                    type="number"
                    min="1"
                    value={ayatSelesai}
                    onChange={e => setAyatSelesai(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Predikat Kelancaran</label>
                  <select
                    value={kelancaran}
                    onChange={e => setKelancaran(e.target.value as any)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                  >
                    <option value="mumtaz" className="bg-slate-900 text-white">Mumtaz (Istimewa / Sangat Lancar)</option>
                    <option value="jayyid_jiddan" className="bg-slate-900 text-white">Jayyid Jiddan (Sangat Baik)</option>
                    <option value="jayyid" className="bg-slate-900 text-white">Jayyid (Baik)</option>
                    <option value="maqbul" className="bg-slate-900 text-white">Maqbul (Cukup / Perlu Pengulangan)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Nilai Tajwid (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={nilaiTajwid}
                    onChange={e => setNilaiTajwid(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Ustadz Penyimak</label>
                  <input
                    type="text"
                    value={ustadzNama}
                    onChange={e => setUstadzNama(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Catatan & Masukan Ustadz</label>
                <input
                  type="text"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Catatan makhraj, tajwid, atau mad..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-950/40 hover:brightness-110"
              >
                Simpan Setoran Tahfidz
              </button>
            </form>
          )}

          {/* Cards List Setoran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tahfidzList.map((item) => {
              const badge = getKelancaranBadge(item.kelancaran);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl glass-card border border-white/10 text-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{item.tanggal}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.siswaNama}</h4>
                        <p className="text-xs text-emerald-400 font-semibold">
                          Juz {item.juz} &bull; Surah {item.surah} (Ayat {item.ayatMulai} - {item.ayatSelesai})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Nilai Tajwid</span>
                        <strong className="text-sm font-mono text-amber-400">{item.nilaiTajwid} / 100</strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 glass-panel-subtle p-2.5 rounded-xl border border-white/5 italic leading-relaxed">
                      "{item.catatan}"
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize font-medium text-amber-300/90">Kategori: {item.jenis}</span>
                    <span>Penyimak: <strong className="text-slate-200">{item.ustadzNama}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Mutaba'ah Ibadah */}
      {activeSubTab === 'mutabaah' && (
        <div className="glass-panel border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl text-white space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Mutaba'ah Yaumiyah (Catatan Amalan Harian)</h3>
              <p className="text-xs text-slate-400">Kedisiplinan ibadah fardhu & sunnah santri</p>
            </div>
            <span className="text-xs font-mono glass-panel-emerald text-emerald-200 border border-emerald-400/40 px-3 py-1 rounded-full font-bold">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Sholat Wajib */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">1. Sholat Fardhu Berjamaah di Masjid</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { key: 'subuh', label: 'Sholat Subuh' },
                { key: 'dzuhur', label: 'Sholat Dzuhur' },
                { key: 'ashar', label: 'Sholat Ashar' },
                { key: 'maghrib', label: 'Sholat Maghrib' },
                { key: 'isya', label: 'Sholat Isya' },
              ].map(sh => {
                const isDone = mutabaahToday.sholatWajib[sh.key as keyof typeof mutabaahToday.sholatWajib];
                return (
                  <button
                    key={sh.key}
                    type="button"
                    onClick={() => {
                      updateMutabaah({
                        sholatWajib: {
                          ...mutabaahToday.sholatWajib,
                          [sh.key]: !isDone
                        }
                      });
                      triggerConfetti();
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isDone
                        ? 'glass-panel-emerald border-emerald-400/60 text-emerald-200 font-bold shadow-md'
                        : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-semibold">{sh.label}</p>
                    <span className="text-sm mt-1 block">{isDone ? '✅ Berjamaah' : '⭕ Belum'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sholat Sunnah */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">2. Ibadah Sunnah & Tilawah</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => updateMutabaah({ sholatSunnah: { ...mutabaahToday.sholatSunnah, dhuha: !mutabaahToday.sholatSunnah.dhuha } })}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  mutabaahToday.sholatSunnah.dhuha ? 'glass-panel-amber border-amber-400/60 text-amber-200' : 'glass-panel-subtle border-white/5 text-slate-400'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Sholat Dhuha</p>
                  <p className="text-[11px] opacity-80">Minimal 2 - 4 Rakaat</p>
                </div>
                <span className="text-base">{mutabaahToday.sholatSunnah.dhuha ? '✓' : '○'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateMutabaah({ sholatSunnah: { ...mutabaahToday.sholatSunnah, tahajjud: !mutabaahToday.sholatSunnah.tahajjud } })}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  mutabaahToday.sholatSunnah.tahajjud ? 'glass-panel-amber border-amber-400/60 text-amber-200' : 'glass-panel-subtle border-white/5 text-slate-400'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Qiyamul Lail / Tahajjud</p>
                  <p className="text-[11px] opacity-80">Sepertiga malam terakhir</p>
                </div>
                <span className="text-base">{mutabaahToday.sholatSunnah.tahajjud ? '✓' : '○'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateMutabaah({ dzikirPagi: !mutabaahToday.dzikirPagi })}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  mutabaahToday.dzikirPagi ? 'glass-panel-emerald border-emerald-400/60 text-emerald-200' : 'glass-panel-subtle border-white/5 text-slate-400'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Dzikir Pagi & Petang</p>
                  <p className="text-[11px] opacity-80">Al-Ma'tsurat Kubro</p>
                </div>
                <span className="text-base">{mutabaahToday.dzikirPagi ? '✓' : '○'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Progres Capaian Juz Santri */}
      {activeSubTab === 'leaderboard' && (
        <div className="glass-panel border border-white/10 rounded-3xl p-5 shadow-xl text-white space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Rekap Target & Capaian Hafalan Al-Qur'an Santri
          </h3>

          <div className="space-y-3">
            {siswaList.map((s, idx) => {
              const persen = Math.min(100, Math.round((s.hafalanTercapai / s.targetJuz) * 100));
              return (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl glass-card border border-white/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xs font-mono">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{s.nama}</h4>
                        <p className="text-[11px] text-slate-400">{s.kelas} &bull; Wali: {s.waliNama}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400">{s.hafalanTercapai} Juz</span>
                      <span className="text-[11px] text-slate-400 block">Target: {s.targetJuz} Juz</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${persen}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Progress: {persen}%</span>
                    <span>Sisa: {(s.targetJuz - s.hafalanTercapai).toFixed(1)} Juz menuju Wisuda</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
