import React, { useState } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  BookMarked, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  Search, 
  Heart, 
  BookOpen, 
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';

export const DoaQuranView: React.FC = () => {
  const { triggerConfetti } = useMadrasah();
  const [activeTab, setActiveTab] = useState<'tasbih' | 'quran' | 'doa'>('tasbih');
  
  // Tasbih state
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(33);
  const [currentDzikir, setCurrentDzikir] = useState<'Subhanallah' | 'Alhamdulillah' | 'Allahu Akbar' | 'Astaghfirullah' | 'La ilaha illallah'>('Subhanallah');

  const dzikirList = [
    { name: 'Subhanallah', arabic: 'سُبْحَانَ اللَّهِ', meaning: 'Maha Suci Allah' },
    { name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', meaning: 'Segala Puji Bagi Allah' },
    { name: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', meaning: 'Allah Maha Besar' },
    { name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', meaning: 'Aku memohon ampun kepada Allah' },
    { name: 'La ilaha illallah', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', meaning: 'Tiada Tuhan selain Allah' },
  ];

  // Surah list for Juz 30 preview
  const surahList = [
    { no: 78, nama: 'An-Naba\'', arabic: 'النبأ', ayat: 40, arti: 'Berita Besar', audio: 'Juz 30' },
    { no: 79, nama: 'An-Nazi\'at', arabic: 'النازعات', ayat: 46, arti: 'Malaikat yang Mencabut', audio: 'Juz 30' },
    { no: 80, nama: '\'Abasa', arabic: 'عبس', ayat: 42, arti: 'Ia Bermuka Masam', audio: 'Juz 30' },
    { no: 93, nama: 'Ad-Duha', arabic: 'الضحى', ayat: 11, arti: 'Waktu Dhuha', audio: 'Juz 30' },
    { no: 94, nama: 'Al-Insyirah', arabic: 'الشرح', ayat: 8, arti: 'Kelapangan', audio: 'Juz 30' },
    { no: 97, nama: 'Al-Qadr', arabic: 'القدر', ayat: 5, arti: 'Kemuliaan', audio: 'Juz 30' },
    { no: 112, nama: 'Al-Ikhlas', arabic: 'الإخلاص', ayat: 4, arti: 'Kemurnian Keesaan', audio: 'Juz 30' },
    { no: 113, nama: 'Al-Falaq', arabic: 'الفلق', ayat: 5, arti: 'Waktu Subuh', audio: 'Juz 30' },
    { no: 114, nama: 'An-Nas', arabic: 'الناس', ayat: 6, arti: 'Manusia', audio: 'Juz 30' },
  ];

  // Doa harian santri
  const doaList = [
    {
      judul: 'Doa Sebelum Belajar',
      arabic: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا وَاجْعَلْنِي مِنَ الصَّالِحِينَ',
      latin: 'Robbi zidnii \'ilman warzuqnii fahman waj\'alnii minash shoolihiin.',
      arti: 'Ya Tuhanku, tambahkanlah ilmuku dan berilah aku pemahaman, serta jadikanlah aku termasuk golongan orang-orang yang shaleh.',
      kategori: 'Belajar'
    },
    {
      judul: 'Doa Menghafal Al-Qur\'an (Kekuatan Ingatan)',
      arabic: 'اللَّهُمَّ نَوِّرْ بِكِتَابِكَ بَصَرِي وَاشْرَحْ بِهِ صَدْرِي وَاسْتَعْمِلْ بِهِ بَدَنِي',
      latin: 'Allahumma nawwir bikitaabika basharii wasyrah bihii shodrii wasta\'mil bihii badanii.',
      arti: 'Ya Allah, terangilah pandanganku dengan Kitab-Mu, lapangkanlah dadaku dengannya, dan gerakkanlah tubuhku dengannya.',
      kategori: 'Tahfidz'
    },
    {
      judul: 'Doa Untuk Kedua Orang Tua',
      arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
      latin: 'Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.',
      arti: 'Wahai Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil.',
      kategori: 'Adab'
    },
    {
      judul: 'Sayyidul Istighfar',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
      latin: 'Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa anaa \'abduka...',
      arti: 'Ya Allah, Engkau adalah Tuhanku, tiada Tuhan selain Engkau yang telah menciptakanku...',
      kategori: 'Harian'
    }
  ];

  const handleTasbihClick = () => {
    const nextCount = tasbihCount + 1;
    setTasbihCount(nextCount);
    if (nextCount >= tasbihTarget) {
      triggerConfetti();
    }
  };

  const handleResetTasbih = () => {
    setTasbihCount(0);
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel-emerald rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Al-Qur'an, Doa & Tasbih Digital</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Ubudiyah
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Koleksi amalan harian, murottal juz 30, dan dzikir interaktif santri
              </p>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-slate-700/80 shrink-0">
            {[
              { id: 'tasbih', label: 'Tasbih Digital' },
              { id: 'quran', label: 'Juz \'Amma' },
              { id: 'doa', label: 'Doa Harian' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'tasbih' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Interactive Tasbih Machine */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Counter: {currentDzikir}
              </span>
              <button
                onClick={handleResetTasbih}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 px-2.5 py-1 rounded-xl glass-button"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Arabic display */}
            <div className="my-4">
              <h3 className="font-arabic text-3xl sm:text-4xl text-amber-300 mb-2">
                {dzikirList.find(d => d.name === currentDzikir)?.arabic}
              </h3>
              <p className="text-sm font-semibold text-slate-200">{currentDzikir}</p>
              <p className="text-xs text-slate-400">{dzikirList.find(d => d.name === currentDzikir)?.meaning}</p>
            </div>

            {/* Big interactive tap button */}
            <button
              onClick={handleTasbihClick}
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 border-4 border-emerald-400/40 p-2 shadow-2xl shadow-emerald-950/80 my-4 flex flex-col items-center justify-center transform active:scale-95 transition-all group"
            >
              <div className="w-full h-full rounded-full bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center border border-emerald-500/30 group-hover:border-amber-400/60">
                <span className="text-4xl sm:text-5xl font-mono font-black text-amber-400 group-hover:scale-105 transition-transform">
                  {tasbihCount}
                </span>
                <span className="text-[11px] font-bold text-emerald-300 mt-1 uppercase tracking-widest">
                  Target: {tasbihTarget}
                </span>
              </div>
            </button>

            <p className="text-xs text-slate-400">
              Ketuk lingkaran di atas untuk menambah hitungan dzikir
            </p>
          </div>

          {/* Right: Dzikir Selector */}
          <div className="glass-panel rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              Pilih Lafadz Dzikir
            </h4>
            {dzikirList.map((dz) => (
              <button
                key={dz.name}
                onClick={() => {
                  setCurrentDzikir(dz.name as any);
                  setTasbihCount(0);
                }}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  currentDzikir === dz.name
                    ? 'glass-panel-emerald border-emerald-400/60 text-white'
                    : 'glass-card border-slate-700/60 text-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-white">{dz.name}</p>
                  <p className="text-[11px] text-slate-400">{dz.meaning}</p>
                </div>
                <span className="font-arabic text-lg text-amber-300">{dz.arabic}</span>
              </button>
            ))}

            <div className="pt-3 border-t border-slate-700/60">
              <label className="text-[11px] text-slate-400 block mb-1">Target Putaran:</label>
              <div className="flex gap-2">
                {[33, 99, 100, 1000].map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setTasbihTarget(t);
                      setTasbihCount(0);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                      tasbihTarget === t
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'glass-button text-slate-400'
                    }`}
                  >
                    {t}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quran' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {surahList.map((surah) => (
            <div key={surah.no} className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs font-mono">
                  {surah.no}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{surah.nama}</h4>
                  <p className="text-[11px] text-slate-400">{surah.arti} &bull; {surah.ayat} Ayat</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-arabic text-xl text-amber-300 block">{surah.arabic}</span>
                <span className="text-[10px] text-emerald-400 font-medium">Juz 30</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'doa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {doaList.map((doa, idx) => (
            <div key={idx} className="glass-panel rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {doa.kategori}
                </span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">{doa.judul}</h4>
              <p className="font-arabic text-xl sm:text-2xl text-amber-200 leading-loose text-right">
                {doa.arabic}
              </p>
              <p className="text-xs text-emerald-300/90 italic">{doa.latin}</p>
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-700/60">
                "{doa.arti}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
