import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store';
import ResourceCard from '../components/ResourceCard';
import { Filter, Search, ArrowDownWideNarrow } from 'lucide-react';
import { CATEGORY_NAMES } from '../utils/autoCategorize';

export default function BrowseView({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { resources } = store.state;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'az'>('newest');

  const filteredResources = useMemo(() => {
    let result = [...resources];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.notes?.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== 'All') {
      result = result.filter(r => r.category === activeCategory);
    }
    
    if (activeStatus !== 'All') {
      result = result.filter(r => r.status === activeStatus);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'priority') {
        const pMap = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return 0;
    });

    return result;
  }, [resources, searchQuery, activeCategory, activeStatus, sortBy]);

  return (
    <div className="h-full flex flex-col pt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[20px] font-semibold text-text-primary">Browse</h1>
      </div>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search resources, tags, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-[6px] py-[10px] pl-9 pr-3 text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar space-x-2">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`shrink-0 px-3 py-1.5 rounded-[6px] text-[13px] font-medium border transition-colors flex items-center ${
              activeCategory === 'All' 
                ? 'bg-accent-subtle border-accent text-accent' 
                : 'bg-transparent border-border text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            All Categories
          </button>
          {CATEGORY_NAMES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-[6px] text-[13px] font-medium border transition-colors flex items-center ${
                activeCategory === cat 
                  ? 'bg-accent-subtle border-accent text-accent' 
                  : 'bg-transparent border-border text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <select 
              value={activeStatus}
              onChange={e => setActiveStatus(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-[6px] py-[8px] pl-8 pr-8 text-[13px] text-text-secondary appearance-none focus:outline-none focus:border-accent transition-colors h-[36px]"
            >
              <option value="All">All Statuses</option>
              <option value="Saved">Saved</option>
              <option value="To Review">To Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="relative flex-1">
            <ArrowDownWideNarrow className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <select 
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-bg-primary border border-border rounded-[6px] py-[8px] pl-8 pr-8 text-[13px] text-text-secondary appearance-none focus:outline-none focus:border-accent transition-colors h-[36px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="az">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 space-y-3 hide-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} store={store} />
          ))}
        </AnimatePresence>
        
        {filteredResources.length === 0 && (
          <div className="col-span-2 text-center p-8 text-text-secondary text-[13px] mt-10">
            <Filter className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p>No resources found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
