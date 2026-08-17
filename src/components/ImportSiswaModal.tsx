import React, { useState, useRef } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { Siswa } from '../types';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ClipboardCopy, 
  Sparkles, 
  Users, 
  Check, 
  Info,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';

interface ImportSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedSiswaRow {
  nisn: string;
  nis: string;
  nama: string;
  kelas: string;
  gender: 'L' | 'P';
  waliNama: string;
  waliPhone: string;
  alamat: string;
  targetJuz: number;
  hafalanTercapai: number;
  status: 'Aktif' | 'Alumni' | 'Cuti';
  isValid: boolean;
  errorNote?: string;
}

const SAMPLE_DEMO_DATA = `0089123471\t320101\tAhmad Zulfikar Ramadhan\t9A Unggulan\tL\tH. Ramadhan\t081234567801\tJl. KH Hasyim Asyari No. 12\t30\t6.0\n0089123472\t320102\tFatimah Az-Zahra Al-Banjari\t9A Unggulan\tP\tHj. Maryam\t081234567802\tKomplek Pesantren Blok B4\t30\t8.5\n0089123473\t320103\tMuhammad Ilham Al-Farabi\t8B Tahfidz\tL\tDrs. Farabi\t081234567803\tJl. Tentara Pelajar No. 45\t30\t4.0\n0089123474\t320104\tNayla Syarafina Putri\t8B Tahfidz\tP\tH. Syarafuddin\t081234567804\tPerumahan Asri Indah No. 8\t30\t5.0\n0089123475\t320105\tAbdullah Yusuf Robbani\t7A Diniyah\tL\tH. Yusuf Subhan\t081234567805\tDesa Karangdowo RT 02/03\t30\t2.0`;

