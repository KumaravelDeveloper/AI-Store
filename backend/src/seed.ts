import { initDb, dbRun, dbAll, dbGet } from './db';

const categoriesData = [
  { name: 'Writing', slug: 'writing', icon: '✍️' },
  { name: 'Design', slug: 'design', icon: '🎨' },
  { name: 'Image Generation', slug: 'image-generation', icon: '🖼️' },
  { name: 'Video', slug: 'video', icon: '🎥' },
  { name: 'Coding', slug: 'coding', icon: '💻' },
  { name: 'Productivity', slug: 'productivity', icon: '⚡' },
  { name: 'Research', slug: 'research', icon: '🔍' },
  { name: 'Marketing', slug: 'marketing', icon: '📈' },
  { name: 'Business', slug: 'business', icon: '💼' },
  { name: 'Education', slug: 'education', icon: '🎓' },
  { name: 'Audio', slug: 'audio', icon: '🎵' },
  { name: 'Automation', slug: 'automation', icon: '🤖' },
  { name: 'Data Analysis', slug: 'data-analysis', icon: '📊' }
];

const tagsData = [
  { name: 'Chatbot', slug: 'chatbot' },
  { name: 'Logo Design', slug: 'logo-design' },
  { name: 'Blogging', slug: 'blogging' },
  { name: 'Programming', slug: 'programming' },
  { name: 'Video Editor', slug: 'video-editor' },
  { name: 'Text to Speech', slug: 'text-to-speech' },
  { name: 'Text to Video', slug: 'text-to-video' },
  { name: 'Website Builder', slug: 'website-builder' },
  { name: 'Voiceover', slug: 'voiceover' },
  { name: 'Web Design', slug: 'web-design' },
  { name: 'SEO', slug: 'seo' },
  { name: 'Translation', slug: 'translation' },
  { name: 'Virtual Avatar', slug: 'virtual-avatar' },
  { name: 'Chart Maker', slug: 'chart-maker' },
  { name: 'Task Automator', slug: 'task-automator' }
];

const useCasesData = [
  'create a presentation',
  'edit a video',
  'write marketing content',
  'build a website',
  'analyze data',
  'generate images',
  'write code',
  'summarize documents',
  'convert text to audio',
  'automate tasks'
];

