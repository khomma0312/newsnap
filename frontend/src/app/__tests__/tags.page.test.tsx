import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ----------------------------------------------------------------
// API モック
// ----------------------------------------------------------------
vi.mock("@/lib/api", () => ({
  getTags:    vi.fn(),
  createTag:  vi.fn(),
  updateTag:  vi.fn(),
  deleteTag:  vi.fn(),
}));

import TagsPage from "../tags/page.js";
import * as api from "@/lib/api";

const INITIAL_TAGS = [
  { id: "t1", userId: "u1", name: "Tech",   articleCount: 3 },
  { id: "t2", userId: "u1", name: "Design", articleCount: 0 },
];

describe("TagsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getTags).mockResolvedValue(INITIAL_TAGS);
  });

  // ----------------------------------------------------------------
  // 一覧表示
  // ----------------------------------------------------------------
  it("タグ一覧を表示する", async () => {
    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tech")).toBeInTheDocument();
      expect(screen.getByText("Design")).toBeInTheDocument();
    });

    expect(screen.getByText(/3 件/)).toBeInTheDocument();
    expect(screen.getByText(/0 件/)).toBeInTheDocument();
  });

  // ----------------------------------------------------------------
  // タグ追加
  // ----------------------------------------------------------------
  it("新しいタグを追加すると一覧に表示される", async () => {
    const user = userEvent.setup();
    vi.mocked(api.createTag).mockResolvedValue({
      id: "t3", userId: "u1", name: "News",
    });

    render(<TagsPage />);
    await waitFor(() => screen.getByText("Tech"));

    await user.type(screen.getByPlaceholderText("新しいタグ名"), "News");
    await user.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => {
      expect(screen.getByText("News")).toBeInTheDocument();
    });
    expect(api.createTag).toHaveBeenCalledWith({ name: "News" });
  });

  it("空文字では追加しない", async () => {
    const user = userEvent.setup();
    render(<TagsPage />);
    await waitFor(() => screen.getByText("Tech"));

    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(api.createTag).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // タグ編集
  // ----------------------------------------------------------------
  it("編集ボタンで入力フィールドが表示され、保存できる", async () => {
    const user = userEvent.setup();
    vi.mocked(api.updateTag).mockResolvedValue({
      id: "t1", userId: "u1", name: "Tech Updated",
    });

    render(<TagsPage />);
    await waitFor(() => screen.getByText("Tech"));

    // 編集モードへ
    const editButtons = screen.getAllByRole("button", { name: "編集" });
    await user.click(editButtons[0]);

    // 入力フィールドに "Updated" を追記
    const input = screen.getByDisplayValue("Tech");
    await user.clear(input);
    await user.type(input, "Tech Updated");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(screen.getByText("Tech Updated")).toBeInTheDocument();
    });
    expect(api.updateTag).toHaveBeenCalledWith("t1", { name: "Tech Updated" });
  });

  // ----------------------------------------------------------------
  // タグ削除
  // ----------------------------------------------------------------
  it("削除確認で OK を選択するとタグが消える", async () => {
    const user = userEvent.setup();
    vi.mocked(api.deleteTag).mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<TagsPage />);
    await waitFor(() => screen.getByText("Tech"));

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Tech")).not.toBeInTheDocument();
    });
    expect(api.deleteTag).toHaveBeenCalledWith("t1");
  });

  it("削除確認でキャンセルを選択するとタグが残る", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<TagsPage />);
    await waitFor(() => screen.getByText("Tech"));

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[0]);

    expect(screen.getByText("Tech")).toBeInTheDocument();
    expect(api.deleteTag).not.toHaveBeenCalled();
  });
});
