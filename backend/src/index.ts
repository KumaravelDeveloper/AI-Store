import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { dbAll, dbGet, dbRun } from './db';
import { Tool, Category, Tag, Submission, Stack, StackStep, Collection } from './types';

// Load environment variables from .env file
dotenv.config();

// Hashing helper to secure user passwords without native compilation bottlenecks
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Global transporter instance for Ethereal email testing or real SMTP dispatch
let transporter: any = null;

async function initEmailTransporter() {
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Use real custom SMTP configuration
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.SMTP_PORT || '587');
      const secure = process.env.SMTP_SECURE === 'true'; // true for 465, false for 587
      
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log(`\n==============================================`);
      console.log(`[SMTP INIT] Real SMTP mailer successfully ready!`);
      console.log(`[SMTP INIT] Dispatching to real inboxes via: ${host}:${port}`);
      console.log(`==============================================\n`);
    } else {
      // Fallback to Ethereal sandbox if credentials not provided
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`\n==============================================`);
      console.log(`[SMTP INIT] Ethereal SMTP mailer successfully ready!`);
      console.log(`[SMTP INIT] Test Inbox User: ${testAccount.user}`);
      console.log(`[SMTP INIT] View incoming mails here: https://ethereal.email`);
      console.log(`==============================================\n`);
    }
  } catch (err) {
    console.error('Failed to spin up nodemailer transporter, falling back to console mock:', err);
  }
}

initEmailTransporter();


// Authentication middleware helper
function getUserIdFromRequest(req: Request): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const parts = token.split('-');
  if (parts.length < 3 || parts[0] !== 'mock' || parts[1] !== 'token') return null;
  const userId = parseInt(parts[2]);
  return isNaN(userId) ? null : userId;
}


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Natural Language Processing and Search Scoring Logic
// ----------------------------------------------------

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Writing': ['write', 'writing', 'copywriting', 'essay', 'blog', 'script', 'email', 'content', 'draft', 'text', 'novel', 'article'],
  'Design': ['design', 'ui', 'ux', 'graphic', 'logo', 'layout', 'canvas', 'illustration', 'wireframe', 'figma', 'framer', 'webpage'],
  'Image Generation': ['image', 'photo', 'art', 'draw', 'picture', 'avatar', 'paint', 'midjourney', 'dall-e', 'dalle', 'visual'],
  'Video': ['video', 'movie', 'clip', 'avatar', 'editing', 'capcut', 'synthesia', 'subtitles', 'render', 'film', 'shorts', 'tiktok'],
  'Coding': ['code', 'coding', 'program', 'developer', 'software', 'react', 'website', 'framer', 'v0', 'html', 'css', 'bug', 'typescript', 'github'],
  'Productivity': ['productivity', 'schedule', 'manage', 'note', 'organize', 'task', 'integrate', 'optimize', 'efficiency', 'work'],
  'Research': ['research', 'search', 'source', 'citation', 'pdf', 'document', 'summarize', 'find', 'google', 'ask', 'explain'],
  'Marketing': ['marketing', 'seo', 'ad', 'sales', 'social', 'campaign', 'brand', 'analytics'],
  'Business': ['business', 'company', 'enterprise', 'customer', 'lead', 'invoice', 'corporate', 'pitch'],
  'Education': ['education', 'student', 'learn', 'teach', 'study', 'class', 'homework', 'tutorial'],
  'Audio': ['audio', 'voice', 'speech', 'clone', 'voiceover', 'narrator', 'podcast', 'elevenlabs', 'sound', 'music'],
  'Automation': ['automation', 'zapier', 'integrate', 'workflow', 'automate', 'trigger', 'zap', 'sync'],
  'Data Analysis': ['data', 'analysis', 'excel', 'sheet', 'csv', 'graph', 'chart', 'regression', 'statistics']
};

// Map categories to workflow order (lower runs first in sequential pipeline)
const WORKFLOW_ORDER: Record<string, number> = {
  'Research': 1,
  'Data Analysis': 2,
  'Writing': 3,
  'Education': 4,
  'Image Generation': 5,
  'Design': 6,
  'Audio': 7,
  'Video': 8,
  'Coding': 9,
  'Automation': 10,
  'Marketing': 11,
  'Business': 12,
  'Productivity': 13
};

