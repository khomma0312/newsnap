"use client";

/**
 * /articles/:id 記事詳細
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

  if (!article) return <p>読み込み中...</p>;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>{article.title}</h1>

      {article.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.thumbnailUrl} alt={article.title} style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} />
      )}

      {/* 要約 */}
      <section>
        <h2>AI 要約</h2>
        <p>{article.summary ?? "（要約なし）"}</p>
        <button onClick={handleRegenerate} disabled={loading}>
          {loading ? "生成中..." : "要約を再生成"}
        </button>
      </section>

      {/* タグ */}
      <section>
        <h2>タグ</h2>
        {article.tags.map((tag) => (
          <span key={tag.id} style={{ background: "#e0e0e0", borderRadius: 4, padding: "2px 8px", marginRight: 4 }}>
            {tag.name}
          </span>
        ))}
        {/* TODO: タグ追加・削除 UI */}
      </section>

      {/* 元記事リンク */}
      <a href={article.url} target="_blank" rel="noopener noreferrer">
        元記事を開く ↗
      </a>

      {/* 削除 */}
      <button onClick={handleDelete} style={{ color: "red", marginTop: 16, display: "block" }}>
        記事を削除
      </button>
    </main>
  );
}
