"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveTokens } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      router.replace("/");
      return;
    }

    fetch(`${API_URL}/api/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
        return res.json();
      })
      .then((data: { id_token: string; refresh_token?: string }) => {
        saveTokens(data.id_token, data.refresh_token);
        window.location.href = "/";
      })
      .catch((err) => {
        console.error("Token exchange error:", err);
        router.replace("/");
      });
  }, [router]);

  return <p>ログイン処理中...</p>;
}
