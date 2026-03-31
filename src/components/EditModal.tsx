import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2 } from 'lucide-react';
import { Resource, Priority, Status } from '../types';
import { useAppStore } from '../store';
import { useToast } from './Toast';
import { CATEGORY_NAMES } from '../utils/autoCategorize';

export default function EditModal({ isOpen, onClose, resource, store }: { isOpen: boolean, onClose: () => void, resource: Resource, store: ReturnType<typeof useAppStore> }) {
  const [formData, setFormData] = useState<Resource>(resource);
  const { showToast } = useToast();

  useEffect(() => {
    setFormData(resource);
  }, [resource]);

  const handleChange = (field: keyof Resource, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    store.updateResource(resource.id, formData);
    showToast('Resource updated', 'success');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      store.deleteResource(resource.id);
      showToast('Resource deleted', 'info');
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 h-[85vh] bg-bg-secondary rounded-t-[12px] z-[60] flex flex-col shadow-2xl max-w-3xl mx-auto"
          >
            <div className="pt-4 pb-2 flex justify-center shrink-0">
              <div className="w-[36px] h-[4px] bg-border rounded-full" />
            </div>
            
            <div className="flex justify-between items-center px-5 pb-4 border-b border-border-subtle shrink-0">
              <h2 className="text-[16px] font-semibold text-text-primary">Edit Resource</h2>
              <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-1.5">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => handleChange('title', e.target.value)}
                  className="w-full p-2.5 bg-bg-primary border border-border rounded-[6px] outline-none focus:border-accent text-[14px] text-text-primary transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-1.5">URL</label>
                <input 
                  type="url" 
                  value={formData.url || ''} 
                  onChange={e => handleChange('url', e.target.value)}
                  className="w-full p-2.5 bg-bg-primary border border-border rounded-[6px] outline-none focus:border-accent text-[14px] text-text-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-1.5">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => handleChange('category', e.target.value)}
                    className="w-full p-2.5 bg-bg-primary border border-border rounded-[6px] outline-none focus:border-accent text-[14px] text-text-primary appearance-none transition-colors"
                  >
                    {CATEGORY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-1.5">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={e => handleChange('priority', e.target.value as Priority)}
                    className="w-full p-2.5 bg-bg-primary border border-border rounded-[6px] outline-none focus:border-accent text-[14px] text-text-primary appearance-none transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value as Status)}
                    className="w-full p-2.5 bg-bg-primary border border-border rounded-[6px] outline-none focus:border-accent text-[14px] text-text-primary appearance-none transition-colors"
                  >
                    <option value="Saved">Saved</option>
                    <option value="To Review">To Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-1.5">Source</label>
                  <input 
                    type="text" 
                    value={formData.source} 
                    onChange={e => handleChange('source', e.target.value)}
                    className="w-full p-2.5 bg-bg-primary border border-border rounded-[6px] outline-none focus:border-accent text-[14px] text-text-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-1.5">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.tags.join(', ')} 
                  onChange={e => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  className="w-full p-2.5 bg-bg-primary border border-border rounded-[6px] outline-none focus:border-accent text-[14px] text-text-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-[0.5px] mb-1.5">Notes</label>
                <textarea 
                  value={formData.notes} 
                  onChange={e => handleChange('notes', e.target.value)}
                  className="w-full h-24 p-2.5 bg-bg-primary border border-border rounded-[6px] resize-none outline-none focus:border-accent text-[14px] text-text-primary transition-colors"
                />
              </div>
            </div>

            <div className="p-5 border-t border-border-subtle flex space-x-3 pb-safe shrink-0">
              <button 
                onClick={handleDelete}
                className="p-2.5 text-danger bg-transparent border border-border hover:bg-bg-tertiary rounded-[6px] transition-colors"
                title="Delete Resource"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-medium rounded-[6px] flex items-center justify-center transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}
