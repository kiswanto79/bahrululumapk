import React, { useState } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  X, 
  Bell, 
  Pin, 
  Calendar, 
  Clock,
  MapPin,
  User, 
  Plus, 
  Trash2, 
  Send,
  Edit3,
  Check,
  Sparkles
} from 'lucide-react';
import { Pengumuman } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { pengumumanList, addPengumuman, updatePengumuman, deletePengumuman, activeRole, currentUser } = useMadrasah();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengumuman | null>(null);

  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [kategori, setKategori] = useState<'Akademik' | 'Kepesantrenan' | 'Kegiatan' | 'Penting'>('Penting');
  const [target, setTarget] = useState<'Semua' | 'Siswa' | 'Guru' | 'Wali Santri'>('Semua');
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [pin, setPin] = useState(true);

  if (!isOpen) return null;

  const getTodayFormattedDate = () => {
    return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getTodayFormattedTime = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm} WIB`;
  };

  const handleStartEdit = (ann: Pengumuman) => {
    setEditingItem(ann);
    setJudul(ann.judul);
    setIsi(ann.isi);
    setKategori(ann.kategori);
    setTarget(ann.target);
    setTanggal(ann.tanggal || getTodayFormattedDate());
    setWaktu(ann.waktu || getTodayFormattedTime());
    setLokasi(ann.lokasi || '');
    setPin(ann.pin ?? true);
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setEditingItem(null);
    setJudul('');
    setIsi('');
    setTanggal('');
    setWaktu('');
    setLokasi('');
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) return;

    const finalTanggal = tanggal.trim() || getTodayFormattedDate();
    const finalWaktu = waktu.trim() || getTodayFormattedTime();

    if (editingItem) {
      await updatePengumuman(editingItem.id, {
        judul,
        isi,
        kategori,
        target,
        tanggal: finalTanggal,
        waktu: finalWaktu,
        lokasi: lokasi.trim() || undefined,
        pin,
      });
    } else {
      await addPengumuman({
        judul,
        isi,
        kategori,
        tanggal: finalTanggal,
        waktu: finalWaktu,
        lokasi: lokasi.trim() || undefined,
        target,
        penulis: currentUser.name || (activeRole === 'admin' ? 'Kepala Madrasah' : 'Ustadz Pengampu'),
        pin,
      });
    }

    handleCancelForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel border border-white/20 w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-button text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-between gap-3 mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Papan Pengumuman & Agenda Madrasah</h3>
              <p className="text-xs text-slate-400">Informasi resmi, agenda kegiatan, jadwal & maklumat terpadu</p>
            </div>
          </div>

          {['admin', 'guru'].includes(activeRole) && (
            <button
              onClick={() => {
                if (showAddForm) {
                  handleCancelForm();
                } else {
                  setEditingItem(null);
                  setJudul('');
                  setIsi('');
                  setTanggal(getTodayFormattedDate());
                  setWaktu(getTodayFormattedTime());
                  setLokasi('');
                  setPin(true);
                  setShowAddForm(true);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Tutup Form' : 'Tulis Pengumuman'}</span>
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4.5 rounded-2xl glass-panel-subtle border border-emerald-400/40 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {editingItem ? 'Edit Pengumuman / Agenda' : 'Tulis Pengumuman / Agenda Baru'}
              </h4>
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
              >
                Batal
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">Judul Pengumuman / Agenda</label>
              <input
                type="text"
                value={judul}
                onChange={e => setJudul(e.target.value)}
                placeholder="Contoh: 📅 Jadwal Ujian Tahfidz Semester Ganjil"
                className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs focus:outline-none"
                required
              />
            </div>

            {/* Tanggal dan Waktu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>Tanggal Pelaksanaan / Rilis</span>
                </label>
                <input
                  type="text"
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  placeholder="Contoh: 16 Agustus 2026"
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs focus:outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>Waktu / Jam</span>
                </label>
                <input
                  type="text"
                  value={waktu}
                  onChange={e => setWaktu(e.target.value)}
                  placeholder="Contoh: 08:00 - 12:00 WIB / 08:00 WIB"
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            {/* Lokasi, Kategori & Target */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>Lokasi (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={e => setLokasi(e.target.value)}
                  placeholder="Contoh: Masjid Jami' / Aula"
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Kategori</label>
                <select
                  value={kategori}
                  onChange={e => setKategori(e.target.value as any)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs focus:outline-none"
                >
                  <option value="Penting" className="bg-slate-900 text-white">Penting</option>
                  <option value="Akademik" className="bg-slate-900 text-white">Akademik</option>
                  <option value="Kepesantrenan" className="bg-slate-900 text-white">Kepesantrenan</option>
                  <option value="Kegiatan" className="bg-slate-900 text-white">Kegiatan</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Target Ditujukan</label>
                <select
                  value={target}
                  onChange={e => setTarget(e.target.value as any)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs focus:outline-none"
                >
                  <option value="Semua" className="bg-slate-900 text-white">Semua Civitas</option>
                  <option value="Siswa" className="bg-slate-900 text-white">Santri / Siswa</option>
                  <option value="Guru" className="bg-slate-900 text-white">Asatidz & Guru</option>
                  <option value="Wali Santri" className="bg-slate-900 text-white">Wali Santri</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">Isi Maklumat / Informasi / Rincian Agenda</label>
              <textarea
                value={isi}
                onChange={e => setIsi(e.target.value)}
                rows={3}
                placeholder="Tuliskan rincian pengumuman atau maklumat secara lengkap..."
                className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pin}
                  onChange={e => setPin(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="flex items-center gap-1 text-[11px]">
                  <Pin className="w-3 h-3 text-amber-400" />
                  Sematkan di paling atas (Pin Pengumuman)
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {editingItem ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{editingItem ? 'Simpan Perubahan Pengumuman' : 'Publikasikan Pengumuman'}</span>
            </button>
          </form>
        )}

        {/* List of Announcements */}
        <div className="space-y-3.5">
          {pengumumanList.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                ann.pin 
                  ? 'glass-panel-amber border-amber-400/50 shadow-lg' 
                  : 'glass-card border-white/10'
              }`}
            >
              {/* Header Badges & Actions */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {ann.pin && (
                    <span className="flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                      <Pin className="w-2.5 h-2.5" /> Disematkan
                    </span>
                  )}
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-semibold">
                    {ann.kategori}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                    Target: <strong className="text-slate-100">{ann.target}</strong>
                  </span>
                </div>

                {['admin', 'guru'].includes(activeRole) && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(ann)}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Edit Pengumuman"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePengumuman(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Body */}
              <h4 className="text-sm sm:text-base font-bold text-white mb-2">{ann.judul}</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-3.5">{ann.isi}</p>

              {/* Date, Time, Location & Author Box */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                {/* Tanggal */}
                <div className="flex items-center gap-2 text-slate-200">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Calendar className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-medium">Tanggal</span>
                    <span className="font-semibold text-white">{ann.tanggal || '16 Agustus 2026'}</span>
                  </div>
                </div>

                {/* Waktu */}
                <div className="flex items-center gap-2 text-slate-200">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-medium">Waktu / Jam</span>
                    <span className="font-semibold text-emerald-300">{ann.waktu || '08:00 WIB'}</span>
                  </div>
                </div>

                {/* Lokasi / Penulis */}
                {ann.lokasi ? (
                  <div className="flex items-center gap-2 text-slate-200">
                    <div className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                      <MapPin className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-medium">Lokasi</span>
                      <span className="font-semibold text-white truncate block">{ann.lokasi}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-200">
                    <div className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                      <User className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-medium">Penulis</span>
                      <span className="font-semibold text-white truncate block">{ann.penulis}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
