# Vanish Link

消える。だから、安心。

1回限りの閲覧で自動消滅する、安全な機密情報共有リンクを生成するWebアプリケーションです。

## 特徴

- **エンドツーエンド暗号化** - AES-256-GCMによるクライアントサイド暗号化。サーバーには暗号文のみ保存
- **ゼロ知識設計** - 復号鍵はURLフラグメント(#)に埋め込まれ、サーバーには送信されない
- **1回限りの閲覧** - 閲覧後、即座にサーバーからデータを物理削除
- **自動消滅** - TTL（1時間/24時間/7日）による自動データ消滅
- **パスワード保護** - オプションでパスワードによる二重暗号化
- **ログイン不要** - 誰でもすぐに使える

## 技術スタック

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Upstash Redis (TTL付き一時保存)
- **Encryption:** Web Crypto API (AES-256-GCM)
- **Deployment:** Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Upstash Redisの設定

[Upstash Console](https://console.upstash.com) でRedisデータベースを作成し、`.env.local`に接続情報を設定:

```bash
cp .env.example .env.local
```

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 を開いてください。

## デプロイ (Vercel)

1. GitHubリポジトリをVercelに接続
2. 環境変数 `UPSTASH_REDIS_REST_URL` と `UPSTASH_REDIS_REST_TOKEN` を設定
3. デプロイ

## セキュリティ設計

```
[ユーザー入力] → [クライアントサイドAES-GCM暗号化] → [暗号文をサーバーに送信]
                                                           ↓
[URLに復号鍵を埋め込み] ← [UUID返却] ← [Redis (TTL付き) に保存]

[閲覧者がURL開く] → [サーバーからGETDEL] → [クライアントサイド復号] → [表示]
```

- 復号鍵はURLフラグメント(`#`以降)に含まれるため、サーバーに送信されない
- サーバー管理者も暗号文しか見えない（ゼロ知識）
- `GETDEL`コマンドで取得と削除をアトミックに実行
