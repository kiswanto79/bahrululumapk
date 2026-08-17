import React, { useState } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  CreditCard, 
  QrCode, 
  Printer, 
  Download, 
  Sparkles, 
  User, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  GraduationCap,
  Building2,
  Share2
} from 'lucide-react';

export const KartuView: React.FC = () => {
  const { siswaList, guruList, currentUser, activeRole, madrasahInfo, triggerConfetti } = useMadrasah();
  const [selectedType, setSelectedType] = useState<'siswa' | 'guru'>('siswa');
  const [selectedId, setSelectedId] = useState<string>(siswaList[0]?.id || 'sis-01');
  const [isFlipped, setIsFlipped] = useState(false);

  const selectedSiswa = siswaList.find(s => s.id === selectedId) || siswaList[0];
  const selectedGuru = guruList.find(g => g.id === selectedId) || guruList[0];

  const currentPerson = selectedType === 'siswa' 
    ? {
        name: selectedSiswa?.nama || currentUser.name,
        nisn: selectedSiswa?.nisn || '0089123456',
        nis: selectedSiswa?.nis || '2026-901',
        kelas: selectedSiswa?.kelas || '9A Unggulan',
        role: 'SANTRI / SISWA AKTIF',
        photo: selectedSiswa?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        status: selectedSiswa?.status || 'Aktif',
        wali: selectedSiswa?.namaWali || 'Orang Tua',
        telepon: selectedSiswa?.noHp || '0812-3456-7890',
        qrData: `KTS-${selectedSiswa?.nisn}-${selectedSiswa?.nis}`,
        barCode: `*${selectedSiswa?.nis}*`
      }
    : {
        name: selectedGuru?.nama || 'Ustadz Ahmad Fauzi, Lc.',
        nisn: selectedGuru?.nip || '198805122019031002',
        nis: selectedGuru?.nuptk || '3456789012345678',
        kelas: selectedGuru?.mapelUtama || 'Tahfidz Al-Qur\'an',
        role: 'DEWAN ASATIDZ / GURU',
        photo: selectedGuru?.foto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        status: selectedGuru?.status || 'Aktif',
        wali: selectedGuru?.pendidikanTerakhir || 'S1 Tafsir Hadits - Al-Azhar Kairo',
        telepon: selectedGuru?.noHp || '0813-8899-0011',
        qrData: `KTG-${selectedGuru?.nip}`,
        barCode: `*${selectedGuru?.nip}*`
      };

  const handlePrint = () => {
    triggerConfetti();
    window.print();
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel-emerald rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">E-Kartu Digital Terpadu</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Smart NFC & QR
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Kartu Tanda Santri (E-KTS) & Kartu Asatidz Digital berstandar Kemenag
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/30 transition-all transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu HD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls & Selectors */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        {/* Type Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-700/80 w-fit">
          <button
            onClick={() => {
              setSelectedType('siswa');
              setSelectedId(siswaList[0]?.id || '');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedType === 'siswa'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Santri / Siswa ({siswaList.length})</span>
          </button>
          <button
            onClick={() => {
              setSelectedType('guru');
              setSelectedId(guruList[0]?.id || '');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedType === 'guru'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Asatidz / Guru ({guruList.length})</span>
          </button>
        </div>

        {/* Member dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Pilih Person:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-white text-xs focus:outline-none min-w-[200px]"
          >
            {selectedType === 'siswa'
              ? siswaList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.nama} ({s.kelas})
                  </option>
                ))
              : guruList.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                    {g.nama} ({g.mapelUtama})
                  </option>
                ))}
          </select>
        </div>
      </div>

      {/* 3D Smart Card Preview */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-full max-w-[420px] aspect-[1.586/1] relative select-none cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
          {/* Front Side */}
          <div className={`w-full h-full rounded-3xl p-5 text-white relative overflow-hidden transition-all duration-500 shadow-2xl border ${
            selectedType === 'siswa' 
              ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 border-emerald-500/40 shadow-emerald-950/60'
              : 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 border-amber-500/40 shadow-amber-950/60'
          } ${isFlipped ? 'hidden' : 'block'}`}>
            
            {/* Geometric watermark */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />

            {/* Header with Logo */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                  {madrasahInfo.logoUrl ? (
                    <img src={madrasahInfo.logoUrl} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-[10px]" />
                  ) : (
                    <Building2 className="w-5 h-5 text-slate-950" />
                  )}
                </div>
                <div>
                  <h4 className="text-[11px] font-black tracking-wider text-white uppercase">{madrasahInfo.nama}</h4>
                  <p className="text-[9px] text-emerald-300 font-medium">{madrasahInfo.nsm} &bull; NPSN: {madrasahInfo.npsn}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {currentPerson.role}
              </span>
            </div>

            {/* Body Info */}
            <div className="flex items-center gap-3.5 my-2">
              <img
                src={currentPerson.photo}
                alt={currentPerson.name}
                className="w-16 h-20 sm:w-18 sm:h-22 rounded-2xl object-cover border-2 border-amber-400/70 shadow-md shrink-0"
              />
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate">{currentPerson.name}</h3>
                <p className="text-[11px] text-amber-300 font-mono font-semibold">
                  {selectedType === 'siswa' ? `NISN: ${currentPerson.nisn}` : `NIP: ${currentPerson.nisn}`}
                </p>
                <div className="text-[10px] text-slate-300 space-y-0.5">
                  <p>Kelas / Tugas: <strong className="text-white">{currentPerson.kelas}</strong></p>
                  <p>Status: <span className="text-emerald-400 font-bold">{currentPerson.status}</span></p>
                </div>
              </div>
            </div>

            {/* Card Footer with QR & Barcode */}
            <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between border-t border-white/10 pt-2">
              <div>
                <div className="font-mono text-[10px] tracking-widest text-slate-400">
                  {currentPerson.barCode}
                </div>
                <p className="text-[8px] text-slate-400">Berlaku s.d. Tahun Ajaran 2026/2027</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-inner">
                <QrCode className="w-8 h-8 text-slate-900" />
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className={`w-full h-full rounded-3xl p-5 text-white relative overflow-hidden transition-all duration-500 shadow-2xl border bg-slate-900 border-slate-700 ${isFlipped ? 'block' : 'hidden'}`}>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Ketentuan Pemegang Kartu</h4>
            <ul className="text-[10px] text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Kartu ini adalah identitas resmi civitas {madrasahInfo.nama}.</li>
              <li>Wajib dibawa saat KBM, Presensi Digital, Setoran Tahfidz, dan Ujian.</li>
              <li>Dapat digunakan sebagai Smart Card Baitul Maal / Pembayaran SPP.</li>
              <li>Bila menemukan kartu ini, harap hubungi: <strong>{madrasahInfo.telepon}</strong>.</li>
            </ul>

            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between border-t border-slate-800 pt-2 text-[9px] text-slate-400">
              <span>{madrasahInfo.alamat}</span>
              <span className="text-emerald-400 font-semibold">{madrasahInfo.website}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5 no-print">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Klik kartu di atas untuk melihat sisi depan/belakang</span>
        </p>
      </div>
    </div>
  );
};