export const ImportSiswaModal: React.FC<ImportSiswaModalProps> = ({ isOpen, onClose }) => {
  const { addBulkSiswa, kelasList, siswaList, triggerConfetti } = useMadrasah();

  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedSiswaRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Default female avatar vs male avatar generator
  const getAvatar = (gender: 'L' | 'P', idx: number) => {
    const maleAvatars = [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    ];
    const femaleAvatars = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    ];
    return gender === 'P' 
      ? femaleAvatars[idx % femaleAvatars.length] 
      : maleAvatars[idx % maleAvatars.length];
  };

  // Parse Raw Text (CSV or Tab Delimited from Excel)
  const parseRawContent = (content: string) => {
    if (!content || !content.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = content.trim().split(/\r?\n/);
    const results: ParsedSiswaRow[] = [];

    // Check if first row is header
    const firstLine = lines[0].toLowerCase();
    const startIndex = (firstLine.includes('nama') || firstLine.includes('nisn') || firstLine.includes('kelas')) ? 1 : 0;

    const existingNisns = new Set(siswaList.map(s => s.nisn));

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by tab or comma (CSV) or semicolon
      let cols: string[] = [];
      if (line.includes('\t')) {
        cols = line.split('\t');
      } else if (line.includes(';')) {
        cols = line.split(';');
      } else {
        cols = line.split(',');
      }

      cols = cols.map(c => c.replace(/^["']|["']$/g, '').trim());

      const nisn = cols[0] || `0089${Math.floor(100000 + Math.random() * 900000)}`;
      const nis = cols[1] || `240${i + 1}`;
      const nama = cols[2] || cols[1] || '';
      const rawKelas = cols[3] || cols[2] || (kelasList[0]?.nama || '9A Unggulan');
      const rawGender = (cols[4] || 'L').toUpperCase();
      const gender: 'L' | 'P' = rawGender.startsWith('P') || rawGender === 'WANITA' || rawGender === 'PEREMPUAN' ? 'P' : 'L';
      const waliNama = cols[5] || `Wali ${nama}`;
      const waliPhone = cols[6] || '081234567890';
      const alamat = cols[7] || 'Komplek Asrama Madrasah';
      const targetJuz = Number(cols[8]) || 30;
      const hafalanTercapai = Number(cols[9]) || 0;

      // Validate
      let isValid = true;
      let errorNote = '';

      if (!nama || nama.length < 2) {
        isValid = false;
        errorNote = 'Nama santri tidak boleh kosong';
      }

      // Check class existence or approximate
      const matchedClass = kelasList.find(k => k.nama.toLowerCase() === rawKelas.toLowerCase());
      const kelas = matchedClass ? matchedClass.nama : (rawKelas || kelasList[0]?.nama || '9A Unggulan');

      if (existingNisns.has(nisn)) {
        errorNote = 'Peringatan: NISN sudah ada di database (akan diperbarui/ditambahkan)';
      }

      results.push({
        nisn,
        nis,
        nama,
        kelas,
        gender,
        waliNama,
        waliPhone,
        alamat,
        targetJuz,
        hafalanTercapai,
        status: 'Aktif',
        isValid,
        errorNote
      });
    }

    setParsedRows(results);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseRawContent(text);
    };

    reader.readAsText(file);
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPasteText(val);
    parseRawContent(val);
  };

  const handleLoadSample = () => {
    setActiveInputMode('paste');
    setPasteText(SAMPLE_DEMO_DATA);
    parseRawContent(SAMPLE_DEMO_DATA);
  };

  const handleDownloadTemplateCSV = () => {
    const headers = 'NISN,NIS,Nama Lengkap,Kelas,Jenis Kelamin (L/P),Nama Wali,No WA Wali,Alamat,Target Juz,Hafalan Awal Juz';
    const sampleRows = [
      '0089123401,320101,Ahmad Zulfikar Ramadhan,9A Unggulan,L,H. Ramadhan,081234567801,Jl. KH Hasyim Asyari No. 12,30,6.0',
      '0089123402,320102,Fatimah Az-Zahra Al-Banjari,9A Unggulan,P,Hj. Maryam,081234567802,Komplek Pesantren Blok B4,30,8.5',
      '0089123403,320103,Muhammad Ilham Al-Farabi,8B Tahfidz,L,Drs. Farabi,081234567803,Jl. Tentara Pelajar No. 45,30,4.0',
      '0089123404,320104,Nayla Syarafina Putri,8B Tahfidz,P,H. Syarafuddin,081234567804,Perumahan Asri Indah No. 8,30,5.0',
    ];

    const csvContent = [headers, ...sampleRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-import-santri-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Tidak ada baris data santri yang valid untuk diimpor. Silakan periksa kembali format data Anda.'
      });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      const santriToInsert: Omit<Siswa, 'id'>[] = validRows.map((r, idx) => ({
        nisn: r.nisn,
        nis: r.nis,
        nama: r.nama,
        kelas: r.kelas,
        gender: r.gender,
        waliNama: r.waliNama,
        waliPhone: r.waliPhone,
        alamat: r.alamat,
        status: r.status,
        targetJuz: r.targetJuz,
        hafalanTercapai: r.hafalanTercapai,
        fotoUrl: getAvatar(r.gender, idx),
        poinKarakter: 100,
      }));

      const count = await addBulkSiswa(santriToInsert);
      setIsProcessing(false);
      setFeedback({
        type: 'success',
        message: `Alhamdulillah! Berhasil mengimpor ${count} data santri ke dalam sistem madrasah.`
      });
      triggerConfetti();

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setIsProcessing(false);
      setFeedback({
        type: 'error',
        message: 'Terjadi kesalahan saat memproses import. Silakan coba lagi.'
      });
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-panel rounded-3xl w-full max-w-3xl border border-emerald-500/40 p-5 sm:p-6 text-white space-y-5 my-auto max-h-[92vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-inner shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Import Data Santri / Siswa (Kolektif)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Excel & CSV
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Impor data ratusan santri sekaligus dari file Excel (.xlsx/.csv), format EMIS Kemenag, atau copy-paste
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

        {/* Action / Help Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs shrink-0">
          <div className="flex items-start sm:items-center gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-emerald-200">
              Format Kolom: <strong>NISN, NIS, Nama Lengkap, Kelas, Gender (L/P), Wali, No HP, Alamat, Target Juz, Hafalan</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadTemplateCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer"
              title="Unduh format spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template Excel/CSV</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
              title="Isi dengan contoh santri"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Contoh Demo</span>
            </button>
          </div>
        </div>

        {/* Input Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveInputMode('upload')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeInputMode === 'upload'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File (.csv / .txt)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputMode('paste')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeInputMode === 'paste'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClipboardCopy className="w-3.5 h-3.5" />
            <span>Copy-Paste Langsung dari Excel</span>
          </button>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeInputMode === 'upload' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-emerald-950/20 hover:bg-emerald-950/30 flex flex-col items-center justify-center space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {fileName ? `File Terpilih: ${fileName}` : 'Klik untuk Pilih File CSV / TXT atau Tarik ke Sini'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung file ekspor dari Microsoft Excel (.csv), Google Sheets, atau EMIS Madrasah
                </p>
              </div>
              {fileName && (
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40">
                  {parsedRows.length} baris data berhasil dibaca
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Paste (Tempel) Baris Tabel dari Excel / Spreadsheet di bawah ini:
              </label>
              <textarea
                value={pasteText}
                onChange={handlePasteChange}
                placeholder={`Contoh (Copy baris dari Excel):\n0089123471\t320101\tAhmad Zulfikar Ramadhan\t9A Unggulan\tL\tH. Ramadhan\t081234567801\tJl. KH Hasyim Asyari No. 12\t30\t6.0`}
                className="w-full h-36 px-3.5 py-3 rounded-2xl glass-input text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
              />
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pratinjau Data Santri ({validCount} Siap Diimpor)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Total Baris: <strong className="text-white">{parsedRows.length}</strong>
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/60 max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold sticky top-0 border-b border-white/10">
                    <tr>
                      <th className="px-3 py-2">No</th>
                      <th className="px-3 py-2">NISN</th>
                      <th className="px-3 py-2">Nama Santri</th>
                      <th className="px-3 py-2">Kelas</th>
                      <th className="px-3 py-2">L/P</th>
                      <th className="px-3 py-2">Wali / No WA</th>
                      <th className="px-3 py-2">Target</th>
                      <th className="px-3 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium text-[11px]">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-white/5' : 'bg-rose-500/10 hover:bg-rose-500/20'}>
                        <td className="px-3 py-2 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-3 py-2 font-mono text-amber-300">{row.nisn}</td>
                        <td className="px-3 py-2 font-bold text-white">{row.nama}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {row.kelas}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-bold">{row.gender}</td>
                        <td className="px-3 py-2 text-slate-300">
                          <div>{row.waliNama}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{row.waliPhone}</div>
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          {row.hafalanTercapai}/{row.targetJuz} Juz
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                              <Check className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400" title={row.errorNote}>
                              <AlertCircle className="w-3 h-3" /> {row.errorNote || 'Error'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notification Feedback */}
          {feedback && (
            <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                : 'bg-rose-500/20 border-rose-400/40 text-rose-200'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl glass-button text-xs text-slate-300 font-bold hover:text-white transition-all"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={isProcessing || validCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="w-4 h-4" />
            <span>{isProcessing ? 'Menyimpan Santri...' : `Import ${validCount} Santri ke Sistem`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
