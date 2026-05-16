// Shared Post type — used across all components
// This is the canonical type that matches what the API returns from the database.
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  content: string;
  featured?: boolean;
  likes: number;
  shares: number;
  tags: string[];
}

// Category type used in sidebar and other components
export interface Category {
  name: string;
  count: number;
  color: string;
}
