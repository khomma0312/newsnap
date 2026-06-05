import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createArticle, getArticle, getArticles } from "../api.js";

// テスト用ダミーデータ
const MOCK_ARTICLE = {
  id: "a1",
  userId: "u1",
  url: "https://example.com",
  title: "Test Article",
  thumbnailUrl: null,
  summary: "要約テスト",
  createdAt: "2026-01-01T00:00:00Z",
  tags: [],
};

// fetch モック
const mockFetch = (body: unknown, ok = true, status = 200) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      statusText: ok ? "OK" : "Error",
      json: () => Promise.resolve(body),
    } as Response)
  );
};

describe("fetchWithAuth（API クライアント共通処理）", () => {
  beforeEach(() => {
    localStorage.setItem("id_token", "mock-id-token");
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("Authorization ヘッダーにトークンを付与してリクエストする", async () => {
    mockFetch([MOCK_ARTICLE]);

    await getArticles();

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining("/api/articles"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-id-token",
        }),
      })
    );
  });

  it("トークンがない場合は Authorization ヘッダーを付与しない", async () => {
    localStorage.clear();
    mockFetch([]);

    await getArticles();

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = (init?.headers ?? {}) as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("レスポンスが ok でない場合は例外をスローする", async () => {
    mockFetch({ error: "Unauthorized" }, false, 401);

    await expect(getArticles()).rejects.toThrow("Session expired");
  });
});

describe("getArticles", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("記事一覧を返す", async () => {
    mockFetch([MOCK_ARTICLE]);

    const result = await getArticles();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Test Article");
  });
});

describe("getArticle", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("指定 ID の記事を返す", async () => {
    mockFetch(MOCK_ARTICLE);

    const result = await getArticle("a1");

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining("/api/articles/a1"),
      expect.anything()
    );
    expect(result.id).toBe("a1");
  });
});

describe("createArticle", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("URL を送信して作成された記事を返す", async () => {
    mockFetch(MOCK_ARTICLE);

    const result = await createArticle({ url: "https://example.com" });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining("/api/articles"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ url: "https://example.com" }),
      })
    );
    expect(result.url).toBe("https://example.com");
  });
});
