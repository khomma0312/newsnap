"use client";

import { useEffect, useState } from "react";
import { isLoggedIn, buildLoginUrl, buildLogoutUrl, clearTokens } from "@/lib/auth";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  function handleLogout() {
    clearTokens();
    window.location.href = buildLogoutUrl();
  }

  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.75rem 1.5rem",
      borderBottom: "1px solid #e0e0e0",
    }}>
      <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>NewsSnap</span>
      {loggedIn === true && (
        <button onClick={handleLogout} style={{ cursor: "pointer" }}>
          ログアウト
        </button>
      )}
      {loggedIn === false && (
        <a href={buildLoginUrl()}>ログイン</a>
      )}
    </header>
  );
}
