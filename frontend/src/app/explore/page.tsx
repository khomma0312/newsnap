"use client";

import { useState } from "react";
import { exploreNews, createArticle } from "@/lib/api";
import type { NewsArticle } from "@/types";
import { isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";

const CATEGORIES = ["", "technology", "business", "health", "science", "sports", "entertainment"];

export default function ExplorePage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const router = useRouter();

  if (isLoggedIn() === false) {
    router.replace("/");
    return null;
  }

  const handleSearch = async () => {
    const articles = await exploreNews({ keyword, category });
    setResults(articles);
  };

  const handleSave = async (article: NewsArticle) => {
    setSaving((prev) => new Set(prev).add(article.url));
    try {
      await createArticle({ url: article.url });
      setSaved((prev) => new Set(prev).add(article.url));
    } finally {
      setSaving((prev) => { const next = new Set(prev); next.delete(article.url); return next; });
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ニュースを探す</h1>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="キーワード"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c || "カテゴリなし"}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-dark transition-colors"
        >
          検索
        </button>
      </div>

      <section className="space-y-4">
        {results.map((article) => (
          <article key={article.url} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
            {article.urlToImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.urlToImage} alt={article.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h2 className="font-semibold text-gray-900 mb-1">{article.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{article.description}</p>
              <div className="flex items-center justify-between">
                <small className="text-xs text-gray-400">
                  {article.source.name} · {new Date(article.publishedAt).toLocaleDateString("ja-JP")}
                </small>
                {saved.has(article.url) ? (
                  <span className="text-xs text-green-600 font-medium">✓ 保存済み</span>
                ) : (
                  <button
                    onClick={() => handleSave(article)}
                    disabled={saving.has(article.url)}
                    className="text-sm bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving.has(article.url) ? "保存中..." : "保存"}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
