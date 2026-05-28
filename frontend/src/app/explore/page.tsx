"use client";

/**
 * /explore ニュース探索（NewsAPI）
 */

import { useState } from "react";
import { exploreNews, createArticle } from "@/lib/api";
import type { NewsArticle } from "@/types";

const CATEGORIES = ["", "technology", "business", "health", "science", "sports", "entertainment"];

export default function ExplorePage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    const articles = await exploreNews({ keyword, category });
    setResults(articles);
  };

  const handleSave = async (article: NewsArticle) => {
    await createArticle({ url: article.url });
    setSaved((prev) => new Set(prev).add(article.url));
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>ニュースを探す</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="キーワード"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c || "カテゴリなし"}</option>
          ))}
        </select>
        <button onClick={handleSearch}>検索</button>
      </div>

      <section>
        {results.map((article) => (
          <article key={article.url} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 16 }}>
            {article.urlToImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.urlToImage} alt={article.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
            )}
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <small>{article.source.name} · {new Date(article.publishedAt).toLocaleDateString("ja-JP")}</small>
            <div style={{ marginTop: 8 }}>
              {saved.has(article.url) ? (
                <span>✅ 保存済み</span>
              ) : (
                <button onClick={() => handleSave(article)}>保存</button>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
