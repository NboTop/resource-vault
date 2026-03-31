import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Resource } from '../types';
import EditModal from './EditModal';
import { useAppStore } from '../store';
import { useToast } from './Toast';

export const ResourceCard = React.forwardRef<HTMLDivElement, { resource: Resource, store: ReturnType<typeof useAppStore> }>(
  ({ resource, store }, ref) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const { showToast } = useToast();

    const priorityColors = {
      High: 'bg-danger',
      Medium: 'bg-warning',
      Low: 'bg-success'
    };

    const handleComplete = (e: React.MouseEvent) => {
      e.stopPropagation();
      store.updateResource(resource.id, { status: 'Completed' });
      showToast('Marked as completed', 'success');
    };

    const timeAgo = (date: number) => {
      const seconds = Math.floor((Date.now() - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m ago";
      return Math.floor(seconds) + "s ago";
    };

    const isCompleted = resource.status === 'Completed';
    const isArchived = resource.status === 'Archived';

    return (
      <motion.div 
        ref={ref}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onClick={() => setIsEditOpen(true)}
        className={`bg-bg-secondary p-[14px_16px] rounded-[8px] border border-border-subtle hover:bg-bg-tertiary transition-colors duration-150 cursor-pointer relative group ${isArchived ? 'opacity-50' : ''}`}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center space-x-2 max-w-[80%]">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColors[resource.priority as keyof typeof priorityColors]}`} />
            <h3 className={`text-[14px] font-medium text-text-primary leading-tight truncate ${isCompleted ? 'line-through text-text-tertiary' : ''}`}>
              {resource.title}
            </h3>
          </div>
          <div className="flex items-center space-x-2 shrink-0 text-[13px] text-text-tertiary">
            <span className="truncate max-w-[80px]">{resource.category.split(' ')[0]}</span>
            <span>·</span>
            <span className="shrink-0">{timeAgo(resource.createdAt)}</span>
          </div>
        </div>
        
        {resource.url && (
          <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-[13px] text-accent hover:text-accent-hover flex items-center mb-2 truncate w-fit max-w-full transition-colors"
          >
            <span className="truncate">{resource.url.replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="w-3 h-3 ml-1.5 shrink-0" />
          </a>
        )}

        {resource.notes && (
          <p className="text-[13px] text-text-secondary line-clamp-2 mb-2">
            {resource.notes}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2">
          {resource.tags && resource.tags.map(tag => (
            <span key={tag} className="text-[11px] font-medium px-2 py-0.5 bg-tag-bg border border-tag-border text-text-secondary rounded-[4px]">
              {tag}
            </span>
          ))}
          {isCompleted && (
            <span className="text-[11px] font-medium px-2 py-0.5 border border-success text-success rounded-[4px]">
              Completed
            </span>
          )}
          {isArchived && (
            <span className="text-[11px] font-medium px-2 py-0.5 border border-border text-text-tertiary rounded-[4px]">
              Archived
            </span>
          )}
        </div>

        {!isCompleted && !isArchived && (
          <button 
            onClick={handleComplete}
            className="absolute top-3 right-3 p-1.5 bg-bg-primary border border-border rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-tertiary text-text-secondary hover:text-success"
            title="Mark as completed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}

        <EditModal 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          resource={resource} 
          store={store} 
        />
      </motion.div>
    );
  }
);

export default ResourceCard;
