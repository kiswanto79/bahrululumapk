import React from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  Home, 
  BookOpen, 
  QrCode, 
  BookmarkCheck, 
  Wallet, 
  Grid 
} from 'lucide-react';

interface BottomNavMobileProps {
  onOpenMenuDrawer: () => void;
}

export const BottomNavMobile: React.FC<BottomNavMobileProps> = ({ onOpenMenuDrawer }) => {
  const { activeTab, setActiveTab } = useMadrasah();

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'siakad', label: 'SIAKAD', icon: BookOpen },
    { id: 'absensi', label: 'Presensi', icon: QrCode, highlight: true },
    { id: 'tahfidz', label: 'Tahfidz', icon: BookmarkCheck },
    { id: 'keuangan', label: 'SPP/Kas', icon: Wallet },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 border-t border-white/10 px-2 py-1.5 shadow-2xl shadow-slate-950 pb-safe backdrop-blur-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto relative px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center -mt-5 group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all transform active:scale-90 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/40 scale-105 ring-4 ring-[#022c22]' 
                    : 'bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-emerald-950/80 ring-4 ring-[#022c22]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight ${isActive ? 'text-amber-400' : 'text-slate-300'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all relative focus:outline-none active:scale-95 ${
                isActive 
                  ? 'text-emerald-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 w-5 h-1 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* More Menu drawer trigger */}
        <button
          onClick={onOpenMenuDrawer}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all focus:outline-none active:scale-95 ${
            ['kartu', 'doaquran', 'manajemen'].includes(activeTab)
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
};
