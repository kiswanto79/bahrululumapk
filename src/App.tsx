import React, { useState } from 'react';
import { MadrasahProvider, useMadrasah } from './context/MadrasahContext';
import { SidebarDesktop } from './components/SidebarDesktop';
import { NavbarTop } from './components/NavbarTop';
import { BottomNavMobile } from './components/BottomNavMobile';
import { MobileDrawer } from './components/MobileDrawer';
import { DashboardView } from './components/DashboardView';
import { KartuView } from './components/KartuView';
import { DoaQuranView } from './components/DoaQuranView';
import { SiakadView } from './components/SiakadView';
import { TahfidzView } from './components/TahfidzView';
import { AbsensiView } from './components/AbsensiView';
import { KeuanganView } from './components/KeuanganView';
import { ManajemenView } from './components/ManajemenView';
import { TabunganView } from './components/TabunganView';
import { KoperasiView } from './components/KoperasiView';
import { GoogleSheetsView } from './components/GoogleSheetsView';
import { NotificationModal } from './components/NotificationModal';
import { RoleSwitchModal } from './components/RoleSwitchModal';
import { ResetDataModal } from './components/ResetDataModal';

const MainLayout: React.FC = () => {
  const { activeTab, isResetModalOpen, setIsResetModalOpen } = useMadrasah();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenRoleModal={() => setIsRoleModalOpen(true)} />;
      case 'kartu':
        return <KartuView />;
      case 'doaquran':
      case 'doa-quran':
        return <DoaQuranView />;
      case 'siakad':
        return <SiakadView />;
      case 'tahfidz':
        return <TahfidzView />;
      case 'absensi':
        return <AbsensiView />;
      case 'keuangan':
        return <KeuanganView />;
      case 'tabungan':
        return <TabunganView />;
      case 'koperasi':
      case 'pos':
        return <KoperasiView />;
      case 'sheets':
      case 'googlesheets':
      case 'google-sheets':
        return <GoogleSheetsView />;
      case 'manajemen':
        return <ManajemenView />;
      default:
        return <DashboardView onOpenRoleModal={() => setIsRoleModalOpen(true)} />;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-[#022c22] text-slate-100 font-sans overflow-hidden select-none relative">
      {/* Background Decorative Ambient Blurs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      {/* Desktop Sidebar (hidden on mobile, visible on lg+) */}
      <SidebarDesktop 
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 min-w-0">
        {/* Top Navigation */}
        <NavbarTop 
          onOpenNotif={() => setIsNotifOpen(true)}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onToggleSidebar={() => setIsDrawerOpen(true)}
        />

        {/* View Content Container with Smooth Scroll & Mobile Safe Padding */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 pb-28 lg:pb-8 no-scrollbar touch-pan-y">
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNavMobile 
          onOpenMenuDrawer={() => setIsDrawerOpen(true)}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenNotif={() => setIsNotifOpen(true)}
      />

      {/* Modals */}
      <NotificationModal 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
      />

      <RoleSwitchModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
      />

      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <MadrasahProvider>
      <MainLayout />
    </MadrasahProvider>
  );
}