// Helper to fetch categories, tags, and use cases for a tool
async function enrichToolData(tool: any): Promise<Tool> {
  const pros = JSON.parse(tool.pros || '[]');
  const cons = JSON.parse(tool.cons || '[]');
  const alternatives = JSON.parse(tool.alternatives || '[]');

  const categories = await dbAll<{ name: string }>(
    `SELECT c.name FROM categories c 
     JOIN tool_categories tc ON c.id = tc.category_id 
     WHERE tc.tool_id = ?`,
    [tool.id]
  );

  const tags = await dbAll<{ name: string }>(
    `SELECT t.name FROM tags t 
     JOIN tool_tags tt ON t.id = tt.tag_id 
     WHERE tt.tool_id = ?`,
    [tool.id]
  );

  const useCases = await dbAll<{ name: string }>(
    `SELECT uc.name FROM use_cases uc 
     JOIN tool_use_cases tuc ON uc.id = tuc.use_case_id 
     WHERE tuc.tool_id = ?`,
    [tool.id]
  );

  return {
    ...tool,
    pros,
    cons,
    alternatives,
    featured: tool.featured === 1,
    approved: tool.approved === 1,
    categories: categories.map(c => c.name),
    tags: tags.map(t => t.name),
    use_cases: useCases.map(uc => uc.name)
  };
}


// ----------------------------------------------------
// Authentication Endpoints
// ----------------------------------------------------

