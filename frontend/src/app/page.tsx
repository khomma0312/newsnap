"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticles } from "@/lib/api";
import { isLoggedIn, buildLoginUrl } from "@/lib/auth";
import type { Article } from "@/types";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedTagIds] = useState<string[]>([]);
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
      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Newsnap</h1>
        <p className="text-gray-500 mb-8">ログインして保存済み記事を確認しましょう。</p>
        <a
          href={buildLoginUrl()}
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-md hover:bg-primary-dark transition-colors font-medium"
        >
          ログイン
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">保存済み記事</h1>
      </div>

      <input
        type="text"
        placeholder="キーワードで検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />

      <section className="space-y-4">
        {filtered.map((article) => (
          <article key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
            {article.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.thumbnailUrl} alt={article.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h2 className="font-semibold text-gray-900 mb-1">
                <Link href={`/articles?id=${article.id}`} className="hover:text-primary">
                  {article.title}
                </Link>
              </h2>
              <p className="text-sm text-gray-600 mb-3">{article.summary?.slice(0, 150)}</p>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {article.tags.map((tag) => (
                  <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {tag.name}
                  </span>
                ))}
                <small className="text-xs text-gray-400 ml-auto">
                  {new Date(article.createdAt).toLocaleDateString("ja-JP")}
                </small>
              </div>
              <Link
                href={`/articles?id=${article.id}`}
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                詳細を見る →
              </Link>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">記事がありません</p>
        )}
      </section>
    </main>
  );
}
