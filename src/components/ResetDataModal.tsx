import React, { useState, useRef } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Upload, 
  Building2, 
  Users, 
  BookOpen, 
  Sparkles, 
  X,
  FileJson,
  ShieldAlert,
  Database
} from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({ isOpen, onClose }) => {
  const { 
    resetToDefaultData, 
    resetMadrasahInfo, 
    resetAcademicAndTransactions,
    resetStudentsAndTeachers,
    exportDatabaseJSON,
    importDatabaseJSON,
    madrasahInfo,
    triggerConfetti 
  } = useMadrasah();

  const [resetType, setResetType] = useState<'all' | 'institution' | 'people' | 'academic'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExecuteReset = () => {
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        if (resetType === 'all') {
          resetToDefaultData();
          setSuccessMessage('Seluruh database madrasah berhasil direset ke pengaturan awal pabrik!');
        } else if (resetType === 'institution') {
          resetMadrasahInfo();
          setSuccessMessage('Profil lembaga & kop surat berhasil direset ke data default!');
        } else if (resetType === 'people') {
          resetStudentsAndTeachers();
          setSuccessMessage('Daftar santri & ustadz berhasil dikembalikan ke data master awal!');
        } else if (resetType === 'academic') {
          resetAcademicAndTransactions();
          setSuccessMessage('Data absensi, nilai raport, tagihan SPP & tahfidz berhasil direset!');
        }

        setIsProcessing(false);
        triggerConfetti();

        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1800);
      } catch (err) {
        setIsProcessing(false);
        setErrorMessage('Gagal melakukan reset data. Silakan coba lagi.');
      }
    }, 400);
  };

  const handleDownloadBackup = () => {
    try {
      const dataStr = exportDatabaseJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `madrasah-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerConfetti();
    } catch (err) {
      setErrorMessage('Gagal mengunduh cadangan database.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const success = importDatabaseJSON(jsonContent);
        if (success) {
          setSuccessMessage('Data cadangan berhasil dipulihkan!');
          triggerConfetti();
          setTimeout(() => {
            setSuccessMessage(null);
            onClose();
          }, 1500);
        } else {
          setErrorMessage('Format berkas JSON tidak sesuai format sistem madrasah.');
        }
      } catch (err) {
        setErrorMessage('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl text-white shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-red-950/50 via-slate-900 to-amber-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <RotateCcw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Manajemen & Reset Data</span>
              </h3>
              <p className="text-xs text-slate-300">
                {madrasahInfo.nama}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-1">
          
          {/* Status Notifications */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 flex items-center gap-3 animate-in slide-in-from-top duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs font-semibold">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 flex items-center gap-3 animate-in slide-in-from-top duration-200">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-xs font-semibold">{errorMessage}</p>
            </div>
          )}

          {/* Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-amber-300 font-bold block mb-0.5">Perhatian Sebelum Mereset:</strong>
              Operasi reset akan mengembalikan data yang tersimpan di browser Anda ke kondisi awal default. Disarankan untuk mengunduh berkas cadangan JSON terlebih dahulu.
            </div>
          </div>

          {/* Reset Options */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Pilih Opsi Reset Data:
            </label>

            <div className="space-y-2">
              {/* Option 1: Full Reset */}
              <label 
                onClick={() => setResetType('all')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  resetType === 'all'
                    ? 'bg-red-500/15 border-red-500/50 shadow-md shadow-red-950/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="resetOption"
                  checked={resetType === 'all'}
                  onChange={() => setResetType('all')}
                  className="mt-1 text-red-500 focus:ring-red-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-white">Reset Semua Data (Pabrik / Full Reset)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Mengembalikan seluruh profil lembaga, santri, ustadz, raport, presensi, SPP, mutabaah, dan pengumuman ke data master resmi.
                  </p>
                </div>
              </label>

              {/* Option 2: Lembaga Saja */}
              <label 
                onClick={() => setResetType('institution')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  resetType === 'institution'
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-950/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="resetOption"
                  checked={resetType === 'institution'}
                  onChange={() => setResetType('institution')}
                  className="mt-1 text-amber-500 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Reset Profil Lembaga & Logo</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Hanya mengembalikan nama madrasah, logo, NSM/NPSN, alamat, dan identitas kop surat ke default.
                  </p>
                </div>
              </label>

              {/* Option 3: Santri & Guru Saja */}
              <label 
                onClick={() => setResetType('people')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  resetType === 'people'
                    ? 'bg-blue-500/15 border-blue-500/50 shadow-md shadow-blue-950/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="resetOption"
                  checked={resetType === 'people'}
                  onChange={() => setResetType('people')}
                  className="mt-1 text-blue-500 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Reset Master Santri & Guru</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Mengembalikan daftar santri dan asatidz ke data master awal tanpa mereset profil madrasah.
                  </p>
                </div>
              </label>

              {/* Option 4: Akademik & Transaksi */}
              <label 
                onClick={() => setResetType('academic')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  resetType === 'academic'
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="resetOption"
                  checked={resetType === 'academic'}
                  onChange={() => setResetType('academic')}
                  className="mt-1 text-emerald-500 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Reset Transaksi KBM & Keuangan</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Mereset absensi harian, nilai raport Kemenag, catatan setoran tahfidz, dan tagihan SPP.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Backup & Restore Utility Section */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Cadangan Data (Backup & Restore):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unduh JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Pulihkan JSON</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleExecuteReset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Sedang Mereset Data...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Konfirmasi & Eksekusi Reset</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
