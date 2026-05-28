"use client";

/**
 * /tags タグ管理
 */

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
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>タグ管理</h1>

      {/* 新規登録 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="新しいタグ名"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={handleCreate}>追加</button>
      </div>

      {/* タグ一覧 */}
      <ul style={{ listStyle: "none" }}>
        {tags.map((tag) => (
          <li key={tag.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #eee" }}>
            {editingId === tag.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button onClick={() => handleUpdate(tag.id)}>保存</button>
                <button onClick={() => setEditingId(null)}>キャンセル</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1 }}>{tag.name}</span>
                <small>（{tag.articleCount ?? 0} 件）</small>
                <button onClick={() => { setEditingId(tag.id); setEditingName(tag.name); }}>編集</button>
                <button onClick={() => handleDelete(tag.id)} style={{ color: "red" }}>削除</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
