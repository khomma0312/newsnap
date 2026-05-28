# NewsSnap

ニュースクリップ＋AI要約アプリ

インフラ（AWS・Terraform）は別リポジトリ [`newsnap-infra`](../newsnap-infra) で管理。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 15（Static Export）|
| バックエンド | Hono（Node.js）|
| 認証 | Amazon Cognito（Hosted UI）|
| 外部API | NewsAPI、AWS Bedrock（Claude 3 Haiku）|

## ディレクトリ構成

```
newsnap/
├── frontend/                  # Next.js（Static Export）
│   └── src/
│       ├── app/               # App Router ページ
│       │   ├── page.tsx               # / トップ（記事一覧）
│       │   ├── articles/[id]/page.tsx # 記事詳細
│       │   ├── explore/page.tsx       # ニュース探索
│       │   ├── tags/page.tsx          # タグ管理
│       │   └── callback/page.tsx      # Cognito コールバック
│       ├── lib/
│       │   ├── api.ts         # バックエンド API クライアント
│       │   └── auth.ts        # Cognito 認証ヘルパー
│       └── types/index.ts     # 型定義
│
└── backend/                   # Hono（Node.js）
    └── src/
        ├── index.ts           # エントリポイント
        ├── middleware/
        │   └── auth.ts        # Cognito JWT 検証
        ├── routes/
        │   ├── auth.ts        # /auth/token
        │   ├── articles.ts    # /api/articles CRUD + 要約
        │   ├── tags.ts        # /api/tags CRUD
        │   └── explore.ts     # /api/explore (NewsAPI)
        ├── db/
        │   ├── client.ts      # PostgreSQL 接続
        │   └── schema.sql     # テーブル定義
        └── lib/
            ├── bedrock.ts     # AWS Bedrock クライアント
            ├── newsapi.ts     # NewsAPI クライアント
            └── ogp.ts         # OGP メタ情報取得
```

## ローカル開発

frontend・backend はそれぞれ独立した `package-lock.json` を持つ。  
`npm install` / `npm ci` は各ディレクトリ内で実行する。

### フロントエンド

```bash
cd frontend
cp .env.local.example .env.local  # 値を編集
npm install      # frontend/package-lock.json を生成
npm run dev
```

### バックエンド

```bash
cd backend
cp .env.example .env  # 値を編集
npm install      # backend/package-lock.json を生成
npm run dev
```

### まとめて起動したい場合（ルートから）

```bash
npm run install:all   # frontend と backend を順番に npm install
npm run dev:frontend
npm run dev:backend
```

### DB セットアップ

```bash
psql -U newsnap -d newsnap -f backend/src/db/schema.sql
```

## デプロイ

AWS リソースの作成・更新は [`newsnap-infra`](../newsnap-infra) の手順に従う。

### CI/CD でのビルド

frontend と backend はパイプラインを分けて、それぞれのディレクトリで `npm ci` を実行する。  
`npm ci` はロックファイルを厳密に参照するため、**不要なパッケージは一切インストールされない**。

```bash
# フロントエンドのビルド
cd frontend
npm ci           # frontend/package-lock.json だけを参照
npm run build    # out/ に静的ファイルを出力

# バックエンドの Docker ビルド（Dockerfile 内）
cd backend
npm ci --omit=dev   # devDependencies を除いた本番インストール
```

詳細は `newsnap-infra/infra-spec.md` を参照。
