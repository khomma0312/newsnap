"use client";

import { useEffect, useState } from "react";
import { isLoggedIn, buildLoginUrl, buildLogoutUrl, clearTokens } from "@/lib/auth";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(() =>
    typeof window === "undefined" ? null : isLoggedIn()
  );

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  function handleLogout() {
    clearTokens();
    window.location.href = buildLogoutUrl();
  }

  return (
    <header style={{
      backgroundColor: "#fff",
      borderBottom: "1px solid #e5e7eb",
      position: "sticky",
      top: 0,
      zIndex: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      height: "3.5rem",
    }}>
      <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>Newsnap</span>
      {loggedIn === true && (
        <button
          onClick={handleLogout}
          style={{ fontSize: "0.875rem", color: "#4b5563", cursor: "pointer", background: "none", border: "none" }}
        >
          ログアウト
        </button>
      )}
      {loggedIn === false && (
        <a
          href={buildLoginUrl()}
          style={{
            fontSize: "0.875rem",
            backgroundColor: "#2563eb",
            color: "#fff",
            padding: "0.375rem 1rem",
            borderRadius: "0.375rem",
            textDecoration: "none",
          }}
        >
          ログイン
        </a>
      )}
    </header>
  );
}
