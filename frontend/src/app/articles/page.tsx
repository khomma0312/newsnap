import { Suspense } from "react";
import ArticleDetail from "./ArticleDetail";

export default function ArticlesPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-12">読み込み中...</p>}>
      <ArticleDetail />
    </Suspense>
  );
}
