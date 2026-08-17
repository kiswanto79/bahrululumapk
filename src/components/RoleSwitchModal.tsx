import React from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { UserRole } from '../types';
import { 
  X, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Users, 
  Check, 
  Sparkles,
  Lock
} from 'lucide-react';

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({ isOpen, onClose }) => {
  const { activeRole, switchRole, loginWithGoogle, currentUser } = useMadrasah();

  if (!isOpen) return null;

  const roles: { role: UserRole; title: string; subtitle: string; desc: string; icon: any; color: string; bg: string }[] = [
    {
      role: 'admin',
      title: 'Kepala Madrasah & Admin',
      subtitle: 'Akses Penuh / Super Admin',
      desc: 'Melihat semua data siswa, guru, keuangan kas & SPP, cetak kartu, rekap absensi, dan pengaturan madrasah.',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bg: 'from-amber-900/40 to-yellow-950/20 border-amber-500/40'
    },
    {
      role: 'guru',
      title: 'Ustadz & Guru Pengampu',
      subtitle: 'KBM & Ubudiyah',
      desc: 'Input nilai tugas & raport, jurnal mengajar, mutaba\'ah setoran tahfidz santri, dan absensi kelas.',
      icon: UserCheck,
      color: 'text-emerald-400',
      bg: 'from-emerald-900/40 to-teal-950/20 border-emerald-500/40'
    },
    {
      role: 'siswa',
      title: 'Santri & Siswa',
      subtitle: 'Akses Pembelajaran & Presensi',
      desc: 'Melihat jadwal pelajaran, presensi harian selfie/GPS, target hafalan Al-Qur\'an, E-KTS digital, dan nilai raport.',
      icon: GraduationCap,
      color: 'text-cyan-400',
      bg: 'from-cyan-900/40 to-blue-950/20 border-cyan-500/40'
    },
    {
      role: 'wali',
      title: 'Wali Santri / Orang Tua',
      subtitle: 'Monitoring Terpadu',
      desc: 'Memantau presensi kehadiran ananda secara real-time, perkembangan juz hafalan, tagihan SPP, dan pengumuman.',
      icon: Users,
      color: 'text-purple-400',
      bg: 'from-purple-900/40 to-fuchsia-950/20 border-purple-500/40'
    }
  ];

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel border border-white/20 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-button text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Ganti Peran Akses Aplikasi</h3>
            <p className="text-xs text-slate-400">Pilih simulasi peran pengguna madrasah</p>
          </div>
        </div>

        {/* Google Sign In with Firebase */}
        <div className="mb-5 p-3.5 rounded-2xl glass-panel-emerald border border-emerald-400/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Firebase Auth Aktif</p>
              <p className="text-[11px] text-emerald-300 font-mono truncate max-w-[180px] sm:max-w-[220px]">
                {currentUser.email || 'Belum login'}
              </p>
            </div>
          </div>
          <button
            onClick={loginWithGoogle}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shrink-0 shadow-md"
          >
            Google Sign-In
          </button>
        </div>

        {/* Roles List */}
        <div className="space-y-2.5">
          {roles.map((item) => {
            const Icon = item.icon;
            const isSelected = activeRole === item.role;

            return (
              <button
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected 
                    ? 'glass-panel-amber border-amber-400 shadow-xl ring-2 ring-amber-400/50' 
                    : 'glass-card border-white/10 hover:border-white/20 opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl glass-panel-subtle border border-white/10 flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded glass-panel-subtle text-slate-300 font-medium">
                        {item.subtitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-950/50">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-white/20 bg-white/5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400">
            Aplikasi mendukung multi-role real-time untuk memudahkan demonstrasi fitur.
          </p>
        </div>
      </div>
    </div>
  );
};
