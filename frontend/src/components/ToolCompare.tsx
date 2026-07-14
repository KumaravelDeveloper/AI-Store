import React from 'react';
import type { Tool } from '../types';

interface ToolCompareProps {
  compareList: Tool[];
  onRemove: (tool: Tool) => void;
  onClose: () => void;
}

export const ToolCompare: React.FC<ToolCompareProps> = ({ compareList, onRemove, onClose }) => {
  return (
    <div className="compare-overlay" onClick={onClose}>
      <div className="compare-modal glass-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="compare-modal-header">
          <h2 className="compare-modal-title">⚖️ Side-by-Side Comparison</h2>
          <button className="close-compare-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {compareList.length === 0 ? (
          <div className="compare-empty-state">
            <p>Select at least 2 tools on the discover grid to compare them here.</p>
          </div>
        ) : (
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="feature-col">Feature / Metric</th>
                  {compareList.map((tool) => (
                    <th key={tool.id} className="tool-col">
                      <div className="compare-tool-head">
                        <span className="compare-tool-logo">{tool.logo}</span>
                        <div className="compare-tool-name-group">
                          <span className="compare-tool-name">{tool.name}</span>
                          <button className="remove-tool-btn" onClick={() => onRemove(tool)}>
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feature-name">Rating</td>
                  {compareList.map((tool) => (
                    <td key={tool.id} className="feature-val rating-cell">
                      ⭐ {tool.rating.toFixed(1)} / 5.0
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-name">Pricing Model</td>
                  {compareList.map((tool) => (
                    <td key={tool.id} className="feature-val">
                      <span className={`badge badge-${tool.pricing_type}`}>{tool.pricing_type}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-name">Supported Platforms</td>
                  {compareList.map((tool) => (
                    <td key={tool.id} className="feature-val spec-text">
                      {tool.platform}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-name">Region Limits</td>
                  {compareList.map((tool) => (
                    <td key={tool.id} className="feature-val spec-text">
                      {tool.region_limited || 'No'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-name">Key Advantages (Pros)</td>
                  {compareList.map((tool) => (
                    <td key={tool.id} className="feature-val list-cell">
                      <ul className="compare-pros-list">
                        {tool.pros.slice(0, 3).map((pro, i) => (
                          <li key={i}>✅ {pro}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-name">Key Drawbacks (Cons)</td>
                  {compareList.map((tool) => (
                    <td key={tool.id} className="feature-val list-cell">
                      <ul className="compare-cons-list">
                        {tool.cons.slice(0, 3).map((con, i) => (
                          <li key={i}>❌ {con}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-name">Suggested Alternatives</td>
                  {compareList.map((tool) => (
                    <td key={tool.id} className="feature-val spec-text">
                      {tool.alternatives?.join(', ') || 'None'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-name">Website Link</td>
                  {compareList.map((tool) => (
                    <td key={tool.id} className="feature-val link-cell">
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm compare-visit-btn"
                      >
                        Visit Website 🚀
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
