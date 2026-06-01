import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";

export const metadata: Metadata = {
  title: "Newsnap",
  description: "ニュースクリップ＋AI要約アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <NavTabs />
        {children}
      </body>
    </html>
  );
}
