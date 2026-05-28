"use client";

/**
 * /callback  Cognito 認証後のコールバック処理
 *
 * Cognito Hosted UI から authorization_code が渡される。
 * バックエンドの /auth/token エンドポイントにコードを渡し、
 * 取得したトークンを localStorage に保存してトップへリダイレクト。
 */

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.replace("/");
      return;
    }

    fetch(`${API_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data: { id_token: string }) => {
        localStorage.setItem("id_token", data.id_token);
        router.replace("/");
      })
      .catch(() => router.replace("/"));
  }, [router, searchParams]);

  return <p>ログイン処理中...</p>;
}
