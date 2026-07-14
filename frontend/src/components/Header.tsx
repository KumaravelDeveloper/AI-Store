import React from 'react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  compareCount: number;
  openCompareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  theme,
  setTheme,
  compareCount,
  openCompareModal,
}) => {
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navItems = [
    { id: 'discover', label: 'Discover' },
    { id: 'stacks', label: 'Workflows' },
    { id: 'collections', label: 'Collections' },
    { id: 'submit', label: 'Suggest Tool' },
    { id: 'admin', label: 'Admin Panel' },
  ];

  return (
    <header className="site-header glass-panel">
      <div className="header-container">
        <div className="logo-section" onClick={() => setCurrentTab('discover')}>
          <span className="logo-icon">🧭</span>
          <span className="logo-text">
            AI <span className="logo-highlight">Compass</span>
          </span>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          {compareCount > 0 && (
            <button className="compare-badge-btn btn btn-secondary btn-sm" onClick={openCompareModal}>
              ⚖️ Compare <span className="badge-count">{compareCount}</span>
            </button>
          )}

          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};
