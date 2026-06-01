"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getArticle, deleteArticle, regenerateSummary } from "@/lib/api";
import type { Article } from "@/types";

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getArticle(id).then(setArticle).catch(console.error);
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("記事を削除しますか？")) return;
    await deleteArticle(id);
    router.push("/");
  };

  const handleRegenerate = async () => {
    setLoading(true);
    const updated = await regenerateSummary(id);
    setArticle(updated);
    setLoading(false);
  };

  if (!article) return <p className="text-center text-gray-400 py-12">読み込み中...</p>;

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">
        ← 一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h1>

      {article.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.thumbnailUrl} alt={article.title} className="w-full max-h-96 object-cover rounded-lg mb-6" />
      )}

      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">AI 要約</h2>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "生成中..." : "再生成"}
          </button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{article.summary ?? "（要約なし）"}</p>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">タグ</h2>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {tag.name}
            </span>
          ))}
          {article.tags.length === 0 && <span className="text-sm text-gray-400">タグなし</span>}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:text-primary-dark"
        >
          元記事を開く ↗
        </a>
        <button
          onClick={handleDelete}
          className="text-sm text-danger border border-danger px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
        >
          記事を削除
        </button>
      </div>
    </main>
  );
}
