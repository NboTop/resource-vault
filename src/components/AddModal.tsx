import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, ListPlus, Type, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store';
import { processInput, categorizeWithGemini } from '../utils/autoCategorize';
import { useToast } from './Toast';
import EditModal from './EditModal';
import { Resource } from '../types';

export default function AddModal({ isOpen, onClose, store }: { isOpen: boolean, onClose: () => void, store: ReturnType<typeof useAppStore> }) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [duplicateFound, setDuplicateFound] = useState<Resource | null>(null);
  const { showToast } = useToast();
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const createResource = async (inputText: string, skipDuplicateCheck = false) => {
    const urlMatch = inputText.match(/(https?:\/\/[^\s]+)/g);
    if (urlMatch && !skipDuplicateCheck) {
      const existing = store.state.resources.find(r => r.url === urlMatch[0]);
      if (existing) {
        return { duplicate: existing };
      }
    }

    let resourceData: Partial<Resource> = {};
    
    if (store.state.geminiApiKey) {
      const aiData = await categorizeWithGemini(inputText, store.state.geminiApiKey);
      if (aiData) {
        resourceData = { ...processInput(inputText, store.state.defaultCategory), ...aiData };
      } else {
        resourceData = processInput(inputText, store.state.defaultCategory);
      }
    } else {
      resourceData = processInput(inputText, store.state.defaultCategory);
    }

    const newResource: Resource = {
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
      title: resourceData.title || 'Untitled',
      url: resourceData.url || null,
      category: resourceData.category || '⭐ Uncategorized',
      tags: resourceData.tags || [],
      priority: resourceData.priority || 'Medium',
      source: resourceData.source || '🌐 Web',
      notes: resourceData.notes || '',
      status: 'Saved',
      isAiCategorized: resourceData.isAiCategorized
    };

    return { resource: newResource };
  };

  const handleSave = async (forceSave = false) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setDuplicateFound(null);

    if (isBulkMode) {
      const lines = text.split('\n').filter(l => l.trim());
      const results: Resource[] = [];
      const categories: Record<string, number> = {};

      for (const line of lines) {
        const { resource } = await createResource(line, true);
        if (resource) {
          store.addResource(resource);
          results.push(resource);
          categories[resource.category] = (categories[resource.category] || 0) + 1;
        }
      }

      setIsProcessing(false);
      setText('');
      onClose();

      const summary = Object.entries(categories).map(([cat, count]) => `${count} in ${cat}`).join(', ');
      showToast(`Bulk saved ${results.length} items: ${summary}`, 'success');
      return;
    }

    const { resource, duplicate } = await createResource(text, forceSave);

    if (duplicate && !forceSave) {
      setDuplicateFound(duplicate);
      setIsProcessing(false);
      return;
    }

    if (resource) {
      store.addResource(resource);
      setIsProcessing(false);
      setText('');
      onClose();

      showToast(`Saved to ${resource.category}`, 'success', {
        label: 'Edit',
        onClick: () => {
          setEditingResource(resource);
        }
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-bg-secondary rounded-t-[12px] z-50 p-5 pb-safe max-w-3xl mx-auto"
            >
              <div className="w-[36px] h-[4px] bg-border rounded-full mx-auto mb-4" />
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-[16px] font-semibold text-text-primary flex items-center">
                    {isBulkMode ? 'Bulk Paste' : 'Quick Add'}
                    {store.state.geminiApiKey && <Sparkles className="w-4 h-4 ml-2 text-accent" />}
                  </h2>
                  <button 
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors border ${
                      isBulkMode 
                        ? 'bg-accent-subtle border-accent text-accent' 
                        : 'bg-transparent border-border text-text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    {isBulkMode ? <ListPlus className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                    {isBulkMode ? 'Bulk Mode' : 'Single Mode'}
                  </button>
                </div>
                <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {duplicateFound ? (
                <div className="bg-bg-tertiary border border-warning/30 rounded-[8px] p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-text-primary text-[14px]">Duplicate Detected</h3>
                      <p className="text-[13px] text-text-secondary mt-1">
                        This URL was already saved on {new Date(duplicateFound.createdAt).toLocaleDateString()}.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => {
                            onClose();
                            setEditingResource(duplicateFound);
                          }}
                          className="text-[13px] font-medium bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-[6px] transition-colors"
                        >
                          View Existing
                        </button>
                        <button 
                          onClick={() => handleSave(true)}
                          className="text-[13px] font-medium bg-transparent border border-border text-text-secondary hover:bg-bg-tertiary px-3 py-1.5 rounded-[6px] transition-colors"
                        >
                          Save Anyway
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={isBulkMode ? "Paste multiple URLs, one per line..." : "Paste a link, drop some text, or just describe what you found..."}
                  className="w-full h-32 p-3 bg-bg-primary border border-border rounded-[6px] resize-none focus:outline-none focus:border-accent text-[14px] text-text-primary placeholder:text-text-tertiary transition-colors"
                  autoFocus
                />
              )}
              
              {!duplicateFound && (
                <button
                  onClick={() => handleSave()}
                  disabled={!text.trim() || isProcessing}
                  className="w-full mt-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-[6px] flex items-center justify-center transition-colors"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : isBulkMode ? 'Process Bulk List' : 'Save Resource'}
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {editingResource && (
        <EditModal 
          isOpen={!!editingResource} 
          onClose={() => setEditingResource(null)} 
          resource={editingResource} 
          store={store} 
        />
      )}
    </>
  );
}
