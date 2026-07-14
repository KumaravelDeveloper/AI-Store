-- SQLite Database Schema for AI Compass

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
);

-- Tools table
CREATE TABLE IF NOT EXISTS tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    logo TEXT NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    pricing_type TEXT NOT NULL CHECK(pricing_type IN ('free', 'freemium', 'paid')),
    platform TEXT NOT NULL, -- comma-separated: web, desktop, mobile, extension, api
    website_url TEXT NOT NULL,
    rating REAL DEFAULT 4.0,
    pros TEXT NOT NULL, -- JSON array of strings
    cons TEXT NOT NULL, -- JSON array of strings
    alternatives TEXT NOT NULL, -- JSON array of strings (tool names)
    region_limited TEXT DEFAULT 'No', -- 'No' or details if limited
    featured INTEGER DEFAULT 0, -- 0 or 1
    approved INTEGER DEFAULT 1, -- 0 or 1 (approved by admin)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tool Categories mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS tool_categories (
    tool_id INTEGER,
    category_id INTEGER,
    PRIMARY KEY (tool_id, category_id),
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

-- Tool Tags mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS tool_tags (
    tool_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (tool_id, tag_id),
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Use cases table
CREATE TABLE IF NOT EXISTS use_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Tool Use cases mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS tool_use_cases (
    tool_id INTEGER,
    use_case_id INTEGER,
    PRIMARY KEY (tool_id, use_case_id),
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
    FOREIGN KEY (use_case_id) REFERENCES use_cases(id) ON DELETE CASCADE
);

-- Collections table (User-curated or System)
CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    is_system INTEGER DEFAULT 0, -- 1 for system stacks/curated, 0 for user creations
    user_id INTEGER, -- references users(id)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Collection Tools mapping
CREATE TABLE IF NOT EXISTS collection_tools (
    collection_id INTEGER,
    tool_id INTEGER,
    PRIMARY KEY (collection_id, tool_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

-- Community submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    website_url TEXT NOT NULL,
    description TEXT NOT NULL,
    pricing_type TEXT NOT NULL,
    platform TEXT NOT NULL,
    categories TEXT NOT NULL, -- comma separated
    tags TEXT NOT NULL, -- comma separated
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pre-configured Stacks table
CREATE TABLE IF NOT EXISTS stacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    is_featured INTEGER DEFAULT 0
);

-- Steps within a Stack (Ordered Workflow)
CREATE TABLE IF NOT EXISTS stack_steps (
    stack_id INTEGER,
    step_order INTEGER NOT NULL,
    tool_id INTEGER NOT NULL,
    role TEXT NOT NULL, -- e.g., 'Script Writing', 'Voice Synthesis'
    PRIMARY KEY (stack_id, step_order),
    FOREIGN KEY (stack_id) REFERENCES stacks(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

-- Users table for Authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    verified INTEGER DEFAULT 0, -- 0 or 1
    verification_code TEXT,
    trial_ends_at DATETIME,
    custom_character TEXT, -- JSON string storing custom name, emoji, tone, pitch, speed
    subscription_status TEXT DEFAULT 'trial', -- 'trial' or 'premium'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

