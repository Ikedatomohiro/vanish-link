"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Lock,
  Clock,
  Copy,
  Check,
  Loader2,
  Eye,
  Shield,
  Timer,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { encrypt } from "@/lib/crypto";
import { copyToClipboard } from "@/lib/clipboard";

type TTLOption = "1h" | "24h" | "7d";

const TTL_LABELS: Record<TTLOption, string> = {
  "1h": "1時間",
  "24h": "24時間",
  "7d": "7日間",
};

export function CreateSecretForm() {
  const [secret, setSecret] = useState("");
  const [ttl, setTtl] = useState<TTLOption>("24h");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secret.trim()) {
      toast.error("機密テキストを入力してください");
      return;
    }

    if (usePassword && !password) {
      toast.error("パスワードを入力してください");
      return;
    }

    setIsLoading(true);

    try {
      // クライアントサイドで暗号化
      const { encryptedData, keyBase64, salt } = await encrypt(
        secret,
        usePassword ? password : undefined
      );

      // サーバーに暗号文を保存
      const res = await fetch("/api/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedData,
          hasPassword: usePassword,
          salt,
          ttl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "リンクの生成に失敗しました");
      }

      const { id } = await res.json();

      // 復号鍵をURLフラグメントに埋め込む（サーバーには送信されない）
      const url = `${window.location.origin}/view/${id}#${keyBase64}`;
      setGeneratedUrl(url);
      toast.success("リンクを生成しました");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "エラーが発生しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await copyToClipboard(generatedUrl);
    setCopied(true);
    toast.success("クリップボードにコピーしました");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSecret("");
    setPassword("");
    setUsePassword(false);
    setGeneratedUrl(null);
    setCopied(false);
  };

  // リンク生成完了画面
  if (generatedUrl) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <Check className="h-6 w-6 text-accent" />
          </div>
          <CardTitle className="text-xl">リンクを生成しました</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            このリンクは<strong>1回の閲覧</strong>後、または
            <strong>{TTL_LABELS[ttl]}</strong>後に自動消滅します
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              readOnly
              value={generatedUrl}
              className="pr-20 font-mono text-xs bg-muted/50"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="ml-1 text-xs">
                {copied ? "コピー済み" : "コピー"}
              </span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3 w-3" />
              1回限り
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Timer className="h-3 w-3" />
              {TTL_LABELS[ttl]}で消滅
            </Badge>
            {usePassword && (
              <Badge variant="secondary" className="gap-1">
                <KeyRound className="h-3 w-3" />
                パスワード保護
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              E2E暗号化
            </Badge>
          </div>

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full mt-4"
          >
            新しいリンクを作成
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 入力フォーム
  return (
    <Card className="w-full max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          機密情報を安全に共有
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 機密テキスト入力 */}
          <div className="space-y-2">
            <Label htmlFor="secret">機密テキスト</Label>
            <Textarea
              id="secret"
              placeholder="パスワード、APIキー、機密メモなどを入力..."
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              rows={5}
              className="resize-none font-mono text-sm"
              maxLength={10000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {secret.length.toLocaleString()} / 10,000
            </p>
          </div>

          {/* 消滅期限 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              消滅期限
            </Label>
            <div className="flex gap-2">
              {(Object.keys(TTL_LABELS) as TTLOption[]).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={ttl === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTtl(option)}
                  className="flex-1"
                >
                  {TTL_LABELS[option]}
                </Button>
              ))}
            </div>
          </div>

          {/* パスワード保護 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="use-password"
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5" />
                パスワード保護
              </Label>
              <Switch
                id="use-password"
                checked={usePassword}
                onCheckedChange={setUsePassword}
              />
            </div>
            {usePassword && (
              <Input
                type="password"
                placeholder="閲覧時に必要なパスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            )}
          </div>

          {/* 送信ボタン */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !secret.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                暗号化してリンクを生成中...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                リンクを生成
              </>
            )}
          </Button>

          {/* 信頼バッジ */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              AES-256-GCM暗号化
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              ゼロ知識設計
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              1回限り閲覧
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
