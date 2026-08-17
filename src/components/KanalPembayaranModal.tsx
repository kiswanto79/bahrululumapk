import React, { useState } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { KanalPembayaran } from '../types';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Building2, 
  QrCode, 
  Banknote, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { INITIAL_KANAL_PEMBAYARAN } from '../data/initialMadrasahData';

interface KanalPembayaranModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KanalPembayaranModal: React.FC<KanalPembayaranModalProps> = ({ isOpen, onClose }) => {
  const { 
    kanalPembayaranList, 
    addKanalPembayaran, 
    updateKanalPembayaran, 
    deleteKanalPembayaran, 
    toggleKanalPembayaran,
    triggerConfetti 
  } = useMadrasah();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  const [tipe, setTipe] = useState<'bank' | 'va' | 'qris' | 'tunai' | 'ewallet'>('bank');
  const [nomorRekening, setNomorRekening] = useState('');
  const [atasNama, setAtasNama] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [instruksi, setInstruksi] = useState('');

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (kanal: KanalPembayaran) => {
    setEditingId(kanal.id);
    setNama(kanal.nama);
    setKode(kanal.kode);
    setTipe(kanal.tipe);
    setNomorRekening(kanal.nomorRekening);
    setAtasNama(kanal.atasNama);
    setKeterangan(kanal.keterangan || '');
    setInstruksi(kanal.instruksi || '');
    setShowAddForm(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    await updateKanalPembayaran(editingId, {
      nama,
      kode: kode || nama.split(' ')[0].toUpperCase(),
      tipe,
      nomorRekening,
      atasNama,
      keterangan,
      instruksi,
    });

    setEditingId(null);
    triggerConfetti();
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nomorRekening || !atasNama) return;

    await addKanalPembayaran({
      nama,
      kode: kode || nama.split(' ')[0].toUpperCase(),
      tipe,
      nomorRekening,
      atasNama,
      aktif: true,
      keterangan,
      instruksi,
    });

    // Reset Form
    setNama('');
    setKode('');
    setNomorRekening('');
    setAtasNama('');
    setKeterangan('');
    setInstruksi('');
    setShowAddForm(false);
    triggerConfetti();
  };

  const getTipeBadge = (tipe: KanalPembayaran['tipe']) => {
    switch (tipe) {
      case 'va':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">Virtual Account</span>;
      case 'qris':
        return <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold border border-teal-500/30">QRIS Pay</span>;
      case 'tunai':
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">Tunai Kasir</span>;
      case 'ewallet':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30">E-Wallet</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">Transfer Bank</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-panel rounded-3xl w-full max-w-3xl border border-emerald-500/40 p-5 sm:p-6 text-white space-y-5 my-auto max-h-[92vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-300 flex items-center justify-center border border-emerald-500/40 shadow-inner shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Pengaturan Kanal Pembayaran & Rekening Kas</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {kanalPembayaranList.filter(k => k.aktif).length} Aktif
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Kelola nomor rekening bank, Virtual Account BSI, kode QRIS, dan metode kasir untuk pembayaran SPP santri
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Kanal pembayaran yang aktif akan otomatis muncul pada opsi <strong>Bayar Online</strong> santri/wali murid serta tercantum pada bukti cetak <strong>Kwitansi Resmi</strong> Baitul Maal madrasah.
          </p>
        </div>

        {/* Action Button to Add New */}
        <div className="flex items-center justify-between shrink-0">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Daftar Kanal & Rekening ({kanalPembayaranList.length})
          </h4>

          {!showAddForm && !editingId && (
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Rekening / Kanal Baru</span>
            </button>
          )}
        </div>

        {/* Form Add / Edit */}
        {(showAddForm || editingId) && (
          <form 
            onSubmit={editingId ? handleSaveEdit : handleCreateNew} 
            className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-3 shrink-0 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>{editingId ? 'Edit Kanal Pembayaran' : 'Tambah Kanal / Rekening Baru'}</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Nama Bank / Kanal *</label>
                <input
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Tipe Kanal *</label>
                <select
                  value={tipe}
                  onChange={e => setTipe(e.target.value as any)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs bg-slate-900"
                >
                  <option value="va" className="bg-slate-900">Virtual Account (VA)</option>
                  <option value="bank" className="bg-slate-900">Transfer Bank Langsung</option>
                  <option value="qris" className="bg-slate-900">QRIS Nasional</option>
                  <option value="tunai" className="bg-slate-900">Tunai / Loket Kasir</option>
                  <option value="ewallet" className="bg-slate-900">E-Wallet (OVO/Gopay/Dana)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Nomor Rekening / No. VA / NMID *</label>
                <input
                  type="text"
                  value={nomorRekening}
                  onChange={e => setNomorRekening(e.target.value)}
                  placeholder="Contoh: 7123-4567-8901"
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Atas Nama Rekening *</label>
                <input
                  type="text"
                  value={atasNama}
                  onChange={e => setAtasNama(e.target.value)}
                  placeholder="Contoh: Baitul Maal Madrasah Al-Azhar"
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Keterangan Singkat</label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  placeholder="Contoh: Rekening Kas Syahriyah Utama"
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Instruksi Pembayaran</label>
                <input
                  type="text"
                  value={instruksi}
                  onChange={e => setInstruksi(e.target.value)}
                  placeholder="Contoh: Sertakan nama santri & kelas pada berita transfer"
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="px-3.5 py-1.5 rounded-xl glass-button text-xs text-slate-300 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambahkan Rekening'}
              </button>
            </div>
          </form>
        )}

        {/* List of Channels */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {kanalPembayaranList.map((kanal) => (
            <div 
              key={kanal.id} 
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                kanal.aktif 
                  ? 'glass-card border-white/10 hover:border-emerald-500/40' 
                  : 'bg-slate-900/40 border-white/5 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-white">{kanal.nama}</h5>
                  {getTipeBadge(kanal.tipe)}
                  {!kanal.aktif && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/60 text-slate-400 font-bold">
                      Non-Aktif
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">No:</span>
                    <strong className="font-mono text-amber-300 font-bold tracking-wider">{kanal.nomorRekening}</strong>
                    <button
                      type="button"
                      onClick={() => handleCopy(kanal.id, kanal.nomorRekening)}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Salin Nomor Rekening"
                    >
                      {copiedId === kanal.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <span>&bull;</span>
                  <div>
                    <span className="text-slate-400">a.n:</span> <strong className="text-white">{kanal.atasNama}</strong>
                  </div>
                </div>

                {kanal.keterangan && (
                  <p className="text-[11px] text-slate-400">{kanal.keterangan}</p>
                )}
                {kanal.instruksi && (
                  <p className="text-[10px] text-emerald-400/90 italic flex items-center gap-1">
                    <Info className="w-3 h-3 shrink-0" />
                    <span>{kanal.instruksi}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => toggleKanalPembayaran(kanal.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    kanal.aktif 
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                  }`}
                  title={kanal.aktif ? 'Klik untuk non-aktifkan' : 'Klik untuk aktifkan'}
                >
                  {kanal.aktif ? 'Aktif' : 'Aktifkan'}
                </button>

                <button
                  type="button"
                  onClick={() => handleStartEdit(kanal)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 transition-colors"
                  title="Ubah data rekening"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteKanalPembayaran(kanal.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Hapus kanal pembayaran"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 shrink-0">
          <div className="text-[11px] text-slate-400">
            Perubahan disimpan otomatis di database madrasah.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md cursor-pointer hover:brightness-110"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
