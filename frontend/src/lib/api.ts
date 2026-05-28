/**
 * バックエンド API クライアント
 * すべてのリクエストに Authorization ヘッダーを付与する。
 */

import type {
  Article,
  Tag,
  NewsArticle,
  CreateArticleRequest,
  CreateTagRequest,
  ExploreQuery,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchWithAuth<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  // クライアントサイドでトークンを取得（/callback で localStorage に保存する想定）
  const token =
    typeof window !== "undefined" ? localStorage.getItem("id_token") : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ---------- Articles ----------

export const getArticles = () =>
  fetchWithAuth<Article[]>("/api/articles");

export const getArticle = (id: string) =>
  fetchWithAuth<Article>(`/api/articles/${id}`);

export const createArticle = (body: CreateArticleRequest) =>
  fetchWithAuth<Article>("/api/articles", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const deleteArticle = (id: string) =>
  fetchWithAuth<void>(`/api/articles/${id}`, { method: "DELETE" });

export const regenerateSummary = (id: string) =>
  fetchWithAuth<Article>(`/api/articles/${id}/summarize`, { method: "POST" });

// ---------- Tags ----------

export const getTags = () => fetchWithAuth<Tag[]>("/api/tags");

export const createTag = (body: CreateTagRequest) =>
  fetchWithAuth<Tag>("/api/tags", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateTag = (id: string, body: CreateTagRequest) =>
  fetchWithAuth<Tag>(`/api/tags/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const deleteTag = (id: string) =>
  fetchWithAuth<void>(`/api/tags/${id}`, { method: "DELETE" });

export const addTagToArticle = (articleId: string, tagId: string) =>
  fetchWithAuth<void>(`/api/articles/${articleId}/tags/${tagId}`, {
    method: "POST",
  });

export const removeTagFromArticle = (articleId: string, tagId: string) =>
  fetchWithAuth<void>(`/api/articles/${articleId}/tags/${tagId}`, {
    method: "DELETE",
  });

// ---------- Explore (NewsAPI) ----------

export const exploreNews = (query: ExploreQuery) => {
  const params = new URLSearchParams(
    Object.entries(query).filter(([, v]) => v) as [string, string][]
  );
  return fetchWithAuth<NewsArticle[]>(`/api/explore?${params}`);
};
