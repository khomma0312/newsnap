"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getArticle, deleteArticle, regenerateSummary, getTags, addTagToArticle, removeTagFromArticle } from "@/lib/api";
import type { Article, Tag } from "@/types";

export default function ArticleDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { router.replace("/"); return; }
    getArticle(id).then(setArticle).catch(console.error);
    getTags().then(setAllTags).catch(console.error);
  }, [id, router]);

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

  const handleAddTag = async (tagId: string) => {
    await addTagToArticle(id, tagId);
    const updated = await getArticle(id);
    setArticle(updated);
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTagFromArticle(id, tagId);
    const updated = await getArticle(id);
    setArticle(updated);
  };

  if (!article) return <p className="text-center text-gray-400 py-12">読み込み中...</p>;

  const attachedTagIds = new Set(article.tags.map((t) => t.id));
  const availableTags = allTags.filter((t) => !attachedTagIds.has(t.id));

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

        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 text-xs bg-primary text-white px-2.5 py-1 rounded-full"
            >
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:opacity-70 leading-none"
                aria-label={`${tag.name}を外す`}
              >
                ×
              </button>
            </span>
          ))}
          {article.tags.length === 0 && (
            <span className="text-sm text-gray-400">タグなし</span>
          )}
        </div>

        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag.id)}
                className="text-xs border border-gray-300 text-gray-600 px-2.5 py-1 rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                + {tag.name}
              </button>
            ))}
          </div>
        )}
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
