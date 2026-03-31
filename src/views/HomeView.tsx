import React from 'react';
import { useAppStore } from '../store';
import ResourceCard from '../components/ResourceCard';
import { Target, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function HomeView({ store, onNavigate }: { store: ReturnType<typeof useAppStore>, onNavigate: (tab: string) => void }) {
  const { resources } = store.state;
  
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

  const thisWeeksFinds = resources.filter(r => r.createdAt > oneWeekAgo);
  const neverReviewed = resources.filter(r => r.createdAt < twoWeeksAgo && (r.status === 'Saved' || r.status === 'To Review'));
  const highPriorityPending = resources.filter(r => r.priority === 'High' && r.status !== 'Completed');
  
  const unreviewed = resources.filter(r => r.status === 'Saved' || r.status === 'To Review');
  const completed = resources.filter(r => r.status === 'Completed');
  
  const categoryCounts = resources.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = (Object.entries(categoryCounts) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const randomResource = resources.length > 0 ? resources[Math.floor(Math.random() * resources.length)] : null;

  return (
    <div className="space-y-6 pb-6">
      <header className="pt-8">
        <h1 className="text-[20px] font-semibold text-text-primary mb-2">Dashboard</h1>
        <p className="text-[13px] text-text-secondary">
          {resources.length} saved · {unreviewed.length} to review · {completed.length} completed
        </p>
      </header>

      <section>
        <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.5px] mb-3">
          Smart Collections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CollectionCard 
            title="This Week's Finds" 
            count={thisWeeksFinds.length} 
            onClick={() => onNavigate('browse')} 
          />
          <CollectionCard 
            title="Never Reviewed" 
            count={neverReviewed.length} 
            onClick={() => onNavigate('browse')} 
          />
          <CollectionCard 
            title="High Priority Pending" 
            count={highPriorityPending.length} 
            onClick={() => onNavigate('browse')} 
          />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.5px]">Top Categories</h2>
          <button onClick={() => onNavigate('browse')} className="text-[13px] font-medium text-accent hover:text-accent-hover transition-colors">View All</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {topCategories.map(([cat, count]) => (
            <div key={cat} onClick={() => onNavigate('browse')} className="bg-bg-secondary p-[14px_16px] rounded-[8px] border border-border-subtle flex items-center justify-between cursor-pointer hover:bg-bg-tertiary transition-colors duration-150">
              <span className="text-[13px] font-medium text-text-primary truncate mr-2">{cat}</span>
              <span className="text-[11px] font-medium text-text-secondary bg-tag-bg border border-tag-border px-2 py-0.5 rounded-[4px]">{count}</span>
            </div>
          ))}
          {topCategories.length === 0 && (
            <div className="col-span-2 text-center p-6 bg-bg-secondary rounded-[8px] border border-border-subtle text-text-secondary text-[13px]">
              No categories yet. Add some resources!
            </div>
          )}
        </div>
      </section>

      {randomResource && (
        <section>
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.5px] mb-3">
            Random Rediscovery
          </h2>
          <ResourceCard resource={randomResource} store={store} />
        </section>
      )}

      {highPriorityPending.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.5px] mb-3">Needs Attention</h2>
          <div className="space-y-3">
            {highPriorityPending.slice(0, 3).map(r => (
              <ResourceCard key={r.id} resource={r} store={store} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.5px] mb-3">Recently Added</h2>
        <div className="space-y-3">
          {resources.slice(0, 5).map(r => (
            <ResourceCard key={r.id} resource={r} store={store} />
          ))}
          {resources.length === 0 && (
            <div className="text-center p-8 bg-bg-secondary rounded-[8px] border border-border-subtle text-text-secondary text-[13px]">
              Your vault is empty. Tap the + button to start saving!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CollectionCard({ title, count, onClick }: { title: string, count: number, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-bg-secondary p-[14px_16px] rounded-[8px] border border-border-subtle cursor-pointer hover:bg-bg-tertiary transition-colors duration-150 flex items-center justify-between"
    >
      <div className="text-[14px] font-medium text-text-primary">{title}</div>
      <div className="text-[13px] font-medium text-text-secondary">{count}</div>
    </div>
  );
}
