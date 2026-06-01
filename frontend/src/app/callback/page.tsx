"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveTokens } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
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
  }, [router, searchParams]);

  return <p>ログイン処理中...</p>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p>ログイン処理中...</p>}>
      <CallbackContent />
    </Suspense>
  );
}
