import React, { useState } from 'react';
import type { Submission, Tool } from '../types';


interface AdminDashboardProps {
  stats: {
    totalTools: number;
    pendingSubmissions: number;
    totalCategories: number;
    totalCollections: number;
  };
  submissions: Submission[];
  toolsList: Tool[];
  onApproveSubmission: (id: number) => void;
  onRejectSubmission: (id: number) => void;
  onAddTool: (toolData: any) => Promise<boolean>;
  onDeleteTool: (id: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  submissions,
  toolsList,
  onApproveSubmission,
  onRejectSubmission,
  onAddTool,
  onDeleteTool,
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'tools' | 'add'>('submissions');
  
  // Add tool form state
  const [newTool, setNewTool] = useState({
    name: '',
    logo: '🔧',
    short_description: '',
    long_description: '',
    pricing_type: 'free',
    platform: 'Web',
    website_url: '',
    rating: 4.5,
    region_limited: 'No',
    featured: false,
    categories: '',
    tags: '',
    use_cases: '',
  });

  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTool.name || !newTool.short_description || !newTool.website_url) {
      setFormError('Please fill in required fields (Name, Short Description, Website URL).');
      return;
    }

    const payload = {
      ...newTool,
      categories: newTool.categories.split(',').map((c) => c.trim()).filter(Boolean),
      tags: newTool.tags.split(',').map((t) => t.trim()).filter(Boolean),
      use_cases: newTool.use_cases.split(',').map((u) => u.trim()).filter(Boolean),
      pros: ['Fast response', 'Easy layout', 'Great dashboard integrations'],
      cons: ['Limited details', 'Basic outputs'],
      alternatives: [],
    };

    const isOk = await onAddTool(payload);
    if (isOk) {
      setFormSuccess(true);
      setFormError('');
      setNewTool({
        name: '',
        logo: '🔧',
        short_description: '',
        long_description: '',
        pricing_type: 'free',
        platform: 'Web',
        website_url: '',
        rating: 4.5,
        region_limited: 'No',
        featured: false,
        categories: '',
        tags: '',
        use_cases: '',
      });
    } else {
      setFormError('Failed to add tool. Please verify if database connection is open.');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-hero">
        <h2 className="admin-title">💼 Admin Management Dashboard</h2>
        <p className="admin-subtitle">Manage user suggestions, add/edit listing directory nodes, and view catalog sizes.</p>
      </div>

      {/* Stats Board */}
      <div className="stats-board">
        <div className="stat-card glass-panel">
          <span className="stat-num">{stats.totalTools}</span>
          <span className="stat-label">Active Approved Tools</span>
        </div>
        <div className="stat-card glass-panel highlight-stat">
          <span className="stat-num">{stats.pendingSubmissions}</span>
          <span className="stat-label">Pending Submissions</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="stat-num">{stats.totalCategories}</span>
          <span className="stat-label">Total Categories</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="stat-num">{stats.totalCollections}</span>
          <span className="stat-label">Saved Collections</span>
        </div>
      </div>

      {/* Admin Tabs Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('submissions');
            setFormSuccess(false);
          }}
        >
          📥 Pending Submissions ({submissions.filter((s) => s.status === 'pending').length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('tools');
            setFormSuccess(false);
          }}
        >
          📂 Active Catalog Directory ({toolsList.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('add');
            setFormSuccess(false);
          }}
        >
          ➕ Add Tool Manually
        </button>
      </div>

      <div className="admin-tab-content">
        {activeTab === 'submissions' && (
          <div className="admin-submissions-section animate-fade-in">
            {submissions.filter((s) => s.status === 'pending').length === 0 ? (
              <div className="admin-empty-state glass-panel">
                <p>No pending suggestions right now. Excellent work! ✨</p>
              </div>
            ) : (
              <div className="submissions-list-table">
                {submissions
                  .filter((s) => s.status === 'pending')
                  .map((sub) => (
                    <div key={sub.id} className="submission-row-card glass-panel">
                      <div className="sub-row-header">
                        <h4 className="sub-tool-name">{sub.name}</h4>
                        <span className="sub-tool-email">Submitted by: {sub.email}</span>
                      </div>
                      <p className="sub-tool-desc">{sub.description}</p>
                      <div className="sub-tool-meta">
                        <span>🔗 <a href={sub.website_url} target="_blank" rel="noreferrer">{sub.website_url}</a></span>
                        <span>💰 Pricing: {sub.pricing_type}</span>
                        <span>💻 Platform: {sub.platform}</span>
                        <span>📂 Categories: {sub.categories}</span>
                      </div>
                      <div className="sub-row-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onRejectSubmission(sub.id)}
                        >
                          ❌ Reject / Dismiss
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onApproveSubmission(sub.id)}
                        >
                          ✅ Approve & Publish
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="admin-catalog-section animate-fade-in">
            <div className="catalog-table-wrapper glass-panel">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Name</th>
                    <th>Pricing</th>
                    <th>Platform</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {toolsList.map((t) => (
                    <tr key={t.id}>
                      <td className="catalog-logo">{t.logo}</td>
                      <td className="catalog-name">
                        <a href={t.website_url} target="_blank" rel="noreferrer" className="catalog-link">
                          {t.name}
                        </a>
                      </td>
                      <td className="catalog-price">
                        <span className={`badge badge-${t.pricing_type}`}>{t.pricing_type}</span>
                      </td>
                      <td>{t.platform}</td>
                      <td>⭐ {t.rating.toFixed(1)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm delete-catalog-btn"
                          onClick={() => onDeleteTool(t.id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="admin-add-section animate-fade-in">
            <div className="admin-form-wrapper glass-panel">
              {formSuccess && (
                <div className="form-success-alert animate-fade-in" style={{ padding: '16px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
                  🎉 Tool added to the directory catalog successfully!
                </div>
              )}
              {formError && <div className="form-error-alert">⚠️ {formError}</div>}

              <form onSubmit={handleAddSubmit} className="admin-add-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Tool Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newTool.name}
                      onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Website URL *</label>
                    <input
                      type="url"
                      className="form-control"
                      value={newTool.website_url}
                      onChange={(e) => setNewTool({ ...newTool, website_url: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Logo Emoji</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newTool.logo}
                      onChange={(e) => setNewTool({ ...newTool, logo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pricing Type</label>
                    <select
                      className="form-control"
                      value={newTool.pricing_type}
                      onChange={(e) => setNewTool({ ...newTool, pricing_type: e.target.value })}
                    >
                      <option value="free">Free</option>
                      <option value="freemium">Freemium</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Platform (Web, Desktop, Mobile, Extension)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newTool.platform}
                      onChange={(e) => setNewTool({ ...newTool, platform: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rating (1.0 - 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      className="form-control"
                      value={newTool.rating}
                      onChange={(e) => setNewTool({ ...newTool, rating: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Region Limited (e.g. No, Yes - China)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newTool.region_limited}
                      onChange={(e) => setNewTool({ ...newTool, region_limited: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Categories (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Writing, Coding, Design"
                      value={newTool.categories}
                      onChange={(e) => setNewTool({ ...newTool, categories: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Use cases (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="write code, edit a video, generate images"
                      value={newTool.use_cases}
                      onChange={(e) => setNewTool({ ...newTool, use_cases: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Short Description *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newTool.short_description}
                      onChange={(e) => setNewTool({ ...newTool, short_description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Long Description</label>
                    <textarea
                      className="form-control"
                      value={newTool.long_description}
                      onChange={(e) => setNewTool({ ...newTool, long_description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="submit-footer">
                  <button type="submit" className="btn btn-primary">
                    Create & Add Tool
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
