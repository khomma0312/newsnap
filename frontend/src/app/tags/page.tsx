"use client";

import { useEffect, useState } from "react";
import { getTags, createTag, updateTag, deleteTag } from "@/lib/api";
import type { Tag } from "@/types";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    getTags().then(setTags).catch(console.error);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const tag = await createTag({ name: newName.trim() });
    setTags((prev) => [...prev, tag]);
    setNewName("");
  };

  const handleUpdate = async (id: string) => {
    const tag = await updateTag(id, { name: editingName });
    setTags((prev) => prev.map((t) => (t.id === id ? tag : t)));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("タグを削除しますか？")) return;
    await deleteTag(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">タグ管理</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="新しいタグ名"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          onClick={handleCreate}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-dark transition-colors"
        >
          追加
        </button>
      </div>

      <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {tags.map((tag) => (
          <li key={tag.id} className="flex items-center gap-3 px-4 py-3">
            {editingId === tag.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={() => handleUpdate(tag.id)}
                  className="text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary-dark transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-900">{tag.name}</span>
                <small className="text-xs text-gray-400">（{tag.articleCount ?? 0} 件）</small>
                <button
                  onClick={() => { setEditingId(tag.id); setEditingName(tag.name); }}
                  className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="text-sm text-danger border border-danger px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                >
                  削除
                </button>
              </>
            )}
          </li>
        ))}
        {tags.length === 0 && (
          <li className="text-center text-gray-400 text-sm py-8">タグがありません</li>
        )}
      </ul>
    </main>
  );
}
