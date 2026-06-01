"use client";

/**
 * / トップ（保存済み記事一覧 + 検索・フィルタ）
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticles } from "@/lib/api";
import { isLoggedIn, buildLoginUrl } from "@/lib/auth";
import type { Article } from "@/types";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const authenticated = isLoggedIn();
    setLoggedIn(authenticated);
    if (authenticated) {
      getArticles().then(setArticles).catch(console.error);
    }
  }, []);

  const filtered = articles.filter((a) => {
    const matchesKeyword =
      !keyword ||
      a.title.includes(keyword) ||
      (a.summary ?? "").includes(keyword);
    const matchesTags =
      selectedTagIds.length === 0 ||
      selectedTagIds.every((id) => a.tags.some((t) => t.id === id));
    return matchesKeyword && matchesTags;
  });

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "4rem 1rem", textAlign: "center" }}>
        <h1>NewsSnap</h1>
        <p>ログインして保存済み記事を確認しましょう。</p>
        <a href={buildLoginUrl()} style={{ display: "inline-block", marginTop: "1rem", padding: "0.6rem 1.5rem", background: "#0070f3", color: "#fff", borderRadius: 6, textDecoration: "none" }}>
          Googleアカウントでログイン
        </a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>NewsSnap</h1>

      {/* 検索バー */}
      <input
        type="text"
        placeholder="キーワードで検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* TODO: タグフィルタ（TagFilter コンポーネント） */}

      <Link href="/explore">ニュースを探す →</Link>

      {/* 記事一覧 */}
      <section>
        {filtered.map((article) => (
          <article key={article.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 16 }}>
            {article.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.thumbnailUrl} alt={article.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            )}
            <h2>
              <Link href={`/articles/${article.id}`}>{article.title}</Link>
            </h2>
            <p>{article.summary?.slice(0, 150)}</p>
            <div>
              {article.tags.map((tag) => (
                <span key={tag.id} style={{ background: "#e0e0e0", borderRadius: 4, padding: "2px 8px", marginRight: 4 }}>
                  {tag.name}
                </span>
              ))}
            </div>
            <small>{new Date(article.createdAt).toLocaleDateString("ja-JP")}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
