"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  ShieldOff,
  Lock,
  Loader2,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { decrypt } from "@/lib/crypto";
import Link from "next/link";

interface ViewSecretProps {
  id: string;
}

type ViewState =
  | "loading"
  | "ready"
  | "password-required"
  | "revealed"
  | "expired"
  | "error";

export function ViewSecret({ id }: ViewSecretProps) {
  const [state, setState] = useState<ViewState>("loading");
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const [salt, setSalt] = useState<string | undefined>();
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyBase64, setKeyBase64] = useState<string | null>(null);

  // URLフラグメントから復号鍵を取得
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setKeyBase64(hash);
    }
  }, []);

  // リンクの有効性チェック
  useEffect(() => {
    const checkSecret = async () => {
      try {
        const res = await fetch(`/api/secrets/${id}/exists`);
        const data = await res.json();

        if (!data.exists) {
          setState("expired");
          return;
        }

        if (data.hasPassword) {
          setState("password-required");
        } else {
          setState("ready");
        }
      } catch {
        setState("error");
      }
    };
    checkSecret();
  }, [id]);

  const revealSecret = useCallback(async () => {
    if (!keyBase64) {
      toast.error("復号鍵が見つかりません。URLが正しいか確認してください。");
      setState("error");
      return;
    }

    setIsDecrypting(true);

    try {
      // サーバーからデータ取得（同時に削除される）
      const res = await fetch(`/api/secrets/${id}`);

      if (!res.ok) {
        if (res.status === 404) {
          setState("expired");
          return;
        }
        throw new Error("データの取得に失敗しました");
      }

      const data = await res.json();
      setEncryptedData(data.encryptedData);
      setSalt(data.salt);

      // クライアントサイドで復号
      const plaintext = await decrypt(
        data.encryptedData,
        keyBase64,
        data.hasPassword ? password : undefined,
        data.salt
      );

      setDecryptedText(plaintext);
      setState("revealed");
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === "OperationError"
      ) {
        // パスワードが間違っている場合、データはすでに削除されている
        // encryptedDataがあればローカルでリトライ可能
        if (encryptedData) {
          toast.error("パスワードが正しくありません。再度お試しください。");
          setIsDecrypting(false);
          return;
        }
        toast.error("復号に失敗しました。URLまたはパスワードが正しくありません。");
        setState("error");
      } else {
        toast.error("エラーが発生しました");
        setState("error");
      }
    } finally {
      setIsDecrypting(false);
    }
  }, [id, keyBase64, password, encryptedData]);

  // ローカルにデータがある場合のリトライ（パスワード間違い時）
  const retryDecrypt = async () => {
    if (!encryptedData || !keyBase64) return;

    setIsDecrypting(true);
    try {
      const plaintext = await decrypt(
        encryptedData,
        keyBase64,
        password,
        salt
      );
      setDecryptedText(plaintext);
      setState("revealed");
    } catch {
      toast.error("パスワードが正しくありません。");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopy = async () => {
    if (!decryptedText) return;
    await navigator.clipboard.writeText(decryptedText);
    setCopied(true);
    toast.success("コピーしました");
    setTimeout(() => setCopied(false), 2000);
  };

  // ローディング
  if (state === "loading") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">リンクを確認中...</p>
        </CardContent>
      </Card>
    );
  }

  // 消滅済み
  if (state === "expired") {
    return (
      <Card className="w-full max-w-lg mx-auto border-muted">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <ShieldOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            このリンクはすでに消滅しました
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            このリンクは閲覧済みか、有効期限切れのため自動消滅しました。
            データはサーバーから完全に削除されています。
          </p>
          <Button variant="outline" render={<Link href="/" />}>
            新しいリンクを作成
          </Button>
        </CardContent>
      </Card>
    );
  }

  // エラー
  if (state === "error") {
    return (
      <Card className="w-full max-w-lg mx-auto border-destructive/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">エラーが発生しました</h2>
          <p className="text-sm text-muted-foreground mb-6">
            リンクが不正か、サーバーエラーが発生しました。
          </p>
          <Button variant="outline" render={<Link href="/" />}>
            トップページへ戻る
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 復号済み（表示中）
  if (state === "revealed" && decryptedText) {
    return (
      <Card className="w-full max-w-lg mx-auto border-accent/30 shadow-lg shadow-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-accent" />
              機密情報
            </CardTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <ShieldOff className="h-3 w-3" />
              閲覧済み・削除済み
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative rounded-md border bg-muted/50 p-4">
            <pre className="whitespace-pre-wrap break-all text-sm font-mono">
              {decryptedText}
            </pre>
          </div>
          <Button onClick={handleCopy} variant="outline" className="w-full">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-accent" />
                コピー済み
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                内容をコピー
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            このデータはサーバーから完全に削除されました。このページを閉じると二度と閲覧できません。
          </p>
        </CardContent>
      </Card>
    );
  }

  // パスワード入力画面
  if (state === "password-required") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">パスワードが必要です</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            この機密情報はパスワードで保護されています
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="view-password">パスワード</Label>
            <Input
              id="view-password"
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && password) {
                  encryptedData ? retryDecrypt() : revealSecret();
                }
              }}
              autoComplete="off"
              autoFocus
            />
          </div>
          <Button
            onClick={encryptedData ? retryDecrypt : revealSecret}
            className="w-full"
            disabled={!password || isDecrypting}
          >
            {isDecrypting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                復号中...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                内容を表示
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            表示後、データはサーバーから完全に削除されます
          </p>
        </CardContent>
      </Card>
    );
  }

  // 閲覧確認画面（パスワードなし）
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
          <EyeOff className="h-6 w-6 text-amber-500" />
        </div>
        <CardTitle className="text-xl">機密情報の閲覧確認</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          この内容は<strong>1回限り</strong>表示されます
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              「表示する」をクリックすると、データはサーバーから即座に削除されます。
              このページを閉じると二度と閲覧できません。
            </p>
          </div>
        </div>
        <Button
          onClick={revealSecret}
          className="w-full"
          size="lg"
          disabled={isDecrypting}
        >
          {isDecrypting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              復号中...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              内容を表示する
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