const toolsData = [
  {
    name: 'ChatGPT',
    logo: '💬',
    short_description: 'An advanced conversational AI by OpenAI capable of content writing, coding, and general tasks.',
    long_description: 'ChatGPT is a state-of-the-art language model designed by OpenAI. It excels at writing blog posts, drafting professional emails, generating and debugging code, translating text, brainstorming ideas, and answering complex queries in natural language. It has a massive developer ecosystem, customized GPT plugins, and strong web browsing tools.',
    pricing_type: 'freemium',
    platform: 'Web, Mobile, Desktop, API',
    website_url: 'https://chatgpt.com',
    rating: 4.8,
    pros: JSON.stringify(['Extremely versatile conversational skills', 'Huge ecosystem and customized GPT models', 'Supports web browsing and image generation via DALL-E']),
    cons: JSON.stringify(['Can hallucinate facts', 'Free model has usage limits during peak hours', 'Context window is smaller than Claude on free tier']),
    alternatives: JSON.stringify(['Claude', 'Perplexity', 'Jasper']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Writing', 'Productivity', 'Coding', 'Marketing'],
    tags: ['Chatbot', 'Blogging', 'Programming', 'SEO'],
    use_cases: ['write marketing content', 'write code', 'summarize documents']
  },
  {
    name: 'Claude',
    logo: '🧠',
    short_description: 'A powerful AI by Anthropic known for deep reasoning, long context, and writing high-quality copy.',
    long_description: 'Claude is Anthropic\'s premier AI model. It features an incredibly large context window, enabling users to upload entire books, codebases, or financial sheets for analysis. Claude is preferred by professionals for its highly nuanced, human-like writing style, superior reasoning capabilities, and safe, helpful interactions.',
    pricing_type: 'freemium',
    platform: 'Web, Mobile, Desktop, API',
    website_url: 'https://claude.ai',
    rating: 4.9,
    pros: JSON.stringify(['Excellent, natural writing quality', 'Huge 200k context window', 'Superior logic and coding capabilities']),
    cons: JSON.stringify(['No native web search tools on free version', 'Lower message limits on premium models', 'No image generator']),
    alternatives: JSON.stringify(['ChatGPT', 'Perplexity']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Writing', 'Research', 'Coding'],
    tags: ['Chatbot', 'Programming', 'Blogging'],
    use_cases: ['write marketing content', 'write code', 'summarize documents']
  },
  {
    name: 'Midjourney',
    logo: '🎨',
    short_description: 'High-quality photorealistic image generator accessible via Discord and Web.',
    long_description: 'Midjourney is an independent research lab that produces an AI tool of the same name. It translates natural language descriptions (prompts) into highly aesthetic and detailed images, specialising in cinematic, photorealistic, and illustrative styles. It runs inside a Web application for premium users and Discord for community interactions.',
    pricing_type: 'paid',
    platform: 'Web',
    website_url: 'https://midjourney.com',
    rating: 4.7,
    pros: JSON.stringify(['Stunning, photorealistic visual outputs', 'Vibrant community and preset prompt options', 'Excellent lighting and artistic style controls']),
    cons: JSON.stringify(['No free trial available currently', 'Steep learning curve for advanced prompt parameters', 'Discord interface can feel confusing for beginners']),
    alternatives: JSON.stringify(['DALL-E 3', 'Stable Diffusion']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Design', 'Image Generation'],
    tags: ['Web Design', 'Logo Design'],
    use_cases: ['generate images']
  },
  {
    name: 'DALL-E 3',
    logo: '🖼️',
    short_description: 'OpenAI\'s image generator integrated directly with ChatGPT for easy prompting.',
    long_description: 'DALL-E 3 is the latest iteration of OpenAI\'s image generator. It is designed to understand prompt descriptions with extremely high fidelity and render text inside images accurately. Because it is built directly into ChatGPT, users can refine images conversational style without needing complex prompts.',
    pricing_type: 'freemium',
    platform: 'Web, Mobile, API',
    website_url: 'https://openai.com/dall-e-3',
    rating: 4.5,
    pros: JSON.stringify(['Superb prompt adherence and details', 'Generates text inside images perfectly', 'Easy to use with ChatGPT']),
    cons: JSON.stringify(['Lacks the highly photorealistic texture of Midjourney', 'Limited free usage credits', 'Strict safety filters can block creative prompts']),
    alternatives: JSON.stringify(['Midjourney']),
    region_limited: 'No',
    featured: 0,
    approved: 1,
    categories: ['Design', 'Image Generation'],
    tags: ['Logo Design'],
    use_cases: ['generate images']
  },
  {
    name: 'Canva',
    logo: '🅰️',
    short_description: 'Popular graphic design suite featuring brand-new magic AI creation capabilities.',
    long_description: 'Canva is an all-in-one graphic design platform that now boasts Magic Studio, an AI-powered design suite. Magic Studio includes text-to-image, text-to-presentation, AI photo editors, automatic social media copy, and background removal, making design work fast and accessible to anyone.',
    pricing_type: 'freemium',
    platform: 'Web, Desktop, Mobile',
    website_url: 'https://canva.com',
    rating: 4.7,
    pros: JSON.stringify(['Enormous library of templates and assets', 'Super intuitive drag-and-drop designer', 'Magic design generates templates from text prompts']),
    cons: JSON.stringify(['AI generation features consume premium credits', 'Advanced designers might find customization options limiting', 'Auto-generated layouts can look generic']),
    alternatives: JSON.stringify(['Framer', 'Midjourney']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Design', 'Marketing', 'Business'],
    tags: ['Web Design', 'Logo Design'],
    use_cases: ['create a presentation', 'generate images']
  },
  {
    name: 'ElevenLabs',
    logo: '🗣️',
    short_description: 'State-of-the-art AI voice generator, sound effects generator, and voice cloner.',
    long_description: 'ElevenLabs produces the most realistic and expressive AI voiceovers in the industry. It can translate text to speech in dozens of languages, duplicate specific voice qualities with custom voice cloning, and synthesize custom sound effects for film, gaming, and social media.',
    pricing_type: 'freemium',
    platform: 'Web, API',
    website_url: 'https://elevenlabs.io',
    rating: 4.8,
    pros: JSON.stringify(['Unmatched realistic vocal intonation', 'Multi-lingual support with accent matching', 'High-quality instant voice cloning']),
    cons: JSON.stringify(['Free tier has low monthly character quotas', 'Cloning voice of public figures is restricted', 'Long articles can get expensive to synthesize']),
    alternatives: JSON.stringify(['Play.ht', 'Murf.ai']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Audio'],
    tags: ['Text to Speech', 'Voiceover'],
    use_cases: ['convert text to audio']
  },
  {
    name: 'CapCut',
    logo: '✂️',
    short_description: 'User-friendly video editor with automated transcripts, captions, and AI filters.',
    long_description: 'CapCut is a comprehensive video editing suite by ByteDance. It features robust AI utilities including auto-captioning in over 20 languages, background isolation, vocal isolation, and dynamic AI filters. It is the go-to tool for short-form video editors (TikTok, Reels, Shorts).',
    pricing_type: 'freemium',
    platform: 'Web, Desktop, Mobile',
    website_url: 'https://capcut.com',
    rating: 4.6,
    pros: JSON.stringify(['Best-in-class automatic captions', 'Huge database of trending music, filters, and overlays', 'Completely free base tier features']),
    cons: JSON.stringify(['Cloud project storage is limited on free tier', 'Desktop app can require heavy GPU specs', 'Advanced grading tools are lacking']),
    alternatives: JSON.stringify(['Premiere Pro', 'Descript']),
    region_limited: 'No',
    featured: 0,
    approved: 1,
    categories: ['Video'],
    tags: ['Video Editor', 'Text to Video'],
    use_cases: ['edit a video']
  },
  {
    name: 'Synthesia',
    logo: '👤',
    short_description: 'Corporate video generator featuring highly realistic virtual talking avatars.',
    long_description: 'Synthesia is an enterprise AI video generator. It allows companies to create instruction, sales, and support videos by simply typing script content. The tool features realistic virtual human avatars that speak over 120 languages, eliminating the need for cameras, actors, and studio rentals.',
    pricing_type: 'paid',
    platform: 'Web',
    website_url: 'https://synthesia.io',
    rating: 4.6,
    pros: JSON.stringify(['Dozens of high-definition realistic avatars', 'Voice uploads sync perfectly to lip movements', 'Translates scripts instantly into global languages']),
    cons: JSON.stringify(['Expensive entry price for personal builders', 'Avatars can sometimes look slightly robotic', 'Not built for action-packed cinematic scenes']),
    alternatives: JSON.stringify(['HeyGen', 'CapCut']),
    region_limited: 'No',
    featured: 0,
    approved: 1,
    categories: ['Video', 'Business'],
    tags: ['Virtual Avatar', 'Text to Video'],
    use_cases: ['edit a video', 'create a presentation']
  },
  {
    name: 'Cursor',
    logo: '💻',
    short_description: 'An AI-first code editor fork of VS Code that auto-writes, edits, and debugs codebases.',
    long_description: 'Cursor is a popular code editor built on top of VS Code. It features native, deeply integrated AI options. You can query your entire codebase, request multi-file edits, auto-generate boilerplate code, and resolve errors with simple keyboard shortcuts using GPT-4o, Claude 3.5 Sonnet, and other top-tier coding models.',
    pricing_type: 'freemium',
    platform: 'Desktop',
    website_url: 'https://cursor.sh',
    rating: 4.9,
    pros: JSON.stringify(['Incredibly fast multi-file codebase edits', 'Fully compatible with all VS Code extensions', 'Smart inline code completions and chat context']),
    cons: JSON.stringify(['No web browser client', 'Requires paid subscription for unlimited high-power model requests', 'Autocompletions can sometimes generate bugs if unchecked']),
    alternatives: JSON.stringify(['GitHub Copilot', 'VS Code', 'Phind']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Coding', 'Productivity'],
    tags: ['Programming'],
    use_cases: ['write code']
  },
  {
    name: 'GitHub Copilot',
    logo: '🐙',
    short_description: 'The industry-standard AI coding autocomplete extension for mainstream IDEs.',
    long_description: 'GitHub Copilot is the pioneer of AI developer autocomplete. Developed by GitHub and OpenAI, it resides inside IDEs (like VS Code, JetBrains, Visual Studio) and suggests full lines, functions, or documentation blocks as you type, streamlining boilerplate coding.',
    pricing_type: 'paid',
    platform: 'IDE Extension',
    website_url: 'https://github.com/features/copilot',
    rating: 4.8,
    pros: JSON.stringify(['Highly fluid, real-time autocomplete suggestions', 'Trained on massive open source repositories', 'Integrates into major editors out of the box']),
    cons: JSON.stringify(['No free tier for commercial developers', 'May output older API code patterns', 'Context understanding is narrower compared to Cursor']),
    alternatives: JSON.stringify(['Cursor', 'Phind']),
    region_limited: 'No',
    featured: 0,
    approved: 1,
    categories: ['Coding'],
    tags: ['Programming'],
    use_cases: ['write code']
  },
  {
    name: 'Perplexity',
    logo: '🔍',
    short_description: 'An AI search engine that reads pages, aggregates information, and outputs cited answers.',
    long_description: 'Perplexity is a conversational search engine designed to replace traditional search queries. It searches the internet in real time, reads articles, and writes a detailed summary answer complete with numbered source citations, allowing users to verify its answers instantly.',
    pricing_type: 'freemium',
    platform: 'Web, Mobile, Extension',
    website_url: 'https://perplexity.ai',
    rating: 4.8,
    pros: JSON.stringify(['Real-time web queries with clear source links', 'Includes follow-up question suggestions', 'Access top models like Claude and GPT-4 in pro tier']),
    cons: JSON.stringify(['Sometimes summarises incorrect data from low-quality sites', 'Pro tier has rate limits', 'Free tier relies on smaller language models']),
    alternatives: JSON.stringify(['ChatGPT', 'NotebookLM']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Research', 'Productivity'],
    tags: ['Chatbot', 'SEO'],
    use_cases: ['summarize documents']
  },
  {
    name: 'NotebookLM',
    logo: '📓',
    short_description: 'Google\'s research assistant that turns notes and documents into interactive guides and podcasts.',
    long_description: 'NotebookLM is a specialized research tool developed by Google. Users upload documents, PDFs, slide decks, or text clips. The AI acts as a localized assistant, answering questions using only the uploaded sources. It can also create an incredibly realistic audio podcast discussion between two virtual hosts discussing your documents.',
    pricing_type: 'free',
    platform: 'Web',
    website_url: 'https://notebooklm.google',
    rating: 4.9,
    pros: JSON.stringify(['Grounds answers completely in your uploaded files', 'Spectacular and popular Audio Overview (Podcast) builder', 'Completely free to use with Google account']),
    cons: JSON.stringify(['Limited upload sizes per notebook', 'No external web search capabilities', 'Exporting documents is currently basic']),
    alternatives: JSON.stringify(['Perplexity', 'ChatGPT']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Research', 'Education', 'Productivity'],
    tags: ['Chatbot', 'Voiceover'],
    use_cases: ['summarize documents']
  },
  {
    name: 'Zapier',
    logo: '🧡',
    short_description: 'Workflow automation app that lets you link thousands of apps together using AI logic.',
    long_description: 'Zapier is an automation system. It has added AI features where users describe their automation ideas in natural language (e.g. "Whenever I get a lead in Typeform, draft an email draft in Gmail and notify Slack") and the AI automatically builds the integration mapping.',
    pricing_type: 'freemium',
    platform: 'Web',
    website_url: 'https://zapier.com',
    rating: 4.6,
    pros: JSON.stringify(['Connects to over 6,000+ distinct web apps', 'AI prompt-to-zap builder makes setup very simple', 'Multi-step automation flows']),
    cons: JSON.stringify(['Paid tiers get expensive quickly', 'Setup can require fine-tuning for complex webhooks', 'Free version limits active runs']),
    alternatives: JSON.stringify(['Make.com', 'n8n']),
    region_limited: 'No',
    featured: 0,
    approved: 1,
    categories: ['Automation', 'Business'],
    tags: ['Task Automator'],
    use_cases: ['automate tasks']
  },
  {
    name: 'Jasper',
    logo: '🔴',
    short_description: 'AI platform tailored for marketing agencies and copywriters to generate SEO copy.',
    long_description: 'Jasper is a copywriting platform built specifically for marketers and marketing teams. It allows companies to define their brand voice, import guidelines, and generate SEO-optimized blog posts, ads, emails, and landing page copy that aligns with their corporate image.',
    pricing_type: 'paid',
    platform: 'Web',
    website_url: 'https://jasper.ai',
    rating: 4.4,
    pros: JSON.stringify(['Maintains brand voice guidelines throughout content', 'Includes direct SEO integrations and plagiarism checkers', 'Dozens of marketing copywriting templates']),
    cons: JSON.stringify(['No permanently free tier', 'Pricing is higher compared to generic tools like ChatGPT', 'Outputs can sometimes feel repetitive without edits']),
    alternatives: JSON.stringify(['ChatGPT', 'Claude']),
    region_limited: 'No',
    featured: 0,
    approved: 1,
    categories: ['Writing', 'Marketing'],
    tags: ['Blogging', 'SEO'],
    use_cases: ['write marketing content']
  },
  {
    name: 'Framer',
    logo: '🔲',
    short_description: 'An AI-powered design-to-live website builder that creates beautiful layouts from prompts.',
    long_description: 'Framer is a premium design and development platform that has integrated AI website generation. Users type a description of the website they want, and Framer generates custom sections, styled copy, responsive grids, and clean color schemes that can be published to a live domain immediately.',
    pricing_type: 'freemium',
    platform: 'Web, Desktop',
    website_url: 'https://framer.com',
    rating: 4.7,
    pros: JSON.stringify(['Stunning, highly animated premium designs', 'Excellent built-in CMS and localization tools', 'Figma design exports map beautifully']),
    cons: JSON.stringify(['Hosting on Framer servers can be expensive for custom tiers', 'Slightly higher design learning curve than Wix or Squarespace', 'Generated layouts require manual fine-tuning']),
    alternatives: JSON.stringify(['Webflow', 'Wix Studio']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Design', 'Coding', 'Business'],
    tags: ['Website Builder', 'Web Design'],
    use_cases: ['build a website']
  },
  {
    name: 'v0.dev',
    logo: '0️⃣',
    short_description: 'Vercel\'s generative UI system that creates component-level frontend code from prompts.',
    long_description: 'v0.dev is a generative UI tool created by Vercel. It generates beautiful, styled frontend React/HTML components utilizing Tailwind CSS and shadcn/ui. Users can preview designs visually and immediately copy the terminal command to install the component directly into their codebases.',
    pricing_type: 'freemium',
    platform: 'Web',
    website_url: 'https://v0.dev',
    rating: 4.8,
    pros: JSON.stringify(['Generates extremely modern, clean frontend code', 'Easy copy-paste layout into React and Next.js applications', 'Saves hours of dashboard styling work']),
    cons: JSON.stringify(['Optimized heavily for React/Tailwind, less useful for other styles', 'Complexity limit per generation', 'Free tier has daily creation tokens']),
    alternatives: JSON.stringify(['Cursor', 'Framer']),
    region_limited: 'No',
    featured: 0,
    approved: 1,
    categories: ['Coding', 'Design'],
    tags: ['Programming', 'Web Design'],
    use_cases: ['write code', 'build a website']
  },
  {
    name: 'Julius AI',
    logo: '📊',
    short_description: 'An AI data scientist that writes code to analyze spreadsheets, files, and build graphs.',
    long_description: 'Julius AI is an AI-powered data analyst. You can upload Excel files, CSV files, PDFs, or databases. The AI writes Python code in the background to execute clean data cleaning, run regressions, construct histograms, plot heatmaps, and perform complex statistical tests, returning both the code and visual graphs.',
    pricing_type: 'freemium',
    platform: 'Web, Mobile',
    website_url: 'https://julius.ai',
    rating: 4.7,
    pros: JSON.stringify(['Automatically builds premium and correct graphs', 'Capable of complex multi-sheet math', 'Exposes the full backend Python execution code']),
    cons: JSON.stringify(['Free version allows only a few queries per month', 'Required domain knowledge to check statistical methods', 'Can struggle with dirty or unlabeled data']),
    alternatives: JSON.stringify(['ChatGPT', 'Python']),
    region_limited: 'No',
    featured: 1,
    approved: 1,
    categories: ['Data Analysis', 'Research'],
    tags: ['Chart Maker'],
    use_cases: ['analyze data']
  }
];

async function runSeed() {
  console.log('Starting database seeding...');
  await initDb();

  // 1. Seed Categories
  console.log('Seeding categories...');
  for (const cat of categoriesData) {
    try {
      await dbRun('INSERT OR IGNORE INTO categories (name, icon, slug) VALUES (?, ?, ?)', [
        cat.name,
        cat.icon,
        cat.slug
      ]);
    } catch (e) {
      console.error(`Failed to insert category ${cat.name}`, e);
    }
  }

  // 2. Seed Tags
  console.log('Seeding tags...');
  for (const tag of tagsData) {
    try {
      await dbRun('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)', [tag.name, tag.slug]);
    } catch (e) {
      console.error(`Failed to insert tag ${tag.name}`, e);
    }
  }

  // 3. Seed Use Cases
  console.log('Seeding use cases...');
  for (const uc of useCasesData) {
    try {
      await dbRun('INSERT OR IGNORE INTO use_cases (name) VALUES (?)', [uc]);
    } catch (e) {
      console.error(`Failed to insert use case ${uc}`, e);
    }
  }

  // Fetch all categories, tags, and use cases for linking
  const dbCats = await dbAll<{ id: number; name: string }>('SELECT id, name FROM categories');
  const dbTags = await dbAll<{ id: number; name: string }>('SELECT id, name FROM tags');
  const dbUCs = await dbAll<{ id: number; name: string }>('SELECT id, name FROM use_cases');

  const catMap = new Map(dbCats.map((c) => [c.name, c.id]));
  const tagMap = new Map(dbTags.map((t) => [t.name, t.id]));
  const ucMap = new Map(dbUCs.map((u) => [u.name, u.id]));

  // 4. Seed Tools and mappings
  console.log('Seeding tools & associations...');
  for (const tool of toolsData) {
    try {
      const res = await dbRun(
        `INSERT OR IGNORE INTO tools 
        (name, logo, short_description, long_description, pricing_type, platform, website_url, rating, pros, cons, alternatives, region_limited, featured, approved) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tool.name,
          tool.logo,
          tool.short_description,
          tool.long_description,
          tool.pricing_type,
          tool.platform,
          tool.website_url,
          tool.rating,
          tool.pros,
          tool.cons,
          tool.alternatives,
          tool.region_limited,
          tool.featured,
          tool.approved
        ]
      );

      // Fetch the tool ID (since IGNORE might skip, find it by name)
      const toolRow = await dbGet<{ id: number }>('SELECT id FROM tools WHERE name = ?', [tool.name]);
      if (!toolRow) continue;
      const toolId = toolRow.id;

      // Link categories
      for (const catName of tool.categories) {
        const catId = catMap.get(catName);
        if (catId) {
          await dbRun('INSERT OR IGNORE INTO tool_categories (tool_id, category_id) VALUES (?, ?)', [
            toolId,
            catId
          ]);
        }
      }

      // Link tags
      for (const tagName of tool.tags) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          await dbRun('INSERT OR IGNORE INTO tool_tags (tool_id, tag_id) VALUES (?, ?)', [toolId, tagId]);
        }
      }

      // Link use cases
      for (const ucName of tool.use_cases) {
        const ucId = ucMap.get(ucName);
        if (ucId) {
          await dbRun('INSERT OR IGNORE INTO tool_use_cases (tool_id, use_case_id) VALUES (?, ?)', [
            toolId,
            ucId
          ]);
        }
      }
    } catch (e) {
      console.error(`Failed to insert tool ${tool.name}`, e);
    }
  }

  // 5. Seed Pre-configured Stacks
  console.log('Seeding pre-configured stacks...');
  const stacksData = [
    {
      name: 'Faceless Video Creation Stack',
      description: 'The ultimate workflow to script, record, visual, and edit short/long-form videos without ever showing your face.',
      steps: [
        { tool: 'ChatGPT', role: 'Idea generation and script writing' },
        { tool: 'ElevenLabs', role: 'Voice synthesis and audio narrations' },
        { tool: 'Midjourney', role: 'Create visual image assets' },
        { tool: 'CapCut', role: 'Video editing, auto captions, and background audio' }
      ]
    },
    {
      name: 'Web Design & Copywriting Stack',
      description: 'Design beautiful, highly interactive landing pages complete with compelling copy and graphic assets.',
      steps: [
        { tool: 'Claude', role: 'Landing page copy, layout outline and copywriting' },
        { tool: 'Midjourney', role: 'High quality asset and background graphic generations' },
        { tool: 'Framer', role: 'Import designs and publish a responsive website live' }
      ]
    },
    {
      name: 'Data Analysis & Business Report Stack',
      description: 'Quickly upload data files, extract statistical diagrams, summarize main takeaways, and present to clients.',
      steps: [
        { tool: 'Julius AI', role: 'Upload files and perform statistical tests & graph plotting' },
        { tool: 'ChatGPT', role: 'Interpret graphs and write bullet point executive summaries' },
        { tool: 'Canva', role: 'Format slides, charts, and summaries into a clean presentation deck' }
      ]
    }
  ];

  for (const stack of stacksData) {
    try {
      const stackRes = await dbRun(
        'INSERT OR IGNORE INTO stacks (name, description, is_featured) VALUES (?, ?, ?)',
        [stack.name, stack.description, 1]
      );
      
      const stackRow = await dbGet<{ id: number }>('SELECT id FROM stacks WHERE name = ?', [stack.name]);
      if (!stackRow) continue;
      const stackId = stackRow.id;

      // Add steps
      let stepOrder = 1;
      for (const step of stack.steps) {
        const toolRow = await dbGet<{ id: number }>('SELECT id FROM tools WHERE name = ?', [step.tool]);
        if (toolRow) {
          await dbRun(
            'INSERT OR IGNORE INTO stack_steps (stack_id, step_order, tool_id, role) VALUES (?, ?, ?, ?)',
            [stackId, stepOrder, toolRow.id, step.role]
          );
          stepOrder++;
        }
      }
    } catch (e) {
      console.error(`Failed to insert stack ${stack.name}`, e);
    }
  }

  // 6. Seed a default favorite collection
  console.log('Seeding system collections...');
  try {
    const colRes = await dbRun(
      'INSERT OR IGNORE INTO collections (id, name, description, is_system) VALUES (1, ?, ?, ?)',
      ['Best Tools for Students', 'A handpicked compilation of AI tools to write essays, summarize readings, and run math code.', 1]
    );

    const studentTools = ['Claude', 'NotebookLM', 'Julius AI', 'ChatGPT'];
    for (const toolName of studentTools) {
      const toolRow = await dbGet<{ id: number }>('SELECT id FROM tools WHERE name = ?', [toolName]);
      if (toolRow) {
        await dbRun('INSERT OR IGNORE INTO collection_tools (collection_id, tool_id) VALUES (?, ?)', [
          1,
          toolRow.id
        ]);
      }
    }
  } catch (e) {
    console.error('Failed to seed system collections', e);
  }

  console.log('Database seeding completed successfully.');
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error('Seeding run error:', err);
    process.exit(1);
  });
}
