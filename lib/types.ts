export type Author = {
  slug: string;
  name: string;
  bio: string;
  avatar?: string;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedDate: string;
  coverImage?: string;
  author: Author;
};

export type Review = {
  slug: string;
  productName: string;
  rating: number;
  summary: string;
  content: string;
  pros: string[];
  cons: string[];
  coverImage?: string;
  author: Author;
};

export type Category = {
  slug: string;
  name: string;
  description?: string;
};

export type SiteConfig = {
  siteName: string;
  domain: string;
  menu: { label: string; href: string }[];
  categories: Category[];
};
