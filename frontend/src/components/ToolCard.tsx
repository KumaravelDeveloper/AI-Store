import React from 'react';
import type { Tool, Collection } from '../types';

interface ToolCardProps {
  tool: Tool;
  onViewDetails: (tool: Tool) => void;
  onToggleCompare: (tool: Tool) => void;
  isComparing: boolean;
  collections: Collection[];
  onSaveToCollection: (collectionId: number, toolId: number) => void;
  onRemoveFromCollection?: (collectionId: number, toolId: number) => void;
  activeCollectionId?: number | null;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onViewDetails,
  onToggleCompare,
  isComparing,
  collections,
  onSaveToCollection,
  onRemoveFromCollection,
  activeCollectionId,
}) => {
  const [showCollectionsDropdown, setShowCollectionsDropdown] = React.useState(false);

  const handleSaveClick = (colId: number) => {
    onSaveToCollection(colId, tool.id);
    setShowCollectionsDropdown(false);
  };

  const isUserCollection = (col: Collection) => !col.is_system;

  return (
    <div className="tool-card glass-panel animate-fade-in">
      <div className="tool-card-header">
        <div className="tool-logo-name" onClick={() => onViewDetails(tool)}>
          <span className="tool-card-logo">{tool.logo}</span>
          <div>
            <h3 className="tool-card-title">{tool.name}</h3>
            <span className={`badge badge-${tool.pricing_type}`}>{tool.pricing_type}</span>
          </div>
        </div>

        <div className="tool-rating-container">
          <span className="star-icon">⭐</span>
          <span className="tool-rating-val">{tool.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="tool-card-body" onClick={() => onViewDetails(tool)}>
        <p className="tool-card-description">{tool.short_description}</p>
        
        <div className="tool-meta-row">
          <span className="meta-label">Platforms:</span>
          <span className="meta-value">{tool.platform}</span>
        </div>

        <div className="tool-tags-container">
          {tool.tags?.map((tag, idx) => (
            <span key={idx} className="tool-tag-chip">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="tool-card-footer">
        <label className="compare-checkbox-label">
          <input
            type="checkbox"
            checked={isComparing}
            onChange={() => onToggleCompare(tool)}
            className="compare-checkbox"
          />
          <span>Compare</span>
        </label>

        <div className="action-buttons-group">
          {activeCollectionId && onRemoveFromCollection ? (
            <button
              className="btn btn-secondary btn-sm remove-collection-btn"
              onClick={() => onRemoveFromCollection(activeCollectionId, tool.id)}
              title="Remove from this collection"
            >
              🗑️ Remove
            </button>
          ) : (
            <div className="collection-dropdown-wrapper">
              <button
                className="btn btn-secondary btn-sm save-collection-trigger"
                onClick={() => setShowCollectionsDropdown(!showCollectionsDropdown)}
                title="Save to a collection"
              >
                💾 Save
              </button>
              {showCollectionsDropdown && (
                <div className="collection-dropdown-menu glass-panel">
                  <div className="dropdown-header">Save to Collection</div>
                  {collections.filter(isUserCollection).length === 0 ? (
                    <div className="dropdown-empty">No collections. Go to 'Collections' tab to create one.</div>
                  ) : (
                    collections
                      .filter(isUserCollection)
                      .map((col) => (
                        <button
                          key={col.id}
                          className="dropdown-item"
                          onClick={() => handleSaveClick(col.id)}
                        >
                          📂 {col.name}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          )}

          <button className="btn btn-primary btn-sm view-details-btn" onClick={() => onViewDetails(tool)}>
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
