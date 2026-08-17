import React, { useState } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { TagihanSPP } from '../types';
import { 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Plus, 
  Search, 
  Building2, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp,
  Receipt,
  PiggyBank,
  Settings,
  QrCode,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { KanalPembayaranModal } from './KanalPembayaranModal';

export const KeuanganView: React.FC = () => {
  const { 
    tagihanList, 
    kanalPembayaranList,
    bayarTagihan, 
    addTagihan, 
    siswaList, 
    activeRole, 
    setActiveTab,
    tabunganAccounts,
    madrasahInfo,
    triggerConfetti 
  } = useMadrasah();

  const [selectedTagihan, setSelectedTagihan] = useState<TagihanSPP | null>(tagihanList[0] || null);
  const [filterStatus, setFilterStatus] = useState<'semua' | 'lunas' | 'belum_lunas'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [showKanalModal, setShowKanalModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [targetPayId, setTargetPayId] = useState<string | null>(null);
  const [copiedPayId, setCopiedPayId] = useState<string | null>(null);

  // New Tagihan Modal State
  const [showAddTagihan, setShowAddTagihan] = useState(false);
  const [newSiswaId, setNewSiswaId] = useState(siswaList[0]?.id || 'sis-01');
  const [newJudul, setNewJudul] = useState('SPP & Asrama Bulan Oktober 2026');
  const [newBulan, setNewBulan] = useState('Oktober 2026');
  const [newNominal, setNewNominal] = useState(450000);

  const activeKanalList = kanalPembayaranList.filter(k => k.aktif);

  const filteredTagihan = tagihanList.filter(t => {
    const matchStatus = filterStatus === 'semua' || t.status === filterStatus;
    const matchSearch = t.siswaNama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.judulTagihan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPemasukan = tagihanList
    .filter(t => t.status === 'lunas')
    .reduce((sum, curr) => sum + curr.nominal, 0);

  const totalPiutang = tagihanList
    .filter(t => t.status === 'belum_lunas')
    .reduce((sum, curr) => sum + curr.nominal, 0);

  const handleOpenPay = (tagihan: TagihanSPP) => {
    setTargetPayId(tagihan.id);
    setSelectedTagihan(tagihan);
    const defaultMethod = activeKanalList[0]?.nama || 'Transfer BSI (Bank Syariah Indonesia)';
    setPaymentMethod(defaultMethod);
    setShowPayModal(true);
  };

  const handleConfirmPay = async () => {
    if (!targetPayId) return;
    await bayarTagihan(targetPayId, paymentMethod || 'Virtual Account BSI');
    setShowPayModal(false);
    triggerConfetti();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayId(id);
    setTimeout(() => setCopiedPayId(null), 2000);
  };

  const handleCreateTagihan = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = siswaList.find(s => s.id === newSiswaId);
    await addTagihan({
      siswaId: newSiswaId,
      siswaNama: st?.nama || 'Santri',
      kelas: st?.kelas || '9A Unggulan',
      judulTagihan: newJudul,
      bulan: newBulan,
      nominal: Number(newNominal),
      status: 'belum_lunas',
      catatan: 'Jatuh tempo tanggal 10 tiap bulan',
    });
    setShowAddTagihan(false);
    triggerConfetti();
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-6">
      {/* Header */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Baitul Maal & Pembayaran SPP</h2>
            <p className="text-xs text-slate-400">Manajemen Iuran Syahriyah, Kas Madrasah & Kwitansi Digital</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Button to Open Kanal Pembayaran Settings */}
          {['admin', 'guru'].includes(activeRole) && (
            <button
              onClick={() => setShowKanalModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-md cursor-pointer"
              title="Atur nomor rekening, VA, dan QRIS madrasah"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Kanal Pembayaran ({activeKanalList.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('tabungan')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <PiggyBank className="w-4 h-4 text-amber-400" />
            <span>Tabungan Santri & Guru ({tabunganAccounts.length})</span>
          </button>

          {['admin', 'guru'].includes(activeRole) && (
            <button
              onClick={() => setShowAddTagihan(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tagihan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl glass-panel-emerald border border-emerald-400/40 shadow-lg text-white">
          <span className="text-xs text-emerald-300 font-medium">Kas Pemasukan SPP (Lunas)</span>
          <p className="text-xl sm:text-2xl font-black mt-1 font-mono text-emerald-200">
            Rp {totalPemasukan.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Total {tagihanList.filter(t => t.status === 'lunas').length} transaksi berhasil</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel-amber border border-amber-400/40 shadow-lg text-white">
          <span className="text-xs text-amber-300 font-medium">Sisa Piutang SPP (Belum Lunas)</span>
          <p className="text-xl sm:text-2xl font-black mt-1 font-mono text-amber-200">
            Rp {totalPiutang.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Total {tagihanList.filter(t => t.status === 'belum_lunas').length} santri dalam tempo</p>
        </div>

        <div 
          onClick={() => setShowKanalModal(true)}
          className="p-4 rounded-2xl glass-panel border border-white/10 shadow-lg text-white hover:border-emerald-500/40 transition-all cursor-pointer group"
          title="Klik untuk melihat / merubah kanal pembayaran"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-teal-300 font-medium">Kanal Pembayaran Aktif</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold group-hover:bg-emerald-500/30">
              Ubah &bull; {activeKanalList.length} Saluran
            </span>
          </div>
          <p className="text-sm font-bold mt-1 text-white group-hover:text-emerald-300 transition-colors">
            {activeKanalList.slice(0, 2).map(k => k.kode).join(', ')} {activeKanalList.length > 2 ? `+${activeKanalList.length - 2} Lainnya` : ''}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Klik untuk atur nomor rekening / VA / QRIS</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
          </p>
        </div>
      </div>

      {/* Tagihan Filter & Search */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 glass-panel-subtle rounded-2xl border border-white/10 self-start">
            {[
              { id: 'semua', label: 'Semua Tagihan' },
              { id: 'belum_lunas', label: 'Belum Lunas' },
              { id: 'lunas', label: 'Sudah Lunas' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow border border-emerald-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama santri..."
              className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-white focus:outline-none w-full sm:w-48"
            />
          </div>
        </div>

        {/* Tagihan List Cards */}
        <div className="space-y-3">
          {filteredTagihan.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl glass-card border border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    t.status === 'lunas'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {t.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                  <span className="text-xs text-slate-400">{t.bulan}</span>
                </div>

                <h4 className="text-sm font-bold text-white">{t.siswaNama}</h4>
                <p className="text-xs text-slate-300">{t.judulTagihan} &bull; <strong className="text-emerald-400">{t.kelas}</strong></p>
                {t.nomorKwitansi && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">No. Kwitansi: {t.nomorKwitansi}</p>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block">Nominal Tagihan</span>
                  <strong className="text-sm sm:text-base font-bold font-mono text-amber-400">
                    Rp {t.nominal.toLocaleString('id-ID')}
                  </strong>
                </div>

                {t.status === 'belum_lunas' ? (
                  <button
                    onClick={() => handleOpenPay(t)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all"
                  >
                    Bayar Online
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedTagihan(t)}
                    className="px-3.5 py-2 rounded-xl glass-button text-amber-300 text-xs font-semibold border border-amber-400/30 flex items-center gap-1.5 transition-all"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Lihat Kwitansi</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kwitansi Resmi Modal / Print Sheet */}
      {selectedTagihan && selectedTagihan.status === 'lunas' && (
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-w-2xl mx-auto">
          {/* Kwitansi Header */}
          <div className="border-b-2 border-emerald-900 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-lg font-display shrink-0 overflow-hidden">
                {madrasahInfo.logoUrl ? (
                  <img src={madrasahInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  madrasahInfo.nama.charAt(0) || 'M'
                )}
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider text-emerald-950 uppercase">
                  {madrasahInfo.nama}
                </h3>
                <p className="text-[11px] text-slate-600">BAITUL MAAL & TATA USAHA KEUANGAN</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                KWITANSI RESMI
              </span>
              <p className="text-[10px] font-mono text-slate-600 mt-1">{selectedTagihan.nomorKwitansi}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs mb-6">
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Telah Diterima Dari:</span>
              <span className="col-span-2 font-bold text-slate-900">{selectedTagihan.siswaNama} ({selectedTagihan.kelas})</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Guna Pembayaran:</span>
              <span className="col-span-2 font-semibold text-slate-800">{selectedTagihan.judulTagihan}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Tanggal Transaksi:</span>
              <span className="col-span-2 text-slate-800">{selectedTagihan.tanggalBayar || '05 Agustus 2026'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Kanal Pembayaran:</span>
              <span className="col-span-2 text-slate-800">{selectedTagihan.metodeBayar || 'Virtual Account BSI'}</span>
            </div>
            <div className="grid grid-cols-3 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-emerald-900 font-bold">Jumlah Nominal:</span>
              <span className="col-span-2 font-mono font-black text-sm text-emerald-900">
                Rp {selectedTagihan.nominal.toLocaleString('id-ID')} (LUNAS)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-600">
            <div>
              <p>Stempel Digital Terverifikasi</p>
              <p className="font-mono text-[9px] text-slate-400">ID: SEC-AZHAR-BSI-99</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kwitansi</span>
            </button>
          </div>
        </div>
      )}

      {/* Online Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel border border-white/20 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Pembayaran Syahriyah & SPP</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Santri:</span>
                <strong className="text-white">{selectedTagihan?.siswaNama} ({selectedTagihan?.kelas})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rincian:</span>
                <span className="text-slate-200">{selectedTagihan?.judulTagihan}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10">
                <span className="text-slate-400 font-bold">Total Tagihan:</span>
                <strong className="text-amber-400 font-mono text-base font-black">Rp {selectedTagihan?.nominal.toLocaleString('id-ID')}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300">Pilih Kanal / Metode Pembayaran</label>
                {['admin', 'guru'].includes(activeRole) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPayModal(false);
                      setShowKanalModal(true);
                    }}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Ubah / Tambah Rekening</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {activeKanalList.map((kanal) => {
                  const isSelected = paymentMethod === kanal.nama || (!paymentMethod && kanal === activeKanalList[0]);
                  return (
                    <div
                      key={kanal.id}
                      onClick={() => setPaymentMethod(kanal.nama)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-950/60 border-emerald-400 shadow-md' 
                          : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-500'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{kanal.nama}</span>
                            <span className="text-[10px] text-slate-400">a.n {kanal.atasNama}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-amber-300 font-bold">{kanal.nomorRekening}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(kanal.id, kanal.nomorRekening);
                            }}
                            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white"
                            title="Salin Nomor Rekening"
                          >
                            {copiedPayId === kanal.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {isSelected && kanal.instruksi && (
                        <p className="text-[10px] text-emerald-300/90 mt-2 pt-2 border-t border-emerald-500/20 italic">
                          💡 {kanal.instruksi}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="flex-1 py-2.5 rounded-xl glass-button text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleConfirmPay}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-950/40 cursor-pointer"
              >
                Konfirmasi & Cetak Kwitansi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tagihan Modal */}
      {showAddTagihan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleCreateTagihan} className="glass-panel border border-white/20 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-3.5">
            <h3 className="text-base font-bold text-white">Buat Tagihan SPP / Iuran Baru</h3>

            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">Pilih Santri</label>
              <select
                value={newSiswaId}
                onChange={e => setNewSiswaId(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
              >
                {siswaList.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.nama} - {s.kelas}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">Judul Tagihan</label>
              <input
                type="text"
                value={newJudul}
                onChange={e => setNewJudul(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Periode Bulan</label>
                <input
                  type="text"
                  value={newBulan}
                  onChange={e => setNewBulan(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={newNominal}
                  onChange={e => setNewNominal(Number(e.target.value))}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTagihan(false)}
                className="flex-1 py-2.5 rounded-xl glass-button text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
              >
                Terbitkan Tagihan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Pengaturan Kanal Pembayaran & Rekening */}
      <KanalPembayaranModal
        isOpen={showKanalModal}
        onClose={() => setShowKanalModal(false)}
      />
    </div>
  );
};