// User Registration
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = hashPassword(password);

    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await dbRun(
      "INSERT INTO users (email, password_hash, verified, verification_code, trial_ends_at, subscription_status) VALUES (?, ?, 0, ?, ?, 'trial')",
      [email, passwordHash, verificationCode, trialEndsAt]
    );

    // Send email using Ethereal sandbox SMTP transporter
    if (transporter) {
      try {
        const fromEmail = process.env.SMTP_FROM || '"AI Store Registry" <noreply@aistore.com>';
        const info = await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject: '🔑 Verify Your AI Store Account',
          text: `Welcome to AI Store! Your 6-digit verification code is: ${verificationCode}. Enter this code on the verification screen to activate your account.`,
          html: `
            <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 40px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 3rem;">🧠</span>
                <h1 style="color: #ffffff; font-size: 1.8rem; margin: 10px 0 0; font-weight: 800; letter-spacing: -0.02em;">AI Store</h1>
              </div>
              <p style="color: #94a3b8; font-size: 1rem; line-height: 1.5;">Welcome to the artificial intelligence solutions registry. Please use the verification code below to activate your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; font-size: 2.2rem; font-weight: 800; color: #ffffff; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); padding: 12px 32px; border-radius: 8px; letter-spacing: 0.15em;">
                  ${verificationCode}
                </div>
              </div>
              <p style="color: #64748b; font-size: 0.85rem; line-height: 1.4; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 20px;">
                If you did not initiate this request, you can safely ignore this email. This confirmation code is temporary.
              </p>
            </div>
          `
        });
        console.log(`\n==============================================`);
        console.log(`[EMAIL SENT] Verification code successfully sent to: ${email}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`[EMAIL PREVIEW] Click here to view the email: ${previewUrl}`);
        }
        console.log(`==============================================\n`);
      } catch (mailErr) {
        console.error('Nodemailer SMTP failed to send message:', mailErr);
      }
    } else {
      // Console fallback if transporter not initialized
      console.log(`\n==============================================`);
      console.log(`[EMAIL FALLBACK] To: ${email}`);
      console.log(`Your AI Store verification code is: ${verificationCode}`);
      console.log(`==============================================\n`);
    }

    res.status(201).json({ success: true, email });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User Verification
app.post('/api/auth/verify', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const user = await dbGet<any>('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    await dbRun('UPDATE users SET verified = 1, verification_code = NULL WHERE id = ?', [user.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await dbGet<any>('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const inputHash = hashPassword(password);
    if (user.password_hash !== inputHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.verified !== 1) {
      return res.status(403).json({ error: 'Email is not verified', unverified: true, email: user.email });
    }

    // Generate custom bearer token
    const token = `mock-token-${user.id}-${Date.now()}`;
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        trial_ends_at: user.trial_ends_at,
        subscription_status: user.subscription_status,
        custom_character: user.custom_character ? JSON.parse(user.custom_character) : null
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Profile
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbGet<any>('SELECT id, email, trial_ends_at, subscription_status, custom_character, created_at FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      trial_ends_at: user.trial_ends_at,
      subscription_status: user.subscription_status,
      custom_character: user.custom_character ? JSON.parse(user.custom_character) : null,
      created_at: user.created_at
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Custom AI Character customization parameters
app.put('/api/auth/character', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { character } = req.body;
    if (!character) {
      return res.status(400).json({ error: 'Character data is required' });
    }

    await dbRun(
      'UPDATE users SET custom_character = ? WHERE id = ?',
      [JSON.stringify(character), userId]
    );

    res.json({ success: true, character });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mock credit card subscription upgrade
app.post('/api/auth/subscribe', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { cardNumber, cardName } = req.body;
    if (!cardNumber || !cardName) {
      return res.status(400).json({ error: 'Card details are required' });
    }

    await dbRun(
      "UPDATE users SET subscription_status = 'premium' WHERE id = ?",
      [userId]
    );

    res.json({ success: true, subscription_status: 'premium' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Public Endpoints
// ----------------------------------------------------

// Get all tools (with filters)
app.get('/api/tools', async (req: Request, res: Response) => {
  try {
    const { category, pricing, platform, search, featured } = req.query;
    let query = 'SELECT * FROM tools WHERE approved = 1';
    const params: any[] = [];

    if (featured === 'true') {
      query += ' AND featured = 1';
    }

    if (pricing) {
      query += ' AND pricing_type = ?';
      params.push(pricing);
    }

    if (platform) {
      query += ' AND platform LIKE ?';
      params.push(`%${platform}%`);
    }

    if (search) {
      query += ' AND (name LIKE ? OR short_description LIKE ? OR long_description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (category) {
      query = `
        SELECT t.* FROM tools t
        JOIN tool_categories tc ON t.id = tc.tool_id
        JOIN categories c ON c.id = tc.category_id
        WHERE t.approved = 1 AND c.slug = ?
      `;
      params.push(category);
      // Re-apply other filters
      if (pricing) {
        query += ' AND t.pricing_type = ?';
        params.push(pricing);
      }
      if (platform) {
        query += ' AND t.platform LIKE ?';
        params.push(`%${platform}%`);
      }
      if (search) {
        query += ' AND (t.name LIKE ? OR t.short_description LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term);
      }
      if (featured === 'true') {
        query += ' AND t.featured = 1';
      }
    }

    const tools = await dbAll<any>(query, params);
    const enrichedTools = await Promise.all(tools.map(enrichToolData));
    res.json(enrichedTools);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await dbAll<Category>('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get tags
app.get('/api/tags', async (req: Request, res: Response) => {
  try {
    const tags = await dbAll<Tag>('SELECT * FROM tags ORDER BY name ASC');
    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single tool details
app.get('/api/tools/:id', async (req: Request, res: Response) => {
  try {
    const tool = await dbGet<any>('SELECT * FROM tools WHERE id = ?', [req.params.id]);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    const enriched = await enrichToolData(tool);
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Natural Language Search & Smart Stacker
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { query, skillLevel, budget, platform } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const q = query.toLowerCase();

    // 1. Detect category matches based on keywords
    const matchedCategories: string[] = [];
    for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => q.includes(keyword))) {
        matchedCategories.push(catName);
      }
    }

    // 2. Fetch all tools
    const allToolsRaw = await dbAll<any>('SELECT * FROM tools WHERE approved = 1');
    const allTools = await Promise.all(allToolsRaw.map(enrichToolData));

    // 3. Compute score for each tool
    const scoredTools = allTools.map(tool => {
      let score = 0;

      // Tool name matches
      if (q.includes(tool.name.toLowerCase())) {
        score += 150;
      }

      // Category matches
      tool.categories?.forEach(cat => {
        if (matchedCategories.includes(cat)) {
          score += 40;
        }
        // Direct category word match
        if (q.includes(cat.toLowerCase())) {
          score += 20;
        }
      });

      // Use Case matches
      tool.use_cases?.forEach(uc => {
        if (q.includes(uc.toLowerCase())) {
          score += 50;
        }
      });

      // Tag matches
      tool.tags?.forEach(tag => {
        if (q.includes(tag.toLowerCase())) {
          score += 30;
        }
      });

      // Description text matching
      const words = q.split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) {
          if (tool.short_description.toLowerCase().includes(word)) score += 3;
          if (tool.long_description.toLowerCase().includes(word)) score += 1;
        }
      });

      // User preferences modifications (filtering/scoring)
      if (budget) {
        if (budget === 'free' && tool.pricing_type === 'free') score += 20;
        if (budget === 'free' && tool.pricing_type === 'paid') score -= 50;
        if (budget === 'freemium' && (tool.pricing_type === 'free' || tool.pricing_type === 'freemium')) score += 10;
      }

      if (platform) {
        if (tool.platform.toLowerCase().includes(platform.toLowerCase())) {
          score += 25;
        } else {
          score -= 10;
        }
      }

      return { tool, score };
    });

    // Sort by score and filter out zero-scores
    let matched = scoredTools
      .filter(st => st.score > 0)
      .sort((a, b) => b.score - a.score || b.tool.rating - a.tool.rating)
      .map(st => st.tool);

    // Fallback: if nothing matches, return featured tools
    if (matched.length === 0) {
      matched = allTools.filter(t => t.featured);
    }

    // 4. Build Custom Tool Stack Recommendation
    let suggestedStack: any = null;
    const detectedCats = matchedCategories.slice(0, 4); // Limit to top 4 categories

    if (detectedCats.length >= 2) {
      // Sort categories logically based on workflow pipeline
      detectedCats.sort((a, b) => (WORKFLOW_ORDER[a] || 99) - (WORKFLOW_ORDER[b] || 99));

      const steps: any[] = [];
      let stepOrder = 1;

      for (const cat of detectedCats) {
        // Find the best tool matching this category from the matched list
        const bestTool = matched.find(t => t.categories?.includes(cat)) || 
                         allTools.find(t => t.categories?.includes(cat));
        
        if (bestTool) {
          steps.push({
            step_order: stepOrder,
            tool_id: bestTool.id,
            tool_name: bestTool.name,
            tool_logo: bestTool.logo,
            role: `Utilize for ${cat}`
          });
          stepOrder++;
        }
      }

      suggestedStack = {
        name: 'AI Custom Recommended Workflow',
        description: `A sequential setup generated to help you: "${query}".`,
        steps
      };
    } else {
      // If only 1 category detected, suggest a predefined featured stack or a 2-step stack combining the top tool + a helper
      const featuredStacks = await dbAll<any>('SELECT * FROM stacks WHERE is_featured = 1');
      if (featuredStacks.length > 0) {
        // Pick the first stack or a stack whose name/description matches keywords
        let chosenStack = featuredStacks[0];
        for (const stack of featuredStacks) {
          if (detectedCats.some(cat => stack.description.toLowerCase().includes(cat.toLowerCase()) || stack.name.toLowerCase().includes(cat.toLowerCase()))) {
            chosenStack = stack;
            break;
          }
        }
        
        const steps = await dbAll<any>(
          `SELECT ss.step_order, ss.tool_id, t.name as tool_name, t.logo as tool_logo, ss.role
           FROM stack_steps ss
           JOIN tools t ON ss.tool_id = t.id
           WHERE ss.stack_id = ?
           ORDER BY ss.step_order ASC`,
          [chosenStack.id]
        );

        suggestedStack = {
          name: chosenStack.name,
          description: chosenStack.description,
          steps
        };
      }
    }

    res.json({
      tools: matched.slice(0, 10), // return top 10 matches
      stack: suggestedStack
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured stacks
app.get('/api/stacks', async (req: Request, res: Response) => {
  try {
    const stacks = await dbAll<any>('SELECT * FROM stacks');
    const enriched = await Promise.all(
      stacks.map(async (stack) => {
        const steps = await dbAll<any>(
          `SELECT ss.step_order, ss.tool_id, t.name as tool_name, t.logo as tool_logo, ss.role
           FROM stack_steps ss
           JOIN tools t ON ss.tool_id = t.id
           WHERE ss.stack_id = ?
           ORDER BY ss.step_order ASC`,
          [stack.id]
        );
        return { ...stack, steps };
      })
    );
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Saved Collections Endpoints
// ----------------------------------------------------

// Get user collections
app.get('/api/collections', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    
    // Fetch either system collections or the current authenticated user's collections
    let query = 'SELECT * FROM collections WHERE is_system = 1';
    const params: any[] = [];
    
    if (userId) {
      query += ' OR user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const collections = await dbAll<any>(query, params);
    const enriched = await Promise.all(
      collections.map(async (col) => {
        const toolsRaw = await dbAll<any>(
          `SELECT t.* FROM tools t
           JOIN collection_tools ct ON t.id = ct.tool_id
           WHERE ct.collection_id = ? AND t.approved = 1`,
          [col.id]
        );
        const tools = await Promise.all(toolsRaw.map(enrichToolData));
        return {
          ...col,
          is_system: col.is_system === 1,
          tools
        };
      })
    );
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new collection
app.post('/api/collections', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Sign in to create a collection' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const result = await dbRun(
      'INSERT INTO collections (name, description, is_system, user_id) VALUES (?, ?, 0, ?)',
      [name, description || '', userId]
    );
    const newCollection = await dbGet('SELECT * FROM collections WHERE id = ?', [result.lastID]);
    res.status(201).json(newCollection);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add tool to collection
app.post('/api/collections/:id/tools', async (req: Request, res: Response) => {
  try {
    const collectionId = parseInt(req.params.id);
    const { toolId } = req.body;
    if (!toolId) {
      return res.status(400).json({ error: 'Tool ID is required' });
    }
    await dbRun(
      'INSERT OR IGNORE INTO collection_tools (collection_id, tool_id) VALUES (?, ?)',
      [collectionId, toolId]
    );
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove tool from collection
app.delete('/api/collections/:id/tools/:toolId', async (req: Request, res: Response) => {
  try {
    const collectionId = parseInt(req.params.id);
    const toolId = parseInt(req.params.toolId);
    await dbRun(
      'DELETE FROM collection_tools WHERE collection_id = ? AND tool_id = ?',
      [collectionId, toolId]
    );
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Community Submission Endpoints
// ----------------------------------------------------

// Submit a new tool suggestion
app.post('/api/submissions', async (req: Request, res: Response) => {
  try {
    const { name, email, website_url, description, pricing_type, platform, categories, tags } = req.body;
    if (!name || !email || !website_url || !description || !pricing_type || !platform) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await dbRun(
      `INSERT INTO submissions 
       (name, email, website_url, description, pricing_type, platform, categories, tags, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        name,
        email,
        website_url,
        description,
        pricing_type,
        platform,
        categories || '',
        tags || ''
      ]
    );
    const newSubmission = await dbGet('SELECT * FROM submissions WHERE id = ?', [result.lastID]);
    res.status(201).json(newSubmission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Admin Management Endpoints
// ----------------------------------------------------

// List all submissions (Admin)
app.get('/api/admin/submissions', async (req: Request, res: Response) => {
  try {
    const submissions = await dbAll<Submission>('SELECT * FROM submissions ORDER BY created_at DESC');
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve or reject submission (Admin)
app.put('/api/admin/submissions/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await dbRun('UPDATE submissions SET status = ? WHERE id = ?', [status, id]);

    // If approved, migrate the submission to the tools table
    if (status === 'approved') {
      const sub = await dbGet<any>('SELECT * FROM submissions WHERE id = ?', [id]);
      if (sub) {
        // Insert tool
        const toolRes = await dbRun(
          `INSERT OR IGNORE INTO tools 
           (name, logo, short_description, long_description, pricing_type, platform, website_url, rating, pros, cons, alternatives, region_limited, featured, approved) 
           VALUES (?, '🔧', ?, ?, ?, ?, ?, 4.0, '[]', '[]', '[]', 'No', 0, 1)`,
          [sub.name, sub.description, sub.description, sub.pricing_type, sub.platform, sub.website_url]
        );

        const toolId = toolRes.lastID;

        // Map categories (split comma string)
        if (sub.categories && toolId) {
          const cats = sub.categories.split(',').map((c: string) => c.trim());
          for (const catName of cats) {
            const catRow = await dbGet<{ id: number }>('SELECT id FROM categories WHERE name LIKE ?', [`%${catName}%`]);
            if (catRow) {
              await dbRun('INSERT OR IGNORE INTO tool_categories (tool_id, category_id) VALUES (?, ?)', [toolId, catRow.id]);
            }
          }
        }

        // Map tags (split comma string)
        if (sub.tags && toolId) {
          const tags = sub.tags.split(',').map((t: string) => t.trim());
          for (const tagName of tags) {
            let tagRow = await dbGet<{ id: number }>('SELECT id FROM tags WHERE name LIKE ?', [`%${tagName}%`]);
            if (!tagRow) {
              const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const ins = await dbRun('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)', [tagName, slug]);
              tagRow = { id: ins.lastID };
            }
            if (tagRow.id) {
              await dbRun('INSERT OR IGNORE INTO tool_tags (tool_id, tag_id) VALUES (?, ?)', [toolId, tagRow.id]);
            }
          }
        }
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin stats
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  try {
    const toolsCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM tools WHERE approved = 1');
    const submissionsCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM submissions WHERE status = "pending"');
    const categoriesCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM categories');
    const collectionsCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM collections');

    res.json({
      totalTools: toolsCount?.count || 0,
      pendingSubmissions: submissionsCount?.count || 0,
      totalCategories: categoriesCount?.count || 0,
      totalCollections: collectionsCount?.count || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Add new tool manually
app.post('/api/admin/tools', async (req: Request, res: Response) => {
  try {
    const { name, logo, short_description, long_description, pricing_type, platform, website_url, rating, pros, cons, alternatives, region_limited, featured, categories, tags, use_cases } = req.body;
    
    if (!name || !logo || !short_description || !pricing_type || !platform || !website_url) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const result = await dbRun(
      `INSERT INTO tools 
       (name, logo, short_description, long_description, pricing_type, platform, website_url, rating, pros, cons, alternatives, region_limited, featured, approved) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name,
        logo,
        short_description,
        long_description || '',
        pricing_type,
        platform,
        website_url,
        rating || 4.0,
        JSON.stringify(pros || []),
        JSON.stringify(cons || []),
        JSON.stringify(alternatives || []),
        region_limited || 'No',
        featured ? 1 : 0
      ]
    );

    const toolId = result.lastID;

    // Link Categories
    if (categories && Array.isArray(categories)) {
      for (const catName of categories) {
        const catRow = await dbGet<{ id: number }>('SELECT id FROM categories WHERE name = ?', [catName]);
        if (catRow) {
          await dbRun('INSERT OR IGNORE INTO tool_categories (tool_id, category_id) VALUES (?, ?)', [toolId, catRow.id]);
        }
      }
    }

    // Link Tags
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        let tagRow = await dbGet<{ id: number }>('SELECT id FROM tags WHERE name = ?', [tagName]);
        if (!tagRow) {
          const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const tagIns = await dbRun('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)', [tagName, slug]);
          tagRow = { id: tagIns.lastID };
        }
        await dbRun('INSERT OR IGNORE INTO tool_tags (tool_id, tag_id) VALUES (?, ?)', [toolId, tagRow.id]);
      }
    }

    // Link Use Cases
    if (use_cases && Array.isArray(use_cases)) {
      for (const ucName of use_cases) {
        let ucRow = await dbGet<{ id: number }>('SELECT id FROM use_cases WHERE name = ?', [ucName]);
        if (!ucRow) {
          const ucIns = await dbRun('INSERT OR IGNORE INTO use_cases (name) VALUES (?)', [ucName]);
          ucRow = { id: ucIns.lastID };
        }
        await dbRun('INSERT OR IGNORE INTO tool_use_cases (tool_id, use_case_id) VALUES (?, ?)', [toolId, ucRow.id]);
      }
    }

    const tool = await dbGet('SELECT * FROM tools WHERE id = ?', [toolId]);
    res.status(201).json(tool);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Update tool
app.put('/api/admin/tools/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, logo, short_description, long_description, pricing_type, platform, website_url, rating, pros, cons, alternatives, region_limited, featured } = req.body;
    
    await dbRun(
      `UPDATE tools SET
       name = ?, logo = ?, short_description = ?, long_description = ?, pricing_type = ?, 
       platform = ?, website_url = ?, rating = ?, pros = ?, cons = ?, alternatives = ?, 
       region_limited = ?, featured = ?
       WHERE id = ?`,
      [
        name, logo, short_description, long_description, pricing_type,
        platform, website_url, rating, JSON.stringify(pros || []), JSON.stringify(cons || []), 
        JSON.stringify(alternatives || []), region_limited, featured ? 1 : 0, id
      ]
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Delete tool
app.delete('/api/admin/tools/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await dbRun('DELETE FROM tools WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
