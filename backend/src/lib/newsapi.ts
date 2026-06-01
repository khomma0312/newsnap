/**
 * NewsAPI クライアント
 */

const API_KEY = process.env.NEWS_API_KEY ?? "";
const BASE = "https://newsapi.org/v2";

type NewsApiArticle = {
  title: string;
  url: string;
  urlToImage: string | null;
  source: { name: string };
  publishedAt: string;
  description: string | null;
};

type FetchNewsOptions = {
  keyword?: string;
  category?: string;
};

export async function fetchNews({
  keyword,
  category,
}: FetchNewsOptions): Promise<NewsApiArticle[]> {
  // キーワードがあれば /everything、なければ /top-headlines
  const endpoint =
    keyword
      ? `${BASE}/everything`
      : `${BASE}/top-headlines`;

  const params = new URLSearchParams({ apiKey: API_KEY, pageSize: "20" });
  if (keyword) params.set("q", keyword);
  if (category) params.set("category", category);

  const res = await fetch(`${endpoint}?${params}`);
  if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);

  const data = (await res.json()) as { articles: NewsApiArticle[] };
  return data.articles;
}
