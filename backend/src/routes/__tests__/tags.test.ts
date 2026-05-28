import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ----------------------------------------------------------------
// db モック（vi.hoisted でインポートより先に定義）
// ----------------------------------------------------------------
const { mockSelect, mockInsert, mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("../../db/client.js", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  },
}));

import tagsRouter from "../tags.js";

// auth ミドルウェアをスタブしたテスト用アプリ
const makeApp = () => {
  const app = new Hono<{ Variables: { userId: string } }>();
  app.use("*", async (c, next) => {
    c.set("userId", "user-123");
    await next();
  });
  app.route("/", tagsRouter);
  return app;
};

// ----------------------------------------------------------------
// GET /
// ----------------------------------------------------------------
describe("GET /api/tags", () => {
  it("タグ一覧（記事数付き）を返す", async () => {
    const mockTags = [
      { id: "t1", userId: "user-123", name: "Tech", articleCount: 3 },
      { id: "t2", userId: "user-123", name: "News", articleCount: 1 },
    ];
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockTags),
            }),
          }),
        }),
      }),
    });

    const res = await makeApp().request("/");

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(2);
    expect(json[0].name).toBe("Tech");
    expect(json[0].articleCount).toBe(3);
  });
});

// ----------------------------------------------------------------
// POST /
// ----------------------------------------------------------------
describe("POST /api/tags", () => {
  it("タグを作成して 201 を返す", async () => {
    const created = { id: "t3", userId: "user-123", name: "Design" };
    mockInsert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([created]),
      }),
    });

    const res = await makeApp().request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Design" }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.name).toBe("Design");
  });
});

// ----------------------------------------------------------------
// PUT /:id
// ----------------------------------------------------------------
describe("PUT /api/tags/:id", () => {
  it("タグ名を更新して返す", async () => {
    const updated = { id: "t1", userId: "user-123", name: "Updated" };
    mockUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updated]),
        }),
      }),
    });

    const res = await makeApp().request("/t1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated" }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe("Updated");
  });

  it("存在しないタグは 404 を返す", async () => {
    mockUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await makeApp().request("/not-exist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X" }),
    });

    expect(res.status).toBe(404);
  });
});

// ----------------------------------------------------------------
// DELETE /:id
// ----------------------------------------------------------------
describe("DELETE /api/tags/:id", () => {
  beforeEach(() => {
    mockDelete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("204 を返す", async () => {
    const res = await makeApp().request("/t1", { method: "DELETE" });
    expect(res.status).toBe(204);
  });
});
