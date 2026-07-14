export interface Tool {
  id: number;
  name: string;
  logo: string;
  short_description: string;
  long_description: string;
  pricing_type: 'free' | 'freemium' | 'paid';
  platform: string;
  website_url: string;
  rating: number;
  pros: string[];
  cons: string[];
  alternatives: string[];
  region_limited: string;
  featured: boolean;
  approved: boolean;
  categories?: string[];
  tags?: string[];
  use_cases?: string[];
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface StackStep {
  step_order: number;
  tool_id: number;
  tool_name?: string;
  tool_logo?: string;
  role: string;
}

export interface Stack {
  id: number;
  name: string;
  description: string;
  is_featured: boolean;
  steps?: StackStep[];
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  created_at?: string;
  tools?: Tool[];
}

export interface Submission {
  id: number;
  name: string;
  email: string;
  website_url: string;
  description: string;
  pricing_type: string;
  platform: string;
  categories: string;
  tags: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
