// ============================================================
// ドメイン型定義
// ============================================================

export type Article = {
  id: string;
  userId: string;
  url: string;
  title: string;
  thumbnailUrl: string | null;
  summary: string | null;
  createdAt: string; // ISO 8601
  tags: Tag[];
};

export type Tag = {
  id: string;
  userId: string;
  name: string;
  articleCount?: number;
};

// NewsAPI レスポンス
export type NewsArticle = {
  title: string;
  url: string;
  urlToImage: string | null;
  source: { name: string };
  publishedAt: string;
  description: string | null;
};

// API リクエスト / レスポンス
export type CreateArticleRequest = {
  url: string;
};

export type CreateTagRequest = {
  name: string;
};

export type ExploreQuery = {
  keyword?: string;
  category?: string;
};
