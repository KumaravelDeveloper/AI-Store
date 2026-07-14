import React, { useState } from 'react';
import type { Collection, Tool } from '../types';
import { ToolCard } from './ToolCard';

interface CollectionViewProps {
  collections: Collection[];
  onAddCollection: (name: string, description: string) => void;
  onRemoveToolFromCollection: (collectionId: number, toolId: number) => void;
  onSaveToCollection: (collectionId: number, toolId: number) => void;
  onViewDetails: (tool: Tool) => void;
  onToggleCompare: (tool: Tool) => void;
  compareList: Tool[];
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  collections,
  onAddCollection,
  onRemoveToolFromCollection,
  onSaveToCollection,
  onViewDetails,
  onToggleCompare,
  compareList,
}) => {
  const [activeCollectionId, setActiveCollectionId] = useState<number | null>(null);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Set the first collection active by default if none is selected
  React.useEffect(() => {
    if (activeCollectionId === null && collections.length > 0) {
      setActiveCollectionId(collections[0].id);
    }
  }, [collections, activeCollectionId]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    onAddCollection(newColName, newColDesc);
    setNewColName('');
    setNewColDesc('');
    setShowCreateForm(false);
  };

  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  return (
    <div className="collections-container">
      <div className="collections-layout">
        {/* Sidebar displaying collections list */}
        <aside className="collections-sidebar glass-panel">
          <div className="sidebar-header">
            <h3 className="sidebar-title">📂 My Collections</h3>
            <button
              className="btn btn-primary btn-sm add-col-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? '✕ Cancel' : '➕ Create'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateSubmit} className="create-col-form animate-fade-in">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Collection Name"
                  className="form-control"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Short Description"
                  className="form-control"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  rows={2}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm submit-col-btn">
                Create Collection
              </button>
            </form>
          )}

          <div className="collections-list">
            <div className="list-group-label">System Stacks</div>
            {collections
              .filter((c) => c.is_system)
              .map((col) => (
                <button
                  key={col.id}
                  className={`collection-sidebar-item ${activeCollectionId === col.id ? 'active' : ''}`}
                  onClick={() => setActiveCollectionId(col.id)}
                >
                  ⭐ {col.name}
                </button>
              ))}

            <div className="list-group-label">Custom Playlists</div>
            {collections.filter((c) => !c.is_system).length === 0 ? (
              <div className="sidebar-empty-state">No custom collections yet.</div>
            ) : (
              collections
                .filter((c) => !c.is_system)
                .map((col) => (
                  <button
                    key={col.id}
                    className={`collection-sidebar-item ${activeCollectionId === col.id ? 'active' : ''}`}
                    onClick={() => setActiveCollectionId(col.id)}
                  >
                    📂 {col.name}
                  </button>
                ))
            )}
          </div>
        </aside>

        {/* Tools display of active collection */}
        <main className="collections-main">
          {activeCollection ? (
            <div className="active-collection-view">
              <div className="active-collection-header glass-panel">
                <span className="collection-icon-badge">
                  {activeCollection.is_system ? '⭐' : '📂'}
                </span>
                <div className="collection-meta">
                  <h2 className="active-collection-title">{activeCollection.name}</h2>
                  <p className="active-collection-desc">
                    {activeCollection.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {activeCollection.tools && activeCollection.tools.length === 0 ? (
                <div className="collection-tools-empty glass-panel">
                  <p>There are no tools saved to this collection yet.</p>
                  <p className="empty-sub">Explore the Discover tab and click Save to add tools here.</p>
                </div>
              ) : (
                <div className="grid-container">
                  {activeCollection.tools?.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onViewDetails={onViewDetails}
                      onToggleCompare={onToggleCompare}
                      isComparing={compareList.some((t) => t.id === tool.id)}
                      collections={collections}
                      onSaveToCollection={onSaveToCollection}
                      onRemoveFromCollection={onRemoveToolFromCollection}
                      activeCollectionId={activeCollectionId}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="collection-no-selection glass-panel">
              <p>Select a collection from the sidebar to view its tools.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
