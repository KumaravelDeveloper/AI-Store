import React from 'react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  user: { email: string } | null;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  compareCount: number;
  openCompareModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  theme,
  setTheme,
  user,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  compareCount,
  openCompareModal,
}) => {
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'discover', label: 'Discover', icon: '🌐' },
    { id: 'stacks', label: 'Workflows', icon: '⚙️' },
    { id: 'collections', label: 'Collections', icon: '📂' },
    { id: 'character', label: 'AI Helper', icon: '🎭' },
    { id: 'billing', label: 'Billing Plan', icon: '💳' },
    { id: 'submit', label: 'Suggest Tool', icon: '🚀' },
    { id: 'admin', label: 'Admin Panel', icon: '💼' },
  ];

  const logoSvg = (
    <svg className="ai-store-logo-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" stroke="url(#logo-grad)" strokeWidth="3" strokeDasharray="8 4" className="logo-outer-ring" />
      <path d="M35 50 C 35 35, 65 35, 65 50 C 65 65, 35 65, 35 50" stroke="url(#logo-grad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="logo-synapse-1" />
      <path d="M50 35 C 35 35, 35 65, 50 65 C 65 65, 65 35, 50 35" stroke="url(#logo-grad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="logo-synapse-2" />
      <circle cx="50" cy="50" r="7" fill="url(#logo-grad)" className="logo-nucleus" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <aside className={`app-sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        {!isCollapsed && (
          <div className="brand-logo" onClick={() => setCurrentTab('home')}>
            <span className="brand-logo-container">{logoSvg}</span>
            <span className="brand-name">
              AI <span className="brand-highlight">Store</span>
            </span>
          </div>
        )}
        {isCollapsed && (
          <span className="brand-logo-container collapsed-brand-logo" onClick={() => setCurrentTab('home')}>
            {logoSvg}
          </span>
        )}
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(item.id)}
            title={item.label}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {!isCollapsed && <span className="sidebar-link-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {compareCount > 0 && (
          <button
            className="sidebar-link compare-sidebar-btn"
            onClick={openCompareModal}
            title={`Compare ${compareCount} tools`}
          >
            <span className="sidebar-link-icon">⚖️</span>
            {!isCollapsed && (
              <span className="sidebar-link-label">
                Compare <span className="sidebar-badge-count">{compareCount}</span>
              </span>
            )}
          </button>
        )}

        <button className="sidebar-link" onClick={toggleTheme} title="Toggle Theme">
          <span className="sidebar-link-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!isCollapsed && <span className="sidebar-link-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <div className="sidebar-user-section">
          {user ? (
            <div className="user-profile-layout">
              <div className="user-avatar" title={user.email}>
                {user.email.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="user-details-group">
                  <span className="user-email-text">{user.email.split('@')[0]}</span>
                  <button className="logout-btn" onClick={onLogout}>
                    Sign Out 🚪
                  </button>
                </div>
              )}
              {isCollapsed && (
                <button className="logout-btn-collapsed" onClick={onLogout} title="Sign Out">
                  🚪
                </button>
              )}
            </div>
          ) : (
            <button className="sidebar-link login-trigger-btn" onClick={() => setCurrentTab('auth')} title="Sign In">
              <span className="sidebar-link-icon">🔑</span>
              {!isCollapsed && <span className="sidebar-link-label">Sign In</span>}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
