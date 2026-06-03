"use client";

import { buildLoginUrl, buildLogoutUrl, clearTokens } from "@/lib/auth";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";

export default function Header() {
  const loggedIn = useIsLoggedIn();

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
      {loggedIn && (
        <button
          onClick={handleLogout}
          style={{ fontSize: "0.875rem", color: "#4b5563", cursor: "pointer", background: "none", border: "none" }}
        >
          ログアウト
        </button>
      )}
      {!loggedIn && (
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
