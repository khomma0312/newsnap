"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/", label: "保存済み記事" },
  { href: "/explore", label: "ニュースを探す" },
];

export default function NavTabs() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(() =>
    typeof window === "undefined" ? false : isLoggedIn()
  );

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  if (!loggedIn) return null;

  return (
    <nav style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
      <div style={{ maxWidth: "64rem", margin: "0 auto", padding: "0 1.5rem", display: "flex", gap: "1.5rem" }}>
        {TABS.map(({ href, label }) => {
          const normalize = (p: string) => p.replace(/\/$/, "") || "/";
          const active = normalize(pathname) === normalize(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "inline-block",
                padding: "0.75rem 0",
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 400,
                color: active ? "#2563eb" : "#6b7280",
                borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
                textDecoration: "none",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
