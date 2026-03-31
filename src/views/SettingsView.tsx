import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Moon, Sun, Key, Download, Upload, Trash2, Info, Sparkles, LogIn, LogOut, Cloud } from 'lucide-react';
import { useToast } from '../components/Toast';
import { CATEGORY_NAMES } from '../utils/autoCategorize';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

export default function SettingsView({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { theme, geminiApiKey, defaultCategory } = store.state;
  const { user } = store;
  const { showToast } = useToast();
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleSaveApiKey = () => {
    store.updateSettings({ geminiApiKey: apiKeyInput });
    showToast('API Key saved successfully', 'success');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(store.state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `resourcevault-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast('Data exported successfully', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const success = await store.importData(data);
        if (success) {
          showToast('Data imported successfully', 'success');
        } else {
          showToast('Invalid backup file format', 'error');
        }
      } catch (err) {
        showToast('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (deleteConfirm === 'DELETE') {
      await store.clearAll();
      setDeleteConfirm('');
      showToast('All data cleared', 'info');
    } else {
      showToast('Type DELETE to confirm', 'error');
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully', 'success');
    } catch (error) {
      console.error('Sign in error:', error);
      showToast('Failed to sign in', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      store.clearLocalResources();
      showToast('Signed out successfully', 'success');
    } catch (error) {
      console.error('Sign out error:', error);
      showToast('Failed to sign out', 'error');
    }
  };

  return (
    <div className="h-full flex flex-col pt-8 pb-24 overflow-y-auto space-y-6 hide-scrollbar">
      <h1 className="text-[20px] font-semibold text-text-primary mb-2">Settings</h1>

      <section className="bg-bg-secondary rounded-[8px] p-5 border border-border-subtle">
        <h2 className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-4 flex items-center">
          <Cloud className="w-3.5 h-3.5 mr-1.5 text-accent" />
          Cloud Sync
        </h2>
        
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-border-subtle" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium text-[13px]">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <p className="text-[13px] font-medium text-text-primary leading-tight">{user.displayName || 'User'}</p>
                <p className="text-[11px] text-text-tertiary">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-bg-primary border border-border hover:bg-bg-tertiary text-text-secondary font-medium rounded-[6px] transition-colors text-[12px] flex items-center"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
              Sign in with Google to sync your resources across all your devices. Your data will be securely backed up to the cloud.
            </p>
            <button 
              onClick={handleSignIn}
              className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-[6px] transition-colors text-[13px] flex items-center justify-center border border-gray-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        )}
      </section>

      <section className="bg-bg-secondary rounded-[8px] p-5 border border-border-subtle">
        <h2 className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-text-primary">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-[14px] font-medium">Theme</span>
          </div>
          <select 
            value={theme}
            onChange={e => store.updateSettings({ theme: e.target.value as 'dark' | 'light' })}
            className="bg-bg-primary border border-border rounded-[6px] px-3 py-1.5 outline-none focus:border-accent appearance-none text-[13px] text-text-primary transition-colors"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </section>

      <section className="bg-bg-secondary rounded-[8px] p-5 border border-border-subtle space-y-5">
        <h2 className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent" />
          Smart Features
        </h2>
        
        <div>
          <label className="block text-[13px] font-medium text-text-primary mb-2 flex items-center">
            <Key className="w-3.5 h-3.5 mr-1.5 text-text-tertiary" />
            Gemini API Key (Optional)
          </label>
          <div className="flex space-x-2">
            <input 
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 p-2.5 bg-bg-primary border border-border rounded-[6px] outline-none focus:border-accent text-[14px] text-text-primary placeholder:text-text-tertiary transition-colors"
            />
            <button 
              onClick={handleSaveApiKey}
              className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-[6px] transition-colors text-[13px]"
            >
              Save
            </button>
          </div>
          <p className="text-[11px] text-text-tertiary mt-2 leading-relaxed">
            Enable smarter auto-categorization using Gemini. Your key is stored locally and never sent to our servers.
          </p>
        </div>

        <div className="pt-5 border-t border-border-subtle">
          <label className="block text-[13px] font-medium text-text-primary mb-2">Default Category</label>
          <select 
            value={defaultCategory}
            onChange={e => store.updateSettings({ defaultCategory: e.target.value })}
            className="w-full bg-bg-primary border border-border rounded-[6px] px-3 py-2.5 outline-none focus:border-accent appearance-none text-[14px] text-text-primary transition-colors"
          >
            {CATEGORY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </section>

      <section className="bg-bg-secondary rounded-[8px] p-5 border border-border-subtle space-y-5">
        <h2 className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px]">Data Management</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center p-2.5 bg-transparent border border-border hover:bg-bg-tertiary rounded-[6px] transition-colors text-[13px] font-medium text-text-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
          
          <label className="flex items-center justify-center p-2.5 bg-transparent border border-border hover:bg-bg-tertiary rounded-[6px] transition-colors text-[13px] font-medium text-text-secondary cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <div className="pt-5 border-t border-border-subtle">
          <label className="block text-[13px] font-medium text-danger mb-2">Danger Zone</label>
          <div className="flex space-x-2">
            <input 
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              className="flex-1 p-2.5 bg-bg-primary border border-danger/30 rounded-[6px] outline-none focus:border-danger text-[14px] text-danger placeholder:text-danger/50 transition-colors"
            />
            <button 
              onClick={handleClearAll}
              disabled={deleteConfirm !== 'DELETE'}
              className="px-4 py-2.5 bg-danger hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-[6px] transition-colors text-[13px] leading-[19.5px] flex items-center whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
          </div>
        </div>
      </section>

      <div className="text-center text-[11px] text-text-tertiary mt-8 flex items-center justify-center">
        <Info className="w-3.5 h-3.5 mr-1.5" />
        ResourceVault v1.0.0 • {user ? 'Cloud Sync Enabled' : '100% Local Storage'}
      </div>
    </div>
  );
}
