import React, { useState } from 'react';
import { Home, FolderOpen, Plus, Settings } from 'lucide-react';
import { useAppStore } from './store';
import HomeView from './views/HomeView';
import BrowseView from './views/BrowseView';
import SettingsView from './views/SettingsView';
import AddModal from './components/AddModal';
import { ToastProvider } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const store = useAppStore();

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-accent-subtle transition-colors duration-150">
        <main className="flex-1 overflow-y-auto pb-24 max-w-3xl mx-auto w-full px-4 sm:px-6">
          {activeTab === 'home' && <HomeView store={store} onNavigate={setActiveTab} />}
          {activeTab === 'browse' && <BrowseView store={store} />}
          {activeTab === 'settings' && <SettingsView store={store} />}
        </main>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-[72px] right-5 w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-[0_2px_12px_rgba(108,108,255,0.25)] hover:scale-105 transition-transform z-40"
        >
          <Plus className="w-6 h-6" />
        </button>

        <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border-subtle pb-safe z-40">
          <div className="flex justify-around items-center h-[52px] max-w-3xl mx-auto px-2">
            <NavItem icon={<Home />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavItem icon={<FolderOpen />} active={activeTab === 'browse'} onClick={() => setActiveTab('browse')} />
            <NavItem icon={<Settings />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </nav>

        <AddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} store={store} />
      </div>
    </ToastProvider>
  );
}

function NavItem({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-16 h-full transition-colors ${active ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'}`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5', strokeWidth: active ? 2.5 : 2 })}
      {active && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />}
    </button>
  );
}
