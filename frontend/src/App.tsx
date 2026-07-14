import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SearchSection } from './components/SearchSection';
import { ToolCard } from './components/ToolCard';
import { ToolDetails } from './components/ToolDetails';
import { ToolCompare } from './components/ToolCompare';
import { ToolStackView } from './components/ToolStackView';
import { CollectionView } from './components/CollectionView';
import { SubmitForm } from './components/SubmitForm';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { CharacterCreator } from './components/CharacterCreator';
import { BillingDashboard } from './components/BillingDashboard';
import { GreetingBot } from './components/GreetingBot';
import type { Tool, Category, Stack, Collection, Submission } from './types';



const API_BASE = 'http://localhost:5000/api';

function App() {
  // Page Routing & Sidebar Collapse States
  const [hash, setHash] = useState(window.location.hash || '#/home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLoading, setIsLoading] = useState(false);

  // User Auth & Subscription states
  const [userToken, setUserToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string } | null>(() => {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<'trial' | 'premium'>('trial');
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [customCharacter, setCustomCharacter] = useState<any | null>(null);


  // Core Catalog Data Lists
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminStats, setAdminStats] = useState({
    totalTools: 0,
    pendingSubmissions: 0,
    totalCategories: 0,
    totalCollections: 0,
  });

  // Search Results & Active Selections
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchResultTools, setSearchResultTools] = useState<Tool[] | null>(null);
  const [customStack, setCustomStack] = useState<Stack | null>(null);
  
  // overlays & modals
  const [selectedToolForDetails, setSelectedToolForDetails] = useState<Tool | null>(null);
  const [compareList, setCompareList] = useState<Tool[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // ----------------------------------------------------
  // Hash Routing Listener Setup
  // ----------------------------------------------------

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/home');
    };
    window.addEventListener('hashchange', handleHashChange);
    
    // Force direct guest routing to auth page
    if (!userToken) {
      window.location.hash = '#/auth';
    } else if (!window.location.hash) {
      window.location.hash = '#/home';
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [userToken]);

  // Map Hash paths to navigation tabs
  const getTabFromHash = (): string => {
    if (!userToken) return 'auth';
    if (hash.startsWith('#/workflows')) return 'stacks';
    if (hash.startsWith('#/collections')) return 'collections';
    if (hash.startsWith('#/submit')) return 'submit';
    if (hash.startsWith('#/admin')) return 'admin';
    if (hash.startsWith('#/auth')) return 'auth';
    if (hash.startsWith('#/home')) return 'home';
    if (hash.startsWith('#/character')) return 'character';
    if (hash.startsWith('#/billing')) return 'billing';
    if (hash.startsWith('#/tool/')) return 'discover';
    return 'discover';
  };

  const navigateToHash = (tab: string) => {
    if (!userToken && tab !== 'auth') {
      window.location.hash = '#/auth';
      return;
    }
    const mapping: Record<string, string> = {
      home: '#/home',
      discover: '#/discover',
      stacks: '#/workflows',
      collections: '#/collections',
      character: '#/character',
      billing: '#/billing',
      submit: '#/submit',
      admin: '#/admin',
      auth: '#/auth',
    };
    window.location.hash = mapping[tab] || '#/home';
  };

  // Dedicated full-page view for tool details (reads hash param)
  useEffect(() => {
    if (hash.startsWith('#/tool/') && tools.length > 0) {
      const toolId = parseInt(hash.split('#/tool/')[1]);
      const matched = tools.find((t) => t.id === toolId);
      if (matched) {
        setSelectedToolForDetails(matched);
      }
    }
  }, [hash, tools]);

  // ----------------------------------------------------
  // API Authentication Headers Setup
  // ----------------------------------------------------

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }
    return headers;
  };

  // ----------------------------------------------------
  // Data Fetching Operations
  // ----------------------------------------------------

  const fetchTools = async (categorySlug: string | null = null) => {
    try {
      let url = `${API_BASE}/tools`;
      if (categorySlug) {
        url += `?category=${categorySlug}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setTools(data);
    } catch (e) {
      console.error('Error fetching tools:', e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const fetchStacks = async () => {
    try {
      const res = await fetch(`${API_BASE}/stacks`);
      const data = await res.json();
      setStacks(data);
    } catch (e) {
      console.error('Error fetching stacks:', e);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API_BASE}/collections`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setCollections(data);
    } catch (e) {
      console.error('Error fetching collections:', e);
    }
  };

  const fetchSubmissionsAndStats = async () => {
    try {
      const statsRes = await fetch(`${API_BASE}/admin/stats`);
      const statsData = await statsRes.json();
      setAdminStats(statsData);

      const subRes = await fetch(`${API_BASE}/admin/submissions`);
      const subData = await subRes.json();
      setSubmissions(subData);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  // Sync session profiles
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setSubscriptionStatus(parsed.subscription_status || 'trial');
        setTrialEndsAt(parsed.trial_ends_at || null);
        setCustomCharacter(parsed.custom_character || null);
      } catch (e) {
        console.error(e);
      }
    }
  }, [userToken]);

  const refetchUserProfile = async () => {
    if (!userToken) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptionStatus(data.subscription_status);
        setTrialEndsAt(data.trial_ends_at);
        setCustomCharacter(data.custom_character);

        const localUser = {
          id: data.id,
          email: data.email,
          subscription_status: data.subscription_status,
          trial_ends_at: data.trial_ends_at,
          custom_character: data.custom_character,
        };
        localStorage.setItem('user', JSON.stringify(localUser));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Initial fetches
  useEffect(() => {
    fetchTools();
    fetchCategories();
    fetchStacks();
    fetchCollections();
    fetchSubmissionsAndStats();

    if (userToken) {
      refetchUserProfile();
    }

    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, [userToken]); // Refetch collections and details when token changes

  // Fetch when category changes
  useEffect(() => {
    setSearchResultTools(null);
    setCustomStack(null);
    fetchTools(activeCategory);
  }, [activeCategory]);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // ----------------------------------------------------
  // Authentication & Session management
  // ----------------------------------------------------

  const handleLoginSuccess = (token: string, user: any) => {
    setUserToken(token);
    setCurrentUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setSubscriptionStatus(user.subscription_status || 'trial');
    setTrialEndsAt(user.trial_ends_at || null);
    setCustomCharacter(user.custom_character || null);
    navigateToHash('home');
  };

  const handleLogout = () => {
    setUserToken(null);
    setCurrentUser(null);
    setSubscriptionStatus('trial');
    setTrialEndsAt(null);
    setCustomCharacter(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigateToHash('auth');
  };

  // ----------------------------------------------------
  // Interactive catalog operations
  // ----------------------------------------------------

  const handleSearch = async (query: string, filters: { budget: string; platform: string }) => {
    if (!query.trim() && !filters.budget && !filters.platform) {
      setSearchResultTools(null);
      setCustomStack(null);
      fetchTools(activeCategory);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, skillLevel: 'beginner', ...filters }),
      });
      const data = await res.json();
      
      setSearchResultTools(data.tools);
      if (data.stack) {
        setCustomStack(data.stack);
        navigateToHash('stacks'); // route to workflows
      } else {
        setCustomStack(null);
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompare = (tool: Tool) => {
    if (compareList.some((t) => t.id === tool.id)) {
      setCompareList(compareList.filter((t) => t.id !== tool.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 tools side-by-side.');
        return;
      }
      setCompareList([...compareList, tool]);
    }
  };

  const handleSaveToCollection = async (collectionId: number, toolId: number) => {
    if (!userToken) {
      alert('Please Sign In to save tools to custom collections!');
      navigateToHash('auth');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/collections/${collectionId}/tools`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ toolId }),
      });
      if (res.ok) {
        alert('Tool saved to collection!');
        fetchCollections();
      }
    } catch (e) {
      console.error('Error saving to collection:', e);
    }
  };

  const handleRemoveToolFromCollection = async (collectionId: number, toolId: number) => {
    try {
      const res = await fetch(`${API_BASE}/collections/${collectionId}/tools/${toolId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchCollections();
      }
    } catch (e) {
      console.error('Error removing tool from collection:', e);
    }
  };

  const handleAddCollection = async (name: string, description: string) => {
    if (!userToken) {
      alert('Please Sign In to create a collection!');
      navigateToHash('auth');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/collections`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        fetchCollections();
      }
    } catch (e) {
      console.error('Error creating collection:', e);
    }
  };

  const handleSubmitSuggestion = async (formData: any) => {
    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchSubmissionsAndStats();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Submission error:', e);
      return false;
    }
  };

  // ----------------------------------------------------
  // Admin dashboard curation operations
  // ----------------------------------------------------

  const handleApproveSubmission = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        fetchTools(activeCategory);
        fetchSubmissionsAndStats();
      }
    } catch (e) {
      console.error('Error approving submission:', e);
    }
  };

  const handleRejectSubmission = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (res.ok) {
        fetchSubmissionsAndStats();
      }
    } catch (e) {
      console.error('Error rejecting submission:', e);
    }
  };

  const handleAddTool = async (toolData: any) => {
    try {
      const res = await fetch(`${API_BASE}/admin/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData),
      });
      if (res.ok) {
        fetchTools(activeCategory);
        fetchSubmissionsAndStats();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error adding tool manually:', e);
      return false;
    }
  };

  const handleDeleteTool = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/tools/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTools(activeCategory);
        fetchSubmissionsAndStats();
      }
    } catch (e) {
      console.error('Error deleting tool:', e);
    }
  };

  // ----------------------------------------------------
  // Template coordination rendering
  // ----------------------------------------------------

  const displayedTools = searchResultTools !== null ? searchResultTools : tools;
  const currentTab = getTabFromHash();

  const handleViewDetails = (tool: Tool) => {
    window.location.hash = `#/tool/${tool.id}`;
  };

  const handleCloseDetails = () => {
    // Navigate back to previous listing page hash
    navigateToHash(currentTab);
    setSelectedToolForDetails(null);
  };

  return (
    <div className={`app-container sidebar-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={navigateToHash}
        theme={theme}
        setTheme={handleThemeChange}
        user={currentUser}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        compareCount={compareList.length}
        openCompareModal={() => setIsCompareOpen(true)}
      />

      <div className="page-wrapper-main">
        <main className="main-content">
          {currentTab === 'home' && (
            <HomePage
              onNavigateToCatalog={() => navigateToHash('discover')}
              onNavigateToWorkflows={() => navigateToHash('stacks')}
            />
          )}

          {currentTab === 'discover' && (
            <div className="discover-tab-flow">
              <SearchSection
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                onSearch={handleSearch}
                isLoading={isLoading}
              />

              <div className="tools-catalog-list" style={{ marginTop: '32px' }}>
                <div className="catalog-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className="catalog-section-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    {searchResultTools !== null ? '🔍 Search Results' : '✨ Featured AI Tools'}
                  </h2>
                  <span className="catalog-results-count" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Showing {displayedTools.length} tools
                  </span>
                </div>

                {displayedTools.length === 0 ? (
                  <div className="catalog-empty glass-panel text-center animate-fade-in" style={{ padding: '48px', color: 'var(--text-secondary)' }}>
                    <p>No tools matched your active search query or categories.</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      Try searching for another keyword, clearing filters, or requesting custom stacks.
                    </p>
                  </div>
                ) : (
                  <div className="grid-container">
                    {displayedTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onViewDetails={handleViewDetails}
                        onToggleCompare={handleToggleCompare}
                        isComparing={compareList.some((t) => t.id === tool.id)}
                        collections={collections}
                        onSaveToCollection={handleSaveToCollection}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === 'stacks' && (
            <ToolStackView
              stacks={stacks}
              customStack={customStack}
              onViewToolDetailsByName={(name) => {
                const matched = tools.find((t) => t.name.toLowerCase() === name.toLowerCase());
                if (matched) handleViewDetails(matched);
              }}
            />
          )}

          {currentTab === 'collections' && (
            <CollectionView
              collections={collections}
              onAddCollection={handleAddCollection}
              onRemoveToolFromCollection={handleRemoveToolFromCollection}
              onSaveToCollection={handleSaveToCollection}
              onViewDetails={handleViewDetails}
              onToggleCompare={handleToggleCompare}
              compareList={compareList}
            />
          )}

          {currentTab === 'submit' && (
            <SubmitForm onSubmitSuggestion={handleSubmitSuggestion} />
          )}

          {currentTab === 'admin' && (
            <AdminDashboard
              stats={adminStats}
              submissions={submissions}
              toolsList={tools}
              onApproveSubmission={handleApproveSubmission}
              onRejectSubmission={handleRejectSubmission}
              onAddTool={handleAddTool}
              onDeleteTool={handleDeleteTool}
            />
          )}

          {currentTab === 'auth' && (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              setCurrentTab={navigateToHash}
            />
          )}

          {currentTab === 'character' && (
            <CharacterCreator
              token={userToken}
              currentCharacter={customCharacter}
              onSaveCharacter={(char) => {
                setCustomCharacter(char);
                refetchUserProfile();
              }}
            />
          )}

          {currentTab === 'billing' && (
            <BillingDashboard
              token={userToken}
              subscriptionStatus={subscriptionStatus}
              trialEndsAt={trialEndsAt}
              onUpgradeSuccess={() => {
                refetchUserProfile();
              }}
            />
          )}
        </main>
      </div>

      {/* Tool Details Sidebar Drawer overlay */}
      {selectedToolForDetails && (
        <ToolDetails
          tool={selectedToolForDetails}
          onClose={handleCloseDetails}
          onSelectAlternative={(altName) => {
            const matched = tools.find((t) => t.name.toLowerCase() === altName.toLowerCase());
            if (matched) handleViewDetails(matched);
          }}
          customCharacter={customCharacter}
        />
      )}

      {/* Compare Tray Sidebar Overlay */}
      {isCompareOpen && (
        <ToolCompare
          compareList={compareList}
          onRemove={handleToggleCompare}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {/* Floating Personal Guide Bot */}
      {userToken && (
        <GreetingBot
          user={{
            email: currentUser?.email || '',
            subscription_status: subscriptionStatus,
            custom_character: customCharacter,
          }}
          navigateToTab={navigateToHash}
        />
      )}
    </div>
  );
}

export default App;
