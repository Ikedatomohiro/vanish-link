import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vanish Link - パスワードを安全に送る無料ツール｜ワンタイムリンク生成",
  description:
    "パスワードやAPIキーを安全に共有できる無料ツール。1回閲覧で自動消滅するワンタイムリンクを生成。エンドツーエンド暗号化でサーバーにもデータは残りません。ログイン不要で今すぐ使えます。",
  keywords: [
    "パスワード 安全に送る",
    "パスワード 共有 方法",
    "パスワード 安全 送信",
    "機密情報 共有",
    "ワンタイムリンク",
    "ワンタイムURL",
    "秘密のリンク",
    "自動消滅リンク",
    "パスワード送信ツール",
    "暗号化リンク",
    "セキュリティ",
    "E2E暗号化",
    "Slack パスワード 送る",
    "パスワード メール 危険",
    "one time secret",
    "password sharing tool",
    "secure link generator",
  ],
  openGraph: {
    title: "Vanish Link - パスワードを安全に送る無料ツール",
    description:
      "1回閲覧で自動消滅。ログイン不要・無料でパスワードやAPIキーを安全に共有できるワンタイムリンク生成ツール。",
    type: "website",
    locale: "ja_JP",
    siteName: "Vanish Link",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vanish Link - パスワードを安全に送る無料ツール",
    description:
      "1回閲覧で自動消滅。ログイン不要でパスワードを安全に共有。エンドツーエンド暗号化。",
  },
  alternates: {
    canonical: "https://vanish-link.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
